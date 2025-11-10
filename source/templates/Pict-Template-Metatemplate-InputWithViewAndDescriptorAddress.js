const libPictTemplate = require('pict-template');

/**
 * This is a template that will generate a dynamic input using a provided dynamic view (by hash)
 */
class PictTemplateInputWithViewAndDescriptorAddressTemplate extends libPictTemplate
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
		/** @type {import('pict') & { ManifestFactory: import('../services/ManifestFactory.js'), DataFormat: any }} */
		this.fable;
		/** @type {any} */
		this.log;

		this.addPattern('{~InputWithViewAndDescriptorAddress:', '~}');
		this.addPattern('{~IWVDA:', '~}');

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
			this.log.trace(`PICT Metacontroller Template [InputWithViewAndDescriptorAddress]::[${tmpHash}]`);
		}

		let tmpViewHash;
		let tmpDescriptorAddress;

		// This is just a simple 2 part hash (the view hash and the descriptor address)
		let tmpHashTemplateSeparator = tmpHash.split(':');
		if (tmpHashTemplateSeparator.length < 2)
		{
			this.log.warn(`InputWithViewAndDescriptorAddress template requires two parameters (ViewHash and DescriptorAddress) [${tmpHash}]`);
			return '';
		}
		tmpViewHash = tmpHashTemplateSeparator[0];
		tmpDescriptorAddress = tmpHashTemplateSeparator[1];

		const tmpInput = this.resolveStateFromAddress(tmpDescriptorAddress, pRecord, pContextArray, null, pScope, pState);

		if (!tmpInput || typeof tmpInput !== 'object' || Array.isArray(tmpInput) || !tmpInput.Address)
		{
			this.log.warn(`InputWithViewAndDescriptorAddress template requires a valid input object at address [${tmpDescriptorAddress}]`);
			return '';
		}

		this._shoreUpDescriptor(tmpInput);

		this.currentInputIndex++;

		const tmpInputView = this.pict.views[tmpViewHash];

		if (!tmpInputView || !tmpInputView.sectionManifest || typeof tmpInputView.getRow !== 'function')
		{
			this.log.warn(`InputWithViewAndDescriptorAddress template requires a valid dynamic View hash [${tmpHash}]`);
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
			this.log.trace(`PICT Metacontroller Template [InputWithViewAndDescriptorAddress]::[${tmpHash}]`);
		}

		let tmpViewHash;
		let tmpDescriptorAddress;

		// This is just a simple 2 part hash (the view hash and the descriptor address)
		let tmpHashTemplateSeparator = tmpHash.split(':');
		if (tmpHashTemplateSeparator.length < 2)
		{
			this.log.warn(`InputWithViewAndDescriptorAddress template requires two parameters (ViewHash and DescriptorAddress) [${tmpHash}]`);
			return fCallback(null, '');
		}
		tmpViewHash = tmpHashTemplateSeparator[0];
		tmpDescriptorAddress = tmpHashTemplateSeparator[1];

		const tmpInput = this.resolveStateFromAddress(tmpDescriptorAddress, pRecord, pContextArray, null, pScope, pState);

		this._shoreUpDescriptor(tmpInput);

		this.currentInputIndex++;

		const tmpInputView = this.pict.views[tmpViewHash];

		if (!tmpInputView || !tmpInputView.sectionManifest || typeof tmpInputView.getRow !== 'function')
		{
			this.log.warn(`InputWithViewAndDescriptorAddress template requires a valid dynamic View hash [${tmpHash}]`);
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

	_shoreUpDescriptor(pDescriptor)
	{
		if (!pDescriptor || typeof pDescriptor !== 'object' || Array.isArray(pDescriptor))
		{
			throw new Error('Invalid descriptor object provided to shoreUpDescriptor');
		}
		if (!pDescriptor.DataAddress)
		{
			pDescriptor.DataAddress = pDescriptor.Address;
		}
		if (!pDescriptor.Hash)
		{
			pDescriptor.Hash = this.fable.DataFormat.sanitizeObjectKey(pDescriptor.Address);
		}
		if (!pDescriptor.Name)
		{
			pDescriptor.Name = pDescriptor.Hash;
		}
		if (!pDescriptor.DataType)
		{
			pDescriptor.DataType = 'String';
		}
		if (!pDescriptor.PictForm)
		{
			pDescriptor.PictForm = { };
		}
		if (!pDescriptor.PictForm.InformaryDataAddress)
		{
			pDescriptor.PictForm.InformaryDataAddress = pDescriptor.DataAddress;
		}
		if (pDescriptor.PictForm.GroupIndex == null)
		{
			pDescriptor.PictForm.GroupIndex = 0;
		}
		if (pDescriptor.PictForm.Row == null)
		{
			pDescriptor.PictForm.Row = 0;
		}
	}
}

module.exports = PictTemplateInputWithViewAndDescriptorAddressTemplate;
