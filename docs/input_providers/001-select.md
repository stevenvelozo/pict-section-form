# Select Input Provider

The Select input provider manages dropdown/select list inputs with support for
static options, dynamic pick lists, and option filtering.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-Select` |
| Input Type | `Select`, `Option` |
| Supports Tabular | Yes |

## Basic Usage

### Static Options

```json
{
  "MyField": {
    "Name": "Status",
    "Hash": "Status",
    "DataType": "String",
    "PictForm": {
      "InputType": "Select",
      "SelectOptions": [
        { "id": "draft", "text": "Draft" },
        { "id": "published", "text": "Published" },
        { "id": "archived", "text": "Archived" }
      ]
    }
  }
}
```

### Dynamic Pick List

```json
{
  "MyField": {
    "Name": "Category",
    "Hash": "Category",
    "DataType": "String",
    "PictForm": {
      "InputType": "Select",
      "SelectOptionsPickList": "CategoryList"
    }
  }
}
```

## Configuration Options

### SelectOptions

Static array of options. Each option should have:
- `id` - The value stored when selected
- `text` - The display text shown to users

```json
"SelectOptions": [
  { "id": "value1", "text": "Display Text 1" },
  { "id": "value2", "text": "Display Text 2" }
]
```

### SelectOptionsPickList

Reference to a dynamic pick list defined in the section or metacontroller.

```json
"SelectOptionsPickList": "MyPickListHash"
```

The pick list is defined in the section configuration:

```json
{
  "PickLists": [
    {
      "Hash": "MyPickListHash",
      "ListAddress": "AppData.PickLists.MyList",
      "ListSourceAddress": "SourceData.Items[]",
      "TextTemplate": "{~D:Record.name~}",
      "IDTemplate": "{~D:Record.id~}",
      "Unique": true,
      "Sorted": true,
      "UpdateFrequency": "Once"
    }
  ]
}
```

### Pick List Properties

| Property | Type | Description |
|----------|------|-------------|
| `Hash` | string | Unique identifier for the pick list |
| `ListAddress` | string | Where to store generated list in AppData |
| `ListSourceAddress` | string | Source data address (use `[]` for arrays) |
| `TextTemplate` | string | Template for display text |
| `IDTemplate` | string | Template for option ID/value |
| `Unique` | boolean | Remove duplicate values |
| `Sorted` | boolean | Sort options alphabetically |
| `UpdateFrequency` | string | When to refresh: `"Once"`, `"Always"` |

## Lifecycle Hooks

### onInputInitialize

Called when the input is first rendered. Refreshes the select list options
from either static configuration or dynamic pick list.

### onDataMarshalToForm

Sets the selected option based on the current data value. Handles both
standard and tabular contexts.

### onDataRequest

Reads the currently selected value from the dropdown element.

## Integration with List Distilling

The Select provider integrates with the ListDistilling provider to filter
options based on view state. This enables cascading dropdowns where one
selection affects another's available options.

```json
{
  "PickLists": [
    {
      "Hash": "CityList",
      "ListSourceAddress": "Data.Cities[]",
      "TextTemplate": "{~D:Record.name~}",
      "IDTemplate": "{~D:Record.id~}",
      "DistillRules": [
        {
          "FilterField": "stateId",
          "FilterAddress": "AppData.SelectedState"
        }
      ]
    }
  ]
}
```

## Tabular Usage

In tabular layouts, the Select provider automatically handles per-row
option management:

```json
{
  "ReferenceManifests": {
    "LineItem": {
      "Descriptors": {
        "ProductCategory": {
          "Name": "Category",
          "Hash": "Category",
          "DataType": "String",
          "PictForm": {
            "InputType": "Select",
            "SelectOptionsPickList": "ProductCategories"
          }
        }
      }
    }
  }
}
```

## Example: Complete Configuration

```json
{
  "Sections": [
    {
      "Hash": "Order",
      "PickLists": [
        {
          "Hash": "StateList",
          "ListAddress": "AppData.PickLists.States",
          "ListSourceAddress": "ReferenceData.States[]",
          "TextTemplate": "{~D:Record.name~}",
          "IDTemplate": "{~D:Record.code~}",
          "Sorted": true,
          "UpdateFrequency": "Once"
        }
      ]
    }
  ],
  "Descriptors": {
    "Customer.State": {
      "Name": "State",
      "Hash": "CustomerState",
      "DataType": "String",
      "PictForm": {
        "Section": "Order",
        "InputType": "Select",
        "SelectOptionsPickList": "StateList"
      }
    }
  }
}
```

## Related Documentation

- [Input Types](../Input_Types.md) - Overview of all input types
- [Configuration](../Configuration.md) - Pick list configuration
