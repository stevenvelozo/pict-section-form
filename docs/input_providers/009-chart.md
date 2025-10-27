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

### Purely Raw Data

You can hard code any chart right into the form.  There are three places
for raw form config:

* `ChartLabelsRaw` - the "labels" object for the chart
* `ChartDatasetsRaw` - the "data" object for the chart
* `ChartJSOptionsCorePrototype` - the chart.js config base

The input provider will use the `ChartJSOptionsCorePrototype` and then
decorate in the `labels` and `data` objects from their raw entries.

Chaining always does the following:

1. If there is a `Raw`

```json
{
 "SimpleGraphExampleRawData":
 {
  Name: "OrderCaloryGraph",
  Hash: "OrderCaloryGraph",
  
  DataType: "Object",
  PictForm:
  {
   Section: "Chart",
   Group: "SimpleChart",

   Row: 1,
   Width: 12,

   InputType: "Chart",

   ChartLabelsRaw:  ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],

   ChartDatasetsRaw: [
    {
     label: 'Awesomeness',
     data: [ 1500, 1200, 800, 1700, 900, 2000 ]
    }],

   ChartJSOptionsCorePrototype:
   {
    type: 'bar'
   }
  }
 }
}
```

### Purely Raw Data

```json
{
 "SimpleGraphExampleRawData":
 {
  Name: "OrderCaloryGraph",
  Hash: "OrderCaloryGraph",
  
  DataType: "Object",
  PictForm:
  {
   Section: "Chart",
   Group: "SimpleChart",
   Row: 1,
   Width: 12,
   InputType: "Chart",

   ChartType: "bar",

   // This allows you to scope data for the chart separately from appdata
   ChartDataScope: "Form",

   ChartDataAddress: "FruitData.FruityVice",

   ChartLabelsAddress: "FruitData.FruityVice",
   ChartLabelsRaw:  ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],

   ChartDatasetsAddress: "FruitData.FruityVice",
   ChartDatasetsConfig:
   {
    Calories:
    {
     ChartLabel: "Calories",
     DataSolver: "Data = {~D:Record.nutritions.calories~}",
     DataTemplate: "{~D:Record.SolverResult~}", // Could also be something from the solver postfix stack
     DataCorePrototype:
     {
      borderWidth: 1
     }
    }
   },
   ChartDatasetsRaw: [
    {
     label: 'Awesomeness',
     data: [ 1500, 1200, 800, 1700, 900, 2000 ]
    }],

   // Do anything you want here!!
   ChartJSOptionsCorePrototype:
   {
    type: 'bar',
    options: {
     scales: {
      y: {
       beginAtZero: true
      }
     }
    }
   }
  }
 }
}
```