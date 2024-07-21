const libPictProvider = require('pict-provider');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-Layout",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

/**
 * The PictDynamicLayout class is a provider that generates dynamic layouts based on configuration.
 */
class PictDynamicLayout extends libPictProvider
{
	/**
	 * Creates an instance of the PictDynamicLayout class.
	 * 
	 * @param {object} pFable - The fable object.
	 * @param {object} pOptions - The options object.
	 * @param {object} pServiceHash - The service hash object.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);
	}

	/**
	 * Generate a group layout template for the Dynamically Generated views.
	 * 
	 * @param {object} pView - The view to generate the dynamic group layout for
	 * @param {object} pGroup - The group to generate and inject dynamic layout templates
	 * @returns 
	 */
	generateGroupLayoutTemplate(pView, pGroup)
	{
		return '';
	}

	/**
	 * After a group template has been rendered, this lets a layout initialize any controls that 
	 * are necessary (e.g. a custom input type or such).
	 * 
	 * @param {object} pView  - The view to initialize the newly rendered control for
	 * @param {object} pGroup - The group to initialize the newly rendered control for
	 * @returns 
	 */
	onGroupLayoutInitialize(pView, pGroup)
	{
		return true;
	}
}

module.exports = PictDynamicLayout;
module.exports.default_configuration = _DefaultProviderConfiguration;