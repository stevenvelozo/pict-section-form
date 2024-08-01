const libPictView = require('pict-view');

const _DEFAULT_VIEW_CONFIGURATION = (
{
	ViewIdentifier: "ManyfestOverviewView",

	DefaultRenderable: "Manyfest-Overview",
    DefaultDestinationAddress: "#Manyfest-Editor-MainApp-Container",

	AutoRender: false,

	CSS: ``,

	Templates: [
		{
			Hash: "Manyfest-Overview-Template",
			Template: /*html*/`
		<div class="container">
			<h1 class="title"><span class="deemphasize">Manyfest Overview</span> {~D:AppData.ManyfestRecord.Scope~}</h1>
			<p>The currently loaded manyfest, scoped to [{~D:AppData.ManyfestRecord.Scope~}], has {~D:AppData.ManyfestRecord.Sections.length~} sections.</p>
			<div>{~TS:Manyfest-Overview-SectionTemplate:AppData.ManyfestRecord.Sections~}</div>
		</div>
`
		},
		{
			Hash: "Manyfest-Overview-SectionTemplate",
			Template: /*html*/`
		<div class="container">
			<h2><span class="deemphasize">Section</span> {~D:Record.Name~}</h2>
			<p>The section with hash {~D:Record.Hash~} has a display name set to {~D:Record.Name~}.  It contains {~D:Record.Groups.length~} explicit groups.</p>
		</div>
`
		}
	],
	Renderables: [
		{
			RenderableHash: "Manyfest-Overview",
			TemplateHash: "Manyfest-Overview-Template"
		}]
});

class ManyfestOverviewView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = ManyfestOverviewView;

module.exports.default_configuration = _DEFAULT_VIEW_CONFIGURATION;
