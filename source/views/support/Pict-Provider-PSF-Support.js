const libPictProvider = require('pict-provider');

/** @type {Record<string, any>} */
const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-Form-SupportExtensions",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

/**
 * Represents a class that provides dynamic templates for the Pict form section provider.
 * @extends libPictProvider
 */
class PictSupportExtension extends libPictProvider
{
	/**
	 * Constructs a new instance of the PictProviderDynamicTemplates class.
	 * @param {Object} pFable - The pFable object.
	 * @param {Object} pOptions - The options object.
	 * @param {Object} pServiceHash - The service hash object.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);

		super(pFable, tmpOptions, pServiceHash);

		// These next two blocks of code manually do what views often do, to support sharing of this across multiple views.
		// Only add this css if it doesn't exist
		if (!('Pict-Support' in this.pict.CSSMap.inlineCSSMap))
		{
			this.pict.CSSMap.addCSS('Pict-Support',
				/*css*/`
					:root{
						--PSF-Global-background-color: #dcdce5;
						--PSF-Global-text-color: #333333;
					}
					#Pict-Form-Extensions-Wrap {
						position: absolute;
						left: 50%;
						top: 0px;
						width: 50vw;
						max-height: 75vh;
						overflow: auto;
					}
					#Pict-Form-Extension-DragControl {
						background-color: #eae;
						cursor: move;
						padding: 4px 6px;
						border-radius: 3px;
						border: 1px solid #111;
					}
					#Pict-Form-Extensions-Container { 
						color: var(--PSF-Global-text-color);
						background-color: var(--PSF-Global-background-color);
						padding: 10px;
						border: 4px double #111;
						border-radius: 8px;
						box-shadow: 2px 2px 10px rgba(0,0,0,0.5);
						font-size: 14px;
						font-family: Arial, sans-serif;
						font-size: 14px;
					}
				`, 1000, 'Pict-Form-SupportBase');
		}

		// Only add these templates if they doesn't exist
		if (this.pict.TemplateProvider.getTemplate('Pict-Form-Support-Container') == null)
		{
			this.pict.TemplateProvider.addTemplate('Pict-Form-Support-Container',
				/*html*/`
			<div id="Pict-Form-Extensions-Wrap">
				<p class="PSFDV-Extension-Header"><span id="Pict-Form-Extension-DragControl" class="PSDV-Extension-Header-Controlbar">Pict.Extensions {~TS:Pict-Form-Support-Container-Link:Pict.providers[Pict-Form-SupportExtensions].getSupportViewLinks()~} <a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.toggleClass('#Pict-Form-Extensions-Container', 'PSFDV-Hidden')">toggle</a></span></p>
				<div id="Pict-Form-Extensions-Container"></div>
			</div>
				`);
		}
		if (this.pict.TemplateProvider.getTemplate('Pict-Form-Support-Container-Link') == null)
		{
			this.pict.TemplateProvider.addTemplate('Pict-Form-Support-Container-Link',
				/*html*/` [ <a href="{~D:Record.Link~}" onclick="{~D:Record.OnClick~}" data-shortname="{~D:Record.ShortName~}" data-longname="{~D:Record.LongName~}">{~D:Record.ShortName~}</a> ] `);
		}


		this.SupportViews = {};
	}

	registerSupportView(pView)
	{
		this.pict.log.info(`Registering support view ${pView.Hash} with Pict Support Extension provider.`);
		this.SupportViews[pView.Hash] = pView;
	}

	getSupportViewLinks()
	{
		let tmpLinks = [];
		let tmpSupportViewHashes = Object.keys(this.SupportViews);
		for (let i = 0; i < tmpSupportViewHashes.length; i++)
		{
			let tmpViewHash = tmpSupportViewHashes[i];
			let tmpView = this.SupportViews[tmpViewHash];
			tmpLinks.push(
				{
					Hash: tmpView.Hash,
					Link: `javascript:void(0);`,
					ShortName: tmpView.DisplayShortName,
					LongName: tmpView.DisplayLongName,
					OnClick: `${this.pict.browserAddress}.views['${tmpView.Hash}'].render()`
				}
			);
		}
		return tmpLinks;
	}
}

module.exports = PictSupportExtension;
module.exports.default_configuration = _DefaultProviderConfiguration;
