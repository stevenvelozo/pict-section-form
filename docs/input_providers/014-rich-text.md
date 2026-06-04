# RichText Input Provider

The RichText input provider pairs the
[pict-section-markdowneditor](https://fable-retold.github.io/pict-section-markdowneditor/)
CodeMirror-based markdown editor (edit mode) with
[pict-section-content](https://fable-retold.github.io/pict-section-content/)-style
rendered markdown (view mode) inside a form field. Boots in **view mode** —
the CodeMirror bundle isn't pulled until the host UI flips the field into
edit mode.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-RichText` |
| Input Type | `RichText` |
| Supports Tabular | No (Phase 1) |
| Display Only | No |

## Setup

The provider class lives in pict-section-form. It lazy-requires
`pict-section-markdowneditor` on the first `setMode('edit')`, so add that
module as a dependency in apps that allow editing.

```javascript
const libPictSectionForm = require('pict-section-form');
const libRichTextInput   = libPictSectionForm.RichTextInput;

pict.addProvider(
    libRichTextInput.default_configuration.ProviderIdentifier,
    libRichTextInput.default_configuration,
    libRichTextInput);
```

## Basic Usage

```json
{
  "Article.Body": {
    "Name": "Body",
    "Hash": "Body",
    "DataType": "String",
    "PictForm": {
      "InputType": "RichText",
      "RichText": {
        "AllowImages":   true,
        "ImageUploader": "uploadImage",
        "Height":        "320px"
      }
    }
  }
}
```

## Configuration Options

### AllowImages

Boolean (default `false`). When `true`, the markdown editor wires in image
paste / drag / file-picker upload. When `false`, image uploads are silently
rejected — no half-baked data URI lands in the markdown.

### ImageUploader

String. Name of a method on `pict.PictApplication` to dispatch image uploads
through. The method receives `(pFile, pInputDescriptor, fCallback)` and should
return `true` if it will handle the upload asynchronously; call
`fCallback(null, pURL)` with the final URL.

```javascript
class MyApp extends libPictSectionForm.PictFormApplication
{
    uploadImage(pFile, pInputDescriptor, fCallback)
    {
        // POST pFile to your storage endpoint, then:
        fCallback(null, '/uploads/' + finalURL);
        return true;
    }
}
```

If `AllowImages: true` but no `ImageUploader` is configured, the editor falls
through to the default `FileReader` → base64 data URI inline.

### Height

CSS string applied to the slot when the field is in edit mode (the editor's
default).

### EditorOptions / ViewerOptions

Pass-through to the underlying section views' configurations. Use sparingly —
the defaults are tuned for in-form embedding.

## Runtime API

```javascript
let tmpProvider = pict.providers['Pict-Input-RichText'];

tmpProvider.setMode('Body', 'edit', (pErr) => { /* … */ });
tmpProvider.setMode('Body', 'view', (pErr) => { /* … */ });
tmpProvider.toggleMode('Body', (pErr) => { /* … */ });
tmpProvider.getMode('Body');           // 'edit' | 'view' | null
tmpProvider.commit('Body', (pErr) => { /* … */ });
```

Wire `toggleMode` to a button in your UI to flip a single field between modes
without re-rendering the rest of the form.

## Lifecycle Hooks

The provider extends `Pict-Provider-InputExtension`:

| Hook | What it does |
|------|-------------|
| `onInputInitialize` | Mounts the slot in view mode (rendered markdown into the `#DISPLAY-FOR-…` slot) |
| `onDataMarshalToForm` | View mode: re-renders the markdown. Edit mode: updates the editor's segment store and triggers a re-render |
| `onInputInitializeTabular` | Throws — RichText is not supported inside tabular rows in Phase 1 |

## Tabular Limitation

Phase 1 explicitly does not support `RichText` inside tabular rows — N rows × a
CodeMirror instance each is a performance landmine. The provider throws a
clear error if used in tabular context.

## Related Documentation

- [RichText Form Input example](https://fable-retold.github.io/pict-section-markdowneditor/#/page/examples/richtext%5Fform/README) — minimal one-field demo with image-upload toggles.
- [Superhero Studio example](https://fable-retold.github.io/pict-section-excalidraw/#/page/examples/superhero%5Fstudio/README) — RichText + Diagram + stock InputTypes in one form.
- [Diagram Input Type](015-diagram.md) — the SVG-output sibling.
- [Markdown Input Type](003-markdown.md) — the display-only markdown renderer (no edit mode).
- [pict-section-markdowneditor docs](https://fable-retold.github.io/pict-section-markdowneditor/) — the underlying editor.
- [pict-section-markdowneditor / Image Upload](https://fable-retold.github.io/pict-section-markdowneditor/#/page/image%5Fupload) — the `onImageUpload` contract that `ImageUploader` proxies through.
