# PostgreSQL Dashboard Frontend

React-based frontend for the PostgreSQL Dashboard application.

## Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/             # React components
│   │   ├── ConnectionForm/
│   │   │   ├── ConnectionForm.js
│   │   │   ├── index.css       # Base styles
│   │   │   ├── light.css       # Light theme
│   │   │   ├── dark.css        # Dark theme
│   │   │   ├── mlight.css      # Mobile light
│   │   │   └── mdark.css       # Mobile dark
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.js
│   │   │   ├── index.css       # Base styles
│   │   │   ├── light.css       # Light theme
│   │   │   ├── dark.css        # Dark theme
│   │   │   ├── mlight.css      # Mobile light
│   │   │   └── mdark.css       # Mobile dark
│   │   ├── index.js            # Component exports
│   │   └── README.md           # Component documentation
│   ├── context/                # React Context
│   │   └── ThemeContext.js     # Theme management
│   ├── App.js                  # Main app component
│   ├── App.css                 # App styles
│   ├── index.js                # React entry point
│   ├── index.css               # Global styles
│   └── api.js                  # API client
├── .env.example                # Environment variables template
└── package.json                # Dependencies
```

## Component Structure

### CSS Naming Convention

All components follow BEM-like naming: `componentname-classname`

Each component includes theme CSS files:
- `index.css` - Base/common styles
- `light.css` - Light theme (default)
- `dark.css` - Dark theme
- `mlight.css` - Mobile light theme
- `mdark.css` - Mobile dark theme

### Components

#### ConnectionForm
Database connection interface component.
- Input fields for PostgreSQL credentials
- Form validation
- Connection error handling
- Theme support

#### Dashboard
Main dashboard interface with database explorer.
- Database and table browser
- Table data viewer
- Schema information display
- Row counting
- Connection management

## Theme System

The app supports light and dark themes with mobile-specific overrides.

### Themes
- **Light**: Gradient purple background, white cards
- **Dark**: Dark blue background, dark cards
- **Mobile**: Optimized for screens < 768px width

### Using Themes

Components automatically inherit theme via CSS cascade. Pass `isDarkMode` prop to components:

```javascript
<Dashboard isDarkMode={isDarkMode} />
<ConnectionForm isDarkMode={isDarkMode} />
```

## Setup & Installation

```bash
# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Start development server
npm start
```

## Dependencies

- **react** - UI library
- **react-dom** - DOM rendering
- **react-router-dom** - Routing
- **axios** - HTTP client

## API Integration

The app communicates with the FastAPI backend via the `api.js` client:

```javascript
import { databaseApi } from './api';

// Connect to database
await databaseApi.connect({ host, port, user, password, database });

// Get databases
await databaseApi.getDatabases();

// Get tables
await databaseApi.getTables();

// Get table data
await databaseApi.getTableData(tableName, limit);

// Get row count
await databaseApi.getTableRowCount(tableName);

// Disconnect
await databaseApi.disconnect();
```

## Development

### Hot Reload
The development server supports hot module reloading. Changes to components and styles update automatically.

### Debugging
Use React DevTools browser extension for component debugging.

### Build for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` directory.

## Mobile Responsive

All components are mobile-responsive with breakpoints at 768px:
- Smaller sidebar (200px)
- Adjusted padding/spacing
- Optimized table layout
- Touch-friendly buttons
