# Scope Mathematics — Solvers That Reach Across Sections

<!-- docuserve:example-launch:start -->
> **[&#9654; Launch the live app](examples/scope%5Fmathematics/index.html)** — runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->


A Pict Section Form solver normally works inside one section, on one section's
data. Scope Mathematics is the example that breaks out of that box: it is an
order-and-inventory worksheet whose final calculations **read values from other
sections and from the global form scope**.

It models a small project estimate — a global configuration, a tabular list of
line items, a tabular list of parts, a cross-scope calculation panel, and a
summary — and wires them together with a three-phase solver chain. Press the
`[ solve ]` link in the form header to run the whole chain.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Per-row record solvers | Each Item / Part row computes its own line total |
| Section aggregation solvers | The Summary totals every row in a section |
| Collection-extraction descriptors | A `[].LineTotal` descriptor flattens one column into an array |
| Solver ordinal phasing | Three ordinals sequence row → section → cross-scope math |
| Global-scope reads | `resolveGlobalFormData` / `getGlobalFormData` pull global values |
| Cross-section reads | `getSectionFormData` reads another section's computed total |
| Cross-section row reads | `getSectionTabularFormData` indexes into another section's grid |

## Key files

- `Scope-Mathematics-Application.js` — the bootstrap: re-exports the stock app, attaches the manifest
- `Scope-Mathematics_Manifest.json` — the manifest: every section, descriptor, and solver
- `html/index.html` — HTML shell + theme CSS

## The data model

The manifest's `Scope` is `ScopeMathematics`. It has five working sections plus
a documentation panel:

- **GlobalConfig** — `TaxRate`, `CurrencySymbol`, `ProjectName`
- **Items** — a `Tabular` group, `Items.ItemList`, rows of `{ ItemName, Quantity, UnitPrice, LineTotal }`
- **Parts** — a `Tabular` group, `Parts.PartList`, rows of `{ PartName, PartQuantity, PartCost, PartTotal }`
- **CrossScope** — descriptors populated entirely by cross-scope solvers
- **Summary** — display-only totals

---

## Feature 1 — Per-row record solvers

A `Tabular` group can carry a `RecordSetSolvers` array. Each expression runs
**once per row**, with that row's own fields in scope. The Items grid computes
each line total in place:

```js
"RecordSetSolvers": [
    "LineTotal = Quantity * UnitPrice"
]
```

After the chain runs, every row of `Items.ItemList` has a `LineTotal` equal to
its own `Quantity * UnitPrice`.

---

## Feature 2 — Aggregation with collection-extraction descriptors

To total a column you first need the column as an array. A
**collection-extraction descriptor** does that — its address ends in `[]` and a
field name, and its `Hash` names the resulting array:

```js
"Items.ItemList[].LineTotal": { "Hash": "ItemLineTotals", /* … */ }
```

`ItemLineTotals` is now an array of every row's `LineTotal`. A section-level
`Solvers` entry aggregates it:

```js
"Solvers": [
    { "Expression": "Summary.TotalItemsCost = SUM(ItemLineTotals)", "Ordinal": 2 },
    { "Expression": "Summary.ItemCount = COUNT(ItemList)", "Ordinal": 2 }
]
```

`SUM`, `COUNT` and friends operate on the extracted array, not on the grid.

---

## Feature 3 — Solver ordinal phasing

Every solver carries an `Ordinal`. The engine runs all ordinal-1 solvers, then
all ordinal-2, then ordinal-3 — so a later phase can safely depend on an
earlier phase's output. Scope Mathematics uses three phases:

1. **Ordinal 1** — per-row `RecordSetSolvers` compute each `LineTotal`
2. **Ordinal 2** — section solvers aggregate the rows into section totals
3. **Ordinal 3** — cross-scope solvers combine totals from every section

An ordinal-3 solver depends on the ordinal-2 results:

```js
{ "Expression": "GrandTotal = TotalItemsCost + TotalPartsCost", "Ordinal": 3 }
```

Without phasing, this solver might run before the totals it adds even exist.

---

## Feature 4 — Reading across scopes

Phase 3 is the point of the example. Four functions let a solver read data it
does not own — each one takes a different route to the value.

**`resolveGlobalFormData(address)`** — resolve a value from the global form
scope by its Manyfest address:

```js
{ "Expression": "TotalItemsCost = resolveGlobalFormData(\"Summary.TotalItemsCost\")", "Ordinal": 3 }
```

**`getGlobalFormData(hash)`** — the same idea, but addressed by descriptor
*hash* rather than full address:

```js
{ "Expression": "GlobalTaxRate = getGlobalFormData(\"TaxRate\")", "Ordinal": 3 }
```

**`getSectionFormData(section, hashOrAddress)`** — read a value computed inside
another *section*:

```js
{ "Expression": "CrossScopeItemTotal = getSectionFormData(\"Items\", \"Summary.TotalItemsCost\")", "Ordinal": 3 }
```

**`getSectionTabularFormData(section, group, rowIndex, hashOrAddress)`** — reach
all the way into a specific *row* of another section's tabular grid:

```js
{ "Expression": "FirstItemTotal = getSectionTabularFormData(\"Items\", \"ItemList\", 0, \"LineTotal\")", "Ordinal": 3 }
```

Together these turn the form from a set of isolated sections into one connected
calculation.

## Running the example

```bash
cd example_applications/scope_mathematics
npm run build
# serve ./dist and open index.html — press [ solve ] in the form header
```

## Takeaways

1. **Solvers compose in phases.** An `Ordinal` on every solver guarantees that
   row math finishes before section math, and section math before cross-scope
   math.
2. **Extract a column before you aggregate it.** A `[].Field` descriptor turns
   one grid column into a named array that `SUM` and `COUNT` can consume.
3. **Four ways to reach out.** `resolveGlobalFormData` and `getGlobalFormData`
   read the global scope; `getSectionFormData` and `getSectionTabularFormData`
   read sibling sections and even individual grid rows.
4. **It is still just a manifest.** The application file only attaches the
   manifest — every calculation above is declarative configuration.

## Related documentation

- [Solvers](../../Solvers.md) — the solver system, ordinals, and the scope-access functions
- [Layouts](../../Layouts.md) — the `Tabular` layout and `RecordSetSolvers`
- [Configuration](../../Configuration.md) — sections, descriptors, and reference manifests
