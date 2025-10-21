const libPictViewFormSupportBase = require(`./Pict-View-PSF-SupportBase.js`);

const defaultViewConfiguration = (
{
	ViewIdentifier: "Pict-Form-AppData",

	DefaultRenderable: 'Pict-Form-AppData-Renderable',
	DefaultDestinationAddress: "#Pict-Form-Extensions-Container",

	RenderOnLoad: false,

	CSS: /*css*/``,

	Templates: [
		{
			Hash: "Pict-Form-AppData-Content",
			Template: /*html*/`
<div id="Pict-Form-AppData-Content">
	<h2 class="PSFAD-Global-Header">Pict AppData Visualization</h2>
</div>
`
		}
	],
	Renderables: [
		{
			RenderableHash: "Pict-Form-AppData-Renderable",
			TemplateHash: "Pict-Form-AppData-Content"
		}
	]
});

class PictFormsAppData extends libPictViewFormSupportBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.DisplayShortName = 'AD';
		this.DisplayLongName = 'AppData';
	}
}

module.exports = PictFormsAppData;

module.exports.default_configuration = defaultViewConfiguration;
