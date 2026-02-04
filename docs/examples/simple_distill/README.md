# Simple Distill Example

The Simple Distill example demonstrates data aggregation patterns including
entity bundle requests, cascading data fetches, trigger groups, and templated
entity lookups.

## What This Example Demonstrates

- **Entity Bundle Requests**: Cascading data fetches from related entities
- **Trigger Groups**: Coordinated updates across multiple form elements
- **Pick Lists from Aggregated Data**: Dynamic dropdowns from fetched data
- **Templated Input Rendering**: Custom templates with nested data binding
- **Templated Entity Lookup**: Conditional display with empty state handling
- **Pre/Post Solvers**: Custom logic before and after trigger execution

## Key Files

- `Simple-Form-Application.js` - Main application with complete configuration
- `html/index.html` - HTML template

## Configuration Highlights

### Initial Bundle (Startup Data Fetch)

```javascript
"InitialBundle": [
  {
    "Entity": "Author",
    "Filter": "FBV~IDAuthor~EQ~100",
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
]
```

### Entity Bundle with Multiple Request Types

```javascript
"EntitiesBundle": [
  // Standard entity fetch
  {
    "Entity": "Author",
    "Filter": "FBV~IDAuthor~EQ~{~D:Record.Value~}",
    "Destination": "AppData.CurrentAuthor",
    "SingleRecord": true
  },
  // Map Join for data enrichment
  {
    "Type": "MapJoin",
    "DestinationRecordSetAddress": "AppData.Books",
    "DestinationJoinValue": "IDBook",
    "Joins": "AppData.BookAuthorJoins",
    "JoinJoinValueLHS": "IDBook",
    "JoinJoinValueRHS": "IDBookAuthorJoin"
  },
  // Custom HTTP request
  {
    "Type": "Custom",
    "Protocol": "HTTP",
    "Host": "localhost",
    "Port": 9999,
    "URL": "/1.0/Book/Schema?Author={~D:AppData.CurrentAuthor.IDAuthor~}",
    "Destination": "AppData.BookSchema"
  }
]
```

### Trigger Groups with Pre/Post Solvers

```javascript
"AutofillTriggerGroup": {
  "TriggerGroupHash": "BookTriggerGroup",
  "TriggerAddress": "AppData.CurrentAuthor.Name",
  "MarshalEmptyValues": true,
  "PreSolvers": [
    'NumBooks = getvalue("AppData.BookAuthorJoins.length")'
  ],
  "PostSolvers": [
    'runSolvers()'
  ]
}
```

### Pick List from Aggregated Data

```javascript
"PickLists": [{
  "Hash": "Books",
  "ListAddress": "AppData.AuthorsBooks",
  "ListSourceAddress": "Books[]",
  "TextTemplate": "{~D:Record.Title~}",
  "IDTemplate": "{~D:Record.IDBook~}",
  "Sorted": true,
  "UpdateFrequency": "Always"
}]
```

### Templated Input with Nested Templates

```javascript
"TemplatedInput": {
  "PictForm": {
    "InputType": "Templated",
    "TriggerGroupHash": "BookTriggerGroup",
    "Template": "<div>{~T:AuthorInfo~}</div><div>{~TS:BookInfo:AppData.Books~}</div>",
    "Templates": {
      "AuthorInfo": "{~D:AppData.CurrentAuthor.IDAuthor~} :: {~D:AppData.CurrentAuthor.Name~}",
      "BookInfo": "<div><img src=\"{~D:Record.ImageURL~}\" />{~D:Record.IDBook~} :: {~D:Record.Title~}</div>"
    }
  }
}
```

### Templated Entity Lookup with Empty State

```javascript
"PictForm": {
  "InputType": "TemplatedEntityLookup",
  "Providers": ["Pict-Input-TemplatedEntityLookup"],
  "TemplatedEntityLookup": {
    "Template": "GUIDBookAuthorJoin {~D:AppData.CurrentBookAuthorJoinForDisplayTemplate.GUIDBookAuthorJoin~}",
    "TriggerGroupHash": "BookTriggerGroup",
    "EmptyValueTestList": ["AppData.CurrentBookAuthorJoinForDisplayTemplate"],
    "EmptyValueTemplate": "No BookAuthorJoin Found",
    "EntitiesBundle": [{
      "Entity": "BookAuthorJoin",
      "Filter": "FBV~IDAuthor~EQ~{~D:AppData.CurrentAuthor.IDAuthor~}",
      "Destination": "AppData.CurrentBookAuthorJoinForDisplayTemplate",
      "SingleRecord": true
    }]
  }
}
```

## Filter Syntax Reference

| Filter Type | Syntax | Description |
|-------------|--------|-------------|
| FBV | `FBV~Field~OP~Value` | Field/Value comparison |
| FBL | `FBL~Field~INN~List` | Field in list |
| PJU | `{~PJU:sep^field^address~}` | Project and join |

## Template Syntax Reference

| Macro | Usage | Description |
|-------|-------|-------------|
| `{~T:Name~}` | Single | Render named template once |
| `{~TS:Name:Array~}` | Loop | Render template for each array item |
| `{~D:Address~}` | Data | Direct data binding |

## Running the Example

```bash
cd example_applications/simple_distill
npm install
npm run build
# Open html/index.html in a browser
```

## Key Concepts Illustrated

1. **Data Aggregation**: Cascading fetches build related data sets
2. **Trigger Coordination**: Multiple elements update together
3. **Template Nesting**: Complex displays from simple templates
4. **Conditional Rendering**: Empty state handling for missing data
5. **Solver Integration**: Pre/post processing around triggers
