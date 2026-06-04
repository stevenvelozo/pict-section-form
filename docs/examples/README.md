# Example Applications

This directory contains documentation for each example application in the
Pict Section Form framework. Each example demonstrates different features
and patterns.

## Quick Reference

| Example | Complexity | Key Features |
|---------|------------|--------------|
| [simple_table](simple_table/README.md) | Basic | Tabular layout, nested data, reference manifests |
| [gradebook](gradebook/README.md) | Intermediate | Stacked headers, row labels, dynamic columns, selection, sorting |
| [postcard_example](postcard_example/README.md) | Intermediate | Theme switching, navigation, custom providers |

## Learning Path

### Getting Started
1. **[simple_table](simple_table/README.md)** - Understand tabular layouts and reference
   manifests

### Intermediate Patterns
2. **[gradebook](gradebook/README.md)** - Advanced tabular recordsets: stacked headers,
   row labels, dynamic columns, selection, sorting, and styling solvers
3. **[postcard_example](postcard_example/README.md)** - Theme system and navigation patterns

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

| Feature | simple_table | gradebook | postcard |
|---------|:------------:|:---------:|:--------:|
| Basic Inputs | [x] | [x] | [x] |
| Tabular Layout | [x] | [x] | |
| Solvers | | [x] | |
| Row Solvers | | [x] | |
| Custom Themes | | | [x] |
| Navigation | | [x] | [x] |
| Stacked Headers | | [x] | |
| Row Labels | | [x] | |
| Dynamic Columns | | [x] | |
| Row/Column Selection | | [x] | |
| Column Sorting | | [x] | |

## Live Examples

<!-- docuserve:examples-index:start -->
| Example | Complexity | Summary | Live |
|---------|------------|---------|------|
| [Change Tracking](change%5Ftracking/README.md) | Intermediate | Demonstrates the multi-input evaluate-on-change solver pattern for reacting to several fields at once. | [Launch](examples/change%5Ftracking/index.html) |
| [Dynamic Analysis](dynamic%5Fanalysis/README.md) | Advanced | A fruit-nutrition analysis lab with dynamic section injection, solver rewriting, charts, and histograms. | [Launch](examples/dynamic%5Fanalysis/index.html) |
| [Gradebook](gradebook/README.md) | Intermediate | An advanced tabular recordset with stacked headers, row labels, dynamic columns, row/column selection, and column sorting — built purely from manifest configuration. | [Launch](examples/gradebook/index.html) |
| [NDT Field Test](ndt%5Ffield%5Ftest/README.md) | Advanced | A nuclear-density-testing field data-collection form with offline persistence and charted results. | [Launch](examples/ndt%5Ffield%5Ftest/index.html) |
| [Scope Mathematics](scope%5Fmathematics/README.md) | Intermediate | Shows solvers reaching across scopes to read and combine data from other sections of the form. | [Launch](examples/scope%5Fmathematics/index.html) |
| [Simple Table](simple%5Ftable/README.md) | Basic | A minimal tabular forms application demonstrating manifest-driven table layout, reference manifests, and dot-notation access into nested record data. | [Launch](examples/simple%5Ftable/index.html) |
<!-- docuserve:examples-index:end -->
