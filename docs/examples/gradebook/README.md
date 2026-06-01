# Gradebook - A Tabular Recordset Case Study

<!-- docuserve:example-launch:start -->
> **[Launch the live app](examples/gradebook/index.html)** - runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->


The Gradebook example is a deep, end-to-end demonstration of **every advanced
tabular capability** in Pict Section Form. It is a real classroom gradebook -
students, assignments, grades, teacher commentary, and a performance
breakdown - and **every screen is built purely from manifest configuration**.
There is no bespoke view code: the host application file is just a manifest.

This page is a guided tour. It explains the design, then walks each feature
with the exact configuration the app uses.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Stacked & clustered headers | Every tab has a banner row; Grade Book/Performance/Commentary add an auto topic super-header |
| Row label columns (clustered) | Section / Student / row-number columns down the left of every grid |
| Dynamic columns from another array | Grade Book, Performance and Commentary grow one column per assignment |
| Non-destructive columns | Removing an assignment hides its column but keeps the entered grades |
| Selectable rows & columns | Grade Book - check a row and/or column to highlight it |
| Column sorting | Students and Assignments - click a header to sort |
| Tabular styling solvers | Performance - each student row is tinted by their average |
| Tab navigation | `TabSectionSelector` switches between the five tabs |
| Seeded example data | `GradebookData.json` loaded as `DefaultAppData` |

## Key files

- `Gradebook-Application.js` - the entire app: one manifest, zero view code
- `GradebookData.json` - seed data (`DefaultAppData`)
- `html/index.html` - HTML shell + theme CSS

## The data model

Five arrays in app data, seeded from `GradebookData.json`:

- `Students` - `{ Section, StudentName, StudentID }`
- `Assignments` - `{ IDAssignment, Title, Topic, Points, Weight }`
- `Grades` - one row per student, with a nested `Grades` object keyed by assignment id
- `Commentary` - one row per student, with a nested `Notes` object keyed by assignment id

The Grade Book, Performance and Commentary grids are **intersections**: their
rows come from `Grades` / `Commentary` and their columns are generated from
`Assignments`.

## Tab navigation

The first section holds nothing but a `TabSectionSelector` input. It is in its
own section so it never gets swapped out when the user changes tabs.

```js
"UI.GradebookTab": {
    "Name": "Section",
    "Hash": "GradebookTab",
    "DataType": "String",
    "PictForm": {
        "Section": "Navigation",
        "InputType": "TabSectionSelector",
        "TabSectionSet":   ["Students", "Assignments", "Gradebook", "Performance", "Commentary"],
        "TabSectionNames": ["Students", "Assignments", "Grade Book", "Performance", "Commentary"]
    }
}
```

---

## Feature 1 - Stacked & clustered headers

Every grid carries a banner row above the column names via the group's
`Headers` property. The Students tab is the simplest case - one banner cell
spanning all three data columns:

```js
{
    "Hash": "StudentList",
    "Layout": "Tabular",
    "RecordSetAddress": "Students",
    "RecordManifest": "StudentEditor",
    "Headers": [
        [ { "Label": "Class Roster", "ColumnSpan": 3 } ]
    ]
}
```

`Headers` is an array of header rows; each row is an array of cells with
`Label`, `ColumnSpan` and an optional `CSSClass`. The Grade Book uses the
`CSSClass` hook to paint its banner:

```js
"Headers": [
    [ { "Label": "Assignments", "ColumnSpan": 7, "CSSClass": "gradebook-banner" } ]
]
```

Header rows that come from `Headers` render above the prime column-name row.
When a grid also uses `HeaderGroupTemplate` dynamic columns (below), a second,
**auto-generated** clustered header row appears between the banner and the
column names.

---

## Feature 2 - Row label columns

The `RowLabels` property adds label columns down the left edge. Each entry is
one column. The Students grid clusters a single `Section` label:

```js
"RowLabels": [
    { "Name": "Section", "Template": "{~D:Record.Value.Section~}", "Cluster": true }
]
```

`Cluster: true` collapses consecutive equal values into one `rowspan` cell - so
the three Section-A students show a single tall "A" cell. The Performance grid
stacks three label columns, mixing a clustered template, a plain template, and
a row number:

```js
"RowLabels": [
    { "Name": "Section", "Template": "{~D:Record.Value.Section~}", "Cluster": true },
    { "Name": "Student", "Template": "{~D:Record.Value.StudentName~}" },
    { "Name": "#",        "RowNumber": true }
]
```

Inside a `Template`, the row record is at `Record.Value` and the row index at
`Record.Key`. A label column can instead use `RowNumber: true` (the 1-based
row number) or `SourceAddress` (a pre-slotted array indexed by row). There is
no "prime" label column - any of them may be clustered.

---

## Feature 3 - Dynamic columns from another array

The Grade Book grid has only two *static* descriptors (`Section`,
`StudentName`, both marked `TabularHidden` so they live as row labels instead
of columns). Every visible grade column is **generated from the `Assignments`
array** by a `DynamicColumns` generator:

```js
{
    "Hash": "GradebookGrid",
    "Layout": "Tabular",
    "RecordSetAddress": "Grades",
    "RecordManifest": "GradeRowEditor",
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
}
```

For every row of `Assignments` this produces one column:

- `HashTemplate` -> a unique descriptor hash (`Grade_1`, `Grade_2`, ...)
- `NameTemplate` -> the column header (the assignment title)
- `InformaryDataAddressTemplate` -> where each cell binds within the row
  (`Grades.1` -> `Grades[rowIndex].Grades["1"]`)
- `HeaderGroupTemplate` -> the cluster label for the auto super-header row

### Non-destructive by design

Dynamic columns react to their source array, but they never destroy data. If
an assignment is removed from `Assignments`, its column disappears - but the
grades already entered at `Grades[*].Grades["<id>"]` are left in place. Add the
assignment back and the column returns with every grade intact. This is why a
`DynamicColumns` generator is safe to drive from live, user-editable data.

### Auto topic super-header

Because the generator sets `HeaderGroupTemplate: "{~D:Record.Topic~}"`,
pict-section-form synthesizes an extra header row above the column names and
**clusters adjacent columns that share a topic** - Math, Science, Reading, Art,
Writing each become one spanning cell. No extra configuration is required; the
super-header is derived entirely from the generator.

The Commentary tab reuses the identical pattern with a different data path
(`Notes.<id>`) and a `TextArea` input, showing one generator shape driving very
different grids.

---

## Feature 4 - Editing controls & read-only grids

By default each tabular row shows del / up / down controls on the right. The
Performance grid is a summary view, so it hides them:

```js
{
    "Hash": "PerformanceGrid",
    "Layout": "Tabular",
    "EditingControlsPosition": "hidden"
}
```

`EditingControlsPosition` also accepts `"left"` to move the controls to a
leading column.

---

## Feature 5 - Selectable rows & columns

The Grade Book turns on both selection modes:

```js
{
    "Hash": "GradebookGrid",
    "Layout": "Tabular",
    "RecordSetAddress": "Grades",
    "RecordManifest": "GradeRowEditor",
    "RowSelection": true,
    "ColumnSelection": true,
    "DynamicColumns": [ /* ... */ ]
}
```

`RowSelection: true` adds a checkbox column on the left; `ColumnSelection: true`
adds a checkbox header row. Checking a row highlights every cell across it;
checking a column highlights every cell down it; the intersection gets both.

The selected state is **stored in the form data** - as boolean arrays at
`GradebookGrid_RowSelection` and `GradebookGrid_ColumnSelection` by default
(`<GroupHash>_RowSelection` / `_ColumnSelection`) - so it round-trips with a
save/load. Either property can also be an object for finer control:

```js
"RowSelection": {
    "DataAddress": "MyRowPicks",            // where the boolean array lives
    "HighlightClass": "pict-tabular-row-highlight", // "" => solver-driven only
    "HeaderLabel": "Pick"
}
```

Because the selection lives in the form data, a solver can read it and decide
how to present it - the built-in highlight is just the default.

---

## Feature 6 - Column sorting

The Students and Assignments tabs enable sorting:

```js
{
    "Hash": "StudentList",
    "Layout": "Tabular",
    "RecordSetAddress": "Students",
    "RecordManifest": "StudentEditor",
    "ColumnSorting": true
}
```

`ColumnSorting: true` injects a `<span>` with a sort SVG glyph (from Pict's
icon registry) into every prime header cell. Clicking sorts the record set
ascending; clicking the active column again toggles descending. The glyph
shows the state - a neutral double-arrow on idle columns, an up/down arrow on
the sorted one. Sorting is off by default; it works on static and dynamic
columns alike.

---

## Feature 7 - Tabular styling solvers

The Performance tab colors each student row by their average grade. First a
`RecordSetSolver` on the group computes the average for every row:

```js
"RecordSetSolvers": [
    "Average = avg(objectvaluestoarray(Grades))"
]
```

Then the section's `Solvers` call `colortabularrow` per row, mapping the
average to a band color:

```js
"Solvers": [
    { "Ordinal": 5, "Expression":
        "colortabularrow(\"Performance\", \"PerformanceGrid\", 0, " +
        "IF(getSectionTabularFormData(\"Performance\", \"PerformanceGrid\", 0, \"Average\"), \">=\", 85, \"#BFE3BF\", " +
        "IF(getSectionTabularFormData(\"Performance\", \"PerformanceGrid\", 0, \"Average\"), \">=\", 75, \"#F5DFA8\", \"#EBB8B8\")), 1)" }
    /* ... one expression per student row ... */
]
```

`colortabularrow(section, group, rowIndex, color, flag)` paints every cell of a
row; its siblings `colortabularcolumn`, `highlighttabularrow` and
`highlighttabularcolumn` cover the other three combinations. The highlight pair
toggles a CSS class on a `1`/`0` flag; the color pair sets or clears a
background. See [Solvers](../../Solvers.md) for the full reference.

---

## Seeded example data

Like the other example applications, the gradebook ships its data inline.
`GradebookData.json` is loaded as `DefaultAppData` in the Pict configuration:

```js
module.exports.default_configuration.pict_configuration = {
    "Product": "Gradebook",
    "DefaultAppData": require('./GradebookData.json'),
    "DefaultFormManifest": { /* the manifest */ }
};
```

No server, no fetch - open the page and the classroom is populated.

## Running the example

```bash
cd example_applications/gradebook
npm run build
# serve ./dist and open index.html
```

## Takeaways

1. **Configuration, not code.** Five interactive grids, sorting, selection,
   live coloring - and the application file contains only a manifest.
2. **Intersections are first-class.** `DynamicColumns` turns "students × assignments"
   into a real editable grid without hand-written columns.
3. **Non-destructive always.** Hiding a column never discards the data behind it.
4. **State that persists.** Row/column selection rides along in the form data.
5. **One pattern, many grids.** The same `DynamicColumns` generator shape drives
   the Grade Book, the Performance breakdown, and the Commentary grid.

## Related documentation

- [Layouts](../../Layouts.md) - tabular layout reference (all of the properties above)
- [Solvers](../../Solvers.md) - the tabular styling solver functions
- [Configuration](../../Configuration.md) - group property reference
