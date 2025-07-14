class YahooTopicsApp {
    constructor() {
        this.apiBase = window.location.origin;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStatistics();
        this.setDefaultDates();
    }

    setupEventListeners() {
        // Add entry form
        document.getElementById('add-entry-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEntry();
        });

        // Query form
        document.getElementById('query-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.queryHistory();
        });

        // Load initial data on page load
        this.queryHistory();
    }

    setDefaultDates() {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        document.getElementById('start-date').value = this.formatDateForInput(oneWeekAgo);
        document.getElementById('end-date').value = this.formatDateForInput(now);
    }

    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    async addEntry() {
        const form = document.getElementById('add-entry-form');
        const formData = new FormData(form);
        
        const entry = {
            title: formData.get('title'),
            link: formData.get('link'),
            categories: formData.get('categories') 
                ? formData.get('categories').split(',').map(cat => cat.trim()) 
                : [],
            action: formData.get('action')
        };

        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiBase}/api/update-history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ entries: [entry] })
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Entry added successfully!', 'success');
                form.reset();
                this.loadStatistics();
                this.queryHistory(); // Refresh current view
            } else {
                throw new Error(result.error || 'Failed to add entry');
            }
        } catch (error) {
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async queryHistory() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (!startDate || !endDate) {
            this.showMessage('Please select both start and end dates', 'error');
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(
                `${this.apiBase}/api/history?start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`
            );

            const result = await response.json();

            if (response.ok) {
                this.displayResults(result);
            } else {
                throw new Error(result.error || 'Failed to fetch history');
            }
        } catch (error) {
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadStatistics() {
        try {
            const response = await fetch(`${this.apiBase}/api/history/stats`);
            const stats = await response.json();

            if (response.ok) {
                this.displayStatistics(stats);
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    displayStatistics(stats) {
        document.getElementById('total-entries').textContent = stats.total;
        document.getElementById('categories-count').textContent = stats.categories.length;
        
        const dateRangeElement = document.getElementById('date-range');
        if (stats.dateRange.earliest && stats.dateRange.latest) {
            const earliest = new Date(stats.dateRange.earliest).toLocaleDateString();
            const latest = new Date(stats.dateRange.latest).toLocaleDateString();
            dateRangeElement.textContent = `${earliest} - ${latest}`;
        } else {
            dateRangeElement.textContent = 'No data';
        }
    }

    displayResults(result) {
        const resultsInfo = document.getElementById('results-info');
        const resultsContainer = document.getElementById('results-container');

        // Update info
        resultsInfo.innerHTML = `
            <strong>Found ${result.total} entries</strong> 
            for period: ${new Date(result.period.start).toLocaleDateString()} - ${new Date(result.period.end).toLocaleDateString()}
        `;

        // Clear previous results
        resultsContainer.innerHTML = '';

        if (result.history.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d; margin: 40px 0;">No entries found for the selected period.</p>';
            return;
        }

        // Sort entries by timestamp (newest first)
        const sortedEntries = result.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Display entries
        sortedEntries.forEach(entry => {
            const entryElement = this.createEntryElement(entry);
            resultsContainer.appendChild(entryElement);
        });
    }

    createEntryElement(entry) {
        const div = document.createElement('div');
        div.className = 'history-entry';

        const timestamp = new Date(entry.timestamp);
        const timeString = timestamp.toLocaleString();

        const categoriesHtml = entry.categories.length > 0 
            ? `<div class="entry-categories">
                ${entry.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
               </div>`
            : '';

        div.innerHTML = `
            <div class="entry-header">
                <div>
                    <div class="entry-title">${this.escapeHtml(entry.title)}</div>
                    <a href="${entry.link}" target="_blank" class="entry-link">${this.escapeHtml(entry.link)}</a>
                </div>
                <div class="entry-meta">
                    <span class="entry-timestamp">${timeString}</span>
                    <span class="entry-action ${entry.action}">${entry.action}</span>
                </div>
            </div>
            ${categoriesHtml}
        `;

        return div;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        if (show) {
            loadingElement.classList.remove('hidden');
        } else {
            loadingElement.classList.add('hidden');
        }
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.classList.remove('hidden');

        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new YahooTopicsApp();
});