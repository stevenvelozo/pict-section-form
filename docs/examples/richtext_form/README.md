# RichText Form Input

<!-- docuserve:example-launch:start -->
> **[Launch the live app](examples/richtext%5Fform/index.html)** - runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->

**RichText Form Input** is the smallest demonstration of the new
`RichText` InputType: a pict-section-form with one field whose provider
pairs this module's markdown editor (edit mode) with rendered markdown
(view mode). Boots in view mode — no CodeMirror loaded until the first
toggle. Demonstrates the pluggable image-uploader hook in two flavors.

The `RichText` InputType + its provider class live in **pict-section-form**
(see [the Input Type doc](https://fable-retold.github.io/pict-section-form/#/page/input%5Fproviders/014-rich-text)).
The provider lazy-requires this module on the first edit toggle — that's why
the heavy CodeMirror bundle isn't fetched at boot.

For the same InputType inside a richer character-sheet form alongside
stock inputs and a Diagram, see
[Superhero Studio](../superhero%5Fstudio/README.md)
in the pict-section-excalidraw sister module.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| `Pict-Input-RichText` provider registration | One `pict.addProvider(...)` call wires the InputType into the form |
| Per-field runtime mode toggle | `provider.toggleMode('Body', cb)` flips view ↔ edit; the editor bundle lazy-loads on the first edit |
| View-mode rendered markdown | `pict-section-content` renders headings, lists, code blocks, blockquotes into the slot — no editor present |
| `AllowImages: false` rejection | The checkbox toggles this off live; pasting an image surfaces a rejection rather than inserting a half-baked data URI |
| Pluggable `ImageUploader` | Pasting with the uploader on calls `pict.PictApplication.uploadImage(file, descriptor, cb)`; turning it off falls through to default base64 inline |

## Key files

- `RichTextForm-Example-Application.js` — the app. Registers the RichText input provider, defines a one-field form manifest, stubs `uploadImage`, and exposes the mode-toggle + AllowImages-toggle controls.
- `html/index.html` — page chrome: the Edit/Done toggle, two checkboxes (`AllowImages` and `Use ImageUploader stub`), and the form container.

## The form descriptor

```javascript
'Body': {
    Name:     'Body',
    Hash:     'Body',
    DataType: 'String',
    PictForm:
    {
        Section:   'Article',
        Row:       1,
        Width:     12,
        InputType: 'RichText',
        RichText:
        {
            AllowImages:   true,
            ImageUploader: 'uploadImage',  // method name on pict.PictApplication
            Height:        '320px'
        }
    }
}
```

The provider auto-injects its templates into pict-section-form's `DynamicTemplates` registry on construction, so the form's render path finds `*-Template-Input-InputType-RichText` and emits the standard hidden input + display slot.

## Feature 1 — View-by-default with lazy editor mount

On page load, the field's value is parsed as markdown and written into the slot — that's it. Inspect the DevTools Network tab: no `vendor`-side or `codemirror`-side requests fire.

The first time the user clicks Edit, `provider.setMode('Body', 'edit', cb)` runs:

1. Tear down view-mode DOM (clear the slot).
2. Instantiate a subclass of `Pict-Section-MarkdownEditor` with `TargetElementAddress` pointing at the slot.
3. Seed it with the value the provider was last holding for this hash.
4. Wire `onContentChange(segmentIndex, content)` so every keystroke writes through to the form's hidden `<input>` (and dispatches a `change` event so Informary updates AppData).

Clicking Done calls `setMode('Body', 'view', cb)`: the editor is destroyed, the slot is re-rendered from the latest value. The hidden input keeps the user's content across the toggle.

## Feature 2 — `AllowImages: false` rejection

The provider subclass overrides `onImageUpload(file, segmentIndex, cb)`:

```javascript
onImageUpload(pFile, pSegmentIndex, fImgCallback)
{
    if (!tmpRichTextOpts.AllowImages)
    {
        fImgCallback('Image uploads are disabled for this field.');
        return true;   // claim the upload so the editor doesn't fall through
    }
    // ... uploader dispatch below
}
```

Returning `true` and calling `fCallback(errMessage)` tells the editor "I handled this — and I refused it." No half-baked data URI ends up in the markdown. Toggle the page checkbox to see the live difference.

## Feature 3 — Pluggable `ImageUploader`

When `AllowImages: true` AND `ImageUploader` is set, the provider dispatches the file to `pict.PictApplication[name](pFile, pInputDescriptor, fCallback)`:

```javascript
uploadImage(pFile, pInputDescriptor, fCallback)
{
    setTimeout(() =>
    {
        let tmpFakeURL = '/uploads/' + Date.now() + '-' + pFile.name.replace(/[^A-Za-z0-9._-]/g, '_');
        fCallback(null, tmpFakeURL);
    }, 600);
    return true;
}
```

The 600 ms `setTimeout` mimics a real upload round-trip. A production app would POST the file to its storage endpoint and call back with the permanent URL. With the page checkbox set to "off", the stub returns `false`, which tells the underlying editor "fall through to default" — and the default is `FileReader` → base64 data URI inline. Toggle and confirm.

## Running the example

```sh
cd modules/pict/pict-section-form/example_applications/richtext_form
npm install
npx quack build && npx quack copy
open dist/index.html
```

## Takeaways

1. **The provider is the only registration step.** Once it's added to the Pict instance, every form on the instance can use `InputType: 'RichText'`.
2. **Image handling is the host's contract.** Three knobs cover the realistic cases: forbid (`AllowImages: false`), accept and embed (`AllowImages: true`, no uploader), accept and store remotely (`AllowImages: true`, `ImageUploader: '<name>'`).
3. **View-mode performance is free.** A form full of read-only RichText fields never touches CodeMirror until the user starts editing.

## Related documentation

- [pict-section-markdowneditor API Reference ↗](https://fable-retold.github.io/pict-section-markdowneditor/#/page/api) — the markdown editor's public surface, on which the input provider depends.
- [pict-section-markdowneditor / Image Upload ↗](https://fable-retold.github.io/pict-section-markdowneditor/#/page/image%5Fupload) — the full `onImageUpload` contract (this is what `ImageUploader` proxies through).
- [Server Upload ↗](https://fable-retold.github.io/pict-section-markdowneditor/#/page/examples/server%5Fupload/README) — the editor's `onImageUpload` hook wired to a real Orator backend; useful when you want to build a real `ImageUploader` for the form provider.
- [Superhero Studio](../superhero%5Fstudio/README.md) — the RichText InputType inside a fuller form, alongside a Diagram InputType.
