const libPictView = require('pict-view');

const _ViewConfiguration = (
{
	ViewIdentifier: "Postcard-MainApplication",

	DefaultRenderable: "Postcard-Main-Application",
    DefaultDestinationAddress: "#Postcard-Content-Container",

	AutoRender: true,

	CSS: ".PostcardControls { margin-top: 2em; background-color: #fff5f5; }",

	Templates: [
		{
			Hash: "Postcard-Main-Application-Template",
			Template: /*html*/`
<!-- This template is where the Form Metacontroller view puts its content -->
<div class="header">
	<h1>Send a Fabulous Postkard!</h1>
	<h2>Where every moment becomes a cherished memory to share.</h2>
</div>
<!-- This div is where the actual form containers will go -->
<div class="content" id="Pict-Form-Container"></div>
`
		}
	],
	Renderables: [
		{
			RenderableHash: "Postcard-Main-Application",
			TemplateHash: "Postcard-Main-Application-Template"
		}]
});

class PostcardMainApplicationView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterInitialize()
	{
		this.pict.views.PostcardNavigation.render()
		return super.onAfterInitialize();
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.views.PictFormMetacontroller.render();
		this.pict.views.PictFormMetacontroller.renderFormSections();
		this.pict.PictApplication.marshalDataFromAppDataToView();
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
		//return super.onAfterRenderAsync(fCallback);
	}
}

module.exports = PostcardMainApplicationView;

module.exports.default_configuration = _ViewConfiguration;
