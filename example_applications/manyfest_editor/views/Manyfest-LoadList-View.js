 const libPictView = require('pict-view');

const _DEFAULT_VIEW_CONFIGURATION = (
{
	ViewIdentifier: "ManyfestLoadList",

	DefaultRenderable: "Manyfest-LoadList",
    DefaultDestinationAddress: "#Manyfest-LoadList-Container",

	CSS: `.Manyfest-Header-Scope: color: #ffaa00; font-weight: bolder;`,

	AutoRender: true,

	Templates: [
		{
			Hash: "Manyfest-LoadList-Template",
			Template: /*html*/` {~TS:Manyfest-LoadList-Entry-Template:Context[0].pict.providers.DataProvider.listManyfests()~} `
		},
		{
			Hash: "Manyfest-LoadList-Entry-Template",
			Template: /*html*/` <a class="navbar-item" href="#/Manyfest/Load/{~D:Record.Scope~}"> {~D:Record.Scope~} </a> `
		},
		{
			Hash: "Manyfest-DeleteList-Template",
			Template: /*html*/` {~TS:Manyfest-DeleteList-Entry-Template:Context[0].pict.providers.DataProvider.listManyfests()~} `
		},
		{
			Hash: "Manyfest-DeleteList-Entry-Template",
			Template: /*html*/`<a class="navbar-item" href="#/Manyfest/Delete/{~D:Record.Scope~}"> {~D:Record.Scope~} </a>`
		},
		{
			Hash: "Manyfest-LoadedManyfest-Header",
			Template: /*html*/`[ scope <span class="Manyfest-Header-Scope">{~D:AppData.Scope~}</span> ]`
		}
	],
	Renderables: [
		{
			RenderableHash: "Manyfest-LoadList",
			TemplateHash: "Manyfest-LoadList-Template"
		},
		{
			RenderableHash: "Manyfest-DeleteList",
			TemplateHash: "Manyfest-DeleteList-Template",
			ContentDestinationAddress: "#Manyfest-DeleteList-Container"
		},
		{
			RenderableHash: "Manyfest-LoadedManyfest",
			TemplateHash: "Manyfest-LoadedManyfest-Header",
			ContentDestinationAddress: "#Manyfest-LoadedManyfest-Header-Container"
		}]
});

class ManyfestLoadListView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender()
	{
		// Would be nice to have a "renderBasic" that just renders without the trimmings
		this.pict.ContentAssignment.assignContent("#Manyfest-LoadedManyfest-Header-Container", this.pict.parseTemplateByHash("Manyfest-LoadedManyfest-Header", null, null, [this]))
		this.pict.ContentAssignment.assignContent("#Manyfest-DeleteList-Container", this.pict.parseTemplateByHash("Manyfest-DeleteList-Template", null, null, [this]))
		return super.onAfterRender();
	}
}

module.exports = ManyfestLoadListView;
module.exports.default_configuration = _DEFAULT_VIEW_CONFIGURATION;
