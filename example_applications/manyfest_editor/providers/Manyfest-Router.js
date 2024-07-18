const libPictProvider = require('pict-provider');
const libNavigo = require('navigo');

const _DEFAULT_PROVIDER_CONFIGURATION =
{
	ProviderIdentifier: 'Manyfest-Router',

	AutoInitialize: true,
	AutoInitializeOrdinal: 0,
}

class ManyfestRouter extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DEFAULT_PROVIDER_CONFIGURATION, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		// Initialize the navigo router and set the base path to '/'
		this.router = new libNavigo('/', { hash: true });
	}

	onInitializeAsync(fCallback)
	{
		// Define the routes for our application
		this.router.on('/Manyfest/Editor',
			(pData) =>
			{
				this.pict.views.PictFormMetacontroller.render()
			});
		this.router.on('/Manyfest/Code',
			(pData) =>
			{
				this.pict.views.ManyfestCodeView.render();
			});

		this.router.on('/Manyfest/Save',
			(pData) =>
			{
				this.pict.providers.DataProvider.saveManyfest()
			});

		this.router.on('/Manyfest/Load/:Scope',
			(pData) =>
			{
				this.pict.providers.DataProvider.loadManyfest(pData.Scope)
			});

		return super.onInitializeAsync(fCallback);
	}
}

module.exports = ManyfestRouter;
module.exports.default_configuration = _DEFAULT_PROVIDER_CONFIGURATION;