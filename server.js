const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'history.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize history file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ history: [] }, null, 2));
}

// Helper function to read history data
function readHistory() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading history file:', error);
        return { history: [] };
    }
}

// Helper function to write history data (append-only)
function writeHistory(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing history file:', error);
        return false;
    }
}

// API: Get history by date range
app.get('/api/history', (req, res) => {
    try {
        const { start, end } = req.query;
        
        if (!start || !end) {
            return res.status(400).json({ 
                error: 'Both start and end dates are required' 
            });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ 
                error: 'Invalid date format' 
            });
        }

        if (startDate > endDate) {
            return res.status(400).json({ 
                error: 'Start date must be before or equal to end date' 
            });
        }

        const data = readHistory();
        const filteredHistory = data.history.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= startDate && entryDate <= endDate;
        });

        res.json({
            history: filteredHistory,
            total: filteredHistory.length,
            period: {
                start: start,
                end: end
            }
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API: Add new history entries (append-only)
app.post('/api/update-history', (req, res) => {
    try {
        const { entries } = req.body;
        
        if (!entries || !Array.isArray(entries)) {
            return res.status(400).json({ 
                error: 'entries must be an array' 
            });
        }

        const data = readHistory();
        const newEntries = [];

        for (const entry of entries) {
            // Validate required fields
            if (!entry.title || !entry.link) {
                return res.status(400).json({ 
                    error: 'Each entry must have title and link' 
                });
            }

            const newEntry = {
                id: entry.id || uuidv4(),
                title: entry.title,
                link: entry.link,
                timestamp: entry.timestamp || new Date().toISOString(),
                action: entry.action || 'added',
                categories: entry.categories || []
            };

            // Check if entry already exists (by ID)
            const existingEntry = data.history.find(h => h.id === newEntry.id);
            if (!existingEntry) {
                data.history.push(newEntry);
                newEntries.push(newEntry);
            }
        }

        if (writeHistory(data)) {
            res.json({
                message: 'History updated successfully',
                added: newEntries.length,
                entries: newEntries
            });
        } else {
            res.status(500).json({ error: 'Failed to save history' });
        }
    } catch (error) {
        console.error('Error updating history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API: Get all history (for development/debugging)
app.get('/api/history/all', (req, res) => {
    try {
        const data = readHistory();
        res.json(data);
    } catch (error) {
        console.error('Error fetching all history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API: Get history statistics
app.get('/api/history/stats', (req, res) => {
    try {
        const data = readHistory();
        const stats = {
            total: data.history.length,
            categories: [...new Set(data.history.flatMap(entry => entry.categories))],
            actions: [...new Set(data.history.map(entry => entry.action))],
            dateRange: {
                earliest: data.history.length > 0 ? 
                    Math.min(...data.history.map(entry => new Date(entry.timestamp).getTime())) : null,
                latest: data.history.length > 0 ? 
                    Math.max(...data.history.map(entry => new Date(entry.timestamp).getTime())) : null
            }
        };
        
        if (stats.dateRange.earliest) {
            stats.dateRange.earliest = new Date(stats.dateRange.earliest).toISOString();
        }
        if (stats.dateRange.latest) {
            stats.dateRange.latest = new Date(stats.dateRange.latest).toISOString();
        }

        res.json(stats);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, 'localhost', () => {
    console.log(`Yahoo Topics History Server running on http://localhost:${PORT}`);
    console.log(`Data file: ${DATA_FILE}`);
});