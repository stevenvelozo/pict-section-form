 const libPictView = require('pict-view');

const _DEFAULT_VIEW_CONFIGURATION = (
{
	ViewIdentifier: "ManyfestPersistence",

	DefaultRenderable: "Manyfest-Persistence-Container",
    DefaultDestinationAddress: "#navbar-persistcontrols",

	CSS: `.Manyfest-Header-Scope { color: #ffaa00; font-weight: bolder; }`,

	AutoRender: true,

	Templates: [
		{
			Hash: "Manyfest-Persistence-Container-Template",
			"Template": /*html*/ `
		<div class="navbar-item">
			<div class="navbar-item has-dropdown is-hoverable">
				<a class="navbar-item" href="#/Manyfest/New"> New </a>
			</div>
		</div>

		<div class="navbar-item">
			<div class="navbar-item has-dropdown is-hoverable">
				<a class="navbar-link"> Load </a>
				<div class="navbar-dropdown" id="Manyfest-LoadList-Container"></div>
			</div>
		</div>

		<div class="navbar-item">
			<div class="navbar-item has-dropdown is-hoverable">
				<a class="navbar-link"> Delete </a>
				<div class="navbar-dropdown" id="Manyfest-DeleteList-Container">
				</div>
			</div>
		</div>

		<div class="buttons">
			<a class="button is-primary" href="#/Manyfest/Save"> <strong>Save</strong> </a>
		</div>
`		
		},
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
			Template: /*html*/`[ scope <span class="Manyfest-Header-Scope">{~D:AppData.ManyfestRecord.Scope~}</span> ]`
		}
	],
	Renderables: [
		{
			RenderableHash: "Manyfest-Persistence-Container",
			TemplateHash: "Manyfest-Persistence-Container-Template"
		},
		{
			RenderableHash: "Manyfest-LoadList",
			TemplateHash: "Manyfest-LoadList-Template",
			ContentDestinationAddress: "#Manyfest-LoadList-Container"
		},
		{
			RenderableHash: "Manyfest-DeleteList",
			TemplateHash: "Manyfest-DeleteList-Template",
			ContentDestinationAddress: "#Manyfest-DeleteList-Container"
		},
		{
			RenderableHash: "Manyfest-LoadedManyfest",
			TemplateHash: "Manyfest-LoadedManyfest-Header",
			ContentDestinationAddress: "#Manyfest-LoadedManyfest-Scope-Indicator"
		}]
});

class ManyfestPersistenceView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender()
	{
		this.basicRender('Manyfest-LoadList');
		this.basicRender('Manyfest-DeleteList');
		return super.onAfterRender();
	}
}

module.exports = ManyfestPersistenceView;
module.exports.default_configuration = _DEFAULT_VIEW_CONFIGURATION;
