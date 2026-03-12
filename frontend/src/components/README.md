# Component Structure

## CSS Naming Convention

All components follow the naming convention: `componentname-classname`

Each component has the following CSS files:

- **index.css** - Base/common styles
- **light.css** - Light theme styles
- **dark.css** - Dark theme styles
- **mlight.css** - Mobile light theme styles
- **mdark.css** - Mobile dark theme styles

## Component Classes

### ConnectionForm
- `.connectionform-container` - Main container
- `.connectionform-form` - Form wrapper
- `.connectionform-title` - Form title
- `.connectionform-group` - Form group
- `.connectionform-label` - Input label
- `.connectionform-input` - Input field
- `.connectionform-button` - Submit button
- `.connectionform-error` - Error message

### Dashboard
- `.dashboard` - Main container
- `.dashboard-header` - Header section
- `.dashboard-title` - Page title
- `.dashboard-connectioninfo` - Connection info container
- `.dashboard-connectiontext` - Connection text
- `.dashboard-disconnectbtn` - Disconnect button
- `.dashboard-error` - Error message
- `.dashboard-content` - Main content area
- `.dashboard-sidebar` - Sidebar
- `.dashboard-section` - Sidebar section
- `.dashboard-sectiontitle` - Section title
- `.dashboard-list` - Item list
- `.dashboard-dbitem` - Database item
- `.dashboard-tableitem` - Table item
- `.dashboard-maincontent` - Main content
- `.dashboard-noselection` - No selection message
- `.dashboard-tableview` - Table view container
- `.dashboard-tableheader` - Table header
- `.dashboard-tablename` - Table name
- `.dashboard-rowcount` - Row count
- `.dashboard-tablecontainer` - Table container
- `.dashboard-columnheader` - Column header
- `.dashboard-columntype` - Column type
- `.dashboard-loading` - Loading message
- `.dashboard-nodata` - No data message

## Theme Usage

Import CSS files in order:
1. index.css (base)
2. light.css or dark.css (theme)
3. mlight.css or mdark.css (mobile)

```javascript
import './index.css';
import './light.css';     // or dark.css
import './mlight.css';    // or mdark.css
```

## Mobile Breakpoint

Mobile styles use `@media (max-width: 768px)`
