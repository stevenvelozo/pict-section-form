const libPictViewClass = require('pict-view');

const _DefaultConfiguration =
{
	"RenderOnLoad": true,

	"DefaultRenderable": "Form-Wrap",
	"DefaultDestinationAddress": "#Form-Container-Div",

	"Templates": [
		{
			"Hash": "Form-Container",
			"Template": ""
		}
	],

	"Renderables": [
		{
			"RenderableHash": "Form-Wrap",
			"TemplateHash": "Form-Container",
			"DestinationAddress": "#Form-Container-Div"
		}
	],

	"TargetElementAddress": "#Form-Container-Div"
};

class PictSectionForm extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DefaultConfiguration, pOptions);

		super(pFable, tmpOptions, pServiceHash);

		this.initialRenderComplete = false;
	}
}

module.exports = PictSectionForm;

module.exports.default_configuration = _DefaultConfiguration;
