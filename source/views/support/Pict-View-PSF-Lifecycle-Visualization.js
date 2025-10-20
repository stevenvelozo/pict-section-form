const libPictView = require(`pict-view`);

const defaultViewConfiguration = (
{
	ViewIdentifier: "PictSectionForm-Visualization-Lifecycle",

	DefaultRenderable: 'PSF-Visualization-Lifecycle-Renderable',
	DefaultDestinationAddress: "#PictSectionForm-Extensions-Container",

	RenderOnLoad: false,

	Templates: [
		{
			Hash: "PictSectionForm-Visualization-Lifecycle-Content",
			Template: /*html*/``
		}
	],
	Renderables: [
		{
			RenderableHash: "PictSectionForm-Visualization-Lifecycle-Renderable",
			TemplateHash: "PictSectionForm-Visualization-Lifecycle-Content"
		}
	]
});

class PictSectionFormsLifecycleVisualization extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = PictSectionFormsLifecycleVisualization;

module.exports.default_configuration = defaultViewConfiguration;
