const libPictProvider = require('pict-provider');
const libPictViewDynamicForm = require('../../../source/views/Pict-View-DynamicForm.js');

const _DEFAULT_PROVIDER_CONFIGURATION =
{
	ProviderIdentifier: 'Postcard-DynamicSection-Provider',

	AutoInitialize: true,
	AutoInitializeOrdinal: 0,
}

class PostcardDynamicSectionProvider extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DEFAULT_PROVIDER_CONFIGURATION, pOptions);
		super(pFable, tmpOptions, pServiceHash);
	}

	onInitializeAsync(fCallback)
	{
		const tmpDynamicInputViewSection = (
		{
			"Hash": "PostkardDynamicInputs",
			"Name": "Custom Dynamic Inputs",
			"ViewHash": "MyDynamicView",

			"IncludeInMetatemplateSectionGeneration": false,

			"Manifests": {
				"Section": {
					"Scope": "PostkardDyanmic",
					"Sections": [
						{
							"Hash": "PostkardDynamicInputs",
							"Name": "Dynamic Inputs"
						}
					],
					"Descriptors": {
						"Postkard.DynamicInputPlaceholder": {
							"Name": "DynamicInputPlaceholder",
							"Hash": "DynamicInputPlaceholder",
							"DataType": "String",
							"Macro": {
								"HTMLSelector": ""
							},
							"PictForm": {
								"Section": "PostkardDynamicInputs"
							}
						}
					}
				}
			}
		});

		if (!(tmpDynamicInputViewSection.ViewHash in this.pict.views))
		{
			this.pict.addView(tmpDynamicInputViewSection.ViewHash, Object.assign({}, tmpDynamicInputViewSection), libPictViewDynamicForm);
		}
		this.log.info('PostcardDynamicSectionProvider.onInitializeAsync() called --- loading dynamic section views from "server".');
		// Load the dynamnic section views from the server
		this.pict.settings.DefaultFormManifest = require('./PictProvider-Dynamic-Sections-MockServerResponse.json');
		this.log.info('PostcardDynamicSectionProvider.onInitializeAsync() -- loaded dynamic section views from "server" to the application [settings.DefaultFormManifest] location.');

		return super.onInitializeAsync(fCallback);
	}
}

module.exports = PostcardDynamicSectionProvider;
module.exports.default_configuration = _DEFAULT_PROVIDER_CONFIGURATION;
