# Pict-Section-Form

> A dynamic, configuration-driven forms framework built on the Pict application platform

Pict-Section-Form enables building complex forms through JSON configuration rather than code. It provides a complete forms solution with automatic data binding, calculated fields, conditional logic, and extensible input types.

## Features

- **Declarative Configuration** - Define forms through JSON manifests
- **Two-way Data Binding** - Automatic sync between UI and data
- **Expression Solvers** - Calculated fields and conditional logic
- **Extensible Input Types** - Standard and custom input types
- **Flexible Templates** - Complete UI customization
- **Tabular Layouts** - Multi-row data entry with tables

## Quick Start

```javascript
const libPictSectionForm = require('pict-section-form');

// Create form application
const app = new libPictSectionForm.PictFormApplication(fable, {
  pict_configuration: {
    Product: "MyForm",
    DefaultFormManifest: manifestJSON
  }
});

// Initialize and render
app.initialize();
app.pict.views.PictFormMetacontroller.render();
```

## Installation

```bash
npm install pict-section-form
```

## Manifest Example

```json
{
  "Scope": "ContactForm",
  "Sections": [
    { "Hash": "Contact", "Name": "Contact Information" }
  ],
  "Descriptors": {
    "Contact.Name": {
      "Name": "Full Name",
      "Hash": "Name",
      "DataType": "String",
      "PictForm": { "Section": "Contact", "Row": 1, "Width": 12 }
    },
    "Contact.Email": {
      "Name": "Email",
      "Hash": "Email",
      "DataType": "String",
      "PictForm": { "Section": "Contact", "Row": 2, "Width": 6 }
    }
  }
}
```

## Documentation

- [Getting Started](Getting_Started.md) - Quick start guide
- [Architecture](Pict_Section_Form_Architecture.md) - System architecture and design
- [Configuration](Configuration.md) - Complete configuration reference
- [Input Types](Input_Types.md) - Available input types
- [Templates](Templates.md) - Template customization
- [Solvers](Solvers.md) - Expression solver system
- [Providers](Providers.md) - Provider reference
- [Layouts](Layouts.md) - Layout types and customization

## Example Applications


<!-- docuserve:examples:start -->
*Live, runnable example applications — each opens in a new browser tab:*

- **[Change Tracking](examples/change%5Ftracking/README.md)** — Demonstrates the multi-input evaluate-on-change solver pattern for reacting to several fields at once. · [&#9654; Launch live app](examples/change%5Ftracking/index.html)
- **[Dynamic Analysis](examples/dynamic%5Fanalysis/README.md)** — A fruit-nutrition analysis lab with dynamic section injection, solver rewriting, charts, and histograms. · [&#9654; Launch live app](examples/dynamic%5Fanalysis/index.html)
- **[Gradebook](examples/gradebook/README.md)** — An advanced tabular recordset with stacked headers, row labels, dynamic columns, row/column selection, and column sorting — built purely from manifest configuration. · [&#9654; Launch live app](examples/gradebook/index.html)
- **[NDT Field Test](examples/ndt%5Ffield%5Ftest/README.md)** — A nuclear-density-testing field data-collection form with offline persistence and charted results. · [&#9654; Launch live app](examples/ndt%5Ffield%5Ftest/index.html)
- **[Scope Mathematics](examples/scope%5Fmathematics/README.md)** — Shows solvers reaching across scopes to read and combine data from other sections of the form. · [&#9654; Launch live app](examples/scope%5Fmathematics/index.html)
- **[Simple Form](examples/simple%5Fform/README.md)** — A minimal forms application demonstrating calculated fields, conditional visibility, and expression solvers. · [&#9654; Launch live app](examples/simple%5Fform/index.html)
<!-- docuserve:examples:end -->

- [simple_form](examples/simple_form/) - Basic form with solvers and visibility control
- [simple_table](examples/simple_table/) - Minimal tabular layout example
- [gradebook](examples/gradebook/) - Advanced tabular recordsets: stacked headers, row labels, dynamic columns, selection, sorting
- [complex_table](examples/complex_table/) - Full-featured with charts and entity bundles

## Related Packages

- [pict](https://github.com/stevenvelozo/pict) - Core application framework
- [pict-view](https://github.com/stevenvelozo/pict-view) - View base class
- [pict-provider](https://github.com/stevenvelozo/pict-provider) - Provider base class
- [manyfest](https://github.com/stevenvelozo/manyfest) - Schema definitions
- [fable](https://github.com/stevenvelozo/fable) - Service infrastructure
