# Templates

Pict Section Form uses a hierarchical template system for rendering forms.
Templates can be customized at multiple levels to achieve any desired appearance.

## Template Hierarchy

Templates are rendered in a strict hierarchical order:

```
Form Level
├── -Template-Form-Container-Header
├── -Template-Form-Container-Wrap-Prefix
│
└── For each Section:
    ├── -Template-Form-Container
    │
    └── -Template-Wrap-Prefix
        ├── -Template-Section-Prefix
        │
        └── For each Group:
            ├── -Template-Group-Prefix
            │
            └── For each Row:
                ├── -Template-Row-Prefix
                │   ├── For each Input:
                │   │   └── -Template-Input-InputType-{type}
                │   │      OR -Template-Input-DataType-{type}
                │   │      OR -TabularTemplate-*
                │   └── -Template-Row-Postfix
                │
                └── -Template-Group-Postfix
        │
        └── -Template-Section-Postfix
    └── -Template-Wrap-Postfix
│
└── -Template-Form-Container-Wrap-Postfix
```

## Template Resolution

When looking for a template, the framework checks in order:

1. **View-specific** - `{ViewTemplatePrefix}{TemplatePostfix}`
2. **Theme-specific** - `{ThemePrefix}{TemplatePostfix}`
3. **Default** - `Pict-Form{TemplatePostfix}`

This allows progressive customization from global themes to section-specific
overrides.

## Template Prefixes

### Theme Prefix

Set globally in the form configuration:

```json
"Form-Section-Configuration": {
  "DefaultTemplatePrefix": "Bootstrap5-"
}
```

### View-Specific Prefix

Each view has a unique prefix for section-specific templates:

```
PFT-{ViewHash}-{ViewUUID}
```

## Template Variables

Templates have access to several context variables:

### Record Context

The `Record` variable contains the current input descriptor:

```html
<label>{~Data:Record.Name~}</label>
<input type="text" id="{~Data:Record.Hash~}" />
```

### Context Arrays

The `Context` array contains parent elements:
- `Context[0]` - Current view
- `Context[1]` - Current group
- `Context[2]` - Current row
- `Context[3]` - Current input

```html
<div data-section="{~Data:Context[0].Hash~}">
```

### Pict Reference

Access the Pict application via `{~P~}`:

```html
<span>{~P:AppData.User.Name~}</span>
```

### Data References

Reference data directly:

```html
{~D:Record.PictForm.Placeholder~}
```

## Macros

Macros are pre-computed template fragments that simplify common patterns.

### Standard Macros

```json
"MacroTemplates": {
  "Section": {
    "HTMLID": " id=\"Section-{~D:Context[0].UUID~}\" "
  },
  "Group": {
    "HTMLID": " id=\"Group-{~D:Context[0].UUID~}\" ",
    "PictFormLayout": " data-i-pictdynamiclayout=\"true\" "
  },
  "Input": {
    "RawHTMLID": "{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}",
    "HTMLID": " id=\"{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}\" ",
    "InputChangeHandler": " onchange=\"_Pict.views['{~D:Context[0].Hash~}'].dataChanged('{~D:Record.Hash~}')\" "
  }
}
```

### Using Macros in Templates

```html
<input {~D:Record.Macro.HTMLID~} {~D:Record.Macro.InputChangeHandler~} />
```

## Custom Templates

### MetaTemplates in Configuration

Add custom templates via the manifest:

```json
{
  "Sections": [
    {
      "Hash": "MySection",
      "MetaTemplates": [
        {
          "HashPostfix": "-Template-Input-InputType-CustomWidget",
          "Template": "<div class=\"custom-widget\"><label>{~D:Record.Name~}</label><input type=\"text\" {~D:Record.Macro.HTMLID~} /></div>"
        }
      ]
    }
  ]
}
```

### Programmatic Template Registration

```javascript
pict.TemplateProvider.addTemplate(
  'MyTheme-Template-Section-Prefix',
  '<section class="my-section">'
);

pict.TemplateProvider.addTemplate(
  'MyTheme-Template-Section-Postfix',
  '</section>'
);
```

## Default Templates

### Section Templates

```html
<!-- Section Prefix -->
<div class="pict-form-section" {~D:Context[0].Macro.HTMLID~}>
  <h2>{~D:Context[0].Name~}</h2>

<!-- Section Postfix -->
</div>
```

### Group Templates

```html
<!-- Group Prefix -->
<div class="pict-form-group" {~D:Context[0].Macro.HTMLID~} {~D:Context[0].Macro.PictFormLayout~}>
  <h3>{~D:Context[0].Name~}</h3>

<!-- Group Postfix -->
</div>
```

### Row Templates

```html
<!-- Row Prefix -->
<div class="pict-form-row">

<!-- Row Postfix -->
</div>
```

### Input Templates

Input templates are selected based on InputType or DataType:

```html
<!-- Template-Input-InputType-Text -->
<div class="pict-form-input" style="width:{~D:Record.PictForm.Width~}">
  <label for="{~D:Record.Macro.RawHTMLID~}">{~D:Record.Name~}</label>
  <input type="text"
         {~D:Record.Macro.HTMLID~}
         {~D:Record.Macro.InputChangeHandler~}
         placeholder="{~D:Record.PictForm.Placeholder~}" />
</div>
```

## Tabular Templates

Tabular layouts use a different template structure:

```
-TabularTemplate-TablePrefix
-TabularTemplate-HeadPrefix
-TabularTemplate-HeadCell (for each column)
-TabularTemplate-HeadPostfix
-TabularTemplate-RowPrefix (for each row)
-TabularTemplate-DataCell (for each cell)
-TabularTemplate-RowPostfix
-TabularTemplate-TablePostfix
```

### Tabular Input Reference

In tabular templates, inputs use indexed change handlers:

```html
<input {~D:Record.Macro.TabularHTMLID~}
       onchange="_Pict.views['{~D:Context[0].Hash~}'].dataChangedTabular({~D:Context[1].GroupIndex~}, {~D:Record.PictForm.InputIndex~}, {~D:RowIndex~})" />
```

## Read-Only Templates

The framework provides read-only template variants:

```
-Template-Input-InputType-Text-ReadOnly
-Template-Input-DataType-String-ReadOnly
```

Switch to read-only mode:

```javascript
pict.views.PictFormMetacontroller.formTemplatePrefix = 'Pict-Form-ReadOnly-';
pict.views.PictFormMetacontroller.render();
```

## Theme Development

### Creating a Complete Theme

1. Define templates for each level of the hierarchy
2. Use a consistent prefix (e.g., `MyTheme-`)
3. Register all templates before rendering

```javascript
// Register theme templates
const themeTemplates = {
  'MyTheme-Template-Section-Prefix': '<section class="my-section">',
  'MyTheme-Template-Section-Postfix': '</section>',
  'MyTheme-Template-Group-Prefix': '<fieldset class="my-group">',
  'MyTheme-Template-Group-Postfix': '</fieldset>',
  'MyTheme-Template-Row-Prefix': '<div class="my-row">',
  'MyTheme-Template-Row-Postfix': '</div>',
  'MyTheme-Template-Input-DataType-String': '<input class="my-input" {~D:Record.Macro.HTMLID~} />'
};

for (const [hash, template] of Object.entries(themeTemplates))
{
  pict.TemplateProvider.addTemplate(hash, template);
}
```

### Bootstrap 5 Example

```javascript
pict.TemplateProvider.addTemplate(
  'BS5-Template-Row-Prefix',
  '<div class="row mb-3">'
);

pict.TemplateProvider.addTemplate(
  'BS5-Template-Input-DataType-String',
  `<div class="col-{~D:Record.PictForm.Width~}">
    <label class="form-label" for="{~D:Record.Macro.RawHTMLID~}">{~D:Record.Name~}</label>
    <input type="text" class="form-control" {~D:Record.Macro.HTMLID~} {~D:Record.Macro.InputChangeHandler~} />
  </div>`
);
```

## Template Debugging

Enable template debugging to see which templates are being used:

```javascript
pict.LogNoisiness = 3; // Verbose logging
```

The framework logs template resolution attempts, making it easier to identify
which templates need customization.

## Related Documentation

- [Architecture](Pict_Section_Form_Architecture.md) - Template system internals
- [Configuration](Configuration.md) - Template configuration options
- [Input Types](Input_Types.md) - Input-specific templates
