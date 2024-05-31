const libPictProvider = require('pict-provider');

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
		this.log.info('PostcardDynamicSectionProvider.onInitializeAsync() called --- loading dynamic section views from "server".');
		// Load the dynamnic section views from the server
		this.pict.settings.DefaultFormManifest = require('./PictProvider-Dynamic-Sections-MockServerResponse.json');
		this.log.info('PostcardDynamicSectionProvider.onInitializeAsync() -- loaded dynamic section views from "server" to the application [settings.DefaultFormManifest] location.');

		return super.onInitializeAsync(fCallback);
	}
}

module.exports = PostcardDynamicSectionProvider;
module.exports.default_configuration = _DEFAULT_PROVIDER_CONFIGURATION;