const libPictTemplate = require('pict-template');

/**
 * This is a template that will generate a Metatemplate input, for manual use of metatemplates.
 */
class PictTemplateMetatemplateInputTemplate extends libPictTemplate
{
	/**
	 * @param {Object} pFable - The Fable Framework instance
	 * @param {Object} pOptions - The options for the service
	 * @param {String} pServiceHash - The hash of the service
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {import('pict')} */
		this.pict;
		/** @type {import('pict') & { ManifestFactory: import('../services/ManifestFactory.js') }} */
		this.fable;
		/** @type {any} */
		this.log;

		this.addPattern('{~MetaTemplateInputWithHashAddress:', '~}');
		this.addPattern('{~MTIWHA:', '~}');

		this.currentInputIndex = 0;
	}

	/**
	 * Renders the PICT Metacontroller Template.  The Record reference is ignored in this template.
	 *
	 * @param {string} pTemplateHash - The template hash.
	 * @param {object} pRecord - The record object.
	 * @param {array} pContextArray - The context array.
	 * @param {any} [pScope] - A sticky scope that can be used to carry state and simplify template
	 * @param {any} [pState] - A catchall state object for plumbing data through template processing.
	 * @returns {string} - The rendered template.
	 */
	render(pTemplateHash, pRecord, pContextArray, pScope, pState)
	{
		let tmpHash = pTemplateHash.trim();
		let tmpMetatemplateGenerator = this.pict.providers.MetatemplateGenerator;

		if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PICT Metacontroller Template [MetaTemplateInput]::[${tmpHash}]`);
		}

		let tmpInputName;
		let tmpInputAddress;
		let tmpDataType;
		let tmpInputType;

		// This is just a simple 2 part hash (the entity and the ID)
		let tmpHashTemplateSeparator = tmpHash.split(':');
		if (tmpHashTemplateSeparator.length < 2)
		{
			this.log.warn(`MetaTemplateInput template requires at least parameters (Address and DataType) [${tmpHash}]`);
			return '';
		}
		tmpInputName = tmpHashTemplateSeparator[0];
		// This template expects this address to be a location to get the hash from...
		//FIXME: should pScope here be the eventual view so the scope is consistent?
		tmpInputAddress = this.resolveStateFromAddress(tmpHashTemplateSeparator[1], pRecord, pContextArray, null, pScope, pState);
		if ((typeof(tmpInputAddress) !== 'string') || tmpInputAddress.length < 1)
		{
			this.log.warn(`MetaTemplateInput template requires a valid Address for an Address in the second parameter [${tmpHash}]`);
			return '';
		}
		tmpDataType = tmpHashTemplateSeparator[2];
		if (tmpHashTemplateSeparator.length > 3)
		{
			tmpInputType = tmpHashTemplateSeparator[3];
		}
		// Construct a fake input object
		const tmpInput =
		{
			Address: tmpInputAddress,
			DataAddress: tmpInputAddress,
			Name: tmpInputName,
			Hash: this.fable.ManifestFactory.sanitizeObjectKey(tmpInputAddress),
			DataType: tmpDataType,
			PictForm:
			{
				InformaryDataAddress: tmpInputAddress,
				GroupIndex: 0,
				Row: 0
			},
		};

		this.currentInputIndex++;

		if (tmpInputType)
		{
			tmpInput.PictForm.InputType = tmpInputType;
		}

		// Check to see if the input is already in the manifest
		let tmpRow = tmpMetatemplateGenerator.dynamicInputView.getRow(0, 0);

		for (let i = 0; i < tmpRow.Inputs.length; i++)
		{
			if (tmpRow.Inputs[i].Hash === tmpInput.Hash)
			{
				const tmpInput = tmpRow.Inputs[i];
				return this.pict.parseTemplate(tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(tmpMetatemplateGenerator.dynamicInputView,
					tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("0","0","${tmpInput.PictForm.InputIndex}")`), tmpInput, null, [tmpMetatemplateGenerator.dynamicInputView], tmpMetatemplateGenerator.dynamicInputView, pState);
			}
		}

		// It isn't already in the manifest, so add it.
		tmpInput.PictForm.InputIndex = tmpRow.Inputs.length;
		tmpMetatemplateGenerator.dynamicInputView.sectionManifest.addDescriptor(tmpInput.Address, tmpInput);
		tmpRow.Inputs.push(tmpInput);

		this.pict.providers.MetatemplateMacros.buildInputMacros(tmpMetatemplateGenerator.dynamicInputView, tmpInput);

		// Now generate the metatemplate
		const tmpTemplate = tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(tmpMetatemplateGenerator.dynamicInputView,
			tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("0","0","${tmpInput.PictForm.InputIndex}")`);

		// Now parse it and return it.
		return this.pict.parseTemplate(tmpTemplate, tmpInput, null, [tmpMetatemplateGenerator.dynamicInputView], tmpMetatemplateGenerator.dynamicInputView, pState);
	}

	/**
	 * Renders the PICT Metacontroller Template.  The Record reference is ignored in this template.
	 *
	 * @param {string} pTemplateHash - The schema hash of the control.
	 * @param {object} pRecord - The record object.
	 * @param {function | null} fCallback - The callback function.
	 * @param {array} pContextArray - The context array.
	 * @param {any} [pScope] - A sticky scope that can be used to carry state and simplify template
	 * @param {any} [pState] - A catchall state object for plumbing data through template processing.
	 *
	 * @return {void}
	 */
	renderAsync(pTemplateHash, pRecord, fCallback, pContextArray, pScope, pState)
	{
		let tmpHash = pTemplateHash.trim();
		let tmpMetatemplateGenerator = this.pict.providers.MetatemplateGenerator;

		if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PICT Metacontroller Template [MetaTemplateInput]::[${tmpHash}]`);
		}

		let tmpInputName;
		let tmpInputAddress;
		let tmpDataType;
		let tmpInputType;

		// This is just a simple 2 part hash (the Address and the DataType)
		let tmpHashTemplateSeparator = tmpHash.split(':');
		if (tmpHashTemplateSeparator.length < 2)
		{
			this.log.warn(`MetaTemplateInput template requires at least parameters (Address and DataType) [${tmpHash}]`);
			return fCallback(null, '');
		}
		tmpInputName = tmpHashTemplateSeparator[0];
		// This template expects this address to be a location to get the hash from...
		//FIXME: should pScope here be the eventual view so the scope is consistent?
		tmpInputAddress = this.resolveStateFromAddress(tmpHashTemplateSeparator[1], pRecord, pContextArray, null, pScope, pState);
		if ((typeof(tmpInputAddress) !== 'string') || tmpInputAddress.length < 1)
		{
			this.log.warn(`MetaTemplateInput template requires a valid Address for an Address in the second parameter [${tmpHash}]`);
			return fCallback(null, '');
		}
		tmpDataType = tmpHashTemplateSeparator[2];
		if (tmpHashTemplateSeparator.length > 3)
		{
			tmpInputType = tmpHashTemplateSeparator[3];
		}
		// Construct a fake input object
		let tmpInput = {
			Address: tmpInputAddress,
			DataAddress: tmpInputAddress,
			Name: tmpInputName,
			Hash: this.fable.ManifestFactory.sanitizeObjectKey(tmpInputAddress),
			DataType: tmpDataType,
			PictForm: {
				InformaryDataAddress: tmpInputAddress,
				GroupIndex: 0,
				Row: 0
			}
		};

		this.currentInputIndex++;

		if (tmpInputType)
		{
			tmpInput.PictForm.InputType = tmpInputType;
		}

		// Check to see if the input is already in the manifest
		let tmpRow = tmpMetatemplateGenerator.dynamicInputView.getRow(0, 0);

		for (let i = 0; i < tmpRow.Inputs.length; i++)
		{
			if (tmpRow.Inputs[i].Hash === tmpInput.Hash)
			{
				let tmpInput = tmpRow.Inputs[i];
				let tmpTemplate = tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(tmpMetatemplateGenerator.dynamicInputView,
					tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("0","0","${tmpInput.PictForm.InputIndex}")`);
				this.pict.parseTemplate(tmpTemplate, tmpInput, fCallback, [tmpMetatemplateGenerator.dynamicInputView], tmpMetatemplateGenerator.dynamicInputView, pState);
				return;
			}
		}

		// It isn't already in the manifest, so add it.
		tmpInput.PictForm.InputIndex = tmpRow.Inputs.length;
		tmpMetatemplateGenerator.dynamicInputView.sectionManifest.addDescriptor(tmpInput.Address, tmpInput);
		tmpRow.Inputs.push(tmpInput);

		this.pict.providers.MetatemplateMacros.buildInputMacros(tmpMetatemplateGenerator.dynamicInputView, tmpInput);

		// Now generate the metatemplate
		const tmpTemplate = tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(tmpMetatemplateGenerator.dynamicInputView,
			tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("0","0","${tmpInput.PictForm.InputIndex}")`);

		this.pict.parseTemplate(tmpTemplate, tmpInput, fCallback, [tmpMetatemplateGenerator.dynamicInputView], tmpMetatemplateGenerator.dynamicInputView, pState);
		return;
	}
}

module.exports = PictTemplateMetatemplateInputTemplate;
