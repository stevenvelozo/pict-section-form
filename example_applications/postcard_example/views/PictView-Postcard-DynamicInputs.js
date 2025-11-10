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
{~MTI:First:DynamoData.SomeFunnyPlaceForTheData:String~}

and

{~MTI:Second funny place for the data's storage, yo...:DynamoData.SomeFunnyPlaceForTheDataAsASignatureInputType:String:PostKardSignature~}

{~IWVDA:MyDynamicView:AppData.CustomDescriptor~}

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

class PostcardDynamicInputsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.inputCounter = 0;
	}

	onInitialize()
	{
		this.pict.AppData.CustomDescriptor =
		{
			Hash: 'CustomPostkardData',
			Name: 'Custom PostKard Data',
			Address: 'CustomPostkardData',
			DataType: 'String',
			PictForm:
			{
				InputType: 'TexaArea',
				Description: 'This is a custom descriptor for the PostKard application.',
			},
		};
		return super.onInitialize();
	}

	onAfterRender()
	{
		this.pict.PictApplication.marshalToViews();
		return super.onAfterRender();
	}

	makeMoreInputs()
	{
		let tmpDefectInput = {
			SpecificDefectHash: this.fable.getUUID(),
			InputCounter: this.inputCounter++
		};
		if (!Array.isArray(this.pict.AppData.CustomDescriptors))
		{
			this.pict.AppData.CustomDescriptors = [];
		}
		const tmpIndex = this.pict.AppData.CustomDescriptors.length;
		this.pict.AppData.CustomDescriptors.push(
		{
			Hash: `CustomPostkardData${tmpIndex}`,
			Name: `Custom PostKard Data ${tmpIndex}`,
			Address: `CustomPostkardData${tmpIndex}`,
			DataType: 'PreciseNumber',
			PictForm:
			{
				Description: 'This is a custom descriptor for the PostKard application.',
			},
		});

		this.pict.parseTemplate(`<p>Input Numero {~D:Record.InputCounter~}: {~MTIWHA:Nombre:Record.SpecificDefectHash:String~}  {~IWVDA:MyDynamicView:AppData.CustomDescriptors[${tmpIndex}]~}</p>`, tmpDefectInput, 
			function (pError, pParsedTemplate)
			{
				this.pict.ContentAssignment.appendContent('#DynamicInputContainer', pParsedTemplate);
				this.pict.PictApplication.marshalToViews();
			}.bind(this));
	}
}

module.exports = PostcardDynamicInputsView;

module.exports.default_configuration = _ViewConfiguration;
