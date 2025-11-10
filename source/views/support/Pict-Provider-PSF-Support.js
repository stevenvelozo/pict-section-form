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

		// These next blocks of code manually do what views often do, to support sharing of this across multiple views.

		// Only add this css if it doesn't exist already in the css map
		if (!('Pict-Support' in this.pict.CSSMap.inlineCSSMap))
		{
			this.pict.CSSMap.addCSS('Pict-Support',
				/*css*/`
					:root{
						--PSF-Global-background-color: #dcdce5;
						--PSF-Global-text-color: #333333;

						--PSFExt-gutter-size: 5px;
						--PSFExt-indentation-size: calc(2 * var(--PSFExt-gutter-size));
						--PSFExt-Global-background-color: #dedede;
						--PSFExt-Global-text-color: #333333;
						--PSFExt-Section-background-color: #efefef;
						--PSFExt-Section-button-color: #5A52A3;
						--PSFExt-Section-button-text-color: #D8D7E5;
						--PSFExt-Section-token-color: #eAf3a2;
						--PSFExt-Section-label-color: #999;
						--PSFExt-Section-Data-background-color: #fafafa;
						--PSFExt-Section-Group-Header-background-color: #ebebff;
						--PSFExt-Section-Group-Row-Header-background-color: #dcf0f0;
						--PSFExt-Solver-Entry-text-color: #bb4a9c;
						--PSFExt-Section-DynamicInput-background-color: #a3ccd8;
						--PSFExt-Section-DynamicInput-button-color: #2b89a4;
						--PSFExt-Section-DynamicInput-button-text-color: #D8D7E5;
					}

					/** Wrapping container	*/
					#Pict-Form-Extensions-Wrap {
						display:flex;
						flex-direction: column;
						height: 75vh;
						overflow: hidden;
						position: absolute;
						left: 50%;
						top: 0px;
						width: 20vw;
						min-width: 340px;
						min-height: 200px;
					}
					#Pict-Form-Extension-DragControl {
						background-color: #eae;
						cursor: move;
						padding: 4px 6px;
						border-radius: 3px;
						border: 1px solid #111;
					}
					#Pict-Form-Extensions-Container { 
						flex-grow: 1;
						overflow: auto;
						margin-top: 2px;
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
					#Pict-Form-Extension-ResizeControl {
						background-color: #eae;
						cursor: move;
						padding: 4px 4px;
						border-radius: 3px;
						border: 1px solid #111;
					}
					.PSFExt-Extension-Footer {
						text-align: right;
						font-size: 10px;
						font-weight: bold;
						margin-top: 8px;
					}

					/** Headers	*/
					.PSFExt-Extension-Header {
						font-size: 10px;
						font-weight: bold;
						margin-bottom: var(--PSFExt-gutter-size);
					}
					.PSFExt-Global-Header {
						padding: var(--PSFExt-gutter-size);
						margin: 0;
					}
					.PSFExt-Section-Header {
						padding: var(--PSFExt-gutter-size);
						margin: 0;
					}
					.PSFExt-Content-Header {
						padding: var(--PSFExt-gutter-size);
						margin: 0;
						background-color: var(--PSFExt-Section-background-color);
					}
					.PSFExt-Data-Header {
						font-weight: bold;
						border-bottom: 1px dotted #ccc;
						padding: var(--PSFExt-gutter-size);
					}
					/** Section content */
					.PSFExt-Section { 
						margin: var(--PSFExt-gutter-size);
						padding: var(--PSFExt-gutter-size);
						background-color: var(--PSFExt-Section-background-color);
						border-radius: 4px;
					}
					.PSFExt-Section-Descriptors { 
						padding: var(--PSFExt-gutter-size) 0;
					}
					.PSFExt-Section-Group { 
						padding: var(--PSFExt-gutter-size);
					}
					.PSFExt-Section-Buttons {
						list-style-type: none;
						padding: 0;
						padding-bottom: var(--PSFExt-gutter-size);
						margin: calc(var(--PSFExt-gutter-size) * 2) var(--PSFExt-gutter-size);
					}
					.PSFExt-Section-Button { 
						display: inline;
						margin-right: calc(var(--PSFExt-gutter-size) * 0.25);
						text-decoration: none;
						background-color: var(--PSFExt-Section-button-color);
						padding: var(--PSFExt-gutter-size);
						border-radius: var(--PSFExt-gutter-size);
					}
					.PSFExt-Section-Button a { 
						text-decoration: none;
						color: var(--PSFExt-Section-button-text-color);
					}
					.PSFExt-Section-Button a:hover { 
						text-decoration: underline;
					}
					.PSFExt-Section-Solver-Entry:not(:last-child) {
						border-bottom: 1px solid #ccc;
					}
					.PSFExt-Solver-Entry { 
						font-family: "Courier New", "Lucida Console", monospace;
						font-weight: bold;
						margin-top: var(--PSFExt-gutter-size);
						padding: var(--PSFExt-gutter-size);
						line-height: 1.2;
						color: var(--PSFExt-Solver-Entry-text-color);
						border-bottom: 1px dotted #ccc;
					}
					.PSFExt-Solver-Result { 
						font-family: "Courier New", "Lucida Console", monospace;
						font-weight: bold;
						margin-top: var(--PSFExt-gutter-size);
						padding: 0 var(--PSFExt-gutter-size);
						line-height: 1.2;
					}
					.PSFExt-Section-ExtraData {
						padding-top: calc(var(--PSFExt-gutter-size) / 2);
						padding-bottom: calc(var(--PSFExt-gutter-size) / 2);
						background-color: var(--PSFExt-Section-Data-background-color);
					}
					.PSFExt-Section-Group .PSFExt-Content-Header.PSFExt-Section-Group-Header {
						background-color: var(--PSFExt-Section-Group-Header-background-color);
					}
					.PSFExt-Section-Group .PSFExt-Content-Header.PSFExt-Section-Group-Row-Header {
						background-color: var(--PSFExt-Section-Group-Row-Header-background-color);
					}
					.PSFExt-DeEmphasize { 
						color: var(--PSFExt-Section-label-color);
						font-size: smaller;
					}
					.PSFExt-Data { 
						margin-left: var(--PSFExt-indentation-size);
						line-height: 0.85;
						font-size: smaller;
					}
					.PSFExt-Data-Table {
						width: 100%;
						border-collapse: collapse;
						margin-left: var(--PSFExt-indentation-size);
						margin-top: var(--PSFExt-gutter-size);
						margin-bottom: var(--PSFExt-gutter-size);
						overflow-x: auto;
					}
					.PSFExt-Label { 
						min-width: 15%;
						color: var(--PSFExt-Section-label-color);
						margin: var(--PSFExt-gutter-size) 0;
					}
					.PSFExt-Label::after {
						content: ": ";
					}
					.PSFExt-Hidden { 
						display: none;
					}
					.PSFExt-Section-Solver-DynamicInput {
						background-color: #ffffff;
					}
					
					/** empty states */
					.PSFExt-Section-Solvers:empty::before {
						content: "No Section Solvers Defined";
						font-style: italic;
						color: var(--PSFExt-Section-label-color);
						margin-left: var(--PSFExt-indentation-size);
						text-align: center;
						padding: var(--PSFExt-gutter-size);
						display: block;
						font-size: smaller;
					}
					.PSFExt-Group-Solvers:empty::before {
						content: "No Group/RecordSet Solvers Defined";
						font-style: italic;
						color: var(--PSFExt-Section-label-color);
						margin-left: var(--PSFExt-indentation-size);
						text-align: center;
						padding: var(--PSFExt-gutter-size);
						display: block;
						font-size: smaller;
					}
					.PSFExt-ExpressionEditbox {
						width: calc(100% - 20px);
						resize: vertical;
						min-height: 80px;
						font-family: monospace;
						font-size: 0.9em;
					}
					.PSFExt-Token {
						background-color: var(--PSFExt-Section-token-color);
					}
				`, 1000, 'Pict-Form-SupportBase');
		}

		// Only add these templates if they doesn't exist
		if (this.pict.TemplateProvider.getTemplate('Pict-Form-Support-Container') == null)
		{
			this.pict.TemplateProvider.addTemplate('Pict-Form-Support-Container',
				/*html*/`
			<div id="Pict-Form-Extensions-Wrap">
				<p class="PSFExt-Extension-Header"><span id="Pict-Form-Extension-DragControl" class="PSDV-Extension-Header-Controlbar">Pict.Extensions {~TS:Pict-Form-Support-Container-Link:Pict.providers[Pict-Form-SupportExtensions].getSupportViewLinks()~} <a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.toggleClass('#Pict-Form-Extensions-Container', 'PSFExt-Hidden');{~P~}.ContentAssignment.toggleClass('#Pict-Form-Extensions-Footer', 'PSFExt-Hidden');">toggle</a></span></p>
				<div id="Pict-Form-Extensions-Container"></div>
				<p id="Pict-Form-Extensions-Footer" class="PSFExt-Extension-Footer"><span id="Pict-Form-Extension-ResizeControl">Pict.Extensions Resize</span></p>
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
