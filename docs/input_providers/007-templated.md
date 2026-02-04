# Templated Input Provider

The Templated input provider renders dynamic content via Pict template parsing,
supporting trigger group events for automatic updates.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-Templated` |
| Input Type | `Templated` |
| Supports Tabular | Yes |
| Display Only | Yes |

## Basic Usage

```json
{
  "Display.Summary": {
    "Name": "Summary",
    "Hash": "Summary",
    "DataType": "String",
    "PictForm": {
      "InputType": "Templated",
      "Template": "<div><strong>{~D:AppData.Customer.Name~}</strong> - {~D:AppData.Customer.Email~}</div>"
    }
  }
}
```

## Configuration Options

### Template

The Pict template string to parse and render:

```json
"PictForm": {
  "InputType": "Templated",
  "Template": "<p>Order #{~D:AppData.Order.ID~} for {~D:AppData.Customer.Name~}</p>"
}
```

### Templates

Object of named templates to register for use in the main template:

```json
"PictForm": {
  "InputType": "Templated",
  "Template": "<div>{~T:Header~}</div><div>{~TS:Item:AppData.Items~}</div>",
  "Templates": {
    "Header": "<h2>{~D:AppData.Title~}</h2>",
    "Item": "<li>{~D:Record.name~}: {~D:Record.value~}</li>"
  }
}
```

### TriggerGroupHash

Array or string of trigger group hashes to listen to. The template re-renders
when these events fire:

```json
"PictForm": {
  "InputType": "Templated",
  "TriggerGroupHash": "CustomerDataUpdate",
  "Template": "{~D:AppData.Customer.Name~}"
}
```

### Default

Fallback content if Template is empty and no value:

```json
"PictForm": {
  "InputType": "Templated",
  "Default": "<em>No data available</em>"
}
```

## Template Syntax

### Data References

```
{~D:AppData.Path.To.Value~}  - Direct data access
{~D:Record.field~}           - Current record in iteration
```

### Template References

```
{~T:TemplateName~}                    - Render named template once
{~TS:TemplateName:ArrayAddress~}      - Render template for each array item
```

### Pict References

```
{~P~}       - Reference to Pict application
{~Pict~}    - Same as {~P~}
```

## Lifecycle Hooks

### onInputInitialize

1. Registers any custom templates from `Templates` configuration
2. Parses the main template
3. Assigns rendered HTML to display element

### onDataMarshalToForm

Re-parses and updates the template content when data changes.

### onAfterEventCompletion

Listens for TriggerGroup events and re-renders the template when
configured trigger groups fire.

## Example: Nested Templates

```json
{
  "Report.Display": {
    "Name": "Report",
    "Hash": "ReportDisplay",
    "DataType": "String",
    "PictForm": {
      "InputType": "Templated",
      "Template": "<div class=\"report\">{~T:Header~}<ul>{~TS:LineItem:AppData.Report.Items~}</ul>{~T:Footer~}</div>",
      "Templates": {
        "Header": "<header><h1>{~D:AppData.Report.Title~}</h1><p>Generated: {~D:AppData.Report.Date~}</p></header>",
        "LineItem": "<li><span class=\"name\">{~D:Record.name~}</span><span class=\"value\">{~D:Record.amount~}</span></li>",
        "Footer": "<footer>Total: {~D:AppData.Report.Total~}</footer>"
      }
    }
  }
}
```

## Example: With Trigger Group

```json
{
  "Sections": [
    {
      "Hash": "Customer"
    }
  ],
  "Descriptors": {
    "Customer.ID": {
      "Name": "Customer ID",
      "Hash": "CustomerID",
      "DataType": "String",
      "PictForm": {
        "Section": "Customer",
        "Providers": ["Pict-Input-EntityBundleRequest"],
        "EntityBundleTriggerGroup": "CustomerLoaded"
      }
    },
    "Customer.Display": {
      "Name": "Customer Info",
      "Hash": "CustomerDisplay",
      "DataType": "String",
      "PictForm": {
        "Section": "Customer",
        "InputType": "Templated",
        "TriggerGroupHash": "CustomerLoaded",
        "Template": "<div class=\"customer-card\"><h3>{~D:AppData.CurrentCustomer.Name~}</h3><p>{~D:AppData.CurrentCustomer.Email~}</p><p>{~D:AppData.CurrentCustomer.Phone~}</p></div>",
        "Default": "<p class=\"no-selection\">Select a customer to view details</p>"
      }
    }
  }
}
```

## Tabular Usage

```json
{
  "ReferenceManifests": {
    "Product": {
      "Descriptors": {
        "Display": {
          "Name": "Product",
          "Hash": "ProductDisplay",
          "DataType": "String",
          "PictForm": {
            "InputType": "Templated",
            "Template": "<div><img src=\"{~D:Record.imageUrl~}\" /><span>{~D:Record.name~}</span></div>"
          }
        }
      }
    }
  }
}
```

## Notes

- Templates are parsed using the full Pict template engine
- Access to all AppData and view context is available
- Trigger groups enable reactive updates without explicit data binding
- Complex templates should consider performance implications

## Related Documentation

- [HTML Input Provider](004-html.md) - For static HTML
- [TemplatedEntityLookup Provider](008-templated-entity-lookup.md) - For entity data
- [Templates](../Templates.md) - Template system overview
