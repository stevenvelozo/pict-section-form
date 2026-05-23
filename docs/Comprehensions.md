# Comprehensions

The `addComprehensionEntity` solver function builds **multi-context, multi-entity
comprehensions** from form data — a JSON shape that can be inspected, diffed,
and pushed to a Meadow REST API via
[`meadow-integration load_comprehension`](https://github.com/stevenvelozo/meadow-integration).

Think of it as the "save side" of a form: a single function call lays down one
property of one record under one workflow context, and many calls compose into a
single nested tree that a downstream pipeline can read in one go.

## Signature

```
addComprehensionEntity(Context, Entity, GUID, Property, Value)
```

| Parameter | Type | Meaning |
|---|---|---|
| `Context` | string (manyfest address) | Workflow bucket — `"OnSave"`, `"OnApprovalAction.Approve"`, etc. Dots create nested branches. |
| `Entity` | string | The entity name — `"Book"`, `"Recipe"`, `"Fruit"`. Opaque key (not parsed). |
| `GUID` | string | External GUID for the record. Opaque key (dots are NOT interpreted). |
| `Property` | string | The field to set on the record. Opaque key. |
| `Value` | any | The value to write. Strings, numbers, booleans, objects, arrays. |

Successive calls to the same `(Context, Entity, GUID)` **accumulate properties**
on the same record. Successive calls to the same
`(Context, Entity, GUID, Property)` **overwrite**.

## The shape it builds

Given these solvers on a Book form:

```js
"Solvers":
[
    `addComprehensionEntity("OnSave", "Book", BookGUID, "Title", BookTitle)`,
    `addComprehensionEntity("OnSave", "Book", BookGUID, "Author", BookAuthor)`,
    `addComprehensionEntity("OnSave", "Book", BookGUID, "ISBN", BookISBN)`,
    `addComprehensionEntity("OnApprovalAction.Submit", "Book", BookGUID, "Status", "Submitted")`,
    `addComprehensionEntity("OnApprovalAction.Approve", "Book", BookGUID, "Status", "Approved")`
]
```

…the destination ends up looking like:

```json
{
    "OnSave": {
        "Book": {
            "0x73278432987": {
                "Title": "The Giving Tree",
                "Author": "Shel Silverstein",
                "ISBN": "8675309"
            }
        }
    },
    "OnApprovalAction": {
        "Submit": {
            "Book": {
                "0x73278432987": { "Status": "Submitted" }
            }
        },
        "Approve": {
            "Book": {
                "0x73278432987": { "Status": "Approved" }
            }
        }
    }
}
```

Every leaf in this tree is a Meadow-shaped record keyed by external GUID — the
exact format [`load_comprehension`](https://github.com/stevenvelozo/meadow-integration)
expects.

## Where the result lands

By default the tree is written to `AppData.FormEntityComprehensions`.

The destination is **a manyfest address** resolved against the pict instance, so
addresses like `AppData.X.Y`, `Bundle.X`, etc. all work. Change it on the
metacontroller:

```js
// At any point after the metacontroller is registered (i.e. inside the
// application's constructor, after super() has run):
this.pict.views.PictFormMetacontroller.comprehensionDestinationAddress = 'AppData.MyWorkflowComprehensions';
```

…or pass it in the metacontroller view options if you're constructing the
metacontroller manually:

```js
pict.addView('PictFormMetacontroller', { ComprehensionDestinationAddress: 'AppData.MyWorkflowComprehensions' },
    libPictSectionForm.PictFormMetacontroller);
```

If the address resolves to nothing, the function materializes an object there on
the first write. If it resolves to a non-object scalar, the call logs a warning
and bails (it won't overwrite a number with an object).

## Basic example — flat OnSave context

```js
"Sections":
[
    {
        "Hash": "BookEditor",
        "Solvers":
        [
            `addComprehensionEntity("OnSave", "Book", BookGUID, "Title", BookTitle)`,
            `addComprehensionEntity("OnSave", "Book", BookGUID, "Author", BookAuthor)`,
            `addComprehensionEntity("OnSave", "Book", BookGUID, "Status", "New")`
        ]
    }
]
```

After a solve, `AppData.FormEntityComprehensions.OnSave.Book[<BookGUID>]` holds
the three properties.

## Quick gotchas

1. **Empty GUIDs bail.** If any of `Context`, `Entity`, `GUID`, or `Property`
   resolves to `null`, `undefined`, or the empty string, the call logs a warning
   and returns `undefined`. Recipes with an empty `RecipeName` will not silently
   create a `""` bucket — they just no-op until the user fills the name in.
2. **Solver ordinals.** Solvers run in ascending ordinal order. Put your
   `addComprehensionEntity` calls *after* any solvers they depend on (e.g. after
   the `TotalCalories = SUM(...)` aggregate they read from). The complex_table
   example uses ordinals 200–220 to keep them after the default-ordinal compute
   solvers.
3. **Re-solves overwrite.** Each solve re-runs every solver, so each
   `addComprehensionEntity` call overwrites the property it wrote last time
   with the current value. This is what you want — the comprehension always
   reflects the current form state.
4. **The destination is *not* cleared between solves.** If your form removes a
   record (e.g. deletes a row from a grid), the previous comprehension for that
   record stays behind. If that matters for your workflow, reset the destination
   at the start of the solve cycle (`AppData.FormEntityComprehensions = {}`) or
   in `marshalFromView` before the comprehension solvers fire.

## Pushing the result

Once the comprehension is built, push it via meadow-integration:

```js
// Browser-side -- POST the AppData blob directly to the Comprehension/Push REST endpoint.
fetch('/1.0/Comprehension/Push',
{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
    {
        Comprehension: pict.AppData.FormEntityComprehensions.OnSave,
        GUIDPrefix: 'MYAPP'
    })
});
```

Or write to a file and push from a CLI:

```bash
npx meadow-integration load_comprehension out.json --prefix MYAPP
```

See [meadow-integration: Comprehensions](https://github.com/stevenvelozo/meadow-integration/blob/main/docs/comprehensions.md)
for the full push semantics — GUID marshaling, foreign-key resolution, batch
upserts, idempotency.

## See also

- [Advanced patterns](Comprehensions_Advanced.md) — mixing hashes and direct
  addresses, computed contexts, per-row `MAP VAR` generation, customized
  destinations.
- [Solvers](Solvers.md) — full solver function reference.
- The Complex Table example (`example_applications/complex_table/Complex-Tabular-Application.js`)
  builds a complete `RecipeWorkflowComprehensions` tree with `OnSave` and
  `OnApprovalAction.{Submit,Approve}` contexts off the Recipe section and the
  FruitGrid recordset.
