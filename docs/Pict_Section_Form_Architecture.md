# Pict Section Form Architecture

Pict Section Form is a dynamic forms framework built on top of the Pict application
framework and Fable service infrastructure. It provides a declarative,
configuration-driven approach to building complex forms with automatic data
marshaling, expression-based calculations, and extensible input types.

## Design Philosophy

The framework follows several key principles:

1. **Configuration over Code** - Forms are defined through JSON manifests rather
   than imperative code. This allows forms to be stored, versioned, and modified
   without code changes.

2. **Non-opinionated UI** - The framework provides no opinion on UI frameworks.
   Default templates generate standard HTML, but the entire template system can
   be replaced to work with any CSS framework or component library.

3. **Two-way Data Binding** - Automatic synchronization between form inputs and
   application state through the Informary provider.

4. **Expression-based Dynamics** - Solvers enable calculated fields, conditional
   visibility, and dynamic styling through a powerful expression parser.

5. **Modular Extensibility** - Each concern (input types, layouts, data handling,
   events) is handled by separate providers that can be extended or replaced.

## Core Components

### Views

The view layer consists of two primary classes:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PictFormMetacontroller                        │
│   - Manages multiple form sections                               │
│   - Orchestrates data marshaling                                 │
│   - Controls solver execution                                    │
│   - Handles initial bundle loading                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ manages
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PictViewDynamicForm                           │
│   - Represents a single form section                             │
│   - Maintains section manifest instance                          │
│   - Handles input provider lifecycle                             │
│   - Manages group and row structures                             │
└─────────────────────────────────────────────────────────────────┘
```

**PictViewDynamicForm** extends `pict-view` and represents a single form section.
It maintains:
- The section manifest (an instantiated Manyfest)
- Solvers specific to this section
- Groups, rows, and input definitions
- Template prefix resolution

**PictFormMetacontroller** is the master controller that:
- Creates and manages multiple `PictViewDynamicForm` instances
- Orchestrates data flow between forms and application state
- Coordinates solver execution across all sections
- Manages debug/support views

### Providers

Providers are singleton services that handle specific responsibilities:

| Provider | Responsibility |
|----------|---------------|
| `DynamicInput` | Routes input rendering to appropriate templates and handlers |
| `DynamicSolver` | Processes expressions to compute values and control behavior |
| `DynamicTemplates` | Manages the hierarchical template system |
| `MetatemplateGenerator` | Creates on-demand templates for dynamic rendering |
| `Informary` | Handles DOM-to-data and data-to-DOM marshaling |
| `DynamicLayout` | Generates layout templates for different group types |
| `DynamicInputEvents` | Manages input event handling and change detection |
| `DynamicTabularData` | Handles tabular data structures and row operations |

### Services

**ManifestFactory** - Creates and manages form manifest instances:
- Initializes form groups from descriptors
- Creates supporting manifests for tabular groups
- Tracks section and group hashes for lookup
- Sanitizes object keys for consistency

**ManifestConversionToCSV** - Converts form configurations to tabular format
for export and editing.

## Data Flow

### Rendering Flow

```
1. Application instantiates PictFormMetacontroller
2. For each Section in manifest:
   a. PictViewDynamicForm is created
   b. ManifestFactory parses descriptors into groups and rows
   c. MetatemplateGenerator creates layout templates
3. Forms are rendered to DOM using template hierarchy
4. Solvers are executed (expressions resolve values)
5. Input providers initialize UI controls
6. Event handlers attach for changes
```

### Data Change Flow

```
1. User modifies input value
2. dataChanged() called on PictViewDynamicForm
3. Informary marshals specific input from DOM to AppData
4. Input providers run onDataChange hooks
5. Application.solve() executes all solvers
6. Metacontroller marshals all sections back to view
7. Input providers run onDataMarshalToForm hooks
```

### Marshal Operations

- **toView** (`onMarshalToView`): AppData → Form inputs
- **fromView** (`onMarshalFromView`): Form inputs → AppData

The Informary provider handles the actual DOM operations, using data attributes
to map form elements to their corresponding data addresses.

## Template Hierarchy

Templates are rendered in a strict hierarchy:

```
Form Container
└── Section (for each)
    ├── Section Prefix
    └── Group (for each)
        ├── Group Prefix
        └── Row (for each)
            ├── Row Prefix
            ├── Input (for each)
            │   └── Input Template (by InputType or DataType)
            └── Row Postfix
        └── Group Postfix
    └── Section Postfix
```

Templates support three levels of customization:
1. **View-specific** - Templates specific to a single view instance
2. **Theme-specific** - Templates for the current template prefix/theme
3. **Default** - Fallback templates provided by the framework

## Configuration Structure

Forms are configured through manifest JSON:

```json
{
  "Scope": "FormName",

  "Sections": [
    {
      "Hash": "SectionID",
      "Name": "Display Name",
      "Solvers": ["expression1", "expression2"],
      "Groups": [...]
    }
  ],

  "Descriptors": {
    "DataAddress": {
      "Name": "Field Label",
      "Hash": "FieldHash",
      "DataType": "String",
      "PictForm": {
        "Section": "SectionID",
        "Group": "GroupID",
        "Row": 1,
        "Width": 6,
        "InputType": "Text"
      }
    }
  }
}
```

See the [Configuration Reference](Configuration.md) for complete details.

## Transaction System

The framework uses a transaction tracking system to manage asynchronous operations:

1. Each data change creates a transaction with a unique GUID
2. Async operations register themselves with the transaction
3. The transaction finalizes only when all operations complete
4. Callbacks can be registered for transaction completion

This prevents race conditions when multiple inputs trigger changes simultaneously.

## Extension Points

### Custom Input Types

Create new input types by:
1. Extending `PictInputExtensionProvider`
2. Implementing lifecycle hooks (`onInputInitialize`, `onDataChange`, etc.)
3. Registering the provider with `PictDynamicFormDependencyManager`
4. Adding templates for the new input type

### Custom Layouts

Create new layouts by:
1. Extending `PictDynamicLayoutProvider`
2. Implementing `generateGroupLayoutTemplate()`
3. Registering with the layout provider system

### Custom Solvers

Add solver functions by:
1. Extending `DynamicFormSolverBehaviors`
2. Implementing new solver functions
3. Registering with the expression parser

## Ecosystem Dependencies

Pict Section Form builds on several Pict ecosystem packages:

- **pict** - Core application framework
- **pict-view** - Base view class
- **pict-provider** - Provider base class
- **pict-template** - Template engine
- **fable** - Service provider infrastructure
- **manyfest** - Schema and data descriptor system

## Related Documentation

- [Getting Started](Getting_Started.md) - Quick start guide
- [Configuration Reference](Configuration.md) - Complete configuration options
- [Input Types](Input_Types.md) - Available input types
- [Solvers](Solvers.md) - Expression solver system
- [Templates](Templates.md) - Template customization
