const libPictTemplate = require('pict-template');

/**
 * This is a template that will generate a dynamic input using a provided dynamic view (by hash)
 */
class PictTemplateInputWithViewTemplate extends libPictTemplate
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

		this.addPattern('{~InputWithView:', '~}');
		this.addPattern('{~IWV:', '~}');

		this.currentInputIndex = 0;
	}

	/**
	 * Renders an arbitrary PICT input by hash, with a custom data type, input type and label.  The Record reference is ignored in this template.
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
			this.log.trace(`PICT Metacontroller Template [InputWithView]::[${tmpHash}]`);
		}

		let tmpViewHash;
		let tmpInputName;
		let tmpInputAddress;
		let tmpDataType;
		let tmpInputType;

		let tmpHashTemplateSeparator = tmpHash.split(':');
		if (tmpHashTemplateSeparator.length < 3)
		{
			this.log.warn(`InputWithView template requires at least three parameters (ViewHash, Address and DataType) [${tmpHash}]`);
			return '';
		}
		tmpViewHash = tmpHashTemplateSeparator[0];
		tmpInputName = tmpHashTemplateSeparator[1];
		tmpInputAddress = tmpHashTemplateSeparator[2];
		tmpDataType = tmpHashTemplateSeparator[3];
		if (tmpHashTemplateSeparator.length > 4)
		{
			tmpInputType = tmpHashTemplateSeparator[4];
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

		const tmpInputView = this.pict.views[tmpViewHash];

		if (!tmpInputView || !tmpInputView.sectionManifest || typeof tmpInputView.getRow !== 'function')
		{
			this.log.warn(`InputWithView template requires a valid dynamic View hash [${tmpHash}]`);
			return '';
		}

		// Check to see if the input is already in the manifest
		let tmpRow = tmpInputView.getRow(0, 0);

		for (let i = 0; i < tmpRow.Inputs.length; i++)
		{
			if (tmpRow.Inputs[i].Hash === tmpInput.Hash)
			{
				let tmpInput = tmpRow.Inputs[i];
				return this.pict.parseTemplate(tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(tmpInputView, tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("0","0","${tmpInput.PictForm.InputIndex}")`), tmpInput, null, [tmpInputView], tmpInputView, pState);
			}
		}

		// It isn't already in the manifest, so add it.
		tmpInput.PictForm.InputIndex = tmpRow.Inputs.length;
		tmpInputView.sectionManifest.addDescriptor(tmpInput.Address, tmpInput);
		tmpRow.Inputs.push(tmpInput);

		this.pict.providers.MetatemplateMacros.buildInputMacros(tmpInputView, tmpInput);

		// Now generate the metatemplate
		let tmpTemplate = tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(tmpInputView, tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("0","0","${tmpInput.PictForm.InputIndex}")`);

		// Now parse it and return it.
		return this.pict.parseTemplate(tmpTemplate, tmpInput, null, [tmpInputView], tmpInputView, pState);
	}

	/**
	 * Renders an arbitrary PICT input by hash, with a custom data type, input type and label.  The Record reference is ignored in this template.
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
			this.log.trace(`PICT Metacontroller Template [InputWithView]::[${tmpHash}]`);
		}

		let tmpViewHash;
		let tmpInputName;
		let tmpInputAddress;
		let tmpDataType;
		let tmpInputType;

		// This is just a simple 2 part hash (the entity and the ID)
		let tmpHashTemplateSeparator = tmpHash.split(':');
		if (tmpHashTemplateSeparator.length < 3)
		{
			this.log.warn(`InputWithView template requires at least three parameters (ViewHash, Address and DataType) [${tmpHash}]`);
			return fCallback(null, '');
		}
		tmpViewHash = tmpHashTemplateSeparator[0];
		tmpInputName = tmpHashTemplateSeparator[1];
		tmpInputAddress = tmpHashTemplateSeparator[2];
		tmpDataType = tmpHashTemplateSeparator[3];
		if (tmpHashTemplateSeparator.length > 4)
		{
			tmpInputType = tmpHashTemplateSeparator[4];
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

		const tmpInputView = this.pict.views[tmpViewHash];

		if (!tmpInputView || !tmpInputView.sectionManifest || typeof tmpInputView.getRow !== 'function')
		{
			this.log.warn(`InputWithView template requires a valid dynamic View hash [${tmpHash}]`);
			return fCallback(null, '');
		}

		// Check to see if the input is already in the manifest
		let tmpRow = tmpInputView.getRow(0, 0);

		for (let i = 0; i < tmpRow.Inputs.length; i++)
		{
			if (tmpRow.Inputs[i].Hash === tmpInput.Hash)
			{
				let tmpInput = tmpRow.Inputs[i];
				let tmpTemplate = tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(tmpInputView, tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("0","0","${tmpInput.PictForm.InputIndex}")`);
				this.pict.parseTemplate(tmpTemplate, tmpInput, fCallback, [tmpInputView], tmpInputView, pState);
				return;
			}
		}

		// It isn't already in the manifest, so add it.
		tmpInput.PictForm.InputIndex = tmpRow.Inputs.length;
		tmpInputView.sectionManifest.addDescriptor(tmpInput.Address, tmpInput);
		tmpRow.Inputs.push(tmpInput);

		this.pict.providers.MetatemplateMacros.buildInputMacros(tmpInputView, tmpInput);

		// Now generate the metatemplate
		let tmpTemplate = tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(tmpInputView, tmpInput.DataType, tmpInput.PictForm.InputType, `getInput("0","0","${tmpInput.PictForm.InputIndex}")`);

		this.pict.parseTemplate(tmpTemplate, tmpInput, fCallback, [tmpInputView], tmpInputView, pState);
		return;
	}
}

module.exports = PictTemplateInputWithViewTemplate;
