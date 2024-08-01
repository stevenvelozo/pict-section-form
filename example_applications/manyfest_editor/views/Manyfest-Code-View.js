const libPictView = require('pict-view');

const _DEFAULT_VIEW_CONFIGURATION = (
{
	ViewIdentifier: "ManyfestCodeView",

	DefaultRenderable: "Manyfest-Code",
    DefaultDestinationAddress: "#Manyfest-Editor-MainApp-Container",

	AutoRender: false,

	CSS: `
#manyfest-jsoneditor {
	height: 700px;
}
`,

	Templates: [
		{
			Hash: "Manyfest-Code-Editor-Template",
			Template: /*html*/`
		<div class="container">
			<h1 class="title">Manyfest Raw Code</h1>
			<h2 class="subtitle">A lens into the gears and guts of this machine.</h2>
			<div id="manyfest-jsoneditor"></div>
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
	
	onAfterRender()
	{
		// Get the HTML DOM element that will contain the JSON editor
		let tmpEditorContainer = this.pict.ContentAssignment.getElement("#manyfest-jsoneditor");
		if (tmpEditorContainer.length < 1)
		{
			this.log.error(`Could not find JSON editor container in ManyfestCodeView.onAfterRender()`);
			return
		}
		tmpEditorContainer = tmpEditorContainer[0];

		// Set the JSON editor options
        const tmpEditorOptions = {};

		// Initialize the JSON editor
        this.jsonEditor = new JSONEditor(tmpEditorContainer, tmpEditorOptions);
		// Load the current manifest into the editor
        this.jsonEditor.set(this.pict.AppData);

		return super.onAfterRender();
	}

	onMarshalFromView()
	{
		if (!this.jsonEditor)
		{
			this.log.error(`JSON editor not initialized in ManyfestCodeView.onMarshalFromView() -- bad juju.`);
			return;
		}
		let tmpCode = this.jsonEditor.get();
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
}

module.exports = ManyfestCodeView;

module.exports.default_configuration = _DEFAULT_VIEW_CONFIGURATION;
