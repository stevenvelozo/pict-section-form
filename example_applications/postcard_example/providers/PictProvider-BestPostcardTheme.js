const libPictFormSection = require('../../../source/Pict-Section-Form.js');

const _Theme = (
{
	"TemplatePrefix": "Postcard-Theme",

	"Templates":
		[
			{
				"HashPostfix": "-Template-Form-Container-Header",
				"Template": /*HTML*/`
<!-- Pict Form Metacontroller container Header

  ;,//;,    ,;/
 o:::::::;;///
>::::::::;;\\\
  ''\\\\'" ';\

Glug glug CUSTOMIZED glug Oo... -->
<div id="Pict-{~D:Context[0].UUID~}-FormContainer" class="pict-form">`
			},
			{
				"HashPostfix": "-Template-Wrap-Prefix",
				"Template": /*HTML*/` `
			},
			{
				"HashPostfix": "-Template-Wrap-Postfix",
				"Template": /*HTML*/` `
			},


			{
				"HashPostfix": "-Template-Section-Prefix",
				"Template": /*HTML*/`
<form class="pure-form pure-form-stacked">
    <fieldset>
	`
			},
			{
				"HashPostfix": "-Template-Section-Postfix",
				"Template": /*HTML*/`
    </fieldset>
</form>
	`
			},


			{
				"HashPostfix": "-Template-Group-Prefix",
				"Template": /*HTML*/`
        <legend>{~D:Record.Name~}</legend>
        <div class="pure-g" {~D:Record.Macro.PictFormLayout~}>
	`
			},
			{
				"HashPostfix": "-Template-Row-Prefix",
				"Template": /*HTML*/`
					<div>
	`
			},
			{
				"HashPostfix": "-Template-Row-Postfix",
				"Template": /*HTML*/` `
			},
			{
				"HashPostfix": "-Template-Group-Postfix",
				"Template": /*HTML*/` `
			},


			/*
			* [ Input Templates ]
			*/
			{
				"HashPostfix": "-Template-Input",
				"Template": /*HTML*/`
            <div class="pure-u-1 pure-u-md-1-3">
                <label {~D:Record.Macro.HTMLForID~}>{~D:Record.Name~}:</label>
                <input type="text" {~D:Record.Macro.HTMLID~} {~D:Record.Macro.InputFullProperties~} class="pure-u-23-24" />
            </div>
	`
			},
			{
				"HashPostfix": "-Template-Input-DataType-String",
				"Template": /*HTML*/`
            <div class="pure-u-1 pure-u-md-1-3">
                <label {~D:Record.Macro.HTMLForID~}>{~D:Record.Name~}:</label>
                <input type="text" {~D:Record.Macro.HTMLID~} {~D:Record.Macro.InputFullProperties~} class="pure-u-23-24" />
            </div>
	`
			},
			{
				"HashPostfix": "-Template-Input-DataType-Number",
				"Template": /*HTML*/`
            <div class="pure-u-1 pure-u-md-1-3">
                <label {~D:Record.Macro.HTMLForID~}>{~D:Record.Name~}:</label>
                <input type="number" {~D:Record.Macro.HTMLID~} {~D:Record.Macro.InputFullProperties~} class="pure-u-23-24" />
            </div>
	`
			},
			{
				"HashPostfix": "-Template-Input-InputType-TextArea",
				"Template": /*HTML*/`
            <div class="pure-u-1 pure-u-md-1-3">
                <label {~D:Record.Macro.HTMLForID~}>{~D:Record.Name~}:</label>
				<textarea {~D:Record.Macro.HTMLID~} {~D:Record.Macro.InputFullProperties~} class="pure-u-23-24"></textarea>
            </div>

	`
			},
			{
				"HashPostfix": "-Template-Input-InputType-PostKardSignature",
				"Template": /*HTML*/`
            <div class="pure-u-1 pure-u-md-1-3">
                <label {~D:Record.Macro.HTMLForID~}><em>{~D:Record.Name~}:</em></label>
				<input type="text" {~D:Record.Macro.CustomPictSettingsProperty~} {~D:Record.Macro.DirectAssignment~} {~D:Record.Macro.HTMLID~} {~D:Record.Macro.InputFullProperties~} class="pure-u-23-24" />
				<a href="#" onclick="{~P~}.views['{~D:Context[0].Hash~}'].inputEvent('{~D:Record.Hash~}', 'BestEventEvarrrr')" class="pure-button">Sign</a>
            </div>
	`
			}
		]});

class PostcardTheme extends libPictFormSection.PictFormTemplateProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, pOptions, {MetaTemplateSet:_Theme});
		super(pFable, tmpOptions, pServiceHash);
	}

	/**
	 * Injects a template set into Pict for the Dynamic Form Section Provider.
	 *
	 * The TemplateSet object expects to have a `TemplatePrefix` and `Templates` property.
	 *
	 * The `TemplatePrefix` is used to prefix the hash of the template.
	 *
	 * The `Templates` property is an array of objects with the following properties:
	 * - `HashPostfix` - The postfix to be added to the template hash.  This defines which dynamic template in the Layout it represents.
	 * - `Template` - The template string to be injected.
	 * - `DefaultInputExtensions` - An optional array of default input extensions to be added to the Dynamic Input provider.
	 *
	 * The context of the template *is not the data*.  The template context is one of these five things depending on the layout layer:
	 * - `Form` - The form object.
	 * - `Section` - The section object.
	 * - `Group` - The group object.
	 * - `Row` - The row object.
	 * - `Input` - The input object.
	 *
	 * @param {Object} pTemplateSet - The template set to be injected.
	 */
	injectTemplateSet(pTemplateSet)
	{
		this.pict.TemplateProvider.addTemplate('CustomTemplateField1', '<div id="customTemplate">{~D:Record.Value~} ({~D:Record.View.Hash~})</div>');
		return super.injectTemplateSet(pTemplateSet);
	}
}

module.exports = PostcardTheme;
