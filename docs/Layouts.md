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

### Stacked & Clustered Headers

By default a tabular group has a single header row, one cell per column. The
optional `Headers` property adds **extra header rows stacked above** that
default ("prime") row. Each entry in `Headers` is one header row; each row is
an array of cells.

| Cell property | Type | Description |
|---------------|------|-------------|
| `Label` | string | Header text |
| `ColumnSpan` | number | Number of data columns this cell spans (default 1) — this is how you "cluster" |
| `CSSClass` | string | Optional class applied to the `<th>` |

```json
{
  "Hash": "GradebookGrid",
  "Layout": "Tabular",
  "RecordSetAddress": "Grades",
  "RecordManifest": "GradeRowEditor",
  "Headers": [
    [
      { "Label": "First Semester", "ColumnSpan": 3, "CSSClass": "term-banner" },
      { "Label": "Second Semester", "ColumnSpan": 4, "CSSClass": "term-banner" }
    ]
  ]
}
```

Each header row's `ColumnSpan` total should equal the number of data columns;
a mismatch is logged as a warning and the header will visually misalign.
Header rows render top-to-bottom in array order, directly above the prime
column-name row.

### Row Label Columns

The `RowLabels` property adds one or more **label columns down the left side**
of the table (before the data columns). Each entry describes one label column.

| Property | Type | Description |
|----------|------|-------------|
| `Name` | string | Header text for the label column |
| `Template` | string | A Pict template resolved per row — the row record is at `Record.Value`, the row index at `Record.Key` |
| `RowNumber` | boolean | When `true`, the label is the 1-based row number |
| `SourceAddress` | string | An app-data address of a pre-slotted array; element `[rowIndex]` is the label |
| `Cluster` | boolean | When `true`, consecutive equal labels collapse into one cell with `rowspan` |
| `CSSClass` | string | Optional class applied to the label `<td>` |

Provide exactly one of `Template`, `RowNumber`, or `SourceAddress` per entry.

```json
"RowLabels": [
  { "Name": "Section", "Template": "{~D:Record.Value.Section~}", "Cluster": true },
  { "Name": "Student", "Template": "{~D:Record.Value.StudentName~}" },
  { "Name": "#", "RowNumber": true }
]
```

`Cluster: true` is what produces the "merged cell" look — a column of repeated
values (e.g. a class section) renders as a single tall cell spanning its run
of rows. Any label column may be clustered; there is no "prime" label column.

### Dynamic Columns

`DynamicColumns` generates table columns at runtime from **another array** in
the form data — for example, one grade column per assignment. Each entry is a
generator:

| Property | Type | Description |
|----------|------|-------------|
| `SourceAddress` | string | App-data address of the array driving the columns |
| `HashTemplate` | string | Template producing each column's unique descriptor hash |
| `NameTemplate` | string | Template producing each column's header text |
| `InformaryDataAddressTemplate` | string | Template producing the per-row data address the cell binds to |
| `HeaderGroupTemplate` | string | Optional — template producing a cluster label; auto-adds a clustered super-header row |
| `DataType` | string | Data type for the generated descriptors |
| `PictForm` | object | `PictForm` block merged onto each generated descriptor (e.g. `InputType`) |
| `InsertAt` | string/object | `"End"` (default), `"Start"`, or `{ "After": "<hash>" }` |

Inside each template the **source row** is the record (`Record.Field`).

```json
"DynamicColumns": [
  {
    "SourceAddress": "Assignments",
    "HashTemplate": "Grade_{~D:Record.IDAssignment~}",
    "NameTemplate": "{~D:Record.Title~}",
    "InformaryDataAddressTemplate": "Grades.{~D:Record.IDAssignment~}",
    "HeaderGroupTemplate": "{~D:Record.Topic~}",
    "DataType": "Number",
    "PictForm": { "InputType": "Number" }
  }
]
```

Dynamic columns are **non-destructive**: when a source row is removed the
generated column disappears, but the underlying row data at the
`InformaryDataAddress` is left untouched — re-adding the source row brings the
column back with its data intact. The columns re-resolve automatically as the
source array changes; no manual refresh call is needed.

When `HeaderGroupTemplate` is set, an extra clustered super-header row is
synthesized automatically: consecutive generated columns sharing the same
header-group value merge into one spanning cell (e.g. assignments clustered by
topic).

### Editing Controls Position

Tabular rows render del / up / down controls. `EditingControlsPosition`
controls where:

| Value | Behavior |
|-------|----------|
| `"right"` | Default — controls in a trailing column |
| `"left"` | Controls in a leading column, before the data columns |
| `"hidden"` | No editing controls (read-only style table) |

```json
{ "Layout": "Tabular", "EditingControlsPosition": "hidden" }
```

### Suppressing the Default Header Row

Set `SuppressDefaultColumnHeaderRow: true` to omit the prime column-name row
entirely — useful when custom `Headers` rows fully describe the columns.

### Selectable Rows & Columns

`RowSelection` and `ColumnSelection` add checkboxes that let the user pick
rows / columns. The selected state is **stored in the form data**, so it
persists with a save and can be read by solvers.

Set either to `true` for defaults, or to an object:

| Property | Type | Description |
|----------|------|-------------|
| `Enabled` | boolean | Set `false` to disable (same as omitting) |
| `DataAddress` | string | Where the boolean selection array is stored (default `<GroupHash>_RowSelection` / `_ColumnSelection`) |
| `HighlightClass` | string | Class auto-applied to selected rows/columns; set to `""` for solver-driven highlighting only |
| `HeaderLabel` | string | Header text for the row-selection column |

```json
{
  "Layout": "Tabular",
  "RecordSetAddress": "Grades",
  "RowSelection": true,
  "ColumnSelection": true
}
```

Checking a row (or column) highlights every cell across (or down) it and
writes `true` into the selection array at the configured address. Because the
array lives in the marshalled form data it round-trips with save / load.

### Column Sorting

`ColumnSorting: true` (off by default) injects a clickable sort control — a
`<span>` carrying a sort SVG glyph from Pict's icon registry — into every
prime header cell.

```json
{ "Layout": "Tabular", "RecordSetAddress": "Students", "ColumnSorting": true }
```

Clicking a column's control sorts the record set ascending; clicking the
active column again toggles to descending. The glyph reflects state: a neutral
double-arrow on idle columns, an up / down arrow on the active column. Sorting
works for both static and dynamic columns (dynamic columns sort by their
`InformaryDataAddress` value). Values that parse as numbers sort numerically;
others sort lexically.

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
