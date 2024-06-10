const libPictProvider = require('pict-provider');

// Picked an open source npm module that saw a lot of use as our router
//const libRouterJS = require('@capitec/omni-router');

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

		// Like wow.  These routers are really wanting to be fancy (made 3 work so far and holy crap)
		// But eff that at this point.  Let's keep the example simple.
	}

	onInitializeAsync(fCallback)
	{
		// // Map some routes.  Could DRY A bit.
		// this.router.map(
		// 	function (fMatch)
		// 	{
		// 		fMatch("/view/:pViewHash").to("renderView");
		// 		fMatch("/load/:pManyfestHash").to("loadManyfest");
		// 		fMatch("/save").to("saveManyfest");
		// 	});

		// this.routerHandlers.renderView = {
		// 	model: function (pRouteParameters)
		// 	{
		// 		// This loads the model then passes it on to the setup
		// 		return pRouteParameters;
		// 	},

		// 	setup: function (pRouteParameters)
		// 	{
		// 		// Render the View with the parameters
		// 		this.pict.views[pRouteParameters.pViewHash].render();
		// 	}
		// };

		// this.router.getRoute = function (pHandlerName)
		// {
		// 	return this.routerHandlers[name];
		// };

		return super.onInitializeAsync(fCallback);
	}
}

module.exports = ManyfestRouter;
module.exports.default_configuration = _DEFAULT_PROVIDER_CONFIGURATION;