const libPictSectionForm = require('../../../source/Pict-Section-Form.js');

const libManyfestLoadListView = require('../views/Manyfest-LoadList-View.js');
const libManyfestSummaryView = require('../views/Manyfest-Summary-View.js');
const libManyfestCodeView = require('../views/Manyfest-Code-View.js');

class ManyfestEditor extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.options.AutoRenderMainViewportViewAfterInitialize = false;

		this.pict.addProvider('ManyfestRouter', {}, require('../providers/Manyfest-Router.js'));
		this.pict.addProvider('DataProvider', {}, require('../providers/Manyfest-Data-Provider.js'));

		this.pict.addView('ManyfestSummaryView', libManyfestSummaryView.default_configuration, libManyfestSummaryView);
		this.pict.addView('ManyfestCodeView', libManyfestCodeView.default_configuration, libManyfestCodeView);
		this.pict.addView('ManyfestLoadListView', libManyfestLoadListView.default_configuration, libManyfestLoadListView);

		this.pict.AppData = this.options.pict_configuration.DefaultFormManifest;
	}

	onBeforeInitialize()
	{
		let tmpMetacontrollerOptions = this.pict.views.PictFormMetacontroller.options;
		tmpMetacontrollerOptions.DefaultDestinationAddress = `#Manyfest-Editor-MainApp-Container`;
		tmpMetacontrollerOptions.AutoRender = false;
		this.log.trace(`Loading the manyfest editor!`);
		return super.onBeforeInitialize();
	}

	onAfterInitialize()
	{
		// Load the list of Manifests that have been saved.
		_Pict.views.ManyfestLoadListView.render()
	}
}

module.exports = ManyfestEditor;

module.exports.default_configuration = libPictSectionForm.PictFormApplication.default_configuration;
module.exports.default_configuration.pict_configuration = (
	{
		"Product":"ManyfestEditor",
		"DefaultFormManifest":
		{
			"Scope":"Manyfest",

			"Sections": [
				{
					"Hash":"MainManyfest",
					"Name":"Main Manyfest Data",
					"Groups": [
						{
							"Hash":"Description",
							"Name":"Description",
						}
					]
				},
				{
					"Hash":"ManyfestSections",
					"Name":"Form Interface Sections",
					"Groups": [
						{
							"Hash":"FormSections",
							"Name":"Form Sections",

							"Layout":"Tabular",

							"RecordSetAddress":"Sections",
							"RecordManifest":"ManyfestSection"
						}
					]
				},
				{
					"Hash":"ManyfestDescriptors",
					"Name":"Data Address Descriptors",
					"Groups": [
						{
							"Hash":"DescriptorGrid",
							"Name":"Manyfest Descriptors",

							"Layout":"Tabular",

							"RecordSetAddress":"Descriptors",
							"RecordManifest":"ManyfestDescriptor"
						}
					]
				}
			],

			"Descriptors":
			{
				"Scope":
				{
					"Name":"Data Scope",
					"Hash":"Scope",
					"DataType":"String",
					"Default":"DefaultManyfestScope"
					, "PictForm": { "Section":"MainManyfest", "Group":"Description" }
				},
				"Name":
				{
					"Name":"Name",
					"Hash":"Name",
					"DataType":"String",
					"Default":"Default Manyfest"
					, "PictForm": { "Section":"MainManyfest", "Group":"Description" }
				},
				"Description":
				{
					"Name":"Description",
					"Hash":"Description",
					"DataType":"String",
					"Default":""
					, "PictForm": { "Section":"MainManyfest", "Group":"Description", "InputType":"TextArea" }
				},

				"Sections":
				{
					"Name":"Pict Form Sections",
					"Hash":"ManifestSections",
					"DataType":"Array",
					"Default": []
					, "PictForm": { "Section":"ManyfestSections", "Group":"SectionGrid" }
				},
				"Groups":
				{
					"Name":"Pict Form Groups",
					"Hash":"ManifestGroups",
					"DataType":"Array"
				},

				"Descriptors":
				{
					"Name":"Manifest Data Descriptors",
					"Hash":"ManifestDescriptors",
					"DataType":"Object",
					"Default": []
					, "PictForm": { "Section":"ManyfestDescriptors", "Group":"DescriptorGrid" }
				},
			},

			"ReferenceManifests":
			{
				"ManyfestSection":
				{
					"Scope":"ManyfestSection",
					"Descriptors":
					{
						"Name":
						{
							"Name":"Section Name",
							"Hash":"Name",
							"DataType":"String"
							, "PictForm": { "Section":"ManyfestSection", "Group":"SectionGrid" }
						},
					}
				},
				"ManyfestDescriptor":
				{
					"Scope":"ManyfestDescriptor",
					"Descriptors":
					{
						"Name":
						{
							"Name":"Data Property Name",
							"Hash":"Name",
							"DataType":"String"
							, "PictForm": { "Section":"ManyfestDescriptors", "Group":"DescriptorGrid" }
						},
						"Name":
						{
							"Name":"Short Name",
							"Hash":"NameShort",
							"DataType":"String"
							, "PictForm": { "Section":"ManyfestDescriptors", "Group":"DescriptorGrid" }
						},
						"Description":
						{
							"Name":"Description",
							"Hash":"Description",
							"DataType":"String"
							, "PictForm": { "Section":"ManyfestDescriptors", "Group":"DescriptorGrid", "InputType":"TextArea" }
						},
						"DataType":
						{
							"Name":"Data Type",
							"Hash":"DataType",
							"DataType":"String",
							"PictForm":
							{
								"Section":"ManyfestDescriptors",
								"Group":"DescriptorGrid",
								"InputType":"SelectList",
								"SelectOptions":
									[
										"String",
										"Integer",
										"Float",
										"Number",
										"Boolean",
										"Binary",
										"YesNo",
										"DateTime",
										"Array",
										"Object",
										"Null"
									]
							}
						},
						"Default":
						{
							"Name":"Default Value",
							"Hash":"DefaultValue",
							"DataType":"String"
							, "PictForm": { "Section":"ManyfestDescriptors", "Group":"DescriptorGrid" }
						}
					}
				}
			}
		}
	});