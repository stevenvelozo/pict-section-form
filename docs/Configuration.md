# Configuration Reference

This document provides a complete reference for Pict Section Form configuration
options.

## Manifest Structure

A form manifest is a JSON object with the following top-level properties:

```json
{
  "Scope": "string",
  "Sections": [],
  "Descriptors": {},
  "ReferenceManifests": {},
  "Form-Section-Configuration": {}
}
```

## Scope

The `Scope` property is a string identifier for the form manifest.

```json
{
  "Scope": "CustomerRegistration"
}
```

## Sections

Sections are the top-level organizational units of a form.

### Section Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `Hash` | string | Yes | Unique identifier for the section |
| `Name` | string | Yes | Display name |
| `Description` | string | No | Help text or description |
| `Groups` | array | No | Array of group definitions |
| `Solvers` | array | No | Array of solver expressions |
| `MetaTemplates` | array | No | Custom templates for this section |
| `InitialBundle` | array | No | Data to load before rendering |
| `DefaultDestinationAddress` | string | No | Override DOM container selector |
| `Visible` | boolean | No | Initial visibility (default: true) |

### Section Example

```json
{
  "Hash": "PersonalInfo",
  "Name": "Personal Information",
  "Description": "Enter your personal details",
  "Groups": [
    {
      "Hash": "Identity",
      "Name": "Identity"
    },
    {
      "Hash": "Contact",
      "Name": "Contact Details"
    }
  ],
  "Solvers": [
    "PersonalInfo.FullName = PersonalInfo.FirstName + ' ' + PersonalInfo.LastName"
  ]
}
```

## Groups

Groups organize inputs within a section.

### Group Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `Hash` | string | Yes | Unique identifier within the section |
| `Name` | string | No | Display name |
| `Description` | string | No | Help text |
| `Layout` | string | No | Layout type (default: "Record") |
| `RecordSetAddress` | string | No | Data address for tabular layouts |
| `Rows` | array | No | Explicit row definitions (auto-generated if omitted) |
| `CSSClasses` | array | No | CSS classes to apply |
| `Visible` | boolean | No | Initial visibility (default: true) |

### Layout Types

- `Record` - Standard form layout with rows and columns
- `VerticalRecord` - Single column layout
- `Tabular` - Table layout with multiple data rows
- `RecordSet` - Multiple related records
- `TuiGrid` - TUI Grid integration
- `Chart` - Data visualization

### Group Example

```json
{
  "Hash": "LineItems",
  "Name": "Order Line Items",
  "Layout": "Tabular",
  "RecordSetAddress": "Order.Items",
  "CSSClasses": ["striped-table"]
}
```

## Descriptors

Descriptors define individual form fields and their data mapping.

### Descriptor Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `Name` | string | Yes | Display label |
| `Hash` | string | Yes | Unique identifier |
| `Description` | string | No | Tooltip/help text |
| `DataType` | string | Yes | Data type |
| `Default` | any | No | Default value |
| `PictForm` | object | Yes | Form-specific configuration |

### DataType Values

- `String` - Text values
- `Number` - Numeric values
- `Boolean` - True/false
- `DateTime` - Date and time
- `Object` - Complex objects
- `Array` - Arrays

### Descriptor Example

```json
"Customer.Email": {
  "Name": "Email Address",
  "Hash": "CustomerEmail",
  "Description": "We'll use this to contact you about your order",
  "DataType": "String",
  "Default": "",
  "PictForm": {
    "Section": "Customer",
    "Group": "Contact",
    "Row": 2,
    "Width": 8,
    "InputType": "Text"
  }
}
```

## PictForm Configuration

The `PictForm` object within a descriptor controls form-specific behavior.

### PictForm Properties

| Property | Type | Description |
|----------|------|-------------|
| `Section` | string | Section hash where this input appears |
| `Group` | string | Group hash within the section |
| `Row` | number | Row number for positioning |
| `Width` | number | Width in grid units (1-12) |
| `InputType` | string | Override default input type |
| `Providers` | array | Additional input providers |
| `CSSClasses` | array | CSS classes for the input |
| `Placeholder` | string | Placeholder text |

### Input-Type Specific Properties

Different input types support additional properties:

#### Select Inputs

```json
"PictForm": {
  "InputType": "Select",
  "SelectOptions": [
    { "id": "opt1", "text": "Option 1" },
    { "id": "opt2", "text": "Option 2" }
  ],
  "SelectOptionsPickList": "StatesList",
  "SelectIDColumn": "id",
  "SelectTextColumn": "text"
}
```

#### DateTime Inputs

```json
"PictForm": {
  "InputType": "DateTime",
  "DateTimeFormat": "YYYY-MM-DD"
}
```

#### TextArea Inputs

```json
"PictForm": {
  "InputType": "TextArea",
  "TextAreaRows": 5
}
```

#### Chart Inputs

See [Chart Input Type](input_providers/009-chart.md) for complete chart configuration.

### Tabular Input Properties

For inputs in tabular layouts:

| Property | Type | Description |
|----------|------|-------------|
| `InformaryContainerAddress` | string | Address of the array containing rows |
| `InformaryDataAddress` | string | Address of the field within each row |

## MetaTemplates

Custom templates can be injected at the section or metacontroller level.

```json
"MetaTemplates": [
  {
    "HashPostfix": "-Template-Input-InputType-CustomWidget",
    "Template": "<div class=\"custom-widget\">{~Data:Record.Name~}</div>"
  }
]
```

## Form-Section-Configuration

Global form configuration options:

```json
"Form-Section-Configuration": {
  "DefaultTemplatePrefix": "MyTheme-",
  "AutoPopulateRowsFromDescriptors": true,
  "AutoCreateMissingGroups": true
}
```

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `DefaultTemplatePrefix` | string | "Pict-" | Template prefix for theme |
| `AutoPopulateRowsFromDescriptors` | boolean | true | Auto-create rows from descriptors |
| `AutoCreateMissingGroups` | boolean | true | Auto-create groups referenced in descriptors |

## Reference Manifests

Reference manifests define schemas for nested or related data:

```json
"ReferenceManifests": {
  "LineItem": {
    "Scope": "LineItem",
    "Descriptors": {
      "ProductName": {
        "Name": "Product",
        "Hash": "ProductName",
        "DataType": "String"
      },
      "Quantity": {
        "Name": "Qty",
        "Hash": "Quantity",
        "DataType": "Number"
      }
    }
  }
}
```

## Complete Example

```json
{
  "Scope": "OrderForm",

  "Form-Section-Configuration": {
    "DefaultTemplatePrefix": "Bootstrap5-"
  },

  "Sections": [
    {
      "Hash": "Customer",
      "Name": "Customer Information",
      "Groups": [
        { "Hash": "Identity", "Name": "Customer" },
        { "Hash": "Address", "Name": "Shipping Address" }
      ]
    },
    {
      "Hash": "Items",
      "Name": "Order Items",
      "Groups": [
        {
          "Hash": "LineItems",
          "Layout": "Tabular",
          "RecordSetAddress": "Order.Items"
        }
      ],
      "Solvers": [
        "LineItem.Total = LineItem.Price * LineItem.Quantity",
        "Order.Subtotal = SUM(Order.Items[].Total)"
      ]
    },
    {
      "Hash": "Summary",
      "Name": "Order Summary",
      "Solvers": [
        "Order.Tax = Order.Subtotal * 0.0825",
        "Order.GrandTotal = Order.Subtotal + Order.Tax + Order.Shipping"
      ]
    }
  ],

  "Descriptors": {
    "Customer.Name": {
      "Name": "Customer Name",
      "Hash": "CustomerName",
      "DataType": "String",
      "PictForm": {
        "Section": "Customer",
        "Group": "Identity",
        "Row": 1,
        "Width": 12
      }
    },
    "Customer.Email": {
      "Name": "Email",
      "Hash": "Email",
      "DataType": "String",
      "PictForm": {
        "Section": "Customer",
        "Group": "Identity",
        "Row": 2,
        "Width": 6,
        "InputType": "Text",
        "Placeholder": "name@example.com"
      }
    },
    "Customer.Phone": {
      "Name": "Phone",
      "Hash": "Phone",
      "DataType": "String",
      "PictForm": {
        "Section": "Customer",
        "Group": "Identity",
        "Row": 2,
        "Width": 6
      }
    },
    "Address.Street": {
      "Name": "Street Address",
      "Hash": "Street",
      "DataType": "String",
      "PictForm": {
        "Section": "Customer",
        "Group": "Address",
        "Row": 1,
        "Width": 12
      }
    },
    "Address.City": {
      "Name": "City",
      "Hash": "City",
      "DataType": "String",
      "PictForm": {
        "Section": "Customer",
        "Group": "Address",
        "Row": 2,
        "Width": 6
      }
    },
    "Address.State": {
      "Name": "State",
      "Hash": "State",
      "DataType": "String",
      "PictForm": {
        "Section": "Customer",
        "Group": "Address",
        "Row": 2,
        "Width": 3,
        "InputType": "Select",
        "SelectOptionsPickList": "USStates"
      }
    },
    "Address.Zip": {
      "Name": "ZIP Code",
      "Hash": "Zip",
      "DataType": "String",
      "PictForm": {
        "Section": "Customer",
        "Group": "Address",
        "Row": 2,
        "Width": 3
      }
    },
    "Order.Subtotal": {
      "Name": "Subtotal",
      "Hash": "Subtotal",
      "DataType": "Number",
      "PictForm": {
        "Section": "Summary",
        "Row": 1,
        "Width": 4
      }
    },
    "Order.Tax": {
      "Name": "Tax",
      "Hash": "Tax",
      "DataType": "Number",
      "PictForm": {
        "Section": "Summary",
        "Row": 1,
        "Width": 4
      }
    },
    "Order.GrandTotal": {
      "Name": "Grand Total",
      "Hash": "GrandTotal",
      "DataType": "Number",
      "PictForm": {
        "Section": "Summary",
        "Row": 1,
        "Width": 4,
        "CSSClasses": ["fw-bold", "fs-4"]
      }
    }
  },

  "ReferenceManifests": {
    "LineItem": {
      "Scope": "LineItem",
      "Descriptors": {
        "ProductName": {
          "Name": "Product",
          "Hash": "ProductName",
          "DataType": "String",
          "PictForm": { "Width": 4 }
        },
        "Price": {
          "Name": "Price",
          "Hash": "Price",
          "DataType": "Number",
          "PictForm": { "Width": 2 }
        },
        "Quantity": {
          "Name": "Qty",
          "Hash": "Quantity",
          "DataType": "Number",
          "PictForm": { "Width": 2 }
        },
        "Total": {
          "Name": "Total",
          "Hash": "Total",
          "DataType": "Number",
          "PictForm": { "Width": 2 }
        }
      }
    }
  }
}
```
