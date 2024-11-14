const libPictView = require('pict-view');
const { isTemplateSpan } = require('typescript');

const _ViewConfiguration = (
{
	ViewIdentifier: "Postcard-DynamicInputs",

	DefaultRenderable: "Postcard-Dynamic-Inputs",

    DefaultDestinationAddress: "#Postcard-Content-Container",

	AutoRender: false,

	Templates: [
		{
			Hash: "Postcard-Dynamic-Input-Template",
			Template: /*html*/`
<div class="header">
	<h1>So many inputs, so little time.</h1>
	<h2>This postcard example is getting silly.</h2>
</div>
<div class="content">
{~MTI:First:DynamoData.SomeFunnyPlaceForTheData:String~}

and

{~MTI:Second funny place for the data's storage, yo...:DynamoData.SomeFunnyPlaceForTheDataAsASignatureInputType:String:PostKardSignature~}

<br />

<a href="#" onclick="_Pict.views.PostcardDynamicInputs.makeMoreInputs();" class="button">Add More Inputs</a>

<div id="DynamicInputContainer">
</div>
</div>
`
		}
	],
	Renderables: [
		{
			RenderableHash: "Postcard-Dynamic-Inputs",
			TemplateHash: "Postcard-Dynamic-Input-Template"
		}]
});

class PostcardMainApplicationView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.inputCounter = 0;
	}

	makeMoreInputs()
	{
		let tmpDefectInput = {
			SpecificDefectHash: this.fable.getUUID(),
			InputCounter: this.inputCounter++
		};

		this.pict.parseTemplate('<p>Input Numero {~D:Record.InputCounter~}: {~MTIWHA:Nombre:Record.SpecificDefectHash:String~}</p>', tmpDefectInput, 
			function (pError, pParsedTemplate)
			{
				this.pict.ContentAssignment.appendContent('#DynamicInputContainer', pParsedTemplate);
			}.bind(this));
	}
}

module.exports = PostcardMainApplicationView;

module.exports.default_configuration = _ViewConfiguration;
