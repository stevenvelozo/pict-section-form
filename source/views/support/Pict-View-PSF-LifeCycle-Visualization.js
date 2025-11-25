const libPictViewFormSupportBase = require(`./Pict-View-PSF-SupportBase.js`);

const defaultViewConfiguration = (
{
	ViewIdentifier: "Pict-Form-LifeCycle",

	DefaultRenderable: 'Pict-Form-LifeCycle-Renderable',
	DefaultDestinationAddress: "#Pict-Form-Extensions-Container",

	RenderOnLoad: false,

	CSS: /*css*/``,

	Templates: [
		{
			Hash: "Pict-Form-LifeCycle-Content",
			Template: /*html*/`
<div id="Pict-Form-LifeCycle-Content">
	<h2 class="PSFLC-Global-Header">Pict LifeCycle Visualization</h2>
</div>
`
		}
	],
	Renderables: [
		{
			RenderableHash: "Pict-Form-LifeCycle-Renderable",
			TemplateHash: "Pict-Form-LifeCycle-Content"
		}
	]
});

class PictFormsLifeCycle extends libPictViewFormSupportBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.DisplayShortName = 'LCV';
		this.DisplayLongName = 'LifecycleVisulization';
	}
}

module.exports = PictFormsLifeCycle;

module.exports.default_configuration = defaultViewConfiguration;
