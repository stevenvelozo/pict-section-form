# Pict Section Form Documentation

Welcome to the Pict Section Form documentation. This library provides a dynamic,
configuration-driven forms framework built on the Pict application platform.

## Quick Links

| Document | Description |
|----------|-------------|
| [Getting Started](Getting_Started.md) | Quick start guide for new users |
| [Architecture](Pict_Section_Form_Architecture.md) | System architecture and design |
| [Configuration](Configuration.md) | Complete configuration reference |
| [Input Types](Input_Types.md) | Available input types |
| [Templates](Templates.md) | Template customization |
| [Solvers](Solvers.md) | Expression solver system |
| [Providers](Providers.md) | Provider reference |
| [Layouts](Layouts.md) | Layout types and customization |

## Example Applications

| Example | Description |
|---------|-------------|
| [simple_form](examples/simple_form/) | Basic form with solvers and visibility control |
| [simple_table](examples/simple_table/) | Minimal tabular layout example |
| [simple_distill](examples/simple_distill/) | Entity bundles and trigger groups |
| [gradebook](examples/gradebook/) | Multi-table app with localStorage |
| [postcard_example](examples/postcard_example/) | Theme switching and navigation |
| [complex_table](examples/complex_table/) | Full-featured with charts and entity bundles |
| [complex_tuigrid](examples/complex_tuigrid/) | TuiGrid with aggregations |
| [manyfest_editor](examples/manyfest_editor/) | Meta-configuration editor |

See the [Examples Overview](examples/) for a complete guide.

## Input Provider Documentation

| Document | Description |
|----------|-------------|
| [Input Providers Overview](input_providers/) | Complete input providers guide |
| [Select](input_providers/001-select.md) | Dropdown lists with static/dynamic options |
| [DateTime](input_providers/002-datetime.md) | Date and time picker |
| [Markdown](input_providers/003-markdown.md) | Markdown content display |
| [HTML](input_providers/004-html.md) | Raw HTML content display |
| [PreciseNumber](input_providers/005-precise-number.md) | Formatted numbers with precision |
| [Link](input_providers/006-link.md) | Hyperlink inputs |
| [Templated](input_providers/007-templated.md) | Dynamic template rendering |
| [TemplatedEntityLookup](input_providers/008-templated-entity-lookup.md) | Entity fetch with templates |
| [Chart](input_providers/009-chart.md) | Chart.js visualizations |
| [EntityBundleRequest](input_providers/010-entity-bundle-request.md) | Cascading entity fetches |
| [AutofillTriggerGroup](input_providers/011-autofill-trigger-group.md) | Trigger-based autofill |
| [TabGroupSelector](input_providers/012-tab-group-selector.md) | Tab navigation for groups |
| [TabSectionSelector](input_providers/013-tab-section-selector.md) | Tab navigation for sections |

## Overview

Pict Section Form enables building complex forms through JSON configuration
rather than code. Key features include:

- **Declarative Configuration** - Define forms through manifests
- **Two-way Data Binding** - Automatic sync between UI and data
- **Expression Solvers** - Calculated fields and conditional logic
- **Extensible Input Types** - Standard and custom input types
- **Flexible Templates** - Complete UI customization
- **Tabular Layouts** - Multi-row data entry

## Installation

```bash
npm install pict-section-form
```

## Basic Usage

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

## Manifest Example

```json
{
  "Scope": "ContactForm",

  "Sections": [
    {
      "Hash": "Contact",
      "Name": "Contact Information"
    }
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

## Ecosystem

Pict Section Form is part of the Pict ecosystem:

- [pict](https://github.com/stevenvelozo/pict) - Core application framework
- [pict-view](https://github.com/stevenvelozo/pict-view) - View base class
- [pict-provider](https://github.com/stevenvelozo/pict-provider) - Provider base class
- [manyfest](https://github.com/stevenvelozo/manyfest) - Schema definitions
- [fable](https://github.com/stevenvelozo/fable) - Service infrastructure

## Contributing

Contributions are welcome! Please see the main repository for contribution
guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.
