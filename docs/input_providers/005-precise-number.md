# PreciseNumber Input Provider

The PreciseNumber input provider formats numeric values with precision control,
thousand separators, and prefix/postfix support.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-PreciseNumber` |
| Input Type | `PreciseNumber`, `PreciseNumberReadOnly` |
| Supports Tabular | Yes |

## Basic Usage

```json
{
  "Order.Total": {
    "Name": "Order Total",
    "Hash": "Total",
    "DataType": "PreciseNumber",
    "PictForm": {
      "Section": "Order",
      "InputType": "PreciseNumber",
      "DecimalPrecision": 2
    }
  }
}
```

## Configuration Options

### DecimalPrecision

Number of decimal places to display:

```json
"PictForm": {
  "DecimalPrecision": 2
}
```

Results:
- `1234.5678` → `1234.57`
- `100` → `100.00`

### RoundingMethod

Algorithm used for rounding. Default is `roundHalfUp`.

```json
"PictForm": {
  "RoundingMethod": "roundHalfUp"
}
```

### AddCommas

Add thousand separators to the number:

```json
"PictForm": {
  "AddCommas": true
}
```

Results:
- `1234567.89` → `1,234,567.89`

### DigitsPrefix

String to prepend to the formatted number:

```json
"PictForm": {
  "DigitsPrefix": "$"
}
```

Results:
- `1234.56` → `$1234.56`

### DigitsPostfix

String to append to the formatted number:

```json
"PictForm": {
  "DigitsPostfix": " USD"
}
```

Results:
- `1234.56` → `1234.56 USD`

## Complete Example

Currency formatting with all options:

```json
{
  "Invoice.Amount": {
    "Name": "Invoice Amount",
    "Hash": "Amount",
    "DataType": "PreciseNumber",
    "PictForm": {
      "Section": "Invoice",
      "Row": 1,
      "Width": 4,
      "InputType": "PreciseNumber",
      "DecimalPrecision": 2,
      "AddCommas": true,
      "DigitsPrefix": "$",
      "DigitsPostfix": " (estimated)"
    }
  }
}
```

Result: `$1,234,567.89 (estimated)`

## Read-Only Variant

Use `PreciseNumberReadOnly` for display-only formatted numbers:

```json
{
  "Report.TotalSales": {
    "Name": "Total Sales",
    "Hash": "TotalSales",
    "DataType": "PreciseNumber",
    "PictForm": {
      "InputType": "PreciseNumberReadOnly",
      "DecimalPrecision": 2,
      "AddCommas": true,
      "DigitsPrefix": "$"
    }
  }
}
```

## Lifecycle Hooks

### roundValue

Internal method that applies all formatting transformations:
1. Rounds to specified precision
2. Adds comma separators if enabled
3. Prepends prefix
4. Appends postfix

### onDataMarshalToForm

Formats and displays the value. For editable inputs, the formatted value
is shown while the precise value is maintained internally.

### onDataMarshalToFormTabular

Handles formatting for tabular rows. Stores both:
- Formatted value in visible element
- Precise value in hidden element for data marshaling

## Tabular Usage

```json
{
  "ReferenceManifests": {
    "LineItem": {
      "Descriptors": {
        "UnitPrice": {
          "Name": "Unit Price",
          "Hash": "UnitPrice",
          "DataType": "PreciseNumber",
          "PictForm": {
            "InputType": "PreciseNumber",
            "DecimalPrecision": 2,
            "DigitsPrefix": "$"
          }
        },
        "Total": {
          "Name": "Total",
          "Hash": "Total",
          "DataType": "PreciseNumber",
          "PictForm": {
            "InputType": "PreciseNumberReadOnly",
            "DecimalPrecision": 2,
            "AddCommas": true,
            "DigitsPrefix": "$"
          }
        }
      }
    }
  }
}
```

## Common Formatting Patterns

### Currency (USD)
```json
{
  "DecimalPrecision": 2,
  "AddCommas": true,
  "DigitsPrefix": "$"
}
```

### Percentage
```json
{
  "DecimalPrecision": 1,
  "DigitsPostfix": "%"
}
```

### Scientific/High Precision
```json
{
  "DecimalPrecision": 6,
  "AddCommas": false
}
```

### Integer with Commas
```json
{
  "DecimalPrecision": 0,
  "AddCommas": true
}
```

## Notes

- The precise unformatted value is maintained for calculations
- Formatting is applied on display, not on the underlying data
- Works with solver expressions that output numeric values

## Related Documentation

- [Input Types](../Input_Types.md) - Overview of all input types
- [Solvers](../Solvers.md) - Mathematical expressions
