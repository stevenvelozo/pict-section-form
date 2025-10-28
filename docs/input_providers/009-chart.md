# Chart Input Type

Chart input types wrap one of a few charting libraries.  This means the tech is
compatible with chart.js, c3 and d3 natively and more can be easily added.

## Defaults

By default charts use `chart.js` and are `bar` charts.  They will try to cast
an array or object into a meaningful data set.

This means minimum viable config is something like the following:

```json
{
 "Scope": "ChartDemo",

 "Descriptors":
 {
  "Chart.Display":
  {
   "Name": "MVP Chart",
   "Hash": "MVPChart",
   "DataType": "Object",
   "PictForm":
   {
    "InputType": "Chart",
    "ChartDataAddress": "City.Populations"
   }
  }
 }
}
```

And AppData has something like this:

```json
{
 "City":
 {
  "Populations":
  {
   "Seattle": 324230,
   "Lynnwood": 2349,
   "Burien": 1500,
   "Tacoma": 23498,
   "Olympia": 17984,
   "Redmond": 8700,
   "Kirkland": 9723,
   "Bellevue": 11001
  }
 }
}
```

You will end up with a bar graph that has the X axis as cities, y axis as
populations and the series will be named "City.Populations" as such:



## Data Addresses, Raw Objects and Configurable Programmability _(oh my!)_

There is a three tiered system to how the chart configuration is generated.
Because modern charting libraries rely almost entirely on configuration to
define behavior these days, we can manage the displays this way and only
rely on the pict-section-form library to broker data back-and-forth.

Chaining by default does the following:

1. If there is a `Raw` use that as the base
2. If there as an `Address` use that instead of `Raw` as the base (this lets you override config if you want)
3. If there is a configuration, merge that with the base

So if there is a `ChartLabelsRaw` you can have a set of hard-coded values, and
then if there is a `ChartLabelsAddress` the input provider will look at that
address and see if there is an object at that address; if there is it will be
used instead (as opposed to merging).

Lastly, if there is a configuration,  it will merge the configuration into
whatever came from these.

You can control this though!  It's controlled by configuration.



### Purely Raw Data

You can hard code any chart right into the form.  There are three places
for raw form config:

* `ChartLabelsRaw` - the "labels" object for the chart
* `ChartDatasetsRaw` - the "data" object for the chart
* `ChartJSOptionsCorePrototype` - the chart.js config base

The input provider will use the `ChartJSOptionsCorePrototype` and then
decorate in the `labels` and `data` objects from their raw entries.


### Purely Raw, Hard-coded Data and Labels

This is hard-coded config.  It takes whatever is in the "Raw" configuration and
puts it into the chart config.

```json
{
	"SimpleGraphExampleRawDataOne":
	{
		Name: "SimpleGraphExampleOne",
		Hash: "SimpleGraphExampleOne",

		DataType: "Object",
		PictForm:
		{
			Section: "Chart",
			Group: "SimpleChart",

			Row: 1,
			Width: 3,

			InputType: "Chart",

			ChartLabelsRaw: ['Red', 'Green', 'Yellow', 'Grey', 'Blue'],

			ChartDatasetsRaw: [{
				label: 'My First Dataset',
				data: [11, 16, 7, 3, 14],
				backgroundColor: 
				[
					'rgb(255, 99, 132)',
					'rgb(75, 192, 192)',
					'rgb(255, 205, 86)',
					'rgb(201, 203, 207)',
					'rgb(54, 162, 235)'
				]
			}],

			ChartJSOptionsCorePrototype:
			{
				type: 'polarArea'
			}
		}
	}
}
```

### Configurability via Solvers

This is configuration based on solvers.

```json
{
	"SimpleGraphExampleRawDataTwo":
	{
		Name: "SimpleGraphExampleTwo",
		Hash: "SimpleGraphExampleTwo",

		DataType: "Object",
		PictForm:
		{
			Section: "Chart",
			Group: "SimpleChart",

			Row: 2,
			Width: 6,

			InputType: "Chart",

			ChartType: "bar",
			ChartLabelsSolver: `objectkeystoarray(aggregationhistogrambyobject(FruitGrid, "name", "nutritions.calories"))`,
			ChartDatasetsSolvers:
				[
					{
						Label: 'Calories',
						DataSolver: `objectvaluestoarray(aggregationhistogrambyobject(FruitGrid, "name", "nutritions.calories"))` 
					}
				]
		}
	}
}
```

### Configurability via Address

This is configuration based on pre-formatted data at specific locations...
technically the inline solvers above can be run as a part of any form solve
and store their data in a location the chart can read from.

```json
{
	"SimpleGraphExampleRawDataTwo":
	{
		Name: "SimpleGraphExampleTwo",
		Hash: "SimpleGraphExampleTwo",

		DataType: "Object",
		PictForm:
		{
			Section: "Chart",
			Group: "SimpleChart",

			Row: 2,
			Width: 6,

			InputType: "Chart",

			ChartType: "bar",
			ChartLabelsAddress: `AppData.Chart.LabelsArray`,
			ChartDatasetsAddress: `AppData.Chart.Datasets`
		}
	}
}
```
