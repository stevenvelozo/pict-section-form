# EntityBundleRequest Input Provider

The EntityBundleRequest provider fetches sequential sets of related entities
from the server based on selection changes, supporting complex data loading
workflows.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-EntityBundleRequest` |
| Input Type | Any (provider-based) |
| Supports Tabular | Yes |
| Async | Yes |

## Basic Usage

```json
{
  "Customer.ID": {
    "Name": "Customer",
    "Hash": "CustomerID",
    "DataType": "String",
    "PictForm": {
      "Section": "Order",
      "InputType": "Select",
      "SelectOptionsPickList": "CustomerList",
      "Providers": ["Pict-Input-Select", "Pict-Input-EntityBundleRequest"],
      "EntitiesBundle": [{
        "Entity": "Customer",
        "Filter": "FBV~IDCustomer~EQ~{~D:Record.Value~}",
        "Destination": "AppData.CurrentCustomer",
        "SingleRecord": true
      }],
      "EntityBundleTriggerGroup": "CustomerSelected"
    }
  }
}
```

## Configuration Options

### EntitiesBundle

Array of entity or custom data requests:

```json
"EntitiesBundle": [
  {
    "Entity": "Customer",
    "Filter": "FBV~IDCustomer~EQ~{~D:Record.Value~}",
    "Destination": "AppData.CurrentCustomer",
    "SingleRecord": true
  },
  {
    "Entity": "Order",
    "Filter": "FBV~IDCustomer~EQ~{~D:AppData.CurrentCustomer.IDCustomer~}",
    "Destination": "AppData.CustomerOrders",
    "RecordCount": 100
  }
]
```

### Entity Request Properties

| Property | Type | Description |
|----------|------|-------------|
| `Entity` | string | Meadow entity name |
| `Filter` | string | Filter expression with templates |
| `Destination` | string | AppData path for results |
| `SingleRecord` | boolean | Return only first record |
| `RecordCount` | number | Max records to fetch (default: 100) |
| `RecordStartCursor` | number | Pagination offset |

### Custom Request Properties

For non-Meadow endpoints:

```json
{
  "Type": "Custom",
  "URL": "/api/v1/data?customer={~D:AppData.CurrentCustomer.ID~}",
  "Protocol": "HTTP",
  "Host": "api.example.com",
  "Port": 443,
  "Destination": "AppData.ExternalData"
}
```

### Trigger Configuration

```json
"PictForm": {
  "EntityBundleTriggerOnInitialize": true,
  "EntityBundleTriggerOnDataChange": true,
  "EntityBundleTriggerWithoutValue": false,
  "EntityBundleTriggerGroup": "DataLoaded",
  "EntityBundleTriggerMetacontrollerSolve": true,
  "EntityBundleTriggerMetacontrollerRender": false
}
```

| Property | Default | Description |
|----------|---------|-------------|
| `EntityBundleTriggerOnInitialize` | false | Fetch on form load |
| `EntityBundleTriggerOnDataChange` | true | Fetch when value changes |
| `EntityBundleTriggerWithoutValue` | false | Allow fetch with empty value |
| `EntityBundleTriggerGroup` | - | Trigger group to fire after load |
| `EntityBundleTriggerMetacontrollerSolve` | false | Run solve() after load |
| `EntityBundleTriggerMetacontrollerRender` | false | Run render() after load |

## Advanced Features

### State Stack Operations

Push and pop state for scoped operations:

```json
{
  "Type": "SetStateAddress",
  "Address": "AppData.TempState"
},
{
  "Entity": "...",
  "..."
},
{
  "Type": "PopState"
}
```

### MapJoin Operation

Join data from multiple sources:

```json
{
  "Type": "MapJoin",
  "DestinationRecordSetAddress": "AppData.Books",
  "DestinationJoinValue": "IDBook",
  "Joins": "AppData.BookAuthorJoins",
  "JoinJoinValueLHS": "IDBook",
  "JoinJoinValueRHS": "IDBookAuthorJoin"
}
```

### ProjectDataset Operation

Transform dataset fields:

```json
{
  "Type": "ProjectDataset",
  "SourceAddress": "AppData.RawData",
  "DestinationAddress": "AppData.ProjectedData",
  "Projection": {
    "id": "originalId",
    "name": "displayName"
  }
}
```

## Filter Syntax

### Basic Comparisons

```
FBV~FieldName~EQ~Value    - Equal
FBV~FieldName~NE~Value    - Not equal
FBV~FieldName~GT~Value    - Greater than
FBV~FieldName~GE~Value    - Greater or equal
FBV~FieldName~LT~Value    - Less than
FBV~FieldName~LE~Value    - Less or equal
FBV~FieldName~LK~Value    - Like (wildcard)
```

### List Operations

```
FBL~FieldName~INN~List    - In list
```

### Template Expressions

```
{~D:Record.Value~}                         - Current input value
{~D:AppData.Path~}                         - AppData reference
{~PJU:,^Field^ArrayAddress~}               - Project and join array
```

## Lifecycle Hooks

### onInputInitialize

May trigger entity fetch on form load if `EntityBundleTriggerOnInitialize`.

### onDataChange

Triggers fetch when input value changes (default behavior).

### gatherDataFromServer

Main async method that:
1. Validates value (unless TriggerWithoutValue)
2. Processes each bundle item sequentially
3. Handles state stack operations
4. Fires trigger group on completion
5. Optionally runs solve() or render()

### onAfterEventCompletion

Listens for specific trigger group events to re-fetch.

## Example: Cascading Data Load

```json
{
  "Descriptors": {
    "Author.Select": {
      "Name": "Select Author",
      "Hash": "AuthorID",
      "DataType": "String",
      "PictForm": {
        "Section": "Books",
        "InputType": "Select",
        "SelectOptionsPickList": "AuthorList",
        "Providers": ["Pict-Input-Select", "Pict-Input-EntityBundleRequest"],
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
          },
          {
            "Entity": "Book",
            "Filter": "FBL~IDBook~INN~{~PJU:,^IDBook^AppData.BookAuthorJoins~}",
            "Destination": "AppData.Books"
          }
        ],
        "EntityBundleTriggerGroup": "AuthorDataLoaded"
      }
    }
  }
}
```

## Transaction Tracking

The provider uses Pict's transaction tracking for async operations:

```javascript
// Register async operation
view.registerEventTransactionAsyncOperation(transactionGUID, 'entityLoad');

// Mark complete when done
view.eventTransactionAsyncOperationComplete(transactionGUID, 'entityLoad');
```

## Notes

- Requests are processed sequentially, allowing cascading dependencies
- Templates in filters are evaluated at request time
- Use RecordCount to limit large result sets
- Consider caching for frequently accessed entities

## Related Documentation

- [AutofillTriggerGroup Provider](011-autofill-trigger-group.md) - Trigger coordination
- [TemplatedEntityLookup Provider](008-templated-entity-lookup.md) - Display fetched data
- [Select Provider](001-select.md) - Often used together
