# Simple Table Example

The Simple Table example demonstrates the most basic tabular/grid application
possible using Pict Section Form. It shows how to render array data in a
table format using configuration alone, with no custom JavaScript logic.

## What This Example Demonstrates

- **Tabular Layout**: Rendering arrays as HTML tables
- **Configuration-Only Implementation**: No custom code required
- **Nested Data Access**: Using dot notation for deeply nested properties
- **External Data Loading**: Loading JSON data into form application
- **Reference Manifests**: Defining column structure for tabular data

## Key Files

- `Simple-Tabular-Application.js` - Main application entry point
- `FruitData.json` - Sample fruit nutritional data
- `html/index.html` - HTML template

## Configuration Highlights

### Tabular Group Definition

```javascript
{
  "Hash": "FruitGrid",
  "Name": "FruitGrid",
  "Layout": "Tabular",
  "RecordSetAddress": "FruitData.FruityVice",
  "RecordManifest": "FruitEditor"
}
```

### Reference Manifest for Column Definitions

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
      "family": {
        "Name": "Family",
        "Hash": "Family",
        "DataType": "String"
      },
      "nutritions.calories": {
        "Name": "Calories",
        "Hash": "Calories",
        "DataType": "Number"
      }
    }
  }
}
```

### Nested Property Access

Access deeply nested data using dot notation:

```javascript
"nutritions.calories": {
  "Name": "Calories",
  "Hash": "Calories",
  "DataType": "Number"
}
```

This maps to `FruitData.FruityVice[n].nutritions.calories` in the data.

### Loading Default Data

```javascript
module.exports.default_configuration.pict_configuration = {
  "Product": "SimpleTable",
  "DefaultAppData": require('./FruitData.json'),
  "DefaultFormManifest": { /* ... */ }
};
```

## Sample Data Structure

```json
{
  "FruitData": {
    "FruityVice": [
      {
        "name": "Persimmon",
        "id": 52,
        "family": "Ebenaceae",
        "order": "Rosales",
        "genus": "Diospyros",
        "nutritions": {
          "calories": 81,
          "fat": 0,
          "sugar": 18,
          "carbohydrates": 18,
          "protein": 0
        }
      }
    ]
  }
}
```

## HTML Bootstrap

```html
<script src="./pict.min.js" type="text/javascript"></script>
<script>
  Pict.safeOnDocumentReady(() => {
    Pict.safeLoadPictApplication(SimpleTabularApplication, 3)
  });
</script>
```

## Running the Example

```bash
cd example_applications/simple_table
npm install
npm run build
# Open html/index.html in a browser
```

## Key Concepts Illustrated

1. **Minimal Configuration**: Tables can be created with just configuration
2. **Automatic Rendering**: The framework handles all table HTML generation
3. **Data Mapping**: Reference manifests define how data maps to columns
4. **Nested Data**: Dot notation enables access to any depth of nested data
