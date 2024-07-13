const libPictView = require('pict-view');

const _DEFAULT_VIEW_CONFIGURATION = (
{
	ViewIdentifier: "ManyfestCodeView",

	DefaultRenderable: "Manyfest-Code",
    DefaultDestinationAddress: "#Manyfest-Editor-MainApp-Container",

	AutoRender: false,

	Templates: [
		{
			Hash: "Manyfest-Code-Editor-Template",
			Template: /*html*/`
		<div class="container">
			<h1 class="title">Manyfest Raw Code</h1>
			<h2 class="subtitle">Your lens into the guts of this machine.</h2>
			<textarea {~D:Record.Macro.InputFullProperties~} id="ManyfestRawCodeEditor" onchange="{~P~}.views.ManyfestCodeView.marshalFromView()">{~D:Context[0].getManyfestRawCode()~}</textarea>
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

class ManyfestCodeView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onMarshalFromView()
	{
		let tmpCode = this.pict.ContentAssignment.readContent('#ManyfestRawCodeEditor');
		if (typeof(tmpCode) === 'string')
		{
			try
			{
				let tmpNewManifest = JSON.parse(tmpCode);

				this.pict.AppData = tmpNewManifest;
			}
			catch(pError)
			{
				this.log.error(`Error marshaling JSON data out of code editor: ${pError}`);
			}
		}
	}

	getManyfestRawCode()
	{
		return JSON.stringify(this.pict.AppData, null, 4);
	}
}

module.exports = ManyfestCodeView;

module.exports.default_configuration = _DEFAULT_VIEW_CONFIGURATION;
