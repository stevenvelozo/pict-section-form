# HTML Input Provider

The HTML input provider renders raw HTML content directly without any parsing
or transformation. It's useful for custom display elements.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-HTML` |
| Input Type | `HTML` |
| Supports Tabular | Yes |
| Display Only | Yes |

## Basic Usage

```json
{
  "UI.Banner": {
    "Name": "Banner",
    "Hash": "Banner",
    "DataType": "String",
    "PictForm": {
      "InputType": "HTML",
      "Content": "<div class=\"alert alert-info\">Welcome to the application!</div>"
    }
  }
}
```

## Configuration Options

### Content

Static HTML content to render:

```json
"PictForm": {
  "InputType": "HTML",
  "Content": "<p class=\"lead\">Important information here.</p>"
}
```

### Default

Fallback HTML if `Content` is not provided and the input value is empty:

```json
"PictForm": {
  "InputType": "HTML",
  "Default": "<span class=\"text-muted\">No content</span>"
}
```

## Content Resolution Order

The provider resolves content in this order:
1. Input value (from data)
2. `Content` property
3. `Default` property

## Lifecycle Hooks

### onInputInitialize

Assigns the HTML content directly to the display element without modification.

### onInputInitializeTabular

Handles HTML assignment for tabular row contexts.

### onDataMarshalToForm

Updates HTML content when data changes.

### onDataMarshalToFormTabular

Updates HTML display in tabular rows.

## Example: Complex HTML Structure

```json
{
  "Stats.Display": {
    "Name": "Statistics",
    "Hash": "StatsDisplay",
    "DataType": "String",
    "PictForm": {
      "Section": "Dashboard",
      "InputType": "HTML",
      "Content": "<div class=\"stats-container\"><div class=\"stat\"><span class=\"stat-value\" id=\"total-count\">0</span><span class=\"stat-label\">Total Items</span></div><div class=\"stat\"><span class=\"stat-value\" id=\"active-count\">0</span><span class=\"stat-label\">Active</span></div></div>"
    }
  }
}
```

## Example: Dynamic HTML from Data

```json
{
  "Report.Summary": {
    "Name": "Summary",
    "Hash": "ReportSummary",
    "DataType": "String",
    "PictForm": {
      "Section": "Report",
      "InputType": "HTML"
    }
  }
}
```

Set dynamically:

```javascript
pict.AppData.Report.Summary = `
  <table class="table">
    <tr><th>Metric</th><th>Value</th></tr>
    <tr><td>Total Sales</td><td>$${salesTotal}</td></tr>
    <tr><td>Orders</td><td>${orderCount}</td></tr>
  </table>
`;
```

## Security Considerations

**Warning:** The HTML provider renders content without sanitization. Only use
with trusted content sources. Never render user-provided HTML directly.

For user content, consider:
- Using the Markdown provider instead
- Sanitizing HTML before storing
- Using templated inputs with data binding

## Comparison with Markdown

| Feature | HTML | Markdown |
|---------|------|----------|
| Raw HTML support | Full | Limited |
| Parsing required | No | Yes |
| Security risk | Higher | Lower |
| User content | Not recommended | Safer |
| Complex layouts | Easy | Difficult |

## Example: Complete Configuration

```json
{
  "Descriptors": {
    "Form.Header": {
      "Name": "Header",
      "Hash": "FormHeader",
      "DataType": "String",
      "PictForm": {
        "Section": "Main",
        "Row": 0,
        "Width": 12,
        "InputType": "HTML",
        "Content": "<header class=\"form-header\"><h1>Customer Registration</h1><p class=\"subtitle\">Please complete all sections</p><nav class=\"breadcrumb\"><span>Home</span> / <span>Forms</span> / <span class=\"current\">Registration</span></nav></header>"
      }
    }
  }
}
```

## Notes

- This is a display-only input
- Content is rendered as-is; ensure HTML is valid
- Scripts in HTML will execute (use caution)
- Styles should be scoped or use unique classes

## Related Documentation

- [Markdown Input Provider](003-markdown.md) - For markdown content
- [Templated Input Provider](007-templated.md) - For dynamic templates
- [Input Types](../Input_Types.md) - Overview of all input types
