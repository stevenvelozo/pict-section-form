# TemplatedEntityLookup Input Provider

The TemplatedEntityLookup provider fetches entity data from the server and
renders it via templates, with support for empty state handling.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-TemplatedEntityLookup` |
| Input Type | `TemplatedEntityLookup` |
| Supports Tabular | Yes |
| Display Only | Yes |
| Async | Yes |

## Basic Usage

```json
{
  "Customer.Details": {
    "Name": "Customer Details",
    "Hash": "CustomerDetails",
    "DataType": "String",
    "PictForm": {
      "InputType": "TemplatedEntityLookup",
      "Providers": ["Pict-Input-TemplatedEntityLookup"],
      "TemplatedEntityLookup": {
        "Template": "<div><strong>{~D:AppData.Customer.Name~}</strong></div>",
        "EntitiesBundle": [{
          "Entity": "Customer",
          "Filter": "FBV~IDCustomer~EQ~{~D:AppData.SelectedCustomerID~}",
          "Destination": "AppData.Customer",
          "SingleRecord": true
        }]
      }
    }
  }
}
```

## Configuration Options

### TemplatedEntityLookup Object

The main configuration object containing all lookup settings:

```json
"TemplatedEntityLookup": {
  "Template": "...",
  "EntitiesBundle": [...],
  "TriggerGroupHash": "...",
  "EmptyValueTestList": [...],
  "EmptyValueTemplate": "..."
}
```

### Template

Pict template to render with fetched entity data:

```json
"Template": "<div>{~D:AppData.LoadedEntity.Name~} - {~D:AppData.LoadedEntity.Status~}</div>"
```

### EntitiesBundle

Array of entity fetch requests (same format as EntityBundleRequest):

```json
"EntitiesBundle": [
  {
    "Entity": "Author",
    "Filter": "FBV~IDAuthor~EQ~{~D:Record.Value~}",
    "Destination": "AppData.CurrentAuthor",
    "SingleRecord": true
  }
]
```

### TriggerGroupHash

Trigger group that causes re-fetch and re-render:

```json
"TriggerGroupHash": "AuthorSelected"
```

### EmptyValueTestList

Array of addresses to check for empty/null values:

```json
"EmptyValueTestList": ["AppData.CurrentAuthor", "AppData.CurrentAuthor.Name"]
```

### EmptyValueTemplate

Template to show when any EmptyValueTestList address is empty:

```json
"EmptyValueTemplate": "<p class=\"no-data\">No author selected</p>"
```

## Lifecycle Hooks

### onInputInitialize

Initiates the entity fetch and renders the template when complete.

### onAfterEventCompletion

Listens for configured trigger group events and re-fetches/re-renders.

### assignDisplayEntityData

Core method that:
1. Fetches entities using Anticipate pattern for async handling
2. Gathers entity data from server
3. Checks EmptyValueTestList for null values
4. Renders appropriate template (main or empty)
5. Assigns HTML to display element

## Example: Complete Configuration

```json
{
  "Descriptors": {
    "UI.AuthorSelector": {
      "Name": "Select Author",
      "Hash": "AuthorID",
      "DataType": "String",
      "PictForm": {
        "Section": "Authors",
        "InputType": "Select",
        "SelectOptionsPickList": "AuthorList",
        "Providers": ["Pict-Input-Select", "Pict-Input-EntityBundleRequest"],
        "EntityBundleTriggerGroup": "AuthorSelected",
        "EntitiesBundle": [{
          "Entity": "Author",
          "Filter": "FBV~IDAuthor~EQ~{~D:Record.Value~}",
          "Destination": "AppData.SelectedAuthor",
          "SingleRecord": true
        }]
      }
    },
    "UI.AuthorDisplay": {
      "Name": "Author Details",
      "Hash": "AuthorDisplay",
      "DataType": "String",
      "PictForm": {
        "Section": "Authors",
        "InputType": "TemplatedEntityLookup",
        "Providers": ["Pict-Input-TemplatedEntityLookup"],
        "TemplatedEntityLookup": {
          "TriggerGroupHash": "AuthorSelected",
          "Template": "<div class=\"author-card\"><h3>{~D:AppData.SelectedAuthor.Name~}</h3><p class=\"bio\">{~D:AppData.SelectedAuthor.Biography~}</p><p class=\"books\">Books: {~D:AppData.SelectedAuthor.BookCount~}</p></div>",
          "EmptyValueTestList": ["AppData.SelectedAuthor"],
          "EmptyValueTemplate": "<div class=\"author-card empty\"><p>Select an author to view their details</p></div>",
          "EntitiesBundle": [{
            "Entity": "BookAuthorJoin",
            "Filter": "FBV~IDAuthor~EQ~{~D:AppData.SelectedAuthor.IDAuthor~}",
            "Destination": "AppData.AuthorBooks"
          }]
        }
      }
    }
  }
}
```

## Entity Bundle Options

Each entity in the bundle can have:

| Property | Type | Description |
|----------|------|-------------|
| `Entity` | string | Meadow entity name |
| `Filter` | string | Filter expression with templates |
| `Destination` | string | AppData path for results |
| `SingleRecord` | boolean | Return only first record |
| `RecordCount` | number | Pagination limit |
| `RecordStartCursor` | number | Pagination offset |

## Filter Syntax

```
FBV~FieldName~Operator~Value    - Field/Value comparison
FBL~FieldName~INN~List          - Field in list
```

Operators: `EQ`, `NE`, `GT`, `GE`, `LT`, `LE`, `LK` (like), `INN` (in)

## Template Value Access

In templates, use `{Value}` for the lookup's own value:

```json
"Template": "Looking up: {Value}"
```

## Tabular Usage

```json
{
  "ReferenceManifests": {
    "OrderLine": {
      "Descriptors": {
        "ProductInfo": {
          "Name": "Product",
          "Hash": "ProductInfo",
          "DataType": "String",
          "PictForm": {
            "InputType": "TemplatedEntityLookup",
            "Providers": ["Pict-Input-TemplatedEntityLookup"],
            "TemplatedEntityLookup": {
              "Template": "<span>{~D:AppData.TempProduct.Name~}</span>",
              "EmptyValueTemplate": "-",
              "EntitiesBundle": [{
                "Entity": "Product",
                "Filter": "FBV~IDProduct~EQ~{~D:Record.IDProduct~}",
                "Destination": "AppData.TempProduct",
                "SingleRecord": true
              }]
            }
          }
        }
      }
    }
  }
}
```

## Notes

- Fetches are asynchronous; UI shows empty template until complete
- Uses `marked` library for markdown in templates
- Integrates with trigger group system for reactive updates
- Consider caching strategies for frequently fetched entities

## Related Documentation

- [EntityBundleRequest Provider](010-entity-bundle-request.md) - Entity fetching
- [Templated Provider](007-templated.md) - Template rendering
- [AutofillTriggerGroup Provider](011-autofill-trigger-group.md) - Trigger coordination
