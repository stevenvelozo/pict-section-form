const libPictFormSection = require('../../../source/Pict-Section-Form.js');

const _Theme = (
{
	"TemplatePrefix": "Postcard-Theme",

	"Templates":
		[
			/*
			*
			* [ Section Wrap Templates ]
			*
			*/
			// -Form-Template-Wrap-Prefix
			{
				"HashPostfix": "-Template-Wrap-Prefix",
				"Template": /*HTML*/`
		<!-- Pict Form Wrap Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] -->
	`
			},
			// -Form-Template-Wrap-Postfix
			{
				"HashPostfix": "-Template-Wrap-Postfix",
				"Template": /*HTML*/`
		<!-- Pict Form Wrap Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] -->
	`
			},


			// -Form-Template-Section-Prefix
			{
				"HashPostfix": "-Template-Section-Prefix",
				"Template": /*HTML*/`
			<!-- Form Section Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
<form class="pure-form pure-form-stacked">
    <fieldset>
	`
			},
			// -Form-Template-Section-Postfix
			{
				"HashPostfix": "-Template-Section-Postfix",
				"Template": /*HTML*/`
    </fieldset>
</form>
			<!-- Form Section Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
	`
			},


			/*
			*
			* [ Group and Row Templates (default) ]
			*
			*/
			// -Form-Template-Group-Prefix
			{
				"HashPostfix": "-Template-Group-Prefix",
				"Template": /*HTML*/`
				<!-- Form Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
        <legend>{~D:Record.Name~}</legend>
        <div class="pure-g">
	`
			},
			// -Form-Template-Row-Prefix
			{
				"HashPostfix": "-Template-Row-Prefix",
				"Template": /*HTML*/`
					<!-- Form Template Row Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
					<div>
	`
			},
			// -Form-Template-Row-Postfix
			{
				"HashPostfix": "-Template-Row-Postfix",
				"Template": /*HTML*/`
					<!-- Form Template Row Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
	`
			},
			// -Form-Template-Group-Postfix
			{
				"HashPostfix": "-Template-Group-Postfix",
				"Template": /*HTML*/`
				<!-- Form Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
	`
			},


			/*
			*
			* [ Input Templates (Default) ]
			*
			*/
			// -Form-Template-Input
			{
				"HashPostfix": "-Template-Input",
				"Template": /*HTML*/`
						<!-- DEFAULT Input {~"D:Record.Hash~} {~D:Record.DataType~} -->
            <div class="pure-u-1 pure-u-md-1-3">
                <label {~D:Record.Macro.HTMLForID~}>{~D:Record.Name~}:</label>
                <input type="text" {~D:Record.Macro.HTMLID~} {~D:Record.Macro.InputFullProperties~} class="pure-u-23-24" />
            </div>
	`
			},
			// -Form-Template-Input-DataType-String
			{
				"HashPostfix": "-Template-Input-DataType-String",
				"Template": /*HTML*/`
						<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
            <div class="pure-u-1 pure-u-md-1-3">
                <label {~D:Record.Macro.HTMLForID~}>{~D:Record.Name~}:</label>
                <input type="text" {~D:Record.Macro.HTMLID~} {~D:Record.Macro.InputFullProperties~} class="pure-u-23-24" />
            </div>
	`
			},
			// -Form-Template-Input-DataType-Number
			{
				"HashPostfix": "-Template-Input-DataType-Number",
				"Template": /*HTML*/`
						<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
            <div class="pure-u-1 pure-u-md-1-3">
                <label {~D:Record.Macro.HTMLForID~}>{~D:Record.Name~}:</label>
                <input type="number" {~D:Record.Macro.HTMLID~} {~D:Record.Macro.InputFullProperties~} class="pure-u-23-24" />
            </div>
	`
			},
			// -Form-Template-Input-InputType-TextArea
			{
				"HashPostfix": "-Template-Input-InputType-TextArea",
				"Template": /*HTML*/`
						<!-- InputType TextArea {~D:Record.Hash~} {~D:Record.DataType~} -->
            <div class="pure-u-1 pure-u-md-1-3">
                <label {~D:Record.Macro.HTMLForID~}>{~D:Record.Name~}:</label>
				<textarea {~D:Record.Macro.HTMLID~} {~D:Record.Macro.InputFullProperties~} class="pure-u-23-24"></textarea>
            </div>

	`
			}
		]}); // End of _Theme

class PostcardTheme extends libPictFormSection.PictFormTemplateProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, pOptions, {MetaTemplateSet:_Theme});
		super(pFable, tmpOptions, pServiceHash);
	}
}

module.exports = PostcardTheme;