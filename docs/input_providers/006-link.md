# Link Input Provider

The Link input provider sets href attributes on anchor elements based on
input values, enabling dynamic hyperlinks in forms.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-Link` |
| Input Type | `Link` |
| Supports Tabular | Yes |

## Basic Usage

```json
{
  "Resource.URL": {
    "Name": "Resource Link",
    "Hash": "ResourceURL",
    "DataType": "String",
    "PictForm": {
      "Section": "Resources",
      "InputType": "Link"
    }
  }
}
```

## How It Works

The Link provider is minimal and focused:

1. Takes the input value (a URL string)
2. Sets it as the `href` attribute on the anchor element
3. Updates when data changes

The template must contain an anchor element (`<a>`) for the provider to target.

## Configuration Options

### LinkTarget

Target attribute for the link (where to open):

```json
"PictForm": {
  "InputType": "Link",
  "LinkTarget": "_blank"
}
```

Common values:
- `_blank` - New window/tab
- `_self` - Same frame (default)
- `_parent` - Parent frame
- `_top` - Full body of window

## Lifecycle Hooks

### onDataMarshalToForm

Sets the href attribute on the anchor element to the current value.

### onDataMarshalToFormTabular

Sets href for anchor elements in tabular row contexts.

## Example with Solver-Generated URL

Combine with solvers to build dynamic URLs:

```json
{
  "Sections": [
    {
      "Hash": "Search",
      "Solvers": [
        "SearchLink = CONCAT('https://google.com/search?q=', SearchTerm)"
      ]
    }
  ],
  "Descriptors": {
    "Search.Term": {
      "Name": "Search Term",
      "Hash": "SearchTerm",
      "DataType": "String",
      "PictForm": { "Section": "Search", "Row": 1 }
    },
    "Search.Link": {
      "Name": "Search",
      "Hash": "SearchLink",
      "DataType": "String",
      "PictForm": {
        "Section": "Search",
        "Row": 2,
        "InputType": "Link"
      }
    }
  }
}
```

## Custom Template

For custom link appearance, create a template:

```json
"MetaTemplates": [
  {
    "HashPostfix": "-Template-Input-InputType-Link",
    "Template": "<div class=\"link-container\"><a {~D:Record.Macro.HTMLID~} href=\"#\" target=\"_blank\" class=\"btn btn-link\"><i class=\"icon-external\"></i> {~D:Record.Name~}</a></div>"
  }
]
```

## Tabular Usage

```json
{
  "ReferenceManifests": {
    "Document": {
      "Descriptors": {
        "ViewLink": {
          "Name": "View",
          "Hash": "ViewLink",
          "DataType": "String",
          "PictForm": {
            "InputType": "Link"
          }
        }
      }
    }
  }
}
```

With data:

```javascript
pict.AppData.Documents = [
  { Name: "Report.pdf", ViewLink: "/documents/report.pdf" },
  { Name: "Summary.xlsx", ViewLink: "/documents/summary.xlsx" }
];
```

## Complete Example

```json
{
  "Sections": [
    {
      "Hash": "Reference",
      "Solvers": [
        "HealthInfoLink = CONCAT('https://www.google.com/search?q=', ProductName, ' health information')"
      ]
    }
  ],
  "Descriptors": {
    "Product.Name": {
      "Name": "Product Name",
      "Hash": "ProductName",
      "DataType": "String",
      "PictForm": {
        "Section": "Reference",
        "Row": 1,
        "Width": 8
      }
    },
    "Product.InfoLink": {
      "Name": "Learn More",
      "Hash": "HealthInfoLink",
      "DataType": "String",
      "PictForm": {
        "Section": "Reference",
        "Row": 1,
        "Width": 4,
        "InputType": "Link",
        "LinkTarget": "_blank"
      }
    }
  }
}
```

## Notes

- The anchor element must exist in the template
- Empty values result in `href="#"` or empty string
- Combine with solvers for dynamic URL generation
- Consider security when building URLs from user input

## Related Documentation

- [Solvers](../Solvers.md) - String concatenation for URLs
- [Input Types](../Input_Types.md) - Overview of all input types
