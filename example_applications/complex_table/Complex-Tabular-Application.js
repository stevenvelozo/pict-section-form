const libPictSectionForm = require('../../source/Pict-Section-Form.js');

module.exports = libPictSectionForm.PictFormApplication;

module.exports.default_configuration = libPictSectionForm.PictFormApplication.default_configuration;
module.exports.default_configuration.pict_configuration = (
	{
		"Product": "SimpleTable",
	
		"DefaultAppData": require('./FruitData.json'),

		"DefaultFormManifest":
		{
			"Scope": "SuperSimpleTabularForm",

			"Sections": [
				{
					"Hash": "Recipe",
					"Name": "Fruit-based Recipe",


					"Solvers":
						[
							"TotalFruitCalories = SUM(FruitNutritionCalories)",
							"AverageFruitCalories = MEAN(FruitNutritionCalories)",
							{ "Ordinal": 99, "Expression": "AverageFatPercent = MEAN(FruitPercentTotalFat)"},
							"RecipeCounterSurfaceArea = RecipeCounterWidth * RecipeCounterDepth",
							"RecipeCounterVolume = RecipeCounterSurfaceArea * RecipeVerticalClearance",
						],

					"Groups": [
						{
							"Hash": "Recipe",
							"Name": "Recipe",
						},
						{
							"Hash": "Statistics",
							"Name": "Statistics",
						},
						{
							"Hash": "FruitStatistics",
							"Name": "Statistics About the Fruit",
						}
					]
				},
				{
					"Hash": "FruitGrid",
					"Name": "Fruits of the World",
					"Groups": [
						{

							"Hash": "FruitGrid",
							"Name": "FruitGrid",

							"Layout": "Tabular",

							"RecordSetSolvers": [
								{"Ordinal": 0, "Expression": "PercentTotalFat = (Fat * 9) / Calories"}
							],
							"RecordSetAddress": "FruitData.FruityVice",
							"RecordManifest": "FruitEditor"
						}
					]
				},
			],

			"Descriptors":
			{
				"RecipeName": { "Name": "Recipe Name", "Hash": "RecipeName", "DataType": "String", "PictForm": { "Section": "Recipe", "Group": "Recipe" } },
				"RecipeType": { "Name": "Recipe Type", "Hash": "RecipeType", "DataType": "String", "PictForm": { "Section": "Recipe", "Group": "Recipe" } },
				"RecipeDescription": { "Name": "Description", "Hash": "RecipeDescription", "DataType": "String", "PictForm": { "Section": "Recipe", "Group": "Recipe" } },
				"Inventor": { "Name": "Inventor", "Hash": "Inventor", "DataType": "String", "PictForm": { "Section": "Recipe", "Group": "Recipe" } },

				"Recipe.Feeds": {
					"Name": "Feeds", "Hash": "RecipeFeeds", "DataType": "PreciseNumber", "Default": "1",
					"PictForm": { "Section": "Recipe", "Group": "Statistics", "Row": 1, "Width": 1 }
				},
				"Recipe.TotalCalories": {
					"Name": "Calories in the Fruits", "Hash": "RecipeCalories", "DataType": "PreciseNumber", "Default": "1",
					"PictForm": { "Section": "Recipe", "Group": "Statistics", "Row": 1, "Width": 1 }
				},

				"Recipe.CounterWidth": {
					"Name": "Counter Prep Width Requirements", "Hash": "RecipeCounterWidth", "DataType": "PreciseNumber", "Default": "10",
					"PictForm": { "Section": "Recipe", "Group": "Statistics", "Row": 2, "Width": 1 }
				},
				"Recipe.CounterDepth": {
					"Name": "Counter Prep Depth Requirements", "Hash": "RecipeCounterDepth", "DataType": "PreciseNumber", "Default": "5",
					"PictForm": { "Section": "Recipe", "Group": "Statistics", "Row": 2, "Width": 1 }
				},
				"Recipe.CounterSurfaceArea": {
					"Name": "Required Counter Surface Area", "Hash": "RecipeCounterSurfaceArea", "DataType": "PreciseNumber",
					"PictForm": { "Section": "Recipe", "Group": "Statistics", "Row": 2, "Width": 1 }
				},

				"Recipe.VerticalClearance": {
					"Name": "Prep Vertical Clearance", "Hash": "RecipeVerticalClearance", "DataType": "PreciseNumber", "Default": "12",
					"PictForm": { "Section": "Recipe", "Group": "Statistics", "Row": 3, "Width": 1 }
				},
				"Recipe.PrepVolume": {
					"Name": "Preparation Volume Requirements", "Hash": "RecipeCounterVolume", "DataType": "PreciseNumber",
					"PictForm": { "Section": "Recipe", "Group": "Statistics", "Row": 3, "Width": 1 }
				},
				"Recipe.MoistureContent": {
					"Name": "Required Moisture Content", "Hash": "RecipeMoistureContent", "DataType": "PreciseNumber",
					"PictForm": { "Section": "Recipe", "Group": "Statistics", "Row": 3, "Width": 1 }
				},

				"FruitStats.TotalCalories": {
					"Name": "Total Calories in All Fruits", "Hash": "TotalFruitCalories", "DataType": "PreciseNumber",
					"PictForm": { "Section": "Recipe", "Group": "FruitStatistics", "Row": 1, "Width": 1 }
				},
				"FruitStats.AverageCalories": {
					"Name": "Average (mean) Calories in All Fruits", "Hash": "AverageFruitCalories", "DataType": "PreciseNumber",
					"PictForm": { "Section": "Recipe", "Group": "FruitStatistics", "Row": 1, "Width": 1 }
				},
				"FruitStats.AverageFatPercent": {
					"Name": "Average (mean) Fat Percentage in All Fruits", "Hash": "AverageFatPercent", "DataType": "PreciseNumber",
					"PictForm": { "Section": "Recipe", "Group": "FruitStatistics", "Row": 1, "Width": 1 }
				},



				"FruitData.FruityVice":
				{
					"Name": "Fruits of the Earth",
					"Hash": "FruitGrid",
					"DataType": "Array",
					"Default": []
					, "PictForm": { "Section": "FruitGrid", "Group": "FruitGrid" }
				},

				"FruitData.FruityVice[].nutritions.calories":
				{
					"Hash": "FruitNutritionCalories"
				},
				"FruitData.FruityVice[].nutritions.percent_total_fat":
				{
					"Hash": "FruitPercentTotalFat"
				},
			},

			"ReferenceManifests":
			{
				"FruitEditor":
				{
					"Scope": "FruitEditor",

					"Descriptors":
					{
						"name":
						{
							"Name": "Fruit Name",
							"Hash": "Name",
							"DataType": "String",
							"Default": "(unnamed fruit)"
							, "PictForm": { "Section": "FruitGrid", "Group": "FruitGrid" }
						},
						"family":
						{
							"Name": "Family",
							"Hash": "Family",
							"DataType": "String"
							, "PictForm": { "Section": "FruitGrid", "Group": "FruitGrid" }
						},
						"order":
						{
							"Name": "Order",
							"Hash": "Order",
							"DataType": "String"
							, "PictForm": { "Section": "FruitGrid", "Group": "FruitGrid" }
						},
						"genus":
						{
							"Name": "Genus",
							"Hash": "Genus",
							"DataType": "String"
							, "PictForm": { "Section": "FruitGrid", "Group": "FruitGrid" }
						},
						"nutritions.calories":
						{
							"Name": "Calories",
							"Hash": "Calories",
							"DataType": "Number"
							, "PictForm": { "Section": "FruitGrid", "Group": "FruitGrid" }
						},
						"nutritions.fat":
						{
							"Name": "Fat",
							"Hash": "Fat",
							"DataType": "Number"
							, "PictForm": { "Section": "FruitGrid", "Group": "FruitGrid" }
						},
						"nutritions.carbohydrates":
						{
							"Name": "Carbohydrates",
							"Hash": "Carbs",
							"DataType": "Number"
							, "PictForm": { "Section": "FruitGrid", "Group": "FruitGrid" }
						},
						"nutritions.protein":
						{
							"Name": "Protein",
							"Hash": "Protein",
							"DataType": "Number"
							, "PictForm": { "Section": "FruitGrid", "Group": "FruitGrid" }
						},
						"nutritions.percent_total_fat":
						{
							"Name": "PercentTotalFat",
							"Hash": "PercentTotalFat",
							"DataType": "Number"
							, "PictForm": { "Section": "FruitGrid", "Group": "FruitGrid" }
						}
					}
				}
			}
		}
	});