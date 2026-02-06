# Chart Input Provider

The Chart input provider renders Chart.js visualizations with dynamic data
loading, solver-based configuration, and intelligent update detection.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-Chart` |
| Input Type | `Chart` |
| Supports Tabular | Yes |
| Display Only | Yes |
| Dependencies | Chart.js (window.Chart) |

## Basic Usage

### Minimal Configuration

```json
{
  "Chart.Display": {
    "Name": "MVP Chart",
    "Hash": "MVPChart",
    "DataType": "Object",
    "PictForm": {
      "InputType": "Chart",
      "ChartDataAddress": "City.Populations"
    }
  }
}
```

With data:

```json
{
  "City": {
    "Populations": {
      "Seattle": 324230,
      "Lynnwood": 2349,
      "Burien": 1500,
      "Tacoma": 23498
    }
  }
}
```

By default, charts use Chart.js and render as bar charts. Object keys become
labels and values become data points.

## Configuration System

The Chart provider uses a sophisticated three-tiered configuration system:

1. **Raw** - Hard-coded values in the manifest
2. **Address** - Data from AppData addresses (overrides Raw)
3. **Solver** - Dynamically computed values (merged with base)

### Configuration Priority

```
Raw → Address (overrides) → Solver (merges) → Final Configuration
```

## Configuration Options

### Core Configuration

| Property | Type | Description |
|----------|------|-------------|
| `ChartType` | string | Chart type: bar, line, pie, doughnut, etc. |
| `ChartJSOptionsCorePrototype` | object | Base Chart.js options |
| `ChartConfigCorePrototypeRaw` | object | Raw core config |
| `ChartConfigCorePrototypeAddress` | string | Address for core config |
| `ChartConfigCorePrototype` | string | Solver for core config |

### Labels Configuration

| Property | Type | Description |
|----------|------|-------------|
| `ChartLabelsRaw` | array | Hard-coded labels array |
| `ChartLabelsAddress` | string | AppData address for labels |
| `ChartLabelsSolver` | string | Solver expression for labels |

### Datasets Configuration

| Property | Type | Description |
|----------|------|-------------|
| `ChartDatasetsRaw` | array | Hard-coded datasets array |
| `ChartDatasetsAddress` | string | AppData address for datasets |
| `ChartDatasetsSolvers` | array | Array of dataset solver configs |

### Dataset Solver Options

```json
{
  "Label": "Dataset Name",
  "DataSolver": "solver expression",
  "ChartType": "line",
  "CustomYAxisID": "y-axis-1",
  "CustomXAxisID": "x-axis-1",
  "Tension": 0.4,
  "PointRadius": 5,
  "StackGroup": "stack1"
}
```

## Examples

### Raw Data Configuration

Hard-coded chart with static data:

```json
{
  "Chart.PolarArea": {
    "Name": "Color Distribution",
    "Hash": "ColorChart",
    "DataType": "Object",
    "PictForm": {
      "Section": "Charts",
      "Row": 1,
      "Width": 6,
      "InputType": "Chart",
      "ChartLabelsRaw": ["Red", "Green", "Yellow", "Grey", "Blue"],
      "ChartDatasetsRaw": [{
        "label": "My First Dataset",
        "data": [11, 16, 7, 3, 14],
        "backgroundColor": [
          "rgb(255, 99, 132)",
          "rgb(75, 192, 192)",
          "rgb(255, 205, 86)",
          "rgb(201, 203, 207)",
          "rgb(54, 162, 235)"
        ]
      }],
      "ChartJSOptionsCorePrototype": {
        "type": "polarArea"
      }
    }
  }
}
```

### Address-Based Configuration

Read pre-computed data from AppData:

```json
{
  "Chart.Sales": {
    "Name": "Sales Chart",
    "Hash": "SalesChart",
    "DataType": "Object",
    "PictForm": {
      "Section": "Dashboard",
      "InputType": "Chart",
      "ChartType": "bar",
      "ChartLabelsAddress": "AppData.Chart.LabelsArray",
      "ChartDatasetsAddress": "AppData.Chart.Datasets"
    }
  }
}
```

### Solver-Based Configuration

Compute chart data dynamically:

```json
{
  "Chart.Calories": {
    "Name": "Fruit Calories",
    "Hash": "CaloriesChart",
    "DataType": "Object",
    "PictForm": {
      "Section": "FruitStats",
      "Row": 1,
      "Width": 6,
      "InputType": "Chart",
      "ChartType": "bar",
      "ChartLabelsSolver": "objectkeystoarray(aggregationhistogrambyobject(FruitGrid, 'name', 'nutritions.calories'))",
      "ChartDatasetsSolvers": [
        {
          "Label": "Calories",
          "DataSolver": "objectvaluestoarray(aggregationhistogrambyobject(FruitGrid, 'name', 'nutritions.calories'))"
        }
      ]
    }
  }
}
```

### Multi-Dataset Chart

```json
{
  "Chart.Comparison": {
    "Name": "Nutrition Comparison",
    "Hash": "NutritionChart",
    "DataType": "Object",
    "PictForm": {
      "Section": "Analysis",
      "InputType": "Chart",
      "ChartType": "bar",
      "ChartLabelsSolver": "objectkeystoarray(aggregationhistogrambyobject(FruitGrid, 'name', 'nutritions.calories'))",
      "ChartDatasetsSolvers": [
        {
          "Label": "Calories",
          "DataSolver": "objectvaluestoarray(aggregationhistogrambyobject(FruitGrid, 'name', 'nutritions.calories'))",
          "StackGroup": "nutrition"
        },
        {
          "Label": "Carbs",
          "DataSolver": "objectvaluestoarray(aggregationhistogrambyobject(FruitGrid, 'name', 'nutritions.carbohydrates'))",
          "StackGroup": "nutrition"
        },
        {
          "Label": "Protein",
          "DataSolver": "objectvaluestoarray(aggregationhistogrambyobject(FruitGrid, 'name', 'nutritions.protein'))",
          "StackGroup": "nutrition"
        }
      ]
    }
  }
}
```

### Mixed Chart Types

```json
{
  "Chart.Mixed": {
    "Name": "Mixed Chart",
    "Hash": "MixedChart",
    "DataType": "Object",
    "PictForm": {
      "InputType": "Chart",
      "ChartType": "bar",
      "ChartLabelsSolver": "...",
      "ChartDatasetsSolvers": [
        {
          "Label": "Sales",
          "DataSolver": "...",
          "ChartType": "bar"
        },
        {
          "Label": "Trend",
          "DataSolver": "...",
          "ChartType": "line",
          "Tension": 0.4
        }
      ]
    }
  }
}
```

## Useful Solver Functions

### Aggregation Functions

```
aggregationhistogrambyobject(array, keyField, valueField)
objectkeystoarray(object)
objectvaluestoarray(object)
SUM(Address[].Field)
```

### Example Aggregation

```json
"ChartLabelsSolver": "objectkeystoarray(aggregationhistogrambyobject(Orders, 'region', 'amount'))",
"ChartDatasetsSolvers": [{
  "Label": "Sales by Region",
  "DataSolver": "objectvaluestoarray(aggregationhistogrambyobject(Orders, 'region', 'amount'))"
}]
```

## Chart Types

Supported Chart.js chart types:

| Type | Description |
|------|-------------|
| `bar` | Vertical bar chart (default) |
| `horizontalBar` | Horizontal bar chart |
| `line` | Line chart |
| `pie` | Pie chart |
| `doughnut` | Doughnut chart |
| `polarArea` | Polar area chart |
| `radar` | Radar/spider chart |
| `scatter` | Scatter plot |
| `bubble` | Bubble chart |

## Lifecycle Hooks

### onInputInitialize

Creates the Chart.js instance:
1. Gets the chart configuration
2. Stores configuration in hidden element
3. Creates Chart object
4. Caches data snapshot for change detection

### onDataMarshalToForm

Updates chart when data changes:
1. Gets new configuration
2. Compares with cached data
3. Only calls chart.update() if data actually changed
4. Prevents unnecessary redraws for performance

### getInputChartConfiguration

Builds complete Chart.js configuration by:
1. Applying core config parsing
2. Applying labels parsing
3. Applying datasets parsing
4. Merging all results

## Performance Optimization

The provider includes intelligent change detection:

```javascript
// Only update if data actually changed
if (JSON.stringify(newData) !== JSON.stringify(cachedData)) {
  chart.data = newData;
  chart.update();
}
```

This prevents expensive chart redraws when solve() runs but chart data
hasn't changed.

## Custom Chart.js Options

Pass any Chart.js options via `ChartJSOptionsCorePrototype`:

```json
"ChartJSOptionsCorePrototype": {
  "type": "line",
  "options": {
    "responsive": true,
    "plugins": {
      "legend": {
        "position": "top"
      },
      "title": {
        "display": true,
        "text": "Sales Over Time"
      }
    },
    "scales": {
      "y": {
        "beginAtZero": true
      }
    }
  }
}
```

## Notes

- Chart.js must be loaded before using this provider
- Charts update reactively when underlying data changes
- Complex solver expressions should consider performance
- Use ChartLabelsAddress for large, pre-computed datasets

## Related Documentation

- [Solvers](../Solvers.md) - Aggregation functions
- [complex_table Example](../examples/complex_table/) - Chart usage
- [complex_tuigrid Example](../examples/complex_tuigrid/) - Chart with TuiGrid
