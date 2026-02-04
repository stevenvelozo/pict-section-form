# Markdown Input Provider

The Markdown input provider renders markdown content as HTML for display-only
inputs. It uses the `marked` library for parsing.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-Markdown` |
| Input Type | `Markdown` |
| Supports Tabular | Yes |
| Display Only | Yes |

## Basic Usage

```json
{
  "Help.Instructions": {
    "Name": "Instructions",
    "Hash": "Instructions",
    "DataType": "String",
    "PictForm": {
      "InputType": "Markdown",
      "Content": "# Welcome\n\nThis is **bold** and this is *italic*."
    }
  }
}
```

## Configuration Options

### Content

Static markdown content to render:

```json
"PictForm": {
  "InputType": "Markdown",
  "Content": "## Section Title\n\n- Item 1\n- Item 2\n- Item 3"
}
```

### Default

Fallback content if `Content` is not provided and the input value is empty:

```json
"PictForm": {
  "InputType": "Markdown",
  "Default": "*No content available*"
}
```

## Content Resolution Order

The provider resolves content in this order:
1. Input value (from data)
2. `Content` property
3. `Default` property

## Lifecycle Hooks

### onInputInitialize

Parses the markdown content using `marked.parse()` and assigns the resulting
HTML to the display element.

### onInputInitializeTabular

Handles markdown rendering for tabular row contexts.

### onDataMarshalToForm

Re-renders markdown when data changes.

### onDataMarshalToFormTabular

Updates markdown display in tabular rows.

## Example: Dynamic Content

You can bind markdown content to data:

```json
{
  "Documentation.Content": {
    "Name": "Documentation",
    "Hash": "DocContent",
    "DataType": "String",
    "PictForm": {
      "Section": "Help",
      "InputType": "Markdown"
    }
  }
}
```

Then set the value programmatically:

```javascript
pict.AppData.Documentation.Content = `
# User Guide

## Getting Started

1. Enter your information
2. Click submit
3. Review confirmation

> Note: All fields are required.
`;
```

## Supported Markdown Features

The provider uses the `marked` library which supports:

- Headers (`# ## ###`)
- Bold (`**text**`) and italic (`*text*`)
- Lists (ordered and unordered)
- Links (`[text](url)`)
- Code blocks (``` and inline \`)
- Blockquotes (`>`)
- Tables
- Images (`![alt](url)`)

## Example: Complete Configuration

```json
{
  "Descriptors": {
    "Form.HelpText": {
      "Name": "Help",
      "Hash": "HelpText",
      "DataType": "String",
      "PictForm": {
        "Section": "Main",
        "Row": 1,
        "Width": 12,
        "InputType": "Markdown",
        "Content": "## Form Instructions\n\nPlease fill out all required fields marked with an asterisk (*).\n\n### Tips\n\n- Use Tab to move between fields\n- Click Submit when finished\n- Contact support if you need help"
      }
    }
  }
}
```

## Notes

- This is a display-only input; users cannot edit the content
- Markdown is parsed on each render, so keep content reasonable in size
- Raw HTML in markdown may be sanitized depending on `marked` configuration

## Related Documentation

- [HTML Input Provider](004-html.md) - For raw HTML content
- [Input Types](../Input_Types.md) - Overview of all input types
