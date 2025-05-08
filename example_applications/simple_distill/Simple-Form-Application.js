const libPictSectionForm = require('../../source/Pict-Section-Form.js');
//const libPictSectionForm = require('pict-section-form');

module.exports = libPictSectionForm.PictFormApplication;

module.exports.default_configuration.pict_configuration = (
	{
		"Product": "SimpleDistill",
		"DefaultFormManifest": {
			"Scope": "SuperSimpleForm",

			"Sections": [
				{
					"Hash": "Book",

					"Name": "Book Data Distillation Roundup",
					"Description": "Prefetch Book Data",

					"Solvers":
						[
						],
					"MetaTemplates":
						[
						]
				}
			],

			"Descriptors":
			{
				"Author.IDAuthor": {
					Name: "Author ID",
					Hash: "IDAuthor",
					Default: 100,
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
								"Filter": "FBV~IDAuthor~EQ~{~D:AppData.CurrentAuthor.IDAuthor~}",
								"Destination": "AppData.BookAuthorJoins"
							},
							{
								"Entity": "Book",
								"Filter": "FBL~IDBook~INN~{~PJU:,^IDBook^AppData.BookAuthorJoins~}",
								"Destination": "AppData.Books"
							}
						],
						EntityBundleTriggerGroup: "BookTriggerGroup",
						EntityBundleTriggerMetacontrollerSolve: true,
						EntityBundleTriggerMetacontrollerRender: true,
						EntityBundleTriggerOnInitialize: true
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
						Section: "Book",
						Group: "Book",
						Row: 1, Width: 1,
						InputType: "Option",
						SelectOptionsPickList: "Books",
						// This performs an entity bundle request whenever a value is selected.
						Providers: ["Pict-Input-Select", "Pict-Input-AutofillTriggerGroup"],
						AutofillTriggerGroup:
						{
							TriggerGroupName: "BookTriggerGroup",
							SelectOptionsRefresh: true
						}
					}
				},
				"Book.Title": {
					Name: "Book Title",
					Hash: "BookTitle",
					DataType: "String",
					PictForm: {
						Section: "Book", Group: "Book", Row: 1, Width: 1
					}
				}
			}
		}
	});