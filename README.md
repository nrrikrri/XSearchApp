# Yahoo Topics History Tracker

A web application for tracking and visualizing Yahoo Topics publishing history with persistent storage and period-based querying capabilities.

![Yahoo Topics History Tracker](https://github.com/user-attachments/assets/c9567a41-3503-4cb3-bfc1-6ecf608a07d4)

## Features

- **Persistent History Storage**: Append-only mechanism ensures history data is never lost
- **Period-Based Querying**: Query history by date range for flexible data visualization
- **Real-time Statistics**: Track total entries, categories, and date ranges
- **User-Friendly Interface**: Clean, responsive web interface for easy interaction
- **RESTful API**: Programmatic access to history data

## API Endpoints

### `/api/history` (GET)
Query Yahoo Topics history by date range.

**Query Parameters:**
- `start` (required): Start date in ISO format
- `end` (required): End date in ISO format

**Response:**
```json
{
  "history": [
    {
      "id": "5f2beef316fe8ef6b43d6cd0b3a169ef",
      "title": "Sample Title",
      "link": "https://example.com/article",
      "timestamp": "2025-07-13T00:02:38.000Z",
      "action": "added",
      "categories": ["Category1", "Category2"]
    }
  ],
  "total": 1,
  "period": {
    "start": "2025-01-13T00:00:00",
    "end": "2025-07-14T23:59:59"
  }
}
```

### `/api/update-history` (POST)
Add new history entries with append-only storage.

**Request Body:**
```json
{
  "entries": [
    {
      "title": "Sample Title",
      "link": "https://example.com/article",
      "categories": ["Category1", "Category2"],
      "action": "added"
    }
  ]
}
```

**Response:**
```json
{
  "message": "History updated successfully",
  "added": 1,
  "entries": [...]
}
```

### `/api/history/stats` (GET)
Get statistics about the history data.

**Response:**
```json
{
  "total": 4,
  "categories": ["Technology", "News", "Business", "Economy"],
  "actions": ["added", "updated", "removed"],
  "dateRange": {
    "earliest": "2025-01-13T10:30:00.000Z",
    "latest": "2025-07-14T03:14:47.215Z"
  }
}
```

## Installation & Usage

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`

## Data Structure

Each history entry follows this structure:
```json
{
  "id": "unique-uuid",
  "title": "Entry title",
  "link": "https://example.com/link",
  "timestamp": "2025-07-13T00:02:38.000Z",
  "action": "added|updated|removed",
  "categories": ["Category1", "Category2"]
}
```

## Development

- **Server**: Node.js with Express
- **Storage**: JSON file-based persistent storage
- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **Port**: 3000 (localhost only)

## File Structure

```
XSearchApp/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── public/                # Frontend files
│   ├── index.html         # Main HTML file
│   ├── style.css          # Styling
│   └── script.js          # Frontend JavaScript
├── data/                  # Data storage (auto-created)
│   └── history.json       # History data file
└── README.md              # This file
```

## Requirements Met

- ✅ **Persistent History Storage**: Append-only JSON file storage
- ✅ **Period-Based History Visualization**: Date range queries with `/api/history`
- ✅ **Development Environment**: Configured for localhost:3000
- ✅ **Required APIs**: `/api/history` and `/api/update-history`
- ✅ **Data Structure**: Implements specified JSON structure
- ✅ **Frontend**: User-friendly interface for querying and adding entries
- ✅ **No hokkaido_np**: Clean implementation without any hokkaido_np references

## Author

[@nrrikrri](https://github.com/nrrikrri)
