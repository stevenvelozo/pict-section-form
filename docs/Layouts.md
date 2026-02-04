# Layouts

Layouts determine how inputs within a group are rendered. Pict Section Form
provides several built-in layouts and supports custom layout development.

## Available Layouts

| Layout | Description |
|--------|-------------|
| `Record` | Standard form with rows and columns (default) |
| `VerticalRecord` | Single column stacked layout |
| `Tabular` | Table with multiple data rows |
| `RecordSet` | Multiple related records |
| `TuiGrid` | TUI Grid integration |
| `Chart` | Data visualization |

## Specifying a Layout

Set the layout in the group configuration:

```json
{
  "Groups": [
    {
      "Hash": "PersonalInfo",
      "Name": "Personal Information",
      "Layout": "Record"
    }
  ]
}
```

## Record Layout

The default layout arranges inputs in rows with configurable widths using
a 12-column grid system.

```json
{
  "Hash": "Contact",
  "Name": "Contact Information",
  "Layout": "Record"
}
```

Inputs specify their row and width:

```json
"PictForm": {
  "Section": "Contact",
  "Group": "Contact",
  "Row": 1,
  "Width": 6  // Half the row width
}
```

### Row Assignment

Inputs on the same row number appear side-by-side. Total width should not
exceed 12:

```json
// Row 1: Name (6) + Email (6) = 12
"Contact.Name": { "PictForm": { "Row": 1, "Width": 6 } },
"Contact.Email": { "PictForm": { "Row": 1, "Width": 6 } },

// Row 2: Phone (4) + Fax (4) + Extension (4) = 12
"Contact.Phone": { "PictForm": { "Row": 2, "Width": 4 } },
"Contact.Fax": { "PictForm": { "Row": 2, "Width": 4 } },
"Contact.Extension": { "PictForm": { "Row": 2, "Width": 4 } }
```

## Vertical Record Layout

All inputs are stacked in a single column, ignoring width settings.

```json
{
  "Hash": "Sidebar",
  "Name": "Quick Entry",
  "Layout": "VerticalRecord"
}
```

## Tabular Layout

Renders inputs as a table with multiple data rows. Each row in the data
array becomes a table row.

```json
{
  "Hash": "LineItems",
  "Name": "Order Items",
  "Layout": "Tabular",
  "RecordSetAddress": "Order.Items"
}
```

### RecordSetAddress

The `RecordSetAddress` points to an array in AppData that contains the rows:

```javascript
pict.AppData.Order.Items = [
  { ProductName: "Widget A", Quantity: 2, Price: 9.99 },
  { ProductName: "Widget B", Quantity: 1, Price: 19.99 }
];
```

### Tabular Input Configuration

Inputs in tabular groups use special addressing:

```json
"LineItem.ProductName": {
  "Name": "Product",
  "Hash": "ProductName",
  "DataType": "String",
  "PictForm": {
    "Section": "Items",
    "Group": "LineItems",
    "Width": 4,
    "InformaryContainerAddress": "Order.Items",
    "InformaryDataAddress": "ProductName"
  }
}
```

### Row Operations

The view provides methods for manipulating tabular data:

```javascript
const view = pict.views['ItemsSection'];

// Add new row
view.createDynamicTableRow(groupIndex);

// Delete row
view.deleteDynamicTableRow(groupIndex, rowIndex);

// Move rows
view.moveDynamicTableRowUp(groupIndex, rowIndex);
view.moveDynamicTableRowDown(groupIndex, rowIndex);
view.setDynamicTableRowIndex(groupIndex, rowIndex, newIndex);
```

### Tabular Templates

Tabular layouts use a different template structure:

```
TabularTemplate-TablePrefix
TabularTemplate-HeadPrefix
TabularTemplate-HeadCell (per column)
TabularTemplate-HeadPostfix
TabularTemplate-RowPrefix (per row)
TabularTemplate-DataCell (per cell)
TabularTemplate-RowPostfix
TabularTemplate-TablePostfix
```

## RecordSet Layout

Similar to tabular but renders each record as a full form section rather
than a table row.

```json
{
  "Hash": "Addresses",
  "Name": "Shipping Addresses",
  "Layout": "RecordSet",
  "RecordSetAddress": "Customer.Addresses"
}
```

## TuiGrid Layout

Integrates with [TUI Grid](https://github.com/nhn/tui.grid) for advanced
grid functionality.

```json
{
  "Hash": "DataGrid",
  "Name": "Data Entry",
  "Layout": "TuiGrid",
  "RecordSetAddress": "Report.Data",
  "TuiGridOptions": {
    "rowHeight": 35,
    "minRowHeight": 25,
    "scrollX": true,
    "scrollY": true
  }
}
```

### TuiGrid Features

- Column resizing
- Cell editing
- Sorting and filtering
- Row selection
- Copy/paste support

## Chart Layout

Renders data as a visualization. See [Chart Input Type](input_providers/009-chart.md)
for complete configuration.

```json
{
  "Hash": "SalesChart",
  "Name": "Sales Overview",
  "Layout": "Chart"
}
```

## Custom Layouts

Create custom layouts by extending `PictDynamicLayoutProvider`.

### Provider Structure

```javascript
const libPictProvider = require('pict-provider');

class CustomLayoutProvider extends libPictProvider
{
  constructor(pFable, pOptions, pServiceHash)
  {
    super(pFable, pOptions, pServiceHash);
    this.serviceType = 'PictDynamicLayout';
  }

  generateGroupLayoutTemplate(pView, pGroup)
  {
    // Generate template for the group
    let template = '<div class="custom-layout">';

    // Add inputs
    for (const row of pGroup.Rows)
    {
      template += this.generateRowTemplate(pView, pGroup, row);
    }

    template += '</div>';
    return template;
  }

  onGroupLayoutInitialize(pView, pGroup)
  {
    // Called after group is rendered
    // Initialize any custom behavior
  }
}

module.exports = CustomLayoutProvider;
```

### Registration

```javascript
// Register the layout provider
pict.providers.DynamicLayout.registerLayoutProvider('CustomLayout', CustomLayoutProvider);
```

### Usage

```json
{
  "Hash": "MyGroup",
  "Name": "Custom Group",
  "Layout": "CustomLayout"
}
```

## Layout Templates

Each layout type has associated templates. Override them for customization:

### Record Layout Templates

```
-Template-Group-Prefix-Record
-Template-Group-Postfix-Record
-Template-Row-Prefix-Record
-Template-Row-Postfix-Record
```

### Tabular Layout Templates

```
-TabularTemplate-TablePrefix
-TabularTemplate-TablePostfix
-TabularTemplate-HeadPrefix
-TabularTemplate-HeadPostfix
-TabularTemplate-HeadCell
-TabularTemplate-RowPrefix
-TabularTemplate-RowPostfix
-TabularTemplate-DataCell
```

## Layout Switching

Change layout at runtime:

```javascript
const group = view.getGroup(groupIndex);
group.Layout = 'Tabular';
view.rebuildCustomTemplate();
view.render();
```

## Responsive Considerations

The 12-column grid system maps well to responsive frameworks:

- Width 12 = Full width
- Width 6 = Half width
- Width 4 = One third
- Width 3 = One quarter

Use CSS classes for responsive behavior:

```json
"PictForm": {
  "Width": 6,
  "CSSClasses": ["col-md-6", "col-sm-12"]
}
```

## Related Documentation

- [Configuration](Configuration.md) - Layout configuration options
- [Templates](Templates.md) - Layout template customization
- [Providers](Providers.md) - DynamicLayout provider reference
