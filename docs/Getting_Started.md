# Getting Started with Pict Section Form

This guide walks through creating your first dynamic form with Pict Section Form.

## Installation

```bash
npm install pict-section-form
```

## Basic Setup

### 1. Create a Manifest

Forms are defined through JSON manifests. Here's a minimal example:

```json
{
  "Scope": "ContactForm",

  "Descriptors": {
    "Contact.FirstName": {
      "Name": "First Name",
      "Hash": "FirstName",
      "DataType": "String",
      "PictForm": { "Section": "Contact", "Row": 1, "Width": 6 }
    },
    "Contact.LastName": {
      "Name": "Last Name",
      "Hash": "LastName",
      "DataType": "String",
      "PictForm": { "Section": "Contact", "Row": 1, "Width": 6 }
    },
    "Contact.Email": {
      "Name": "Email Address",
      "Hash": "Email",
      "DataType": "String",
      "PictForm": { "Section": "Contact", "Row": 2, "Width": 12 }
    }
  },

  "Sections": [
    {
      "Hash": "Contact",
      "Name": "Contact Information",
      "Groups": []
    }
  ]
}
```

### 2. Set Up the Application

```javascript
const libPictSectionForm = require('pict-section-form');

// Create the application
const formApp = new libPictSectionForm.PictFormApplication(
  fable,  // Your fable instance
  {
    pict_configuration: {
      Product: "ContactForm",
      DefaultFormManifest: yourManifestJSON
    }
  }
);

// Initialize and render
formApp.initialize();
formApp.pict.views.PictFormMetacontroller.render();
```

### 3. Add a Container Element

Your HTML needs a container for the form:

```html
<div id="Pict-Form-Container-Contact"></div>
```

The container ID follows the pattern `Pict-Form-Container-{SectionHash}`.

## Understanding the Manifest

### Descriptors

Descriptors define individual form fields. Each descriptor maps a data address
to a form input:

```json
"Contact.FirstName": {
  "Name": "First Name",           // Display label
  "Hash": "FirstName",            // Unique identifier
  "Description": "Enter first name", // Tooltip/help text
  "DataType": "String",           // Data type for validation
  "PictForm": {
    "Section": "Contact",         // Which section this belongs to
    "Group": "PersonalInfo",      // Optional group within section
    "Row": 1,                     // Row number for layout
    "Width": 6,                   // Width (1-12 grid units)
    "InputType": "Text"           // Optional: specific input type
  }
}
```

The key (`Contact.FirstName`) is the address where data will be stored in
your application state.

### Sections

Sections are the top-level organizational unit:

```json
{
  "Hash": "Contact",
  "Name": "Contact Information",
  "Description": "Enter your contact details",
  "Groups": [
    {
      "Hash": "PersonalInfo",
      "Name": "Personal Information"
    },
    {
      "Hash": "AddressInfo",
      "Name": "Address"
    }
  ]
}
```

### Groups

Groups organize inputs within a section. Inputs are assigned to groups via
their `PictForm.Group` property. If no group is specified, inputs go to a
default unnamed group.

## Working with Data

### Accessing Form Data

Form data is stored in your application's AppData:

```javascript
// Get the current data
const formData = pict.AppData;

// Access specific values
const firstName = formData.Contact.FirstName;
```

### Setting Data Programmatically

```javascript
// Set values in AppData
pict.AppData.Contact.FirstName = "John";
pict.AppData.Contact.LastName = "Doe";

// Marshal to view to update the form
pict.views.PictFormMetacontroller.marshalToView();
```

### Responding to Changes

The form automatically marshals data when inputs change. You can add custom
logic by extending the view or adding input providers.

## Adding Calculated Fields

Use solvers for computed values:

```json
{
  "Scope": "AreaCalculator",

  "Descriptors": {
    "Dimensions.Width": {
      "Name": "Width",
      "Hash": "Width",
      "DataType": "Number",
      "PictForm": { "Section": "Area", "Row": 1, "Width": 4 }
    },
    "Dimensions.Height": {
      "Name": "Height",
      "Hash": "Height",
      "DataType": "Number",
      "PictForm": { "Section": "Area", "Row": 1, "Width": 4 }
    },
    "Dimensions.Area": {
      "Name": "Area",
      "Hash": "Area",
      "DataType": "Number",
      "PictForm": { "Section": "Area", "Row": 1, "Width": 4 }
    }
  },

  "Sections": [
    {
      "Hash": "Area",
      "Name": "Area Calculator",
      "Solvers": [
        "Dimensions.Area = Dimensions.Width * Dimensions.Height"
      ]
    }
  ]
}
```

When Width or Height changes, Area is automatically recalculated.

## Input Types

The default input type is determined by DataType:

| DataType | Default Input |
|----------|--------------|
| String   | Text input   |
| Number   | Number input |
| Boolean  | Checkbox     |
| DateTime | Date picker  |

Override with the `InputType` property:

```json
"PictForm": {
  "InputType": "TextArea"
}
```

Available input types include:
- Text, TextArea, Number
- Select (dropdown)
- DateTime
- Checkbox
- Chart
- Markdown, HTML
- And more...

See [Input Types](Input_Types.md) for the complete list.

## Layouts

Groups can use different layouts:

```json
{
  "Hash": "DataGrid",
  "Name": "Data Entry",
  "Layout": "Tabular"  // Renders as a table with rows
}
```

Available layouts:
- **Record** (default) - Standard form layout
- **Tabular** - Table with multiple data rows
- **Chart** - Data visualization
- **TuiGrid** - Advanced grid with TUI Grid integration

## Example: Complete Form

Here's a more complete example combining multiple concepts:

```json
{
  "Scope": "OrderForm",

  "Sections": [
    {
      "Hash": "Customer",
      "Name": "Customer Information",
      "Groups": [
        { "Hash": "Contact", "Name": "Contact" },
        { "Hash": "Shipping", "Name": "Shipping Address" }
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
        "Order.Subtotal = sumalistarraycolumn(Order.Items, 'Total')"
      ]
    },
    {
      "Hash": "Summary",
      "Name": "Order Summary",
      "Solvers": [
        "Order.Tax = Order.Subtotal * 0.08",
        "Order.Total = Order.Subtotal + Order.Tax"
      ]
    }
  ],

  "Descriptors": {
    "Customer.Name": {
      "Name": "Customer Name",
      "Hash": "CustomerName",
      "DataType": "String",
      "PictForm": { "Section": "Customer", "Group": "Contact", "Row": 1, "Width": 12 }
    }
    // ... more descriptors
  }
}
```

## Next Steps

- [Configuration Reference](Configuration.md) - All configuration options
- [Input Types](Input_Types.md) - Available input types
- [Solvers](Solvers.md) - Expression solver system
- [Templates](Templates.md) - Customizing appearance
- [Architecture](Pict_Section_Form_Architecture.md) - How it works internally
