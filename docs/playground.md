# Form Playground

> **[&#9654; Open the Playground](#/playground/section)** — edit a manifest live and watch the form re-render.

The Playground is a sandboxed editor for trying form configurations
without spinning up an example application. Five editor tabs, an
iframe sandbox, and a fresh-render `Run` button:

- **Form Manifest** — sections, groups, inputs, solvers, reference manifests
- **Pict Config** — `pict_configuration` (Product name, default theme, etc.)
- **App Config** — outer application defaults (Name, Hash, lifecycle options)
- **Initial AppData** — the data the form binds against on first render
- **Application Code** — optional JavaScript that returns a class
  extending `PictFormApplication`.  Use it to override lifecycle hooks
  (`onBeforeInitializeAsync`, `onAfterInitializeAsync`), register
  custom views/providers, or add helper methods that inline `onclick`
  handlers in the manifest can call via `_Pict.PictApplication.<name>(...)`.
  The starter file shows the shape.

Press **Run** and the iframe rebuilds with the current editor contents.
Each Run is a clean slate — there's no in-place state to invalidate
between attempts, so a misconfigured manifest can't poison the next
attempt.

Inside the iframe a slim topbar carries the theme picker, mode toggle
(Light / Dark / System), and scale select. Theme state is fully scoped
to the iframe so swapping the form's appearance doesn't disturb the
docs page around it.

## How it works

The Playground is a generic docuserve capability. Any module that wants
one drops a `_playground.json` with `Kind: "section"` into its `docs/`
folder declaring four bits of metadata:

```jsonc
{
    "Kind": "section",
    "SectionType":       "pict-section-form",
    "ApplicationModule": "PictSectionForm",     // window.<this> in the iframe
    "ApplicationGlobal": "PictFormApplication", // <module>.<this> is the app class
    "ManifestKey":       "DefaultFormManifest", // pict_configuration[<this>] = manifest

    "Editors":
    [
        { "Hash": "manifest",   "Label": "Form Manifest",   "Language": "json",
          "DefaultPath": "playground/manifest.json" },
        { "Hash": "pictConfig", "Label": "Pict Config",     "Language": "json",
          "DefaultPath": "playground/pict.json" },
        { "Hash": "appConfig",  "Label": "App Config",      "Language": "json",
          "DefaultPath": "playground/app.json" },
        { "Hash": "appData",    "Label": "Initial AppData", "Language": "json",
          "DefaultPath": "playground/appdata.json" },
        { "Hash": "application","Label": "Application Code","Language": "javascript",
          "DefaultPath": "playground/application.js" }
    ],

    "Imports":
    [
        { "Name": "pict",                "Source": "cdn", "Version": "1" },
        { "Name": "pict-application",    "Source": "cdn", "Version": "1" },
        { "Name": "pict-section-modal",  "Source": "cdn", "Version": "1" },
        { "Name": "pict-section-theme",  "Source": "cdn", "Version": "1" },
        { "Name": "pict-section-form",   "Source": "cdn", "Version": "1" }
    ]
}
```

The starter files (the `DefaultPath`s above) live in `docs/playground/`
and are JSON. They are versioned with the docs, link-resolvable from
prose, and editable in-place by the user via the playground itself.

For `pict-section-recordset`, `pict-section-chart`, and other UX
libraries, the only thing that changes is `ApplicationModule` /
`ApplicationGlobal` / `ManifestKey` plus the `Imports` list. Same view,
same iframe contract, different runtime payload.

## State

- Edits persist to `localStorage` keyed by `<group>/<module>:<editor>`,
  so refreshing the page or jumping away keeps your in-progress work.
- The **Reset** button restores every editor to its starter content
  and clears the matching `localStorage` keys.
- A JSON parse error in any editor surfaces in the status badge over
  the iframe and short-circuits the Run — the iframe stays on the
  last successful render.

## Related documentation

- [Configuration](Configuration.md) — the manifest, section, and group schema
- [Input Types](Input_Types.md) — every input type the manifest can declare
- [Layouts](Layouts.md) — stacked vs. tabular and how `Layout: "Tabular"` reads data
- [Solvers](Solvers.md) — the expression engine that drives the `FullName` field in the starter manifest
