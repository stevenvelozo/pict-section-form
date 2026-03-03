const libPictSectionForm = require('../../source/Pict-Section-Form.js');
//const libPictSectionForm = require('pict-section-form');

/**
 * Authortopia Example Application
 *
 * Demonstrates both global and tabular trigger groups working together:
 *
 * 1. Global TriggerGroup (top section):
 *    - A "Featured Author" selector that fetches author data and fills
 *      related fields across the form using EntityBundleRequest +
 *      AutofillTriggerGroup (the traditional global pattern).
 *
 * 2. Tabular TriggerGroup (book assignment grid):
 *    - Each row has an Author selector that fetches author data and
 *      fills only that row's fields using TabularTriggerGroup.
 *    - Changing the author in row 3 only affects row 3.
 *
 * @class
 * @extends libPictSectionForm.PictFormApplication
 */
class AuthortopiaApplication extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = AuthortopiaApplication;

module.exports.default_configuration = libPictSectionForm.PictFormApplication.default_configuration;

module.exports.default_configuration.pict_configuration = (
{
	"Product": "Authortopia",

	"DefaultFormManifest":
	{
		"Scope": "AuthortopiaForm",

		"PickLists":
		[
			{
				"Hash": "AuthorList",
				"ListAddress": "AppData.AuthorPickList",
				"ListSourceAddress": "AllAuthors[]",
				"TextTemplate": "{~D:Record.Name~}",
				"IDTemplate": "{~D:Record.IDAuthor~}",
				"Sorted": true,
				"UpdateFrequency": "Always"
			},
			{
				"Hash": "FeaturedBooks",
				"ListAddress": "AppData.FeaturedAuthorBookPickList",
				"ListSourceAddress": "FeaturedAuthorBooks[]",
				"TextTemplate": "{~D:Record.Title~} ({~D:Record.PublicationYear~})",
				"IDTemplate": "{~D:Record.IDBook~}",
				"Sorted": true,
				"UpdateFrequency": "Always"
			}
		],

		"Sections":
		[
			{
				"Hash": "FeaturedAuthor",
				"Name": "Featured Author (Global Trigger Group)",
				"Description": "Select a featured author. This uses the traditional global EntityBundleRequest + AutofillTriggerGroup pattern. Changing the author updates ALL fields that listen to the FeaturedAuthorGroup.",

				"Groups":
				[
					{
						"Hash": "FeaturedAuthorSelector",
						"Name": "Select Featured Author"
					},
					{
						"Hash": "FeaturedAuthorDetails",
						"Name": "Featured Author Details"
					}
				]
			},
			{
				"Hash": "BookAssignments",
				"Name": "Book Assignments (Tabular Trigger Group)",
				"Description": "Each row has its own Author selector. Changing the author in one row fills ONLY that row with the author data. This uses the new TabularTriggerGroup provider.",

				"Groups":
				[
					{
						"Hash": "BookAssignmentGrid",
						"Name": "Book Assignment Grid",

						"Layout": "Tabular",

						"RecordSetAddress": "BookAssignments",
						"RecordManifest": "BookAssignmentEditor"
					}
				]
			}
		],

		"Descriptors":
		{
			// ---- Hidden loader: fetches all authors on startup ----
			"AuthorDataLoader":
			{
				"Name": "Author Data Loader",
				"Hash": "AuthorDataLoader",
				"DataType": "String",
				"PictForm":
				{
					"Section": "FeaturedAuthor",
					"Group": "FeaturedAuthorSelector",
					"Row": 0,
					"InputType": "Hidden",
					"Providers": ["Pict-Input-EntityBundleRequest"],
					"EntitiesBundle":
					[
						{
							"Entity": "Author",
							"Filter": "FBV~IDAuthor~GE~0",
							"Destination": "AppData.AllAuthors"
						}
					],
					"EntityBundleTriggerGroup": "AuthorDataLoaded",
					"EntityBundleTriggerOnInitialize": true,
					"EntityBundleTriggerWithoutValue": true,
					"EntityBundleTriggerOnDataChange": false
				}
			},

			// ---- Global Trigger Group Section ----

			"FeaturedAuthor.IDAuthor":
			{
				"Name": "Featured Author",
				"Hash": "FeaturedIDAuthor",
				"DataType": "Number",
				"PictForm":
				{
					"Section": "FeaturedAuthor",
					"Group": "FeaturedAuthorSelector",
					"Row": 1,
					"Width": 2,
					"InputType": "Option",
					"SelectOptionsPickList": "AuthorList",
					// Fetch author data + books when selection changes
					"Providers": ["Pict-Input-Select", "Pict-Input-EntityBundleRequest", "Pict-Input-AutofillTriggerGroup"],
					"EntitiesBundle":
					[
						{
							"Entity": "Author",
							"Filter": "FBV~IDAuthor~EQ~{~D:Record.Value~}",
							"Destination": "AppData.FeaturedAuthor",
							"SingleRecord": true
						},
						{
							"Entity": "BookAuthorJoin",
							"Filter": "FBV~IDAuthor~EQ~{~D:AppData.FeaturedAuthor.IDAuthor~}",
							"Destination": "AppData.FeaturedAuthorJoins"
						},
						{
							"Entity": "Book",
							"Filter": "FBL~IDBook~INN~{~PJU:,^IDBook^AppData.FeaturedAuthorJoins~}",
							"Destination": "AppData.FeaturedAuthorBooks"
						}
					],
					"EntityBundleTriggerGroup": "FeaturedAuthorGroup",
					"EntityBundleTriggerOnInitialize": false,
					"AutofillTriggerGroup":
					[
						{
							"TriggerGroupHash": "FeaturedAuthorGroup",
							"PostSolvers": [ 'runSolvers()' ]
						},
						{
							"TriggerGroupHash": "AuthorDataLoaded",
							"SelectOptionsRefresh": true
						}
					]
				}
			},

			"FeaturedAuthor.Name":
			{
				"Name": "Author Name",
				"Hash": "FeaturedAuthorName",
				"DataType": "String",
				"PictForm":
				{
					"Section": "FeaturedAuthor",
					"Group": "FeaturedAuthorDetails",
					"Row": 1,
					"Width": 2,
					"Providers": ["Pict-Input-AutofillTriggerGroup"],
					"AutofillTriggerGroup":
					{
						"TriggerGroupHash": "FeaturedAuthorGroup",
						"TriggerAddress": "AppData.FeaturedAuthor.Name",
						"MarshalEmptyValues": true
					}
				}
			},

			"FeaturedAuthor.GUID":
			{
				"Name": "Author GUID",
				"Hash": "FeaturedAuthorGUID",
				"DataType": "String",
				"PictForm":
				{
					"Section": "FeaturedAuthor",
					"Group": "FeaturedAuthorDetails",
					"Row": 1,
					"Width": 2,
					"Providers": ["Pict-Input-AutofillTriggerGroup"],
					"AutofillTriggerGroup":
					{
						"TriggerGroupHash": "FeaturedAuthorGroup",
						"TriggerAddress": "AppData.FeaturedAuthor.GUIDAuthor",
						"MarshalEmptyValues": true
					}
				}
			},

			"FeaturedAuthor.BookCount":
			{
				"Name": "Number of Books",
				"Hash": "FeaturedAuthorBookCount",
				"DataType": "String",
				"PictForm":
				{
					"Section": "FeaturedAuthor",
					"Group": "FeaturedAuthorDetails",
					"Row": 2,
					"Width": 1,
					"InputType": "ReadOnly"
				}
			},

			"FeaturedAuthor.SelectedBook":
			{
				"Name": "Select a Book by this Author",
				"Hash": "FeaturedAuthorSelectedBook",
				"DataType": "Number",
				"PictForm":
				{
					"Section": "FeaturedAuthor",
					"Group": "FeaturedAuthorDetails",
					"Row": 2,
					"Width": 2,
					"InputType": "Option",
					"SelectOptionsPickList": "FeaturedBooks",
					"Providers": ["Pict-Input-Select", "Pict-Input-AutofillTriggerGroup"],
					"AutofillTriggerGroup":
					{
						"TriggerGroupHash": "FeaturedAuthorGroup",
						"SelectOptionsRefresh": true
					}
				}
			},

			// ---- Hidden array descriptor for the tabular section ----
			"BookAssignments":
			{
				"Name": "Book Assignments",
				"Hash": "BookAssignments",
				"DataType": "Array",
				"Default": []
			}
		},

		"ReferenceManifests":
		{
			"BookAssignmentEditor":
			{
				"Scope": "BookAssignmentEditor",
				"Descriptors":
				{
					"BookTitle":
					{
						"Name": "Book Title",
						"Hash": "BookTitle",
						"DataType": "String",
						"Default": "",
						"PictForm":
						{
							"Row": "1",
							"Section": "BookAssignments",
							"Group": "BookAssignmentGrid"
						}
					},
					"IDAuthor":
					{
						"Name": "Author",
						"Hash": "IDAuthor",
						"DataType": "Number",
						"PictForm":
						{
							"Row": "1",
							"Section": "BookAssignments",
							"Group": "BookAssignmentGrid",
							"InputType": "Option",
							"SelectOptionsPickList": "AuthorList",
							// TabularTriggerGroup: this is the TRIGGERING input
							// AutofillTriggerGroup: refreshes picklist when AuthorDataLoaded fires
							"Providers": ["Pict-Input-Select", "Pict-Input-TabularTriggerGroup", "Pict-Input-AutofillTriggerGroup"],
							"TabularTriggerGroup":
							{
								"TriggerGroupHash": "AuthorRowTrigger",
								"TriggerAllInputs": true,
								"EntitiesBundle":
								[
									{
										"Entity": "Author",
										"Filter": "FBV~IDAuthor~EQ~{~D:Record.Value~}",
										"Destination": "SelectedAuthor",
										"SingleRecord": true
									}
								]
							},
							"AutofillTriggerGroup":
							{
								"TriggerGroupHash": "AuthorDataLoaded",
								"SelectOptionsRefresh": true
							}
						}
					},
					"AuthorName":
					{
						"Name": "Author Name (auto-filled)",
						"Hash": "AuthorName",
						"DataType": "String",
						"Default": "",
						"PictForm":
						{
							"Row": "1",
							"Section": "BookAssignments",
							"Group": "BookAssignmentGrid",
							// TabularTriggerGroup: this is a RECEIVING input
							"Providers": ["Pict-Input-TabularTriggerGroup"],
							"TabularTriggerGroup":
							{
								"TriggerGroupHash": "AuthorRowTrigger",
								"TriggerAddress": "SelectedAuthor.Name",
								"MarshalEmptyValues": true
							}
						}
					},
					"AuthorGUID":
					{
						"Name": "Author GUID (auto-filled)",
						"Hash": "AuthorGUID",
						"DataType": "String",
						"Default": "",
						"PictForm":
						{
							"Row": "1",
							"Section": "BookAssignments",
							"Group": "BookAssignmentGrid",
							// TabularTriggerGroup: this is a RECEIVING input
							"Providers": ["Pict-Input-TabularTriggerGroup"],
							"TabularTriggerGroup":
							{
								"TriggerGroupHash": "AuthorRowTrigger",
								"TriggerAddress": "SelectedAuthor.GUIDAuthor",
								"MarshalEmptyValues": true
							}
						}
					},
					"Notes":
					{
						"Name": "Notes",
						"Hash": "Notes",
						"DataType": "String",
						"Default": "",
						"PictForm":
						{
							"Row": "1",
							"Section": "BookAssignments",
							"Group": "BookAssignmentGrid"
						}
					}
				}
			}
		}
	},

	"DefaultAppData":
	{
		"AllAuthors": [],
		"FeaturedAuthor": {},
		"FeaturedAuthorJoins": [],
		"FeaturedAuthorBooks": [],
		"BookAssignments":
		[
			{ "BookTitle": "The Shining", "IDAuthor": "", "AuthorName": "", "AuthorGUID": "", "Notes": "A classic horror novel" },
			{ "BookTitle": "Foundation", "IDAuthor": "", "AuthorName": "", "AuthorGUID": "", "Notes": "Epic science fiction" },
			{ "BookTitle": "A Wizard of Earthsea", "IDAuthor": "", "AuthorName": "", "AuthorGUID": "", "Notes": "Fantasy masterpiece" },
			{ "BookTitle": "Kindred", "IDAuthor": "", "AuthorName": "", "AuthorGUID": "", "Notes": "Time travel and history" },
			{ "BookTitle": "Guards! Guards!", "IDAuthor": "", "AuthorName": "", "AuthorGUID": "", "Notes": "Discworld humor" },
			{ "BookTitle": "Harry Potter and the Philosopher's Stone", "IDAuthor": "", "AuthorName": "", "AuthorGUID": "", "Notes": "Wizarding world begins" }
		]
	}
});
