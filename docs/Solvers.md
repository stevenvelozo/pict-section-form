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
| `concat(a, b)` | Concatenate strings | `concat('Hello', ' World')` |
| `uppercase(s)` | Convert to uppercase | `uppercase('hello')` → 'HELLO' |
| `lowercase(s)` | Convert to lowercase | `lowercase('HELLO')` → 'hello' |
| `trim(s)` | Remove whitespace | `trim(' hello ')` → 'hello' |
| `substring(s, start, length)` | Extract substring | `substring('hello', 0, 3)` → 'hel' |

### Array Functions

| Function | Description |
|----------|-------------|
| `sumalistarraycolumn(array, column)` | Sum values in array column |
| `averagealistarraycolumn(array, column)` | Average values in array column |
| `countalistarraycolumn(array, column)` | Count non-null values |
| `minalistarraycolumn(array, column)` | Minimum value in column |
| `maxalistarraycolumn(array, column)` | Maximum value in column |

#### Array Function Examples

```json
"Solvers": [
  "Order.Subtotal = sumalistarraycolumn(Order.Items, 'Total')",
  "Order.AverageItemPrice = averagealistarraycolumn(Order.Items, 'Price')",
  "Order.ItemCount = countalistarraycolumn(Order.Items, 'ProductID')"
]
```

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
| `SetGroupVisibility(hash, visible)` | Show/hide a group |
| `SetInputVisibility(hash, visible)` | Show/hide an input |
| `ShowSections(hash1, hash2, ...)` | Show multiple sections |
| `HideSections(hash1, hash2, ...)` | Hide multiple sections |

#### Visibility Examples

```json
"Solvers": [
  "SetSectionVisibility('ShippingAddress', Order.RequiresShipping == true)",
  "SetGroupVisibility('PaymentDetails', PaymentMethod == 'credit_card')",
  "SetInputVisibility('OtherReason', ReasonCode == 'other')"
]
```

### Styling Functions

| Function | Description |
|----------|-------------|
| `ColorSectionBackground(hash, color)` | Set section background color |
| `ColorGroupBackground(hash, color)` | Set group background color |
| `StyleInput(hash, property, value)` | Apply CSS to input |

#### Styling Examples

```json
"Solvers": [
  "ColorGroupBackground('Totals', Amount < 0 ? '#ffcccc' : '#ccffcc')",
  "StyleInput('Balance', 'font-weight', Balance < 0 ? 'bold' : 'normal')"
]
```

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

### Array Operations

| Function | Description |
|----------|-------------|
| `DifferenceArrays(a, b)` | Elements in a not in b |
| `IntersectionArrays(a, b)` | Elements in both arrays |
| `UnionArrays(a, b)` | All unique elements |

## Solver Execution Order

Solvers are executed in the order they are defined. Dependencies should be
ordered appropriately:

```json
"Solvers": [
  "LineItem.Total = LineItem.Price * LineItem.Quantity",
  "Order.Subtotal = sumalistarraycolumn(Order.Items, 'Total')",
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
