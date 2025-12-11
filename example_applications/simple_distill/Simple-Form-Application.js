const libPictSectionForm = require('../../source/Pict-Section-Form.js');
//const libPictSectionForm = require('pict-section-form');

module.exports = libPictSectionForm.PictFormApplication;

module.exports.default_configuration.pict_configuration = (
	{
		"Product": "SimpleDistill",
		"DefaultFormManifest": {
			"Scope": "SuperSimpleForm",

			"PickLists": [
				{
					"Hash": "Books",
					"ListAddress": "AppData.AuthorsBooks",
					"ListSourceAddress": "Books[]",
					"TextTemplate": "{~D:Record.Title~}",
					"IDTemplate": "{~D:Record.IDBook~}",
					"Sorted": true,
					"UpdateFrequency": "Always"
				}
			],

			"InitialBundle":
				[
					{
						"Entity": "Author",
						"Filter": "FBV~IDAuthor~EQ~100",
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
					},
					{
						"Type": "Custom",
						"Protocol": "HTTP",
						"Host": "localhost",
						"Port": 9999,
						"URL": "/1.0/BookAuthorJoin/Schema",
						"Destination": "AppData.BookAuthorJoinSchema"
					}
				],

			"Sections": [
				{
					"Hash": "Book",

					"Name": "Book Data Distillation Roundup",
					"Description": "Prefetch Book Data",

					"Solvers":
						[
							'runSolvers()'
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
							},
							{
								"Type": "MapJoin",
								"DestinationRecordSetAddress": "AppData.Books",
								"DestinationJoinValue": "IDBook",
								"JoinJoinValueLHS": "IDBook",
								"Joins": "AppData.BookAuthorJoins",
								"JoinJoinValueRHS": "IDBookAuthorJoin",
								"JoinRecordSetAddress": "AppData.BookAuthorJoins",
								"JoinValue": "IDBookAuthorJoin",
								"RecordDestinationAddress": "BookAuthorJoins"
							},
							{
								"Type": "Custom",
								"Protocol": "HTTP",
								"Host": "localhost",
								"Port": 9999,
								"URL": "/1.0/Book/Schema?Author={~D:AppData.CurrentAuthor.IDAuthor~}",
								"Destination": "AppData.BookSchema"
							},
							{
								"Type": "Custom",
								"URL": "Author/Schema",
								"Destination": "AppData.AuthorSchema"
							}
						],
						EntityBundleTriggerGroup: "BookTriggerGroup",
						EntityBundleTriggerOnInitialize: true
					}
				},
				"TemplatedInput": {
					Name: "Templated Input",
					Hash: "TemplatedInput",
					DataType: "String",
					PictForm:
					{
						InputType: 'Templated',
						Section: "Book", Group: "Author", Row: 2,
						TriggerGroupHash: "BookTriggerGroup",
						Template: "<div>{~T:AuthorInfo~}</div><div>{~TS:BookInfo:AppData.Books~}</div>",
						Templates:
						{
							"AuthorInfo": "{~D:AppData.CurrentAuthor.IDAuthor~} :: {~D:AppData.CurrentAuthor.Name~}",
							"BookInfo": "<div><img src=\"{~D:Record.ImageURL~}\" />{~D:Record.IDBook~} :: {~D:Record.Title~}</div>"
						}
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
							TriggerGroupHash: "BookTriggerGroup",
							TriggerAddress: "AppData.CurrentAuthor.Name",
							MarshalEmptyValues: true,
							PreSolvers: [ 'NumBooks = getvalue("AppData.BookAuthorJoins.length")' ],
							PostSolvers: [ 'runSolvers()' ],
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
							TriggerGroupHash: "BookTriggerGroup",
							SelectOptionsRefresh: true
						}
					}
				},
				"BookAuthorJoin": {
					Name: "BookAuthorJoinInfo",
					Hash: "BookAuthorJoin",
					DataType: "String",
					PictForm: {
						Section: "Book",
						Group: "Book",
						Row: 2, Width: 1,
						InputType: "TemplatedEntityLookup",
						Providers: ["Pict-Input-TemplatedEntityLookup"],
						TemplatedEntityLookup:
						{
							Template: "Record GUIDBookAuthorJoin {~D:AppData.CurrentBookAuthorJoinForDisplayTemplate.GUIDBookAuthorJoin~} IDBook {~D:AppData.CurrentBookAuthorJoinForDisplayTemplate.IDBook~} is the first book for IDAuthor {~D:AppData.CurrentAuthor.IDAuthor~} AuthorName [{~D:AppData.CurrentAuthor.Name~}]",

							TriggerGroupHash: "BookTriggerGroup",

							EmptyValueTestList: ["AppData.CurrentBookAuthorJoinForDisplayTemplate"],
							EmptyValueTemplate: "No BookAuthorJoin Found",

							EntitiesBundle: [
								{
									"Entity": "BookAuthorJoin",
									"Filter": "FBV~IDAuthor~EQ~{~D:AppData.CurrentAuthor.IDAuthor~}",
									"Destination": "AppData.CurrentBookAuthorJoinForDisplayTemplate",
									// This marshals a single record
									"SingleRecord": true
								}]
						}
					}
				},
			}
		}
	});
