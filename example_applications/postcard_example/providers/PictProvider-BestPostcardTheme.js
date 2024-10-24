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
  ''\\\\\'" ';\

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
}

module.exports = PostcardTheme;