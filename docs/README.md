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

- [simple_form](examples/simple_form/) - Basic form with solvers and visibility control
- [simple_table](examples/simple_table/) - Minimal tabular layout example
- [gradebook](examples/gradebook/) - Multi-table app with localStorage
- [complex_table](examples/complex_table/) - Full-featured with charts and entity bundles

## Related Packages

- [pict](https://github.com/stevenvelozo/pict) - Core application framework
- [pict-view](https://github.com/stevenvelozo/pict-view) - View base class
- [pict-provider](https://github.com/stevenvelozo/pict-provider) - Provider base class
- [manyfest](https://github.com/stevenvelozo/manyfest) - Schema definitions
- [fable](https://github.com/stevenvelozo/fable) - Service infrastructure
