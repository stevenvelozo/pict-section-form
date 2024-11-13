const libPictView = require('pict-view');

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
{~MTI:DynamoData.SomeFunnyPlaceForTheData:String~}

and

{~MTI:DynamoData.SomeFunnyPlaceForTheDataAsASignatureInputType:String:PostKardSignature~}
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
	}
}

module.exports = PostcardMainApplicationView;

module.exports.default_configuration = _ViewConfiguration;
