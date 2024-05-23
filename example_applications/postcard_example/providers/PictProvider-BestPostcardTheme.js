const libPictFormSection = require('../../../source/Pict-Section-Form.js');

const _Theme = (
{
	"TemplatePrefix": "Postcard-Theme",

	"Templates":
		[
			{
				"HashPostfix": "-Template-Input-DataType-String",
				"Template": /*HTML*/`
						<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
						<span style="font-weight: bold; background-color: #efffef;">{~D:Record.Name~}:</span> <input type="text" id="{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}" name="{~D:Record.Name~}" data-i-form="{~D:Context[0].formID~}" data-i-datum="{~D:Record.PictForm.InformaryDataAddress~}" value="">
						<!-- <p>{~D:Record.Description~}</p> -->
	`
			},
			// -Form-Template-Input-DataType-Number
			{
				"HashPostfix": "-Template-Input-DataType-Number",
				"Template": /*HTML*/`
						<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
						<span style="background-color: #efefef;">{~D:Record.Name~}:</span> <input type="Number" id="{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}" name="{~D:Record.Name~}" data-i-form="{~D:Context[0].formID~}" data-i-datum="{~D:Record.PictForm.InformaryDataAddress~}" value="">
						<!-- <p>{~D:Record.Description~}</p> -->
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