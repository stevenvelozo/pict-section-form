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
| [gradebook](gradebook/) | Intermediate | Multiple tables, localStorage persistence |
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
3. **[gradebook](gradebook/)** - Multiple tables with localStorage persistence
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
| Basic Inputs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tabular Layout | | ✓ | | ✓ | | ✓ | | ✓ |
| TuiGrid | | | | | | | ✓ | ✓ |
| Solvers | ✓ | | ✓ | | | ✓ | ✓ | |
| Row Solvers | | | | | | ✓ | ✓ | |
| Pick Lists | | | ✓ | | | ✓ | ✓ | |
| Entity Bundles | | | ✓ | | | ✓ | | |
| Trigger Groups | | | ✓ | | | ✓ | | |
| localStorage | | | | ✓ | | | | ✓ |
| Custom Themes | | | | | ✓ | | | |
| Navigation | | | | | ✓ | | | ✓ |
| Charts | | | | | | ✓ | | |
| DateTime | | | | | | ✓ | ✓ | |
| JSON Editor | | | | | | | | ✓ |
