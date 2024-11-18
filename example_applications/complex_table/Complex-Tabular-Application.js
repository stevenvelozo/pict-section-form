const libPictSectionForm = require('../../source/Pict-Section-Form.js');

const libCustomDataProvider = require('./Complex-Tabular-CustomDataProvider.js');

class ComplexTabularApplication extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addProvider('CustomDataProvider', libCustomDataProvider.default_configuration, libCustomDataProvider);
	}
}

module.exports = ComplexTabularApplication;

module.exports.default_configuration = libPictSectionForm.PictFormApplication.default_configuration;
module.exports.default_configuration.pict_configuration = {
	Product: "ComplexTable",

	DefaultAppData: require("./FruitData.json"),

	DefaultFormManifest: {
		Scope: "SuperComplexTabularForm",

		Sections: [
			{
				Hash: "Recipe",
				Name: "Fruit-based Recipe",

				Solvers:
				[
					"TotalFruitCalories = SUM(FruitNutritionCalories)",
					"AverageFruitCalories = MEAN(FruitNutritionCalories)",
					{
						Ordinal: 99,
						Expression: "AverageFatPercent = MEAN(FruitPercentTotalFat)",
					},
					"RecipeCounterSurfaceArea = RecipeCounterWidth * RecipeCounterDepth",
					"RecipeCounterVolume = RecipeCounterSurfaceArea * RecipeVerticalClearance",
				],

				MetaTemplates:
				[
					{
						//onclick="{~D:Record.Macro.DataRequestFunction~}"
						"HashPostfix": "-Template-Wrap-Prefix",
						"Template": "<h1>Rectangular Area Solver Micro-app</h1><div><a href=\"#\" onclick=\"{~Pict~}.PictApplication.solve()\">[ solve ]</a></div><hr />"
					}
				],

				PickLists:
				[
					{
						Hash: "Families",
						ListAddress: "AppData.FruitMetaLists.Families",
						ListSourceAddress: "FruitData.FruityVice[]",
						TextTemplate: "{~D:Record.family~}",
						IDTemplate: "{~D:Record.family~}",
						Unique: true,
						Sorted: true,
						UpdateFrequency: "Once",
					},
					{
						Hash: "Orders",
						ListAddress: "AppData.FruitMetaLists.Orders",
						ListSourceAddress: "FruitData.FruityVice[]",
						TextTemplate: "{~D:Record.order~}",
						IDTemplate: "{~D:Record.order~}",
						Unique: true,
						UpdateFrequency: "Once",
					},
					{
						Hash: "Genuses",
						ListAddress: "AppData.FruitMetaLists.Genuses",
						ListSourceAddress: "FruitData.FruityVice[]",
						TextTemplate: "{~D:Record.genus~}",
						IDTemplate: "{~D:Record.genus~}",
						Sorted: true,
						UpdateFrequency: "Always",
					},
					{
						Hash: "Books",
						ListAddress: "AppData.AuthorsBooks",
						ListSourceAddress: "Books[]",
						TextTemplate: "{~D:Record.Title~}",
						IDTemplate: "{~D:Record.IDBook~}",
						Sorted: true,
						UpdateFrequency: "Always",
					},
				],

				Groups: [
					{
						Hash: "Recipe",
						Name: "Recipe",
					},
					{
						Hash: "Statistics",
						Name: "Statistics",
					},
					{
						Hash: "FruitStatistics",
						Name: "Statistics About the Fruit",
					},
				],
			},
			{
				Hash: "Book",
				Name: "Books about Tables",
				Groups: [
					{
						Hash: "Author",
						Name: "Author"
					},
					{
						Hash: "Book",
						Hash: "Book"
					}
				]
			},
			{
				Hash: "FruitGrid",
				Name: "Fruits of the World",
				Groups: [
					{
						Hash: "FruitGrid",
						Name: "FruitGrid",

						Layout: "Tabular",

						RecordSetSolvers: [
							{
								Ordinal: 0,
								Expression: "PercentTotalFat = (Fat * 9) / Calories",
							},
						],
						RecordSetAddress: "FruitData.FruityVice",
						RecordManifest: "FruitEditor",
					},
				],
			},
		],

		Descriptors: {
			RecipeName: {
				Name: "Recipe Name",
				Hash: "RecipeName",
				DataType: "String",
				PictForm: { Section: "Recipe", Group: "Recipe", Row: 1 },
			},
			RecipeType: {
				Name: "Recipe Type",
				Hash: "RecipeType",
				DataType: "String",
				PictForm: 
					{
						Section:"Recipe",
						Group:"Recipe",
						Row: 1
					},
			},
			RecipeDescription: {
				Name: "Description",
				Hash: "RecipeDescription",
				DataType: "String",
				PictForm: { Section: "Recipe", Group: "Recipe", Row: 2 },
			},
			Inventor: {
				Name: "Inventor",
				Hash: "Inventor",
				DataType: "String",
				PictForm: { Section: "Recipe", Group: "Recipe", Row: 3 },
			},
			Proprietary: {
				Name: "Proprietary",
				Hash: "Proprietary",
				DataType: "Boolean",
				PictForm: { InputType: "Boolean", Section: "Recipe", Group: "Recipe", Row: 3 },
			},
			"MetaFruit.Information.FavoriteGenus": {
				Name: "Favorite Genus",
				Hash: "FavoriteGenus",
				DataType: "String",
				PictForm: { Section: "Recipe", Group: "Recipe", Row: 4 },
			},
			"MetaFruit.Information.LastPrepared": {
				Name: "Last Prepared",
				Hash: "LastPrepared",
				DataType: "DateTime",
				PictForm: { Section: "Recipe", Group: "Recipe", Row: 4,
					"Providers": ["Pict-Input-DateTime"]
				},
			},

			"Author.IDAuthor": {
				Name: "Author ID",
				Hash: "IDAuthor",
				DataType: "Number",
				PictForm: {
					Section: "Book", Group: "Author", Row: 1, Width: 1, 
					// This performs an entity bundle request whenever a value is selected.
					Providers: ["Pict-Input-EntityBundleRequest", "Pict-Input-AutofillTriggerGroup"],
					EntitiesBundle: [
							{
								"Entity": "Author",
								"Filter": "FBV~IDAuthor~EQ~{~D:Record.Value~}",
								"Destination": "AppData.CurrentAuthor",
								// This marshals a single record
								"SingleRecord": true
							},
							{
								"Entity": "BookAuthorJoin",
								"Filter": "FBV~IDAuthor~EQ~{~D:Appdata.CurrentAuthor.IDAuthor~}",
								"Destination": "AppData.BookAuthorJoins"
							},
							{
								"Entity": "Book",
								"Filter": "FBL~IDBook~LK~{PJU~:,^IDBook^Appdata.BookAuthorJoins~}",
								"Destination": "AppData.BookAuthorJoins"
							}
						],
					EntityBundleTriggerGroup: "BookTriggerGroup"
				}
			},
			"Author.Name": {
				Name: "Author Name",
				Hash: "AuthorName",
				DataType: "String",
				PictForm: {
					Section: "Book", Group: "Author", Row: 1, Width: 1,
					// This performs an entity bundle request whenever a value is selected.
					Providers: ["Pict-Input-AutofillTriggerGroup"],
					AutofillTriggerGroup:
						{
							TriggerGroupName: "BookTriggerGroup",
							TriggerAddress: "AppData.CurrentAuthor.Name",
							MarshalEmptyValues: true
						}
				}
			},


			"Books": {
				Name: "Authors Book List",
				Hash: "Books",
				DataType: "Array",
				Default: []
			},
			"Book.IDBook": {
				Name: "Specific Book",
				Hash: "SpecificIDBook",
				DataType: "Number",
				PictForm: {
					Section: "Book", Group: "Book", Row: 1, Width: 1, "InputType":"Option",
					"SelectOptionsPickList": "Books",
					// This performs an entity bundle request whenever a value is selected.
					Providers: ["Pict-Input-Select"]
				}
			},
			"Book.Title": {
				Name: "Book Title",
				Hash: "BookTitle",
				DataType: "String",
				PictForm: {
					Section: "Book", Group: "Book", Row: 1, Width: 1
				}
			},

			"Recipe.Feeds": {
				Name: "Feeds",
				Hash: "RecipeFeeds",
				DataType: "PreciseNumber",
				Default: "1",
				PictForm: { Section: "Recipe", Group: "Statistics", Row: 1, Width: 1,
					"InputType":"Option",
					"Providers": ["CustomDataProvider", "Pict-Input-Select"],
					"SelectOptions": [{"id":"few", "text":"Few"}, {"id":"some", "text":"Some"}, {"id":"many", "text":"Many"}]
				},
			},
			"Recipe.TotalCalories": {
				Name: "Calories in the Fruits",
				Hash: "RecipeCalories",
				DataType: "PreciseNumber",
				Default: "1",
				PictForm: { Section: "Recipe", Group: "Statistics", Row: 1, Width: 1 },
			},

			"Recipe.CounterWidth": {
				Name: "Counter Prep Width Requirements",
				Hash: "RecipeCounterWidth",
				DataType: "Number",
				Default: "10",
				PictForm: { Section: "Recipe", Group: "Statistics", Row: 2, Width: 1 },
			},
			"Recipe.CounterDepth": {
				Name: "Counter Prep Depth Requirements",
				Hash: "RecipeCounterDepth",
				DataType: "Number",
				Default: "5",
				PictForm: { Section: "Recipe", Group: "Statistics", Row: 2, Width: 1 },
			},
			"Recipe.CounterSurfaceArea": {
				Name: "Required Counter Surface Area",
				Hash: "RecipeCounterSurfaceArea",
				DataType: "PreciseNumber",
				PictForm: { Section: "Recipe", Group: "Statistics", Row: 2, Width: 1 },
			},

			"Recipe.VerticalClearance": {
				Name: "Prep Vertical Clearance",
				Hash: "RecipeVerticalClearance",
				DataType: "Number",
				Default: "12",
				PictForm: { Section: "Recipe", Group: "Statistics", Row: 3, Width: 1 },
			},
			"Recipe.PrepVolume": {
				Name: "Preparation Volume Requirements",
				Hash: "RecipeCounterVolume",
				DataType: "PreciseNumber",
				PictForm: { Section: "Recipe", Group: "Statistics", Row: 3, Width: 1 },
			},
			"Recipe.MoistureContent": {
				Name: "Required Moisture Content",
				Hash: "RecipeMoistureContent",
				DataType: "PreciseNumber",
				PictForm: { Section: "Recipe", Group: "Statistics", Row: 3, Width: 1 },
			},

			"FruitStats.TotalCalories": {
				Name: "Total Calories in All Fruits",
				Hash: "TotalFruitCalories",
				DataType: "PreciseNumber",
				PictForm: {
					Section: "Recipe",
					Group: "FruitStatistics",
					Row: 1,
					Width: 1,
				},
			},
			"FruitStats.AverageCalories": {
				Name: "Average (mean) Calories in All Fruits",
				Hash: "AverageFruitCalories",
				DataType: "PreciseNumber",
				PictForm: {
					Section: "Recipe",
					Group: "FruitStatistics",
					Row: 1,
					Width: 1,
				},
			},
			"FruitStats.AverageFatPercent": {
				Name: "Average (mean) Fat Percentage in All Fruits",
				Hash: "AverageFatPercent",
				DataType: "PreciseNumber",
				PictForm: {
					Section: "Recipe",
					Group: "FruitStatistics",
					Row: 1,
					Width: 1,
				},
			},

			"FruitData.FruityVice": {
				Name: "Fruits of the Earth",
				Hash: "FruitGrid",
				DataType: "Array",
				Default: []
			},

			"FruitData.FruityVice[].nutritions.calories": {
				Hash: "FruitNutritionCalories",
			},
			"FruitData.FruityVice[].nutritions.percent_total_fat": {
				Hash: "FruitPercentTotalFat",
			},
		},

		ReferenceManifests: {
			FruitEditor: {
				Scope: "FruitEditor",

				Descriptors: {
					name: {
						Name: "Fruit Name",
						Hash: "Name",
						DataType: "String",
						Default: "(unnamed fruit)",
						PictForm: { Section: "FruitGrid", Group: "FruitGrid" },
					},
					family: {
						Name: "Family",
						Hash: "Family",
						DataType: "String",
						PictForm: { Section: "FruitGrid", Group: "FruitGrid", "InputType":"Option",
							"Providers": ["Pict-Input-Select"],
							"SelectOptionsPickList": "Families"}
					},
					order: {
						Name: "Order",
						Hash: "Order",
						DataType: "String",
						PictForm: { Section: "FruitGrid", Group: "FruitGrid" },
					},
					genus: {
						Name: "Genus",
						Hash: "Genus",
						DataType: "String",
						PictForm: { Section: "FruitGrid", Group: "FruitGrid" },
					},
					lastWatered: {
						Name: "Last Watered",
						Hash: "LastWatered",
						DataType: "DateTime",
						PictForm: { Section: "FruitGrid", Group: "FruitGrid", "InputType":"DateTime", "Providers": ["Pict-Input-DateTime"]},
					},
					"nutritions.calories": {
						Name: "Calories",
						Hash: "Calories",
						DataType: "Number",
						PictForm: { Section: "FruitGrid", Group: "FruitGrid"},
					},
					"nutritions.fat": {
						Name: "Fat",
						Hash: "Fat",
						DataType: "Number",
						PictForm: { Section: "FruitGrid", Group: "FruitGrid" },
					},
					"nutritions.carbohydrates": {
						Name: "Carbohydrates",
						Hash: "Carbs",
						DataType: "Number",
						PictForm: { Section: "FruitGrid", Group: "FruitGrid" },
					},
					"nutritions.protein": {
						Name: "Protein",
						Hash: "Protein",
						DataType: "Number",
						PictForm: { Section: "FruitGrid", Group: "FruitGrid" },
					},
					"nutritions.percent_total_fat": {
						Name: "PercentTotalFat",
						Hash: "PercentTotalFat",
						DataType: "Number",
						PictForm: { Section: "FruitGrid", Group: "FruitGrid" },
					},
				},
			},
		},
	},
};