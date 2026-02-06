# Solvers

Solvers are expressions that compute values and control form behavior dynamically.
They are evaluated whenever data changes, enabling calculated fields, conditional
visibility, and dynamic styling.

## Basic Syntax

Solvers are strings that follow expression syntax:

```
TargetAddress = Expression
```

### Simple Assignment

```json
"Solvers": [
  "Order.Total = Order.Subtotal + Order.Tax"
]
```

### Using Variables

Variables reference data addresses in AppData:

```json
"Solvers": [
  "Rectangle.Area = Rectangle.Width * Rectangle.Height"
]
```

## Arithmetic Operations

Standard mathematical operators are supported:

| Operator | Description |
|----------|-------------|
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Division |
| `%` | Modulo |
| `^` | Exponentiation |

### Examples

```json
"Solvers": [
  "Circle.Area = 3.14159 * Circle.Radius ^ 2",
  "Discount.Amount = Order.Subtotal * Discount.Percentage / 100",
  "Remainder = Total % ItemsPerPage"
]
```

## Comparison Operations

| Operator | Description |
|----------|-------------|
| `==` | Equal |
| `!=` | Not equal |
| `<` | Less than |
| `>` | Greater than |
| `<=` | Less than or equal |
| `>=` | Greater than or equal |

### Examples

```json
"Solvers": [
  "IsEligible = Age >= 18",
  "NeedsReview = Amount > 10000"
]
```

## Logical Operations

| Operator | Description |
|----------|-------------|
| `&&` | Logical AND |
| `\|\|` | Logical OR |
| `!` | Logical NOT |

### Examples

```json
"Solvers": [
  "CanProceed = IsVerified && HasBalance",
  "ShowWarning = IsOverdue || AmountDue > 1000"
]
```

## Built-in Functions

### Mathematical Functions

| Function | Description | Example |
|----------|-------------|---------|
| `abs(x)` | Absolute value | `abs(-5)` → 5 |
| `round(x)` | Round to nearest integer | `round(3.7)` → 4 |
| `floor(x)` | Round down | `floor(3.7)` → 3 |
| `ceil(x)` | Round up | `ceil(3.2)` → 4 |
| `min(a, b)` | Minimum value | `min(5, 3)` → 3 |
| `max(a, b)` | Maximum value | `max(5, 3)` → 5 |
| `sqrt(x)` | Square root | `sqrt(16)` → 4 |

### String Functions

| Function | Description | Example |
|----------|-------------|---------|
| `concat(a, b, ...)` | Concatenate values into a string | `concat('Hello', ' World')` |
| `join(separator, a, b, ...)` | Join values with a separator | `join(', ', 'a', 'b', 'c')` |
| `stringgetsegments(s, delimiter)` | Split string into segments | `stringgetsegments('a,b,c', ',')` |
| `stringcountsegments(s, delimiter)` | Count segments in string | `stringcountsegments('a,b,c', ',')` → 3 |
| `resolvehtmlentities(s)` | Resolve HTML entities in string | `resolvehtmlentities('&amp;')` |

### Array Aggregation

Use the `SUM()` function with array address syntax (`Address[].Field`) to
aggregate values from arrays:

| Function | Description |
|----------|-------------|
| `SUM(Address[].Field)` | Sum values in an array column |
| `avg(values...)` | Average of values |
| `mean(values...)` | Mean of values |
| `median(values...)` | Median of values |
| `count(values...)` | Count elements |
| `min(values...)` | Minimum value |
| `max(values...)` | Maximum value |

#### Array Aggregation Examples

```json
"Solvers": [
  "Order.Subtotal = SUM(Order.Items[].Total)",
  "Order.ItemCount = count(Order.Items)"
]
```

### Array Manipulation

| Function | Description |
|----------|-------------|
| `flatten(array)` | Flatten an array of solver inputs |
| `slice(array, start, end)` | Slice an array |
| `arrayconcat(array1, array2, ...)` | Concatenate multiple arrays |
| `unionarrays(a, b)` | All unique elements from both arrays |
| `differencearrays(a, b)` | Elements in a not in b |
| `uniquearray(array)` | Return only unique values |
| `sortarray(array)` | Return a sorted array |

### Object Functions

| Function | Description |
|----------|-------------|
| `objectkeystoarray(obj)` | Get object keys as array |
| `objectvaluestoarray(obj)` | Get object values as array |

### Aggregation Functions

| Function | Description |
|----------|-------------|
| `aggregationhistogrambyobject(array, keyField, valueField)` | Create histogram |

#### Aggregation Example

```json
"Solvers": [
  "Chart.Labels = objectkeystoarray(aggregationhistogrambyobject(Sales, 'Region', 'Amount'))",
  "Chart.Data = objectvaluestoarray(aggregationhistogrambyobject(Sales, 'Region', 'Amount'))"
]
```

## Form Control Functions

### Visibility Control

| Function | Description |
|----------|-------------|
| `SetSectionVisibility(hash, visible)` | Show/hide a section |
| `SetGroupVisibility(sectionHash, groupHash, visible)` | Show/hide a group |
| `ShowSections(hash1, hash2, ...)` | Show multiple sections |
| `HideSections(hash1, hash2, ...)` | Hide multiple sections |

#### Visibility Examples

```json
"Solvers": [
  "SetSectionVisibility('ShippingAddress', Order.RequiresShipping == true)",
  "SetGroupVisibility('OrderSection', 'PaymentDetails', PaymentMethod == 'credit_card')"
]
```

### Styling Functions

| Function | Description |
|----------|-------------|
| `ColorSectionBackground(hash, color)` | Set section background color |
| `ColorGroupBackground(hash, color)` | Set group background color |
| `ColorInputBackground(hash, color)` | Set input background color |
| `ColorInputBackgroundTabular(hash, color)` | Set tabular input background color |
| `GenerateHTMLHexColor(r, g, b)` | Generate hex color from RGB integers |

#### Styling Examples

```json
"Solvers": [
  "ColorGroupBackground('Totals', Amount < 0 ? '#ffcccc' : '#ccffcc')",
  "ColorInputBackground('Balance', Balance < 0 ? '#ffcccc' : '#ffffff')"
]
```

### Solver Control Functions

| Function | Description |
|----------|-------------|
| `SetSolverOrdinalEnabled(ordinal, flag)` | Enable (1) or disable (0) a solver ordinal |
| `EnableSolverOrdinal(ordinal)` | Enable a solver ordinal |
| `DisableSolverOrdinal(ordinal)` | Disable a solver ordinal |
| `RunSolvers()` | Trigger a full solve pass across all views |
| `SetTabularRowLength(hash, length)` | Set the row count for a tabular data set |
| `RefreshTabularSection(hash)` | Refresh a tabular section display |

### Logging

| Function | Description |
|----------|-------------|
| `logvalues(label, val1, val2, ...)` | Log values to the console and return the last one |

## Conditional Expressions

Use ternary operators for conditional logic:

```
condition ? valueIfTrue : valueIfFalse
```

### Examples

```json
"Solvers": [
  "Status = Score >= 70 ? 'Pass' : 'Fail'",
  "ShippingCost = Subtotal >= 50 ? 0 : 5.99",
  "Priority = IsUrgent ? 'High' : (IsMedium ? 'Medium' : 'Low')"
]
```

## Array Manipulation

### String Segmentation

```json
"Solvers": [
  "Tags = StringGetSegments(TagString, ',')"
]
```

### Array Set Operations

| Function | Description |
|----------|-------------|
| `DifferenceArrays(a, b)` | Elements in a not in b |
| `UnionArrays(a, b)` | All unique elements from both arrays |

## Solver Execution Order

Solvers are executed in the order they are defined. Dependencies should be
ordered appropriately:

```json
"Solvers": [
  "LineItem.Total = LineItem.Price * LineItem.Quantity",
  "Order.Subtotal = SUM(Order.Items[].Total)",
  "Order.Tax = Order.Subtotal * TaxRate",
  "Order.Total = Order.Subtotal + Order.Tax"
]
```

## Section vs. Global Solvers

Solvers can be defined at the section level or at the metacontroller level:

### Section Solvers

Applied only to inputs in that section:

```json
{
  "Sections": [
    {
      "Hash": "Dimensions",
      "Solvers": [
        "Dimensions.Area = Dimensions.Width * Dimensions.Height"
      ]
    }
  ]
}
```

### Global Solvers

Applied across all sections via the metacontroller:

```javascript
pict.views.PictFormMetacontroller.sectionSolvers.push(
  'Global.Status = Customer.Status || "Unknown"'
);
```

## Debugging Solvers

### Enable Solver Logging

```javascript
pict.LogNoisiness = 3;
```

### Solver Visualization

Use the built-in solver visualization support view:

```javascript
pict.views.PictFormMetacontroller.showSolverVisualization();
```

### Log Values Function

```json
"Solvers": [
  "logvalues('Debug:', Width, Height, Area)"
]
```

## Performance Considerations

1. **Order solvers efficiently** - Put independent calculations first
2. **Avoid circular dependencies** - The framework has loop detection but
   it's better to design without cycles
3. **Minimize array operations** - Array functions iterate the entire array
   on each solve
4. **Use visibility instead of removal** - Hiding is faster than re-rendering

## Custom Solver Functions

Register custom functions with the expression parser:

```javascript
pict.providers.DynamicSolver.expressionParser.addFunction(
  'formatCurrency',
  (value) => '$' + value.toFixed(2)
);
```

Use in solvers:

```json
"Solvers": [
  "FormattedTotal = formatCurrency(Order.Total)"
]
```

## Related Documentation

- [Configuration](Configuration.md) - Solver configuration options
- [Architecture](Pict_Section_Form_Architecture.md) - Solver system internals
- [Input Types](Input_Types.md) - Input visibility control
