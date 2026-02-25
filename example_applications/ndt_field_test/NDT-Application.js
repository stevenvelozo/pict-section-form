const libPictSectionForm = require('../../source/Pict-Section-Form.js');

const libBundleData = require('./BundleData.json');

/**
 * Nuclear Density Testing (NDT) field data collection application.
 *
 * Demonstrates offline persistence with FormPersistence provider,
 * multiple form instances, tabular recordsets, charts and bundle data.
 */
class NDTApplication extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Seed the bundle data from our static JSON (simulates a server fetch)
		if (!this.pict.Bundle)
		{
			this.pict.Bundle = {};
		}
		Object.assign(this.pict.Bundle, JSON.parse(JSON.stringify(libBundleData)));

		// Register the FormPersistence provider with autosave enabled
		this.pict.addProviderSingleton(
			'FormPersistence',
			{
				FormTypeIdentifier: 'NDTFieldTest',
				AutoPersistOnDataChange: true,
				AutoPersistBundleWithForm: true,
				AutoPersistDebounceMs: 1500
			},
			libPictSectionForm.PictFormPersistenceProvider);
	}

	/**
	 * Called from the UI to create a new blank test form.
	 *
	 * @param {string} pProjectID - The project context identifier.
	 * @param {string} [pLabel] - Optional label for the form.
	 * @returns {string} The new form GUID.
	 */
	createNewTest(pProjectID, pLabel)
	{
		// Save the current form first if one is active
		let tmpPersistence = this.pict.providers.FormPersistence;

		if (tmpPersistence.getActiveFormGUID())
		{
			tmpPersistence.persistActiveForm();
		}

		// Create new form record
		let tmpGUID = tmpPersistence.newFormRecord(pProjectID, pLabel);

		// Reset AppData to defaults for a fresh form
		this.resetFormData(pProjectID);

		// Set as active and do an initial save
		tmpPersistence.setActiveFormGUID(tmpGUID);
		tmpPersistence.saveFormData(tmpGUID);

		// Re-render form with fresh data
		if (this.pict.views.PictFormMetacontroller)
		{
			this.pict.views.PictFormMetacontroller.renderFormSections();
			this.pict.views.PictFormMetacontroller.marshalToView();
		}
		this.solve();

		return tmpGUID;
	}

	/**
	 * Loads an existing form by GUID. Also loads its bundle context if present.
	 *
	 * @param {string} pGUID - The form GUID to load.
	 */
	loadTest(pGUID)
	{
		let tmpPersistence = this.pict.providers.FormPersistence;

		// Save current form first
		if (tmpPersistence.getActiveFormGUID())
		{
			tmpPersistence.persistActiveForm();
		}

		// Load the form record to get bundle context
		let tmpFormIndex = tmpPersistence.getFormIndex();
		let tmpRecord = tmpFormIndex.Records[pGUID];
		if (tmpRecord && tmpRecord.BundleContextIdentifier)
		{
			tmpPersistence.loadBundleData(tmpRecord.BundleContextIdentifier);
		}

		// Load the form data itself
		tmpPersistence.loadFormData(pGUID);
		tmpPersistence.setActiveFormGUID(pGUID);

		// Re-render
		if (this.pict.views.PictFormMetacontroller)
		{
			this.pict.views.PictFormMetacontroller.renderFormSections();
			this.pict.views.PictFormMetacontroller.marshalToView();
		}
		this.solve();
	}

	/**
	 * Resets AppData to fresh defaults for a given project context.
	 *
	 * @param {string} pProjectID - The project ID (used to default the project selection).
	 */
	resetFormData(pProjectID)
	{
		let tmpAppData = this.pict.AppData;

		// Clear previous form data
		let tmpKeys = Object.keys(tmpAppData);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			delete tmpAppData[tmpKeys[i]];
		}

		// Set fresh defaults
		let tmpNow = new Date();
		tmpAppData.Header = (
		{
			ProjectID: pProjectID || '',
			WorkItemID: '',
			ContractorID: '',
			MixDesignID: '',
			Inspector: '',
			TestDate: tmpNow.toISOString().substring(0, 10),
			WeatherTemp: '',
			WeatherConditions: '',
			LotNumber: '',
			SubLotNumber: ''
		});

		tmpAppData.MixInfo = (
		{
			MaxDensity_pcf: 0,
			TargetAirVoids: 0,
			OptimumAC: 0
		});

		tmpAppData.Readings = [];

		tmpAppData.Summary = (
		{
			AverageDensity: 0,
			AverageCompaction: 0,
			PassFail: ''
		});
	}
}

module.exports = NDTApplication;

module.exports.default_configuration = libPictSectionForm.PictFormApplication.default_configuration;
module.exports.default_configuration.Name = "NDT Field Test Application";
module.exports.default_configuration.Hash = "NDTFieldTestApp";
module.exports.default_configuration.pict_configuration = (
{
	Product: "NDTFieldTest",

	DefaultAppData: Object.assign({}, libBundleData,
		{
			WeatherConditionsSource:
			[
				{ ID: "Sunny", Text: "Sunny" },
				{ ID: "Cloudy", Text: "Cloudy" },
				{ ID: "Overcast", Text: "Overcast" },
				{ ID: "Light Rain", Text: "Light Rain" },
				{ ID: "Rain", Text: "Rain" },
				{ ID: "Windy", Text: "Windy" }
			]
		}),

	DefaultFormManifest:
	{
		Scope: "NDTFieldTestForm",

		PickLists:
		[
			{
				Hash: "ProjectList",
				ListAddress: "AppData.ProjectPickList",
				ListSourceAddress: "Projects[]",
				TextTemplate: "{~D:Record.Name~}",
				IDTemplate: "{~D:Record.IDProject~}",
				Sorted: true,
				UpdateFrequency: "Once"
			},
			{
				Hash: "ContractorList",
				ListAddress: "AppData.ContractorPickList",
				ListSourceAddress: "Contractors[]",
				TextTemplate: "{~D:Record.Name~}",
				IDTemplate: "{~D:Record.IDContractor~}",
				Sorted: true,
				UpdateFrequency: "Once"
			},
			{
				Hash: "WorkItemList",
				ListAddress: "AppData.WorkItemPickList",
				ListSourceAddress: "WorkItems[]",
				TextTemplate: "{~D:Record.Description~}",
				IDTemplate: "{~D:Record.IDWorkItem~}",
				Sorted: true,
				UpdateFrequency: "Always"
			},
			{
				Hash: "MixDesignList",
				ListAddress: "AppData.MixDesignPickList",
				ListSourceAddress: "MixDesigns[]",
				TextTemplate: "{~D:Record.Name~} ({~D:Record.IDMixDesign~})",
				IDTemplate: "{~D:Record.IDMixDesign~}",
				Sorted: true,
				UpdateFrequency: "Once"
			},
			{
				Hash: "WeatherConditionsList",
				ListAddress: "AppData.WeatherConditionsPickList",
				ListSourceAddress: "WeatherConditionsSource[]",
				TextTemplate: "{~D:Record.Text~}",
				IDTemplate: "{~D:Record.ID~}",
				UpdateFrequency: "Once"
			}
		],

		Sections:
		[
			{
				Hash: "TestHeader",
				Name: "Test Information",

				Solvers:
				[
					"AverageDensity = MEAN(ReadingDensity)",
					"AverageCompaction = MEAN(ReadingCompactionPercent)"
				],

				Groups:
				[
					{
						Hash: "ProjectInfo",
						Name: "Project & Contract"
					},
					{
						Hash: "TestConditions",
						Name: "Test Conditions"
					},
					{
						Hash: "MixParameters",
						Name: "Mix Design Parameters"
					}
				]
			},
			{
				Hash: "ReadingsGrid",
				Name: "Density Readings",

				Groups:
				[
					{
						Hash: "ReadingsTable",
						Name: "Nuclear Gauge Readings",

						Layout: "Tabular",
						RecordSetAddress: "Readings",
						RecordManifest: "ReadingEditor",

						RecordSetSolvers:
						[
							{
								Ordinal: 0,
								Expression: "CompactionPercent = (WetDensity / MaxDensity) * 100"
							},
							{
								Ordinal: 1,
								Expression: "PassFail = IF(CompactionPercent, \">\", 92, \"PASS\", \"FAIL\")"
							}
						]
					}
				]
			},
			{
				Hash: "ResultsSummary",
				Name: "Test Results Summary",

				Groups:
				[
					{
						Hash: "SummaryStats",
						Name: "Summary Statistics"
					}
				]
			},
			{
				Hash: "Charts",
				Name: "Compaction Chart",
				Groups:
				[
					{
						Hash: "CompactionChart",
						Name: "Compaction Visualization"
					}
				]
			}
		],

		Descriptors:
		{
			// ===== Project / Contract Header =====
			"Header.ProjectID":
			{
				Name: "Project",
				Hash: "ProjectID",
				DataType: "String",
				PictForm:
				{
					Section: "TestHeader",
					Group: "ProjectInfo",
					Row: 1,
					Width: 4,
					InputType: "Option",
					Providers: ["Pict-Input-Select"],
					SelectOptionsPickList: "ProjectList"
				}
			},
			"Header.WorkItemID":
			{
				Name: "Work Item",
				Hash: "WorkItemID",
				DataType: "String",
				PictForm:
				{
					Section: "TestHeader",
					Group: "ProjectInfo",
					Row: 1,
					Width: 4,
					InputType: "Option",
					Providers: ["Pict-Input-Select"],
					SelectOptionsPickList: "WorkItemList"
				}
			},
			"Header.ContractorID":
			{
				Name: "Contractor",
				Hash: "ContractorID",
				DataType: "String",
				PictForm:
				{
					Section: "TestHeader",
					Group: "ProjectInfo",
					Row: 1,
					Width: 4,
					InputType: "Option",
					Providers: ["Pict-Input-Select"],
					SelectOptionsPickList: "ContractorList"
				}
			},
			"Header.Inspector":
			{
				Name: "Inspector Name",
				Hash: "Inspector",
				DataType: "String",
				PictForm:
				{
					Section: "TestHeader",
					Group: "ProjectInfo",
					Row: 2,
					Width: 4
				}
			},
			"Header.LotNumber":
			{
				Name: "Lot Number",
				Hash: "LotNumber",
				DataType: "String",
				PictForm:
				{
					Section: "TestHeader",
					Group: "ProjectInfo",
					Row: 2,
					Width: 4
				}
			},
			"Header.SubLotNumber":
			{
				Name: "Sub-Lot Number",
				Hash: "SubLotNumber",
				DataType: "String",
				PictForm:
				{
					Section: "TestHeader",
					Group: "ProjectInfo",
					Row: 2,
					Width: 4
				}
			},

			// ===== Test Conditions =====
			"Header.TestDate":
			{
				Name: "Test Date",
				Hash: "TestDate",
				DataType: "DateTime",
				PictForm:
				{
					Section: "TestHeader",
					Group: "TestConditions",
					Row: 1,
					Width: 4,
					Providers: ["Pict-Input-DateTime"]
				}
			},
			"Header.WeatherTemp":
			{
				Name: "Temperature (\u00B0F)",
				Hash: "WeatherTemp",
				DataType: "Number",
				PictForm:
				{
					Section: "TestHeader",
					Group: "TestConditions",
					Row: 1,
					Width: 4
				}
			},
			"Header.WeatherConditions":
			{
				Name: "Conditions",
				Hash: "WeatherConditions",
				DataType: "String",
				PictForm:
				{
					Section: "TestHeader",
					Group: "TestConditions",
					Row: 1,
					Width: 4,
					InputType: "Option",
					Providers: ["Pict-Input-Select"],
					SelectOptionsPickList: "WeatherConditionsList"
				}
			},

			// ===== Mix Design Parameters =====
			"Header.MixDesignID":
			{
				Name: "Mix Design",
				Hash: "MixDesignID",
				DataType: "String",
				PictForm:
				{
					Section: "TestHeader",
					Group: "MixParameters",
					Row: 1,
					Width: 4,
					InputType: "Option",
					Providers: ["Pict-Input-Select"],
					SelectOptionsPickList: "MixDesignList"
				}
			},
			"MixInfo.MaxDensity_pcf":
			{
				Name: "Max Theoretical Density (pcf)",
				Hash: "MaxDensity",
				DataType: "Number",
				Default: 0,
				PictForm:
				{
					Section: "TestHeader",
					Group: "MixParameters",
					Row: 1,
					Width: 3
				}
			},
			"MixInfo.TargetAirVoids":
			{
				Name: "Target Air Voids (%)",
				Hash: "TargetAirVoids",
				DataType: "Number",
				Default: 0,
				PictForm:
				{
					Section: "TestHeader",
					Group: "MixParameters",
					Row: 1,
					Width: 2
				}
			},
			"MixInfo.OptimumAC":
			{
				Name: "Optimum AC (%)",
				Hash: "OptimumAC",
				DataType: "Number",
				Default: 0,
				PictForm:
				{
					Section: "TestHeader",
					Group: "MixParameters",
					Row: 1,
					Width: 3
				}
			},

			// ===== Readings Array (for tabular) =====
			"Readings":
			{
				Name: "Density Readings",
				Hash: "ReadingsArray",
				DataType: "Array",
				Default: []
			},

			// Aggregated hashes for solvers
			"Readings[].WetDensity_pcf":
			{
				Hash: "ReadingDensity"
			},
			"Readings[].CompactionPercent":
			{
				Hash: "ReadingCompactionPercent"
			},

			// ===== Summary =====
			"Summary.AverageDensity":
			{
				Name: "Average Wet Density (pcf)",
				Hash: "AverageDensity",
				DataType: "PreciseNumber",
				PictForm:
				{
					Section: "ResultsSummary",
					Group: "SummaryStats",
					Row: 1,
					Width: 4,
					InputType: "PreciseNumberReadOnly",
					DecimalPrecision: 1,
					DigitsPostfix: " pcf"
				}
			},
			"Summary.AverageCompaction":
			{
				Name: "Average Compaction",
				Hash: "AverageCompaction",
				DataType: "PreciseNumber",
				PictForm:
				{
					Section: "ResultsSummary",
					Group: "SummaryStats",
					Row: 1,
					Width: 4,
					InputType: "PreciseNumberReadOnly",
					DecimalPrecision: 1,
					DigitsPostfix: "%"
				}
			},
			"Summary.PassFail":
			{
				Name: "Overall Status",
				Hash: "OverallPassFail",
				DataType: "String",
				PictForm:
				{
					Section: "ResultsSummary",
					Group: "SummaryStats",
					Row: 1,
					Width: 4,
					InputType: "ReadOnly"
				}
			},

			// ===== Chart =====
			"CompactionChartData":
			{
				Name: "Compaction by Reading",
				Hash: "CompactionChartData",
				DataType: "Object",
				PictForm:
				{
					Section: "Charts",
					Group: "CompactionChart",
					Row: 1,
					Width: 12,
					InputType: "Chart",
					ChartType: "bar",
					ChartLabelsSolver: "objectkeystoarray(aggregationhistogrambyobject(ReadingsArray, \"Station\", \"CompactionPercent\"))",
					ChartDatasetsSolvers:
					[
						{
							Label: "Compaction %",
							DataSolver: "objectvaluestoarray(aggregationhistogrambyobject(ReadingsArray, \"Station\", \"CompactionPercent\"))"
						}
					]
				}
			},

			// ===== Weather Conditions Source (for pick list, seeded via DefaultAppData) =====
			"WeatherConditionsSource":
			{
				Hash: "WeatherConditionsSource",
				DataType: "Array"
			}
		},

		ReferenceManifests:
		{
			ReadingEditor:
			{
				Scope: "ReadingEditor",
				Descriptors:
				{
					"Station":
					{
						Name: "Station",
						Hash: "Station",
						DataType: "String",
						Default: "",
						PictForm: { Row: 1, Section: "ReadingsGrid", Group: "ReadingsTable" }
					},
					"Offset_ft":
					{
						Name: "Offset (ft)",
						Hash: "Offset",
						DataType: "Number",
						Default: 0,
						PictForm: { Section: "ReadingsGrid", Group: "ReadingsTable" }
					},
					"Lane":
					{
						Name: "Lane",
						Hash: "Lane",
						DataType: "String",
						Default: "",
						PictForm: { Section: "ReadingsGrid", Group: "ReadingsTable" }
					},
					"WetDensity_pcf":
					{
						Name: "Wet Density (pcf)",
						Hash: "WetDensity",
						DataType: "Number",
						Default: 0,
						PictForm: { Section: "ReadingsGrid", Group: "ReadingsTable" }
					},
					"MoistureContent":
					{
						Name: "Moisture %",
						Hash: "MoistureContent",
						DataType: "Number",
						Default: 0,
						PictForm: { Section: "ReadingsGrid", Group: "ReadingsTable" }
					},
					"MaxDensity":
					{
						Name: "Max Density (pcf)",
						Hash: "MaxDensity",
						DataType: "Number",
						Default: 0,
						PictForm: { Section: "ReadingsGrid", Group: "ReadingsTable" }
					},
					"CompactionPercent":
					{
						Name: "Compaction %",
						Hash: "CompactionPercent",
						DataType: "PreciseNumber",
						PictForm:
						{
							Section: "ReadingsGrid",
							Group: "ReadingsTable",
							InputType: "PreciseNumberReadOnly",
							DecimalPrecision: 1,
							DigitsPostfix: "%"
						}
					},
					"PassFail":
					{
						Name: "Pass/Fail",
						Hash: "PassFail",
						DataType: "String",
						PictForm:
						{
							Section: "ReadingsGrid",
							Group: "ReadingsTable",
							InputType: "ReadOnly"
						}
					},
					"Notes":
					{
						Name: "Notes",
						Hash: "Notes",
						DataType: "String",
						Default: "",
						PictForm: { Section: "ReadingsGrid", Group: "ReadingsTable" }
					}
				}
			}
		}
	}
});
