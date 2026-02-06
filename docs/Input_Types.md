# Input Types

Pict Section Form supports a variety of input types for different data entry
scenarios. Each input type can be specified via the `InputType` property in
the `PictForm` configuration.

## Default Type Mapping

When no `InputType` is specified, the framework selects a default based on
the `DataType`:

| DataType | Default Input |
|----------|--------------|
| String | Text |
| Number | Number |
| Boolean | Checkbox |
| DateTime | DateTime |
| Object | (none - requires explicit InputType) |
| Array | (none - requires explicit InputType) |

## Standard Input Types

### Text

Basic text input for string data.

```json
"PictForm": {
  "InputType": "Text",
  "Placeholder": "Enter text here",
  "MaxLength": 100
}
```

### TextArea

Multi-line text input.

```json
"PictForm": {
  "InputType": "TextArea",
  "TextAreaRows": 5,
  "Placeholder": "Enter detailed description"
}
```

### Number

Numeric input with optional min/max constraints.

```json
"PictForm": {
  "InputType": "Number",
  "Min": 0,
  "Max": 100,
  "Step": 0.01
}
```

### PreciseNumber

High-precision numeric input for financial or scientific calculations.

```json
"PictForm": {
  "InputType": "PreciseNumber",
  "Precision": 4
}
```

### Checkbox (Boolean)

Standard checkbox for boolean values.

```json
"PictForm": {
  "InputType": "Boolean"
}
```

### Select

Dropdown selection from a list of options.

```json
"PictForm": {
  "InputType": "Select",
  "SelectOptions": [
    { "id": "opt1", "text": "Option 1" },
    { "id": "opt2", "text": "Option 2" },
    { "id": "opt3", "text": "Option 3" }
  ]
}
```

#### Dynamic Options from PickList

```json
"PictForm": {
  "InputType": "Select",
  "SelectOptionsPickList": "CountryList",
  "SelectIDColumn": "code",
  "SelectTextColumn": "name"
}
```

The `SelectOptionsPickList` references a list in your AppData that the
MetaLists provider can access.

### DateTime

Date and time picker.

```json
"PictForm": {
  "InputType": "DateTime",
  "DateTimeFormat": "YYYY-MM-DD",
  "DateTimeShowTime": false
}
```

### Option

Radio button or option group selection.

```json
"PictForm": {
  "InputType": "Option",
  "SelectOptions": [
    { "id": "small", "text": "Small" },
    { "id": "medium", "text": "Medium" },
    { "id": "large", "text": "Large" }
  ]
}
```

## Advanced Input Types

### Markdown

Rich text editor with Markdown support.

```json
"PictForm": {
  "InputType": "Markdown"
}
```

### HTML

HTML content editor.

```json
"PictForm": {
  "InputType": "HTML"
}
```

### Link

Hyperlink input with URL validation.

```json
"PictForm": {
  "InputType": "Link",
  "LinkTarget": "_blank"
}
```

### Chart

Data visualization within the form. See [Chart Input Type](input_providers/009-chart.md)
for detailed configuration options.

```json
"PictForm": {
  "InputType": "Chart",
  "ChartType": "bar",
  "ChartDataAddress": "Sales.Monthly"
}
```

### Templated

Custom templated input for complex rendering needs.

```json
"PictForm": {
  "InputType": "Templated",
  "TemplatedInputTemplate": "MyCustomInputTemplate"
}
```

### TemplatedEntityLookup

Entity lookup with custom template rendering.

```json
"PictForm": {
  "InputType": "TemplatedEntityLookup",
  "EntityType": "Customer",
  "DisplayTemplate": "CustomerLookupDisplay"
}
```

## Navigation Input Types

### TabGroupSelector

Renders a tab interface for switching between groups.

```json
"PictForm": {
  "InputType": "TabGroupSelector",
  "TabGroups": ["Tab1", "Tab2", "Tab3"]
}
```

### TabSectionSelector

Renders tabs for switching between sections.

```json
"PictForm": {
  "InputType": "TabSectionSelector",
  "TabSections": ["Section1", "Section2"]
}
```

## Utility Input Types

### AutofillTriggerGroup

Triggers auto-fill functionality for a group of related inputs.

```json
"PictForm": {
  "InputType": "AutofillTriggerGroup",
  "AutofillSource": "CustomerData",
  "AutofillTargets": ["Name", "Address", "Phone"]
}
```

### EntityBundleRequest

Triggers loading of related entity data.

```json
"PictForm": {
  "InputType": "EntityBundleRequest",
  "BundleType": "CustomerOrders",
  "BundleParameter": "Customer.ID"
}
```

## Custom Input Types

You can create custom input types by:

1. Creating a provider that extends `PictInputExtensionProvider`
2. Implementing the required lifecycle hooks
3. Registering the provider
4. Creating templates for the input type

### Provider Lifecycle Hooks

| Hook | Description |
|------|-------------|
| `onInputInitialize` | Called when the input is first rendered |
| `onInputInitializeTabular` | Called for tabular inputs |
| `onDataChange` | Called when the input value changes |
| `onDataChangeTabular` | Called for tabular input changes |
| `onDataMarshalToForm` | Called when data is marshaled to the form |
| `onDataMarshalToFormTabular` | Tabular version |
| `onAfterMarshalToForm` | Called after all marshaling is complete |
| `onDataRequest` | Called for async data loading |

### Example Custom Provider

```javascript
const libPictProvider = require('pict-provider');

class CustomInputProvider extends libPictProvider
{
  constructor(pFable, pOptions, pServiceHash)
  {
    super(pFable, pOptions, pServiceHash);
    this.serviceType = 'PictFormInputExtension';
  }

  onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
  {
    // Initialize custom input behavior
    const element = document.querySelector(pHTMLSelector);
    if (element)
    {
      // Add custom initialization
    }
  }

  onDataChange(pView, pInput, pValue, pHTMLSelector)
  {
    // Handle value changes
  }
}

module.exports = CustomInputProvider;
```

### Registering Custom Input

```javascript
// Register the provider
pict.addProvider('CustomInput', CustomInputProvider);

// Add templates for the input type
pict.TemplateProvider.addTemplate(
  'Pict-Form-Template-Input-InputType-CustomInput',
  '<div class="custom-input">{~Data:Record.Name~}</div>'
);
```

## Visibility and State

Visibility can be controlled at the section and group level via solvers:

```json
"Solvers": [
  "SetSectionVisibility('ShippingAddress', Order.RequiresShipping == true)",
  "SetGroupVisibility('OrderSection', 'PaymentDetails', PaymentMethod == 'credit_card')"
]
```

See [Solvers](Solvers.md) for the full list of visibility and styling functions.

## CSS Customization

Add custom classes to inputs:

```json
"PictForm": {
  "CSSClasses": ["form-control-lg", "text-primary"]
}
```

## Related Documentation

- [Chart Input Type](input_providers/009-chart.md) - Detailed chart configuration
- [Templates](Templates.md) - Customizing input appearance
- [Solvers](Solvers.md) - Dynamic input control
