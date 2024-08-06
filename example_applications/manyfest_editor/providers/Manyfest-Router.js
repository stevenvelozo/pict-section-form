const libPictProvider = require('pict-provider');
const libNavigo = require('navigo');

const _DEFAULT_PROVIDER_CONFIGURATION =
{
	ProviderIdentifier: 'Manyfest-Router',

	AutoInitialize: true,
	AutoInitializeOrdinal: 0
}

class ManyfestRouter extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DEFAULT_PROVIDER_CONFIGURATION, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		// Initialize the navigo router and set the base path to '/'
		this.router = new libNavigo('/', { hash: true });

		// This is the route to render after load
		this.afterPersistView = '/Manyfest/Overview';
	}

	get currentScope()
	{
		return this.AppData?.ManyfestRecord?.Scope ?? 'Default';
	}

	forwardToScopedRoute(pData)
	{
		this.navigate(`${pData.url}/${this.currentScope}`);
	}

	onInitializeAsync(fCallback)
	{
		this.router.on('/Manyfest/Overview', this.forwardToScopedRoute.bind(this));
		this.router.on('/Manyfest/Overview/:Scope',
			(pData) =>
			{
				this.pict.views.ManyfestOverview.render();
			});

		this.router.on('/Manyfest/Editor', this.forwardToScopedRoute.bind(this));
		this.router.on('/Manyfest/Editor/:Scope',
			(pData) =>
			{
				this.afterPersistView = '/Manyfest/Editor';
				this.pict.views.PictFormMetacontroller.renderDefaultFormSections();
			});

		this.router.on('/Manyfest/Code', this.forwardToScopedRoute.bind(this));
		this.router.on('/Manyfest/Code/:Scope',
			(pData) =>
			{
				this.afterPersistView = '/Manyfest/Code';
				this.pict.views.ManyfestCodeView.render();
			});

		this.router.on('/Manyfest/Tabular',
			(pData) =>
			{
				this.pict.views.PictFormMetacontroller.renderSpecificFormSection('PictSectionForm-ManyfestTabular');
			});

		this.router.on('/Manyfest/New',
			(pData) =>
			{
				this.pict.providers.DataProvider.newManyfest();
			});
		this.router.on('/Manyfest/New/:Scope',
			(pData) =>
			{
				this.pict.providers.DataProvider.newManyfest(pData.data.Scope);
			});

		this.router.on('/Manyfest/Save', this.forwardToScopedRoute.bind(this));
		this.router.on('/Manyfest/Save/:Scope',
			(pData) =>
			{
				this.pict.providers.DataProvider.saveManyfest();
			});

		this.router.on('/Manyfest/Load/:Scope',
			(pData) =>
			{
				this.pict.providers.DataProvider.loadManyfest(pData.data.Scope);
			});

		this.router.on('/Manyfest/Delete/:Scope',
			(pData) =>
			{
				this.pict.providers.DataProvider.removeScopeFromManyfestList(pData.data.Scope);
				this.pict.providers.DataProvider.loadManyfest();
			});

		return super.onInitializeAsync(fCallback);
	}

	/**
	 * Navigate to a given route (set the browser URL string, add to history, trigger router)
	 * 
	 * @param {string} pRoute - The route to navigate to
	 */
	navigate(pRoute)
	{
		this.router.navigate(pRoute);
	}

	/**
	 * Navigate to the current view type the user is in (the spreadsheet, or the overview, or whatever) automatically
	 */
	postPersistNavigate()
	{
		// TODO: Add some kind of guard for this string.
		this.router.navigate(this.afterPersistView);
		this.pict.views.ManyfestPersistenceView.basicRender('Manyfest-LoadedManyfest');
	}
}

module.exports = ManyfestRouter;
module.exports.default_configuration = _DEFAULT_PROVIDER_CONFIGURATION;