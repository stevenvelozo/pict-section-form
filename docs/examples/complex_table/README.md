# Complex Table Example

The Complex Table example is a comprehensive demonstration of advanced tabular
data management, calculated fields, chart integration, and dynamic form generation.

## What This Example Demonstrates

- **Multi-Section Architecture**: 8+ sections with different purposes
- **Advanced Solvers**: Aggregations, conditional logic, data transformations
- **Custom Data Providers**: Entity bundle requests and dynamic data population
- **Chart Integration**: Multiple chart types with data aggregation
- **Pick Lists**: Multiple update frequencies (Once, Always, Dynamic)
- **Row-Level Calculations**: Per-record solver expressions
- **Tab Navigation**: Tab-based section switching

## Key Files

- `Complex-Tabular-Application.js` - Main application with custom providers
- `Complex-Tabular-CustomDataProvider.js` - Custom select input provider
- `FruitData.json` - Sample data
- `html/index.html` - HTML template

## Configuration Highlights

### Pick Lists with Multiple Configurations

```javascript
"PickLists": [
  {
    "Hash": "Families",
    "ListAddress": "AppData.FruitMetaLists.Families",
    "ListSourceAddress": "FruitData.FruityVice[]",
    "TextTemplate": "{~D:Record.family~}",
    "IDTemplate": "{~D:Record.family~}",
    "Unique": true,
    "Sorted": true,
    "UpdateFrequency": "Once"
  },
  {
    "Hash": "RandomNumbers",
    "Dynamic": true
  }
]
```

### Section-Level Solvers

```javascript
"Solvers": [
  "TotalFruitCalories = SUM(FruitNutritionCalories)",
  "AverageFruitCalories = MEAN(FruitNutritionCalories)",
  "RecipeCounterSurfaceArea = RecipeCounterWidth * RecipeCounterDepth",
  "RecipeCounterVolume = RecipeCounterSurfaceArea * RecipeVerticalClearance",
  `InspirationLink = CONCAT("https://www.google.com/search?q=", RecipeName, " recipe")`,
  `MAP VAR row FROM FruitData.FruityVice : ColorInputBackgroundTabular(...)`
]
```

### Record Set Solvers (Per-Row Calculations)

```javascript
"RecordSetSolvers": [
  {
    "Ordinal": 0,
    "Expression": "PercentTotalFat = (Fat * 9) / Calories"
  },
  {
    "Ordinal": 1,
    "Expression": "ProteinFatRatio = Protein / Fat * 100"
  },
  {
    "Ordinal": 2,
    "Expression": `HealthInfoLink = CONCAT("https://www.google.com/search?q=", Family, " health information")`
  }
]
```

### Entity Bundle Requests

```javascript
"PictForm": {
  "Providers": ["Pict-Input-EntityBundleRequest", "Pict-Input-AutofillTriggerGroup"],
  "EntitiesBundle": [
    {
      "Entity": "Author",
      "Filter": "FBV~IDAuthor~EQ~{~D:Record.Value~}",
      "Destination": "AppData.CurrentAuthor",
      "SingleRecord": true
    },
    {
      "Entity": "BookAuthorJoin",
      "Filter": "FBV~IDAuthor~EQ~{~D:AppData.CurrentAuthor.IDAuthor~}",
      "Destination": "AppData.BookAuthorJoins"
    }
  ],
  "EntityBundleTriggerGroup": "BookTriggerGroup"
}
```

### Chart Input with Solver-Based Data

```javascript
"PictForm": {
  "InputType": "Chart",
  "ChartType": "bar",
  "ChartLabelsSolver": `objectkeystoarray(aggregationhistogrambyobject(FruitGrid, "name", "nutritions.calories"))`,
  "ChartDatasetsSolvers": [
    {
      "Label": "Calories",
      "DataSolver": `objectvaluestoarray(aggregationhistogrambyobject(FruitGrid, "name", "nutritions.calories"))`
    }
  ]
}
```

### Tab Group Selector

```javascript
"UI.StatisticsTabState": {
  "PictForm": {
    "InputType": "TabGroupSelector",
    "TabGroupSet": ["Statistics", "FruitStatistics"],
    "TabGroupNames": ["Statistics", "Fruit Statistics"]
  }
}
```

## Custom Provider Example

```javascript
class CustomSelectInputProvider extends SelectInputProvider {
  onEvent(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID) {
    const tmpEventParts = pEvent.split(':');
    if (tmpEventParts[0] === 'GetPickList') {
      const tmpListData = this.pict.manifest.getValueByHash(this.pict, tmpEventParts[2]);
      if (tmpListData.length === 0) {
        // Populate with random data
        for (let i = 0; i < 10; ++i) {
          tmpListData.push({ id: `random-${Math.random()}`, text: `${i}` });
        }
      }
    }
    return super.onEvent(...arguments);
  }
}
```

## Running the Example

```bash
cd example_applications/complex_table
npm install
npm run build
# Open html/index.html in a browser
```

## Key Concepts Illustrated

1. **Complex Data Relationships**: Entity bundles handle related data loading
2. **Advanced Calculations**: Aggregations, row-level solvers, conditional styling
3. **Dynamic Pick Lists**: Multiple refresh strategies for dropdowns
4. **Chart Integration**: Native Chart.js support with computed data
5. **Provider Extensions**: Custom input providers for specialized behavior
