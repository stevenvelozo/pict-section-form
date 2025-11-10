const libPictViewFormSupportBase = require(`./Pict-View-PSF-SupportBase.js`);

const defaultViewConfiguration = (
{
	ViewIdentifier: "Pict-Form-SpecificSolve",

	DefaultRenderable: 'Pict-Form-SpecificSolve-Renderable',
	DefaultDestinationAddress: "#Pict-Form-Extensions-Container",

	RenderOnLoad: false,

	CSS: /*css*/``,

	Templates: [
		{
			Hash: "Pict-Form-SpecificSolve-Content",
			Template: /*html*/`
<div id="Pict-Form-SpecificSolve-Content">
	<h2 class="PSFSS-Global-Header">Pict Specific Solve Visualization</h2>
</div>
`
		}
	],
	Renderables: [
		{
			RenderableHash: "Pict-Form-SpecificSolve-Renderable",
			TemplateHash: "Pict-Form-SpecificSolve-Content"
		}
	]
});

class PictFormsSpecificSolve extends libPictViewFormSupportBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.DisplayShortName = 'SSV';
		this.DisplayLongName = 'SpecificSolveVisualization';
	}
}

module.exports = PictFormsSpecificSolve;

module.exports.default_configuration = defaultViewConfiguration;
