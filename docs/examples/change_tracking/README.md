# Change Tracking - A Solver State Machine

<!-- docuserve:example-launch:start -->
> **[Launch the live app](examples/change%5Ftracking/index.html)** - runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->


Some forms need to know *which* field the user changed. A unit-cost calculator
is the classic case: `Dollar Amount = Cost Per Unit × Quantity`, but the user
should be able to edit **any** of the three and have the others stay
consistent. That requires the form to detect the edit and recompute in the
right direction.

Change Tracking builds exactly that - a small **state machine made entirely of
solver expressions**. There is no JavaScript: a six-phase solver chain caches
the previous values, compares them to the current ones, works out what changed,
and recomputes accordingly.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Visible + hidden descriptor pairs | Each tracked field has hidden companions for bookkeeping |
| Ordinal-phased solver chains | Six ordinals sequence init -> cache -> reset -> detect -> recompute -> commit |
| First-solve guards | An `IF()` seeds the cache only on the very first solve |
| Change detection | A solver compares a snapshot against the cached last-solve value |
| `IF()`-gated recompute | Guarded expressions recompute only the field that should change |
| The same logic, per row | A tabular grid runs the identical chain as `RecordSetSolvers` |

## Key files

- `Change-Tracking-Application.js` - the bootstrap: re-exports the stock app, attaches the manifest
- `Change-Tracking_Manifest.json` - the manifest: descriptors and the solver chain
- `html/index.html` - HTML shell + theme CSS

## The data model

The `UnitCost` section has three **visible** `PreciseNumber` inputs -
`Quantity`, `CostPerUnit`, `DollarAmount` - and six **hidden** `Number`
descriptors that exist purely as the state machine's memory:

- `CostPerUnit_LastSolve`, `CostPerUnit_Hidden`, `CostPerUnit_Changed`
- `DollarAmount_LastSolve`, `DollarAmount_Hidden`, `DollarAmount_Changed`

A `LineItems` section then repeats the whole exercise per row of a tabular grid.

---

## Feature 1 - Visible and hidden descriptor pairs

A descriptor does not have to be on screen. Setting `InputType: "Hidden"` keeps
a value in the form data - solvable, savable - but draws no input. Change
Tracking pairs each visible field with hidden companions:

```js
"UnitCost.CostPerUnit_Hidden": {
    "Name": "CostPerUnit Hidden",
    "Hash": "CostPerUnit_Hidden",
    "DataType": "Number",
    "Default": 0,
    "PictForm": { "Section": "UnitCost", "InputType": "Hidden" }
}
```

The hidden descriptors are scratch space: `_Hidden` snapshots the current
value, `_LastSolve` remembers it across solves, and `_Changed` is a flag.

---

## Feature 2 - A six-phase solver chain

The section's `Solvers` array carries an `Ordinal` on every entry. The engine
runs them in ascending order, so the chain is really six phases:

| Ordinal | Phase |
|--------:|-------|
| 5  | Seed the last-solve cache on the first run |
| 10 | Snapshot the current inputs into `_Hidden` |
| 15 | Reset the `_Changed` flags to 0 |
| 20 | Detect changes - compare `_Hidden` to `_LastSolve` |
| 25 | Recompute the dependent field |
| 30 | Commit the settled values back into `_LastSolve` |

A single phase-10 entry looks like this:

```js
{ "Expression": "CostPerUnit_Hidden = CostPerUnit", "Ordinal": 10 }
```

---

## Feature 3 - First-solve cache seeding

On the very first solve there is no "previous value", so a naive comparison
would report a spurious change. Phase 5 guards against that with an `IF()` - it
seeds `_LastSolve` from the current input *only while it is still 0*:

```js
CostPerUnit_LastSolve = IF(CostPerUnit_LastSolve, "==", 0, CostPerUnit, CostPerUnit_LastSolve)
```

`IF()` here is the five-argument form - `IF(left, op, right, then, else)` - so
this reads "if `CostPerUnit_LastSolve == 0`, take `CostPerUnit`, otherwise keep
`CostPerUnit_LastSolve`".

---

## Feature 4 - Change detection

Phase 15 clears the flags; phase 20 sets a flag when a field's snapshot differs
from its cached last-solve value:

```js
CostPerUnit_Changed = 0
CostPerUnit_Changed = IF(CostPerUnit_Hidden, "==", CostPerUnit_LastSolve, 0, 1)
```

After phase 20, `CostPerUnit_Changed` is `1` exactly when the user edited the
cost-per-unit field since the last solve.

---

## Feature 5 - `IF()`-gated bidirectional recompute

Phase 25 is the decision. Three guarded expressions cover the three cases - and
they run in order, so the last one can test "neither of the first two changed":

```js
DollarAmount = IF(CostPerUnit_Changed, "==", 1, CostPerUnit * Quantity, DollarAmount)
CostPerUnit  = IF(DollarAmount_Changed, "==", 1, DollarAmount / Quantity, CostPerUnit)
DollarAmount = IF(CostPerUnit_Changed + DollarAmount_Changed, "==", 0, Quantity * CostPerUnit, DollarAmount)
```

- Cost-per-unit changed -> recompute the dollar amount
- Dollar amount changed -> recompute the cost per unit
- Neither changed (so quantity was edited) -> recompute the dollar amount

The third gate sums the two flags and tests for `0` - a compact way to say
"nothing else changed". Phase 30 then copies the settled `CostPerUnit` and
`DollarAmount` into their `_LastSolve` companions, so the next cycle compares
against fresh values.

---

## Feature 6 - The same chain, per row

The `LineItems` section proves the pattern is not tied to a single section. Its
tabular group runs the identical logic as a `RecordSetSolvers` string array -
one entry per step, executed in array order, which preserves the phase sequence
without explicit ordinals:

```js
"RecordSetSolvers": [
    "CostPerUnit_LastSolve = IF(CostPerUnit_LastSolve, \"==\", 0, CostPerUnit, CostPerUnit_LastSolve)",
    "CostPerUnit_Hidden = CostPerUnit",
    "CostPerUnit_Changed = IF(CostPerUnit_Hidden, \"==\", CostPerUnit_LastSolve, 0, 1)",
    "DollarAmount = IF(CostPerUnit_Changed, \"==\", 1, CostPerUnit * Quantity, DollarAmount)",
    "CostPerUnit_LastSolve = CostPerUnit"
]
```

(Abbreviated - the live manifest carries the full thirteen-step chain.)

## Running the example

```bash
cd example_applications/change_tracking
npm run build
# serve ./dist and open index.html
```

## Takeaways

1. **A form can have memory.** Hidden descriptors give the solver chain scratch
   space to remember values between solves.
2. **Ordinals turn solvers into phases.** Six numbered phases run init, cache,
   reset, detect, recompute, and commit in a guaranteed order.
3. **`IF()` is the only branch you need.** First-solve seeding, change
   detection, and directional recompute are all five-argument `IF()`
   expressions.
4. **Detect, then act.** Comparing a snapshot to a cached value tells the form
   which field the user touched - and a guarded recompute keeps the others
   consistent.
5. **Section logic ports to rows.** The same chain drops into a tabular grid's
   `RecordSetSolvers` and runs once per row.

## Related documentation

- [Solvers](../../Solvers.md) - solver expressions, ordinals, and the `IF()` function
- [Input Types](../../Input_Types.md) - the `Hidden` and `PreciseNumber` input types
- [Configuration](../../Configuration.md) - descriptors and section structure
