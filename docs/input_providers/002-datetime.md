# DateTime Input Provider

The DateTime input provider handles date and time input fields with proper
formatting and value persistence.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-DateTime` |
| Input Type | `DateTime` |
| Supports Tabular | Yes |

## Basic Usage

```json
{
  "Order.DueDate": {
    "Name": "Due Date",
    "Hash": "DueDate",
    "DataType": "DateTime",
    "PictForm": {
      "Section": "Order",
      "InputType": "DateTime",
      "Providers": ["Pict-Input-DateTime"]
    }
  }
}
```

## Configuration Options

### DateTimeFormat

Specifies the display format for dates. Uses standard date format strings.

```json
"PictForm": {
  "InputType": "DateTime",
  "DateTimeFormat": "YYYY-MM-DD"
}
```

### DateTimeShowTime

Controls whether the time portion is displayed.

```json
"PictForm": {
  "InputType": "DateTime",
  "DateTimeShowTime": false
}
```

## How It Works

The DateTime provider uses a dual-input approach:

1. **Visible Input**: An HTML5 `datetime-local` input for user interaction
2. **Hidden Input**: Stores the underlying value for form marshaling

This ensures proper formatting while maintaining data integrity.

## Lifecycle Hooks

### onDataMarshalToForm

Formats and assigns the date value to the visible input element. Handles
conversion between internal data format and display format.

### onDataMarshalToFormTabular

Same as above but for tabular row contexts, addressing the correct row
element.

### onDataRequest

Reads the datetime value from the input with error handling for invalid
or empty values.

### onDataRequestTabular

Reads datetime value from a specific tabular row.

## Tabular Usage

In grid layouts, DateTime inputs work per-row:

```json
{
  "ReferenceManifests": {
    "Task": {
      "Descriptors": {
        "DueDate": {
          "Name": "Due Date",
          "Hash": "DueDate",
          "DataType": "DateTime",
          "PictForm": {
            "InputType": "DateTime",
            "Providers": ["Pict-Input-DateTime"]
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
  "Descriptors": {
    "Event.StartDate": {
      "Name": "Event Start",
      "Hash": "StartDate",
      "DataType": "DateTime",
      "PictForm": {
        "Section": "Event",
        "Row": 1,
        "Width": 6,
        "InputType": "DateTime",
        "Providers": ["Pict-Input-DateTime"]
      }
    },
    "Event.EndDate": {
      "Name": "Event End",
      "Hash": "EndDate",
      "DataType": "DateTime",
      "PictForm": {
        "Section": "Event",
        "Row": 1,
        "Width": 6,
        "InputType": "DateTime",
        "Providers": ["Pict-Input-DateTime"]
      }
    }
  }
}
```

## Notes

- The provider uses the browser's native datetime-local input
- Timezone handling may require additional configuration
- Empty values are handled gracefully without errors

## Related Documentation

- [Input Types](../Input_Types.md) - Overview of all input types
- [Configuration](../Configuration.md) - Descriptor configuration
