const libPictSectionForm = require('../../../source/Pict-Section-Form.js');

const libManyfestBasicViewAdjustments = require('../views/Manyfest-Basic-View-Template-Adjustments.js');
const libManyfestBasicViewConfigurations = libManyfestBasicViewAdjustments(require('../views/Manyfest-Basic-View-Templates.json'));

const libManyfestPersistenceView = require('../views/Manyfest-Persistence-View.js');
const libManyfestCodeView = require('../views/Manyfest-Code-View.js');
const libManyfestOverviewView = require('../views/Manyfest-Overview-View.js');

class ManyfestEditor extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Trying this pattern -- it seems to make the most sense.
		this.options.MainViewportViewIdentifier = 'ManyfestNavigation';
		this.options.AutoRenderMainViewportViewAfterInitialize = true;

		this.pict.addProvider('ManyfestRouter', {}, require('../providers/Manyfest-Router.js'));
		this.pict.addProvider('DataProvider', {}, require('../providers/Manyfest-Data-Provider.js'));

		this.pict.addView('ManyfestCodeView', libManyfestCodeView.default_configuration, libManyfestCodeView);

		// Load the configuration-only views
		this.pict.addView('ManyfestNavigation', libManyfestBasicViewConfigurations['Manyfest-Basic-NavigationHtml-View']);
		this.pict.addView('ManyfestOverview', libManyfestOverviewView.default_configuration, libManyfestOverviewView);
		this.pict.addView('ManyfestPersistenceView', libManyfestPersistenceView.default_configuration, libManyfestPersistenceView);
	}

	onBeforeInitialize()
	{
		// Make sure any form-specific CSS is injected properly.
		this.pict.CSSMap.injectCSS();

		let tmpMetacontrollerOptions = this.pict.views.PictFormMetacontroller.options;
		tmpMetacontrollerOptions.DefaultDestinationAddress = `#Manyfest-Editor-MainApp-Container`;
		tmpMetacontrollerOptions.AutoRender = false;

		this.log.trace(`Loading the manyfest editor!`);
		return super.onBeforeInitialize();
	}

	onAfterInitialize()
	{
		// Load the list of Manifests that have been saved.
		this.pict.providers.DataProvider.loadManyfestMeta(true);
		// TODO: Add a "let's remember the last page" thing to the router.
		this.pict.providers.ManyfestRouter.navigate(`/#Manyfest/Overview`);

		return super.onAfterInitialize();
	}

	onAfterRender()
	{
		// Render the persistence controls
		this.pict.views.ManyfestPersistenceView.render();

		return super.onAfterRender();
	}
}

module.exports = ManyfestEditor;

module.exports.default_configuration = libPictSectionForm.PictFormApplication.default_configuration;
module.exports.default_configuration.pict_configuration = (
	{
		"Product":"ManyfestEditor",
		"DefaultFormManifest": require('../manifests/Manifest-Manyfest.json')
	});