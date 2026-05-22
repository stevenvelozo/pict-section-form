# Example Applications

This directory contains documentation for each example application in the
Pict Section Form framework. Each example demonstrates different features
and patterns.

## Quick Reference

| Example | Complexity | Key Features |
|---------|------------|--------------|
| [simple_form](simple_form/) | Basic | Calculated fields, visibility control, solvers |
| [simple_table](simple_table/) | Basic | Tabular layout, nested data, reference manifests |
| [simple_distill](simple_distill/) | Intermediate | Entity bundles, trigger groups, templated inputs |
| [gradebook](gradebook/) | Intermediate | Stacked headers, row labels, dynamic columns, selection, sorting |
| [postcard_example](postcard_example/) | Intermediate | Theme switching, navigation, custom providers |
| [complex_table](complex_table/) | Advanced | Charts, row solvers, entity requests, pick lists |
| [complex_tuigrid](complex_tuigrid/) | Advanced | TuiGrid, aggregations, DateTime inputs |
| [manyfest_editor](manyfest_editor/) | Advanced | Multiple views, JSON editor, routing |

## Learning Path

### Getting Started
1. **[simple_form](simple_form/)** - Learn basic form configuration, solvers, and
   visibility control
2. **[simple_table](simple_table/)** - Understand tabular layouts and reference
   manifests

### Intermediate Patterns
3. **[gradebook](gradebook/)** - Advanced tabular recordsets: stacked headers,
   row labels, dynamic columns, selection, sorting, and styling solvers
4. **[postcard_example](postcard_example/)** - Theme system and navigation patterns
5. **[simple_distill](simple_distill/)** - Entity relationships and trigger groups

### Advanced Features
6. **[complex_table](complex_table/)** - Full-featured application with charts,
   entity bundles, and row-level solvers
7. **[complex_tuigrid](complex_tuigrid/)** - TuiGrid integration with aggregations
8. **[manyfest_editor](manyfest_editor/)** - Meta-configuration with multiple view types

## Common Patterns Across Examples

### Manifest Structure
All examples follow the same basic manifest structure:
```json
{
  "Scope": "ApplicationName",
  "Sections": [...],
  "Descriptors": {...},
  "ReferenceManifests": {...}
}
```

### Application Bootstrap
```javascript
class MyApp extends libPictSectionForm.PictFormApplication {
  constructor(pFable, pOptions, pServiceHash) {
    super(pFable, pOptions, pServiceHash);
    // Add custom providers here
  }
}
```

### HTML Entry Point
```html
<script src="./pict.min.js"></script>
<script>
  Pict.safeOnDocumentReady(() => {
    Pict.safeLoadPictApplication(MyApplication, 1);
  });
</script>
```

## Running Examples

Each example can be built and run using:

```bash
cd example_applications/<example_name>
npm install
npm run build
# Open html/index.html in a browser
```

Or run all examples together:

```bash
cd example_applications
npm install
./Build-Examples.sh
node ServeExamples.js
# Visit http://localhost:8080
```

## Feature Matrix

| Feature | simple_form | simple_table | simple_distill | gradebook | postcard | complex_table | complex_tuigrid | manyfest_editor |
|---------|:-----------:|:------------:|:--------------:|:---------:|:--------:|:-------------:|:---------------:|:---------------:|
| Basic Inputs | [x] | [x] | [x] | [x] | [x] | [x] | [x] | [x] |
| Tabular Layout | | [x] | | [x] | | [x] | | [x] |
| TuiGrid | | | | | | | [x] | [x] |
| Solvers | [x] | | [x] | [x] | | [x] | [x] | |
| Row Solvers | | | | [x] | | [x] | [x] | |
| Pick Lists | | | [x] | | | [x] | [x] | |
| Entity Bundles | | | [x] | | | [x] | | |
| Trigger Groups | | | [x] | | | [x] | | |
| localStorage | | | | | | | | [x] |
| Custom Themes | | | | | [x] | | | |
| Navigation | | | | [x] | [x] | | | [x] |
| Charts | | | | | | [x] | | |
| DateTime | | | | | | [x] | [x] | |
| JSON Editor | | | | | | | | [x] |
| Stacked Headers | | | | [x] | | | | |
| Row Labels | | | | [x] | | | | |
| Dynamic Columns | | | | [x] | | | | |
| Row/Column Selection | | | | [x] | | | | |
| Column Sorting | | | | [x] | | | | |

## Live Examples

<!-- docuserve:examples-index:start -->
| Example | Complexity | Summary | Live |
|---------|------------|---------|------|
| [Change Tracking](examples/change%5Ftracking/README.md) | Intermediate | Demonstrates the multi-input evaluate-on-change solver pattern for reacting to several fields at once. | [&#9654; Launch](examples/change%5Ftracking/index.html) |
| [Dynamic Analysis](examples/dynamic%5Fanalysis/README.md) | Advanced | A fruit-nutrition analysis lab with dynamic section injection, solver rewriting, charts, and histograms. | [&#9654; Launch](examples/dynamic%5Fanalysis/index.html) |
| [Gradebook](examples/gradebook/README.md) | Intermediate | An advanced tabular recordset with stacked headers, row labels, dynamic columns, row/column selection, and column sorting — built purely from manifest configuration. | [&#9654; Launch](examples/gradebook/index.html) |
| [NDT Field Test](examples/ndt%5Ffield%5Ftest/README.md) | Advanced | A nuclear-density-testing field data-collection form with offline persistence and charted results. | [&#9654; Launch](examples/ndt%5Ffield%5Ftest/index.html) |
| [Scope Mathematics](examples/scope%5Fmathematics/README.md) | Intermediate | Shows solvers reaching across scopes to read and combine data from other sections of the form. | [&#9654; Launch](examples/scope%5Fmathematics/index.html) |
| [Simple Form](examples/simple%5Fform/README.md) | Basic | A minimal forms application demonstrating calculated fields, conditional visibility, and expression solvers. | [&#9654; Launch](examples/simple%5Fform/index.html) |
<!-- docuserve:examples-index:end -->
