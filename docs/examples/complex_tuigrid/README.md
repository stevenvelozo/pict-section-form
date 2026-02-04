# Complex TuiGrid Example

The Complex TuiGrid example showcases advanced grid-based data editing using
TUI Grid integration with calculated fields, aggregations, and dynamic pick lists.

## What This Example Demonstrates

- **TuiGrid Layout**: Enterprise-grade data grid with editing capabilities
- **Aggregation Solvers**: SUM, MEAN calculations across grid data
- **Row-Level Solvers**: Per-record calculations (e.g., fat percentage)
- **Dynamic Pick Lists**: Unique values extracted from data arrays
- **DateTime Integration**: Date picker within grid cells
- **Meta-Templates**: Custom header content with solve button

## Key Files

- `Complex-TuiGrid-Application.js` - Main application with full configuration
- `FruitData.json` - 40+ fruit records with nutritional data
- `html/index.html` - HTML template with TUI Grid styles

## Configuration Highlights

### TuiGrid Group Configuration

```javascript
{
  "Hash": "FruitGrid",
  "Name": "FruitGrid",
  "Layout": "TuiGrid",
  "RecordSetSolvers": [{
    "Ordinal": 0,
    "Expression": "PercentTotalFat = (Fat * 9) / Calories"
  }],
  "RecordSetAddress": "FruitData.FruityVice",
  "RecordManifest": "FruitEditor"
}
```

### Aggregation Solvers

```javascript
"Solvers": [
  "TotalFruitCalories = SUM(FruitNutritionCalories)",
  "AverageFruitCalories = MEAN(FruitNutritionCalories)",
  {
    "Ordinal": 99,
    "Expression": "AverageFatPercent = MEAN(FruitPercentTotalFat)"
  },
  "RecipeCounterSurfaceArea = RecipeCounterWidth * RecipeCounterDepth",
  "RecipeCounterVolume = RecipeCounterSurfaceArea * RecipeVerticalClearance"
]
```

### Pick Lists with Unique Values

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
    "Hash": "Genuses",
    "ListAddress": "AppData.FruitMetaLists.Genuses",
    "ListSourceAddress": "FruitData.FruityVice[]",
    "TextTemplate": "{~D:Record.genus~}",
    "IDTemplate": "{~D:Record.genus~}",
    "Sorted": true,
    "UpdateFrequency": "Always"
  }
]
```

### Grid Column with Select Options

```javascript
"family": {
  "Name": "Family",
  "Hash": "Family",
  "DataType": "String",
  "PictForm": {
    "InputType": "Option",
    "Providers": ["Pict-Input-Select"],
    "SelectOptionsPickList": "Families"
  }
}
```

### DateTime in Grid

```javascript
"lastWatered": {
  "Name": "Last Watered",
  "Hash": "LastWatered",
  "DataType": "DateTime",
  "PictForm": {
    "InputType": "DateTime",
    "Providers": ["Pict-Input-DateTime"]
  }
}
```

### Nested Data Mapping

```javascript
"nutritions.calories": {
  "Name": "Calories",
  "Hash": "Calories",
  "DataType": "Number",
  "PictForm": {
    "DecimalPrecision": 2
  }
}
```

### Array Element References for Solvers

```javascript
"Descriptors": {
  "FruitData.FruityVice[].nutritions.calories": {
    "Hash": "FruitNutritionCalories"
  },
  "FruitData.FruityVice[].nutritions.percent_total_fat": {
    "Hash": "FruitPercentTotalFat"
  }
}
```

### Statistics Display Fields

```javascript
"FruitStats.TotalCalories": {
  "Name": "Total Calories in All Fruits",
  "Hash": "TotalFruitCalories",
  "DataType": "PreciseNumber",
  "PictForm": {
    "Section": "Recipe",
    "Group": "FruitStatistics",
    "Row": 1,
    "Width": 1
  }
}
```

### Meta-Template with Solve Button

```javascript
"MetaTemplates": [{
  "HashPostfix": "-Template-Wrap-Prefix",
  "Template": "<h1>Rectangular Area Solver Micro-app</h1><div><a href=\"#\" onclick=\"{~Pict~}.PictApplication.solve()\">[ solve ]</a></div><hr />"
}]
```

## FruitEditor Reference Manifest

```javascript
"ReferenceManifests": {
  "FruitEditor": {
    "Scope": "FruitEditor",
    "Descriptors": {
      "name": {
        "Name": "Fruit Name",
        "Hash": "Name",
        "DataType": "String",
        "Default": "(unnamed fruit)"
      },
      "family": { /* Select with PickList */ },
      "order": { /* String */ },
      "genus": { /* String */ },
      "lastWatered": { /* DateTime */ },
      "nutritions.calories": { /* Number with precision */ },
      "nutritions.fat": { /* Number */ },
      "nutritions.carbohydrates": { /* Number */ },
      "nutritions.protein": { /* Number */ },
      "nutritions.percent_total_fat": { /* Calculated */ }
    }
  }
}
```

## Running the Example

```bash
cd example_applications/complex_tuigrid
npm install
npm run build
# Open html/index.html in a browser
```

## Key Concepts Illustrated

1. **TuiGrid Integration**: Professional grid with sorting, filtering, editing
2. **Aggregation Functions**: SUM, MEAN across array data
3. **Row-Level Calculations**: Per-record computed fields
4. **Pick List Generation**: Unique values from array data
5. **Multi-Section Forms**: Recipe inputs combined with data grid
