const libPictProvider = require('pict-provider');
const libPictFormSection = require('../../../source/Pict-Section-Form.js');

const _DEFAULT_PROVIDER_CONFIGURATION = 
{
		ProviderIdentifier: 'Postcard-DynamicSection-Provider',

		AutoInitialize: true,
		AutoInitializeOrdinal: 0,

		AutoSolveWithApp: false,
//		AutoSolveOrdinal: 0,

//		Manifests: {},

//		Templates: []
	}

class PostcardDynamicSectionProvider extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DEFAULT_PROVIDER_CONFIGURATION)), pOptions);
		super(pFable, tmpOptions, pServiceHash);
	}

	onInitializeAsync(fCallback)
	{
		this.log.info('PostcardDynamicSectionProvider.onInitializeAsync() called --- loading dynamic section views from "server".');

		// Load the dynamnic section views from the server
		let tmpDynamicFormManifest = require('./PictProvider-Dynamic-Sections-MockServerResponse.json');

		libPictFormSection.bootstrapFormViewsFromManifest(this.pict, tmpDynamicFormManifest);

		return fCallback();
	}
}

module.exports = PostcardDynamicSectionProvider;

module.exports.default_configuration = _DEFAULT_PROVIDER_CONFIGURATION;