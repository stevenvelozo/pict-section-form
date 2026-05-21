# Comprehensions — Advanced patterns

This document goes deeper than [Comprehensions](Comprehensions.md):

- **Hash vs. address arguments** — when to write `BookGUID` (bare symbol),
  `"AppData.Bundle.BookGUID"` (string address), `getvalue("...")` (explicit
  lookup), and when to mix them.
- **Computed contexts** — `IF`/ternary results as the `Context` argument so a
  single solver routes between `OnApprovalAction.Submit` and
  `OnApprovalAction.Approve`.
- **Per-row generation** with `MAP VAR` over a recordset.
- **Customized destinations** at the metacontroller level.
- **Resetting between solves**.

The complete worked example for everything here lives at
[`example_applications/complex_table/Complex-Tabular-Application.js`](../example_applications/complex_table/Complex-Tabular-Application.js)
— if you only read one thing, read that file. This page explains the *why* behind
the patterns it uses.

## Argument resolution — hashes, addresses, and quoted strings

The solver expression parser treats each argument to `addComprehensionEntity`
the same way it would treat any other function argument:

| Argument form | What happens |
|---|---|
| `BookGUID` | **Bare symbol** — resolved from the form's manifest. Looked up first by descriptor hash, then by address against the marshal destination. |
| `Record.GUID` / `AppData.Bundle.X` | **Dotted symbol** — resolved as an address (the parser does NOT need quotes around addresses). |
| `"OnSave"` / `"Book"` | **Quoted string** — taken literally, no resolution. |
| `getvalue("AppData.X.Y")` | **Explicit lookup** — useful when you want to force address-resolution semantics on a value built up from other solvers. |
| `IF(...)` / `CONCAT(...)` | **Nested function call** — the inner function's return value becomes the argument. |

In practice you mix freely:

```js
"Solvers":
[
    // Context and Property are literals; Entity is a literal; GUID and Value
    // are resolved from form data.
    `addComprehensionEntity("OnSave", "Book", BookGUID, "Title", BookTitle)`,

    // Same shape, but the GUID and Value come from absolute addresses rather
    // than descriptor hashes.  Useful if the descriptor hashes haven't been
    // wired up or the data lives outside the form.
    `addComprehensionEntity("OnSave", "Book", AppData.SelectedBook.IDBook, "Status", AppData.SelectedBook.Status)`,

    // Pull a value through a getvalue() call -- equivalent to the line above
    // but with explicit resolution syntax.  Use this form when an inner
    // expression already produces an address string and you want to evaluate it.
    `addComprehensionEntity("OnSave", "Book", getvalue("AppData.SelectedBook.IDBook"), "Status", getvalue("AppData.SelectedBook.Status"))`,

    // The property name itself is computed.  CONCAT returns a string, which
    // becomes the Property argument.
    `addComprehensionEntity("OnSave", "Book", BookGUID, CONCAT("Field_", FieldType), FieldValue)`
]
```

**Rule of thumb:** quote when you want a literal, leave unquoted when you want
the parser to look the symbol up. The first three arguments are almost always
literal strings (Context, Entity name) plus one resolved value (GUID); the
fourth is almost always a literal Property; the fifth is almost always resolved.

## Computed contexts — routing with `IF`

The `Context` argument is a manyfest address. It's also just a string that the
function uses to walk a nested object — which means a *computed* string works
fine. The complex_table example routes between `OnApprovalAction.Submit` and
`OnApprovalAction.Approve` based on a `Proprietary` boolean:

```js
{ Ordinal: 220, Expression:
    `addComprehensionEntity(
        IF(Proprietary, "==", 1, "OnApprovalAction.Submit", "OnApprovalAction.Approve"),
        "Recipe",
        RecipeName,
        "Status",
        IF(Proprietary, "==", 1, "Submitted", "Approved")
    )`
}
```

Both `Submit` and `Approve` branches sit under `OnApprovalAction`, which lets
downstream code key off `Object.keys(comprehension.OnApprovalAction)` to discover
which actions fired this solve.

The same trick scales to richer routing — e.g. context-per-environment:

```js
`addComprehensionEntity(
    CONCAT("OnSave.", EnvironmentName),
    "Recipe", RecipeName, "Status", "Saved"
)`
```

This produces `OnSave.Production.Recipe.<name>.Status` or
`OnSave.Staging.Recipe.<name>.Status` depending on the value of
`EnvironmentName`.

## Per-row generation with `MAP VAR`

`MAP VAR` iterates a recordset and fires the body expression once per row, with
the row bound to a name you choose (`row` is the convention). Combined with
`addComprehensionEntity`, this fans one solver across an entire grid:

```js
// From complex_table -- the Recipe section's solvers reach into the FruitGrid
// recordset and emit one OnSave.Fruit.<name>.<property> entry per (fruit, property)
// pair.  Three MAP VARs produce 3 * N comprehension writes in a single solve.
{ Ordinal: 210, Expression: `MAP VAR row FROM FruitData.FruityVice : addComprehensionEntity("OnSave", "Fruit", row.name, "Family", row.family)` },
{ Ordinal: 210, Expression: `MAP VAR row FROM FruitData.FruityVice : addComprehensionEntity("OnSave", "Fruit", row.name, "Order", row.order)` },
{ Ordinal: 210, Expression: `MAP VAR row FROM FruitData.FruityVice : addComprehensionEntity("OnSave", "Fruit", row.name, "Calories", row.nutritions.calories)` }
```

Inside the body, `row.X.Y` resolves against each row in turn — so you get
deep-property access without writing per-row solvers.

After the solve runs against the bundled FruityVice data, the comprehension at
`AppData.RecipeWorkflowComprehensions.OnSave.Fruit` looks like:

```json
{
    "Apple":    { "Family": "Rosaceae",  "Order": "Rosales",  "Calories": "52" },
    "Banana":   { "Family": "Musaceae",  "Order": "Zingiberales", "Calories": "96" },
    "Mango":    { "Family": "Anacardiaceae", "Order": "Sapindales",  "Calories": "60" },
    ...
}
```

(49 fruits total in the complex_table dataset.)

If you need one comprehension write per row that touches *every* property of the
row, you have two reasonable options:

1. Multiple `MAP VAR` solvers, one per property (as above). Clear and easy to
   audit.
2. A single helper solver function registered on
   `DynamicFormSolverBehaviors` that takes a row + property list and calls
   `addComprehensionEntity` internally. Worth the indirection only if you have
   many entities with many properties; otherwise just write the explicit
   `MAP VAR`s.

## Customizing the destination

Each metacontroller has a `comprehensionDestinationAddress` property —
mirroring the existing `viewMarshalDestination` knob — that controls where
`addComprehensionEntity` writes. The default is `AppData.FormEntityComprehensions`.

### Option 1: in the application constructor

This is what the [complex_table example](../example_applications/complex_table/Complex-Tabular-Application.js)
does. After `super()` (which registers the metacontroller view via
`PictFormApplication`), set the destination directly:

```js
class MyWorkflowApplication extends libPictSectionForm.PictFormApplication
{
    constructor(pFable, pOptions, pServiceHash)
    {
        super(pFable, pOptions, pServiceHash);
        this.pict.views.PictFormMetacontroller.comprehensionDestinationAddress = 'AppData.WorkflowComprehensions';
    }
}
```

### Option 2: via metacontroller options

If you're registering the metacontroller view yourself (no `PictFormApplication`
parent), pass `ComprehensionDestinationAddress` in the options:

```js
pict.addView(
    'PictFormMetacontroller',
    { ComprehensionDestinationAddress: 'Bundle.PendingWrites' },
    libPictSectionForm.PictFormMetacontroller
);
```

### Option 3: change it mid-flight

The property is a plain string -- reassign whenever you need different
destinations for different phases:

```js
// Before fanning the form's solvers, redirect to a transient staging slot.
this.pict.views.PictFormMetacontroller.comprehensionDestinationAddress = 'TempData.PendingComprehension';
this.pict.PictApplication.solve();
const tmpPending = this.pict.TempData.PendingComprehension;

// Promote / discard / inspect tmpPending however you like.

// Switch back to the canonical destination for the next solve.
this.pict.views.PictFormMetacontroller.comprehensionDestinationAddress = 'AppData.WorkflowComprehensions';
```

The destination address is resolved against the pict instance, so any subtree
works (`AppData.*`, `Bundle.*`, `TempData.*`, ...).

## Resetting the tree between solves

`addComprehensionEntity` never deletes keys -- it only writes / overwrites. If
your form workflow expects "only emit comprehensions for *currently visible*
records," you need to clear the destination at the start of the solve cycle.
Two patterns:

### Pattern A: low-ordinal reset solver

```js
"Solvers":
[
    // Runs before any addComprehensionEntity calls because of the explicit
    // low ordinal.  `getvalue` returns a reference to the live AppData branch,
    // but assigning to `AppData.X` rebinds the address.  In manyfest assignments
    // we want to nuke the previous tree, so explicitly empty it.
    { Ordinal: 1, Expression: `AppData.RecipeWorkflowComprehensions = "{}"` },
    // ...then the addComprehensionEntity calls at higher ordinals
]
```

The string `"{}"` becomes `{}` after JSON round-trip on the assignment. If your
solver dialect doesn't coerce strings to JSON for you, do the reset in
JavaScript instead:

### Pattern B: JS-side reset

Override `marshalFromView` or `onBeforeSolve` to zero the destination:

```js
class MyWorkflowApplication extends libPictSectionForm.PictFormApplication
{
    onBeforeSolve()
    {
        this.pict.AppData.RecipeWorkflowComprehensions = {};
        return super.onBeforeSolve();
    }
}
```

This is the simplest version. The `addComprehensionEntity` resolver handles a
missing-or-emptied destination by re-materializing it on the next write.

## Full reference: the complex_table sample config

The [complex_table example](../example_applications/complex_table/Complex-Tabular-Application.js)
exercises every pattern on this page in one application. The relevant pieces:

```js
// Constructor sets a customized destination.
this.pict.views.PictFormMetacontroller.comprehensionDestinationAddress = 'AppData.RecipeWorkflowComprehensions';
```

```js
// Recipe section solvers -- mix of bare-symbol GUID (RecipeName) and address
// arguments, multiple OnSave properties, MAP VAR fanning over a recordset,
// and IF-routed OnApprovalAction.
Solvers:
[
    // ...prior compute solvers...

    // OnSave.Recipe.<RecipeName>.<Property> for the recipe-level facts.
    { Ordinal: 200, Expression: `addComprehensionEntity("OnSave", "Recipe", RecipeName, "Name", RecipeName)` },
    { Ordinal: 200, Expression: `addComprehensionEntity("OnSave", "Recipe", RecipeName, "Type", RecipeType)` },
    { Ordinal: 200, Expression: `addComprehensionEntity("OnSave", "Recipe", RecipeName, "Description", RecipeDescription)` },
    { Ordinal: 200, Expression: `addComprehensionEntity("OnSave", "Recipe", RecipeName, "Inventor", Inventor)` },
    { Ordinal: 200, Expression: `addComprehensionEntity("OnSave", "Recipe", RecipeName, "TotalCalories", TotalFruitCalories)` },
    { Ordinal: 200, Expression: `addComprehensionEntity("OnSave", "Recipe", RecipeName, "AverageFatPercent", AverageFatPercent)` },

    // OnSave.Fruit.<fruit>.<Property> -- per-row via MAP VAR over the FruitGrid recordset.
    { Ordinal: 210, Expression: `MAP VAR row FROM FruitData.FruityVice : addComprehensionEntity("OnSave", "Fruit", row.name, "Family", row.family)` },
    { Ordinal: 210, Expression: `MAP VAR row FROM FruitData.FruityVice : addComprehensionEntity("OnSave", "Fruit", row.name, "Order", row.order)` },
    { Ordinal: 210, Expression: `MAP VAR row FROM FruitData.FruityVice : addComprehensionEntity("OnSave", "Fruit", row.name, "Calories", row.nutritions.calories)` },

    // OnApprovalAction.{Submit,Approve}.Recipe.<RecipeName> -- computed context.
    { Ordinal: 220, Expression: `addComprehensionEntity(IF(Proprietary, "==", 1, "OnApprovalAction.Submit", "OnApprovalAction.Approve"), "Recipe", RecipeName, "Status", IF(Proprietary, "==", 1, "Submitted", "Approved"))` },
    { Ordinal: 220, Expression: `addComprehensionEntity(IF(Proprietary, "==", 1, "OnApprovalAction.Submit", "OnApprovalAction.Approve"), "Recipe", RecipeName, "Reviewer", Inventor)` }
]
```

After loading the example, fill in the Recipe section and toggle the
Proprietary checkbox; inspect `_Pict.AppData.RecipeWorkflowComprehensions` in
the browser console to see the OnSave / OnApprovalAction subtrees update.

## Where this stops being the right tool

`addComprehensionEntity` is for shaping comprehension trees inside the
solver. If you're operating outside the solver loop -- e.g. building a
comprehension from an HTTP response, transforming CSV, or merging two pre-built
comprehensions -- reach for the meadow-integration toolchain directly:

- `meadow-integration csvtransform` to map columns into entity records.
- `meadow-integration comprehensionintersect` to merge two comprehensions.
- The `Comprehension` object's `Object.assign` semantics for in-code merges.

See [meadow-integration: Comprehensions](https://github.com/stevenvelozo/meadow-integration/blob/main/docs/comprehensions.md)
for those tools. The solver helper is purpose-built for "as I edit this form,
build the comprehension that will save it."
