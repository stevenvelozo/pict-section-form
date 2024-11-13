const libPictTemplate = require('pict-template');

/**
 * This is a template that will generate a Metatemplate input, for manual use of metatemplates.
 */
class PictTemplateMetatemplateInput extends libPictTemplate
{
	/**
	 * @param {Object} pFable - The Fable Framework instance
	 * @param {Object} pOptions - The options for the service
	 * @param {String} pServiceHash - The hash of the service
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.addPattern('{~MetaTemplateInput:', '~}');
		this.addPattern('{~MTI:', '~}');
	}

	/**
	 * Renders the PICT Metacontroller Template.  The Record reference is ignored in this template.
	 * 
	 * @param {string} pTemplateHash - The template hash.
	 * @param {object} pRecord - The record object.
	 * @param {array} pContextArray - The context array.
	 * @returns {string} - The rendered template.
	 */
	render(pTemplateHash, pRecord, pContextArray)
	{
		let tmpHash = pTemplateHash.trim();
		let tmpMetatemplateGenerator = this.pict.providers.MetatemplateGenerator;

		if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PICT Metacontroller Template [MetaTemplateInput]::[${tmpHash}]`);
		}

		let tmpInputAddress = false;
		let tmpDataType = false;
		let tmpInputType = false;

		// This is just a simple 2 part hash (the entity and the ID)
		let tmpHashTemplateSeparator = tmpHash.split(':');
		if (tmpHashTemplateSeparator.length < 2)
		{
			this.log.warn(`MetaTemplateInput template requires at least parameters (Address and DataType) [${tmpHash}]`);
			return '';
		}
		tmpInputAddress = tmpHashTemplateSeparator[0];
		tmpDataType = tmpHashTemplateSeparator[1];
		if (tmpHashTemplateSeparator.length > 2)
		{
			tmpInputType = tmpHashTemplateSeparator[2];
		}

		// Construct a fake input object
		let tmpInput = {
			Address: tmpInputAddress,
			Hash: tmpInputAddress,
			DataType: tmpDataType,
			PictForm: {}
		};

		if (tmpInputType)
		{
			tmpInput.PictForm.InputType = tmpInputType;
		}

		tmpMetatemplateGenerator.dynamicInputView.sectionManifest.addDescriptor(tmpInput.Address, tmpInput);

		return tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(tmpMetatemplateGenerator.dynamicInputView, tmpInput.DataType, tmpInput.PictForm.InputType, `getInputByHash("${tmpInput.Hash}")`);
	}
}

module.exports = PictTemplateMetatemplateInput;
