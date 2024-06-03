const libPictView = require('pict-view');

const _DEFAULT_VIEW_CONFIGURATION = (
{
	ViewIdentifier: "ManyfestSummaryView",

	DefaultRenderable: "Manyfest-Summary",
    DefaultDestinationAddress: "#Manyfest-Editor-MainApp-Container",

	AutoRender: false,

	Templates: [
		{
			Hash: "Manyfest-Summary-Template",
			Template: /*html*/`
		<div class="container">
			<h1 class="title">Manyfest [ {~D:AppData.Scope~} ]</h1>
			<h2 class="subtitle">This manyfest has {~D:AppData.Descriptors.length~} descriptors and {~D:AppData.Sections.length~} sections.</h2>

		</div>
`
		}
	],
	Renderables: [
		{
			RenderableHash: "Manyfest-Code",
			TemplateHash: "Manyfest-Code-Editor-Template"
		}]
});

class ManyfestSummaryView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = ManyfestSummaryView;

module.exports.default_configuration = _DEFAULT_VIEW_CONFIGURATION;
