# Component Structure

## CSS Naming Convention

All components follow the naming convention: `componentname-classname`

Each component has the following CSS files:

- **index.css** - Base/common styles
- **light.css** - Light theme styles
- **dark.css** - Dark theme styles

## Component Classes

### ConnectionForm
- `.connectionform-container` - Main container
- `.connectionform-form` - Form wrapper
- `.connectionform-title` - Form title
- `.connectionform-group` - Form group
- `.connectionform-label` - Input label
- `.connectionform-input` - Input field
- `.connectionform-button` - Submit button
- `.connectionform-theme-btn` - Theme toggle button
- `.connectionform-error` - Error message

### Dashboard
- `.dashboard` - Main container
- `.dashboard-header` - Header section
- `.dashboard-title` - Page title
- `.dashboard-connection-info` - Connection info container
- `.dashboard-connection-text` - Connection text
- `.dashboard-theme-btn` - Theme toggle button
- `.dashboard-disconnect-btn` - Disconnect button
- `.dashboard-error` - Error message
- `.dashboard-content` - Main content area
- `.dashboard-sidebar` - Sidebar
- `.dashboard-section` - Sidebar section
- `.dashboard-section-title` - Section title
- `.dashboard-list` - Item list
- `.dashboard-db-item` - Database item
- `.dashboard-table-item` - Table item
- `.dashboard-main-content` - Main content
- `.dashboard-no-selection` - No selection message
- `.dashboard-table-view` - Table view container
- `.dashboard-table-header` - Table header
- `.dashboard-table-name` - Table name
- `.dashboard-row-count` - Row count
- `.dashboard-table-container` - Table container
- `.dashboard-column-header` - Column header
- `.dashboard-column-type` - Column type
- `.dashboard-loading` - Loading message
- `.dashboard-no-data` - No data message

## Theme Usage

Import CSS files in order:
1. index.css (base)
2. light.css or dark.css (theme)

```javascript
import './index.css';
import './light.css';     // or dark.css
```

## Mobile Breakpoint

Mobile styles live in `index.css` via `@media (max-width: 768px)`
