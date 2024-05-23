const libPictView = require('pict-view');

const _ViewConfiguration = (
{
	ViewIdentifier: "Postcard-MainApplication",

	DefaultRenderable: "Postcard-Main-Application",
    DefaultDestinationAddress: "#Postcard-Content-Container",

	RenderOnLoad: true,

	CSS: ".PostcardControls { margin-top: 2em; background-color: #fff5f5; }",

	Templates: [
		{
			Hash: "Postcard-Main-Application-Template",
			Template: /*html*/`
<h1>Send a Fabulous Postkard!</h1>

<!-- where the Form Metacontroller view puts its content -->
<div id="Pict-Form-Container"></div>

<div class="PostcardControls"> 
	<a href="#" onclick="_Pict.PictApplication.marshalDataFromViewToAppData()">[ Store Data ]</a> | <a href="#" onclick="_Pict.PictApplication.marshalDataFromAppDataToView()">[ Read Data ]</a>
	||
	<a href="#" onclick="_Pict.PictApplication.changeToPostcardTheme()">[ Postkard Theme ]</a> | <a href="#" onclick="_Pict.PictApplication.changeToDefaultTheme()">[ Default Theme ]</a>
</div>
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

	onAfterRender()
	{
		this.pict.views.PictFormMetacontroller.render();
		this.pict.views.PictFormMetacontroller.renderAllFormSections();
		this.pict.PictApplication.marshalDataFromAppDataToView();
	}
}

module.exports = PostcardMainApplicationView;

module.exports.default_configuration = _ViewConfiguration;
