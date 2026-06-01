# NDT Field Test - Offline Persistence, Pick Lists, and Charts

<!-- docuserve:example-launch:start -->
> **[Launch the live app](examples/ndt%5Ffield%5Ftest/index.html)** - runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->


NDT Field Test is the example built for the field, not the office. It is a
**Nuclear Density Testing** data-collection form for an asphalt-paving QA
inspector: pick the project and mix design, record the test conditions, enter a
grid of nuclear-gauge density readings, and watch each reading score itself
PASS or FAIL while the form rolls the lot up into summary statistics and a
histogram.

Because an inspector works where there is no network, the example is built
**offline-first** - a persistence provider autosaves every change to local
storage, and the app shell can juggle several saved tests at once.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Offline autosave | A `FormPersistence` provider persists the form to local storage |
| Multi-instance forms | `createNewTest` / `loadTest` manage many saved tests |
| Bundle context | Reference data is saved and reloaded alongside the form |
| Static pick lists | Project / Contractor lists built once with `UpdateFrequency: "Once"` |
| Dynamic pick lists | The Work Item list re-resolves every solve with `"Always"` |
| Row pass/fail solvers | Each reading row computes compaction % and a PASS/FAIL verdict |
| Aggregation charts | A histogram chart is driven entirely by solver functions |

## Key files

- `NDT-Application.js` - the application: `NDTApplication`, the persistence wiring, and the inline manifest
- `BundleData.json` - reference data (projects, contractors, mix designs, work items)
- `html/index.html` - HTML shell + theme CSS

## The data model

The form data is grouped into four objects:

- **Header** - project, contractor, work item, mix design, inspector, date, weather, lot numbers
- **MixInfo** - `MaxDensity_pcf`, `TargetAirVoids`, `OptimumAC`
- **Readings** - a tabular array; each row is one nuclear-gauge reading
- **Summary** - `AverageDensity`, `AverageCompaction`, `PassFail`

`BundleData.json` supplies the reference arrays - `Projects`, `Contractors`,
`MixDesigns`, `WorkItems` - that the pick lists draw from.

---

## Feature 1 - The FormPersistence provider

Unlike the manifest-only examples, NDT Field Test subclasses
`PictFormApplication` so its constructor can register a persistence provider.
`PictFormPersistenceProvider` autosaves the form to local storage:

```js
this.pict.addProviderSingleton(
    'FormPersistence',
    {
        FormTypeIdentifier: 'NDTFieldTest',
        AutoPersistOnDataChange: true,
        AutoPersistBundleWithForm: true,
        AutoPersistDebounceMs: 1500
    },
    libPictSectionForm.PictFormPersistenceProvider);
```

`AutoPersistOnDataChange` saves whenever the data changes; `AutoPersistDebounceMs`
coalesces a burst of edits into one write; `AutoPersistBundleWithForm` stores
the reference data next to the form so a reloaded test still resolves its pick
lists.

---

## Feature 2 - Many tests, one form

Because each saved form has a GUID, the app shell can manage a whole library of
tests. `loadTest` restores one - first its bundle context, then its data:

```js
let tmpFormIndex = tmpPersistence.getFormIndex();
let tmpRecord = tmpFormIndex.Records[pGUID];
if (tmpRecord && tmpRecord.BundleContextIdentifier)
{
    tmpPersistence.loadBundleData(tmpRecord.BundleContextIdentifier);
}
tmpPersistence.loadFormData(pGUID);
tmpPersistence.setActiveFormGUID(pGUID);
```

`createNewTest` is the mirror image - it persists the active form, then starts
a fresh record.

---

## Feature 3 - Static and dynamic pick lists

A pick list turns a reference array into a set of selectable options. Its
`UpdateFrequency` decides how often it is rebuilt. The Project list is built
**once** - projects do not change mid-test:

```js
{
    "Hash": "ProjectList",
    "ListAddress": "AppData.ProjectPickList",
    "ListSourceAddress": "Projects[]",
    "TextTemplate": "{~D:Record.Name~}",
    "IDTemplate": "{~D:Record.IDProject~}",
    "Sorted": true,
    "UpdateFrequency": "Once"
}
```

The Work Item list instead uses `"Always"`, so it re-resolves on every solve -
useful when the options depend on other, changing fields:

```js
{
    "Hash": "WorkItemList",
    "ListSourceAddress": "WorkItems[]",
    "UpdateFrequency": "Always"
}
```

A descriptor binds to a list with `InputType: "Option"` and
`SelectOptionsPickList: "ProjectList"`.

---

## Feature 4 - Row-level pass/fail solvers

The `Readings` grid carries `RecordSetSolvers` with ordinals. Ordinal 0
computes the compaction percentage; ordinal 1 turns it into a verdict:

```js
"RecordSetSolvers": [
    { "Ordinal": 0, "Expression": "CompactionPercent = (WetDensity / MaxDensity) * 100" },
    { "Ordinal": 1, "Expression": "PassFail = IF(CompactionPercent, \">\", 92, \"PASS\", \"FAIL\")" }
]
```

Every reading row scores itself the moment its density is entered - 92%
compaction is the pass threshold.

---

## Feature 5 - Section aggregation solvers

The section that owns the grid averages the readings into the `Summary` object.
The solvers consume aggregated-hash descriptors built over the readings column:

```js
"Solvers": [
    "AverageDensity = MEAN(ReadingDensity)",
    "AverageCompaction = MEAN(ReadingCompactionPercent)"
]
```

`ReadingDensity` and `ReadingCompactionPercent` are descriptors over
`Readings[].WetDensity_pcf` and `Readings[].CompactionPercent` - the same
collection-extraction idea used in
[Scope Mathematics](../scope_mathematics/README.md).

---

## Feature 6 - An aggregation-histogram chart

The results chart is a descriptor with `InputType: "Chart"`. Its labels and
data are not static - they are **solver expressions**, recomputed every solve:

```js
"InputType": "Chart",
"ChartType": "bar",
"ChartLabelsSolver": "objectkeystoarray(aggregationhistogrambyobject(ReadingsArray, \"Station\", \"CompactionPercent\"))",
"ChartDatasetsSolvers": [
    { "Label": "Compaction %", "DataSolver": "objectvaluestoarray(aggregationhistogrambyobject(ReadingsArray, \"Station\", \"CompactionPercent\"))" }
]
```

`aggregationhistogrambyobject` buckets the readings by station;
`objectkeystoarray` / `objectvaluestoarray` split that into the chart's labels
and bars.

## Running the example

```bash
cd example_applications/ndt_field_test
npm run build
# serve ./dist and open index.html
```

## Takeaways

1. **Offline-first is a provider.** Registering `PictFormPersistenceProvider`
   gives the form debounced autosave to local storage with no extra code.
2. **A form can be a record.** Each saved test has a GUID, so the app shell can
   create, list, and reload many of them - bundle context included.
3. **Pick lists choose their own freshness.** `UpdateFrequency: "Once"` builds
   a list a single time; `"Always"` rebuilds it on every solve.
4. **Rows judge themselves.** Per-row `RecordSetSolvers` compute a value and
   then an `IF()`-based PASS/FAIL verdict for every reading.
5. **Charts are solver output.** A `Chart` descriptor renders whatever its
   `ChartLabelsSolver` and `DataSolver` expressions produce - here, a live
   aggregation histogram.

## Related documentation

- [Solvers](../../Solvers.md) - solvers, ordinals, and the aggregation functions
- [Providers](../../Providers.md) - provider registration and the persistence provider
- [Input Types](../../Input_Types.md) - the `Option` and `Chart` input types
- [Layouts](../../Layouts.md) - the `Tabular` layout and `RecordSetSolvers`
