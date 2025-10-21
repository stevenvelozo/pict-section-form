const libPictViewFormSupportBase = require(`./Pict-View-PSF-SupportBase.js`);

const defaultViewConfiguration = (
{
	ViewIdentifier: "Pict-Form-Solver",

	DefaultRenderable: 'Pict-Form-Solver-Renderable',
	DefaultDestinationAddress: "#Pict-Form-Extensions-Container",

	RenderOnLoad: false,

	CSS: /*css*/``,

	Templates: [
		{
			Hash: "Pict-Form-Solver-Content",
			Template: /*html*/`
<div id="Pict-Form-Solver-Content">
	<h2 class="PSFS-Global-Header">Pict Solver Visualization</h2>
</div>
`
		}
	],
	Renderables: [
		{
			RenderableHash: "Pict-Form-Solver-Renderable",
			TemplateHash: "Pict-Form-Solver-Content"
		}
	]
});

class PictFormsSolver extends libPictViewFormSupportBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.DisplayShortName = 'SV';
		this.DisplayLongName = 'SolverVisualization';
	}
}

module.exports = PictFormsSolver;

module.exports.default_configuration = defaultViewConfiguration;
