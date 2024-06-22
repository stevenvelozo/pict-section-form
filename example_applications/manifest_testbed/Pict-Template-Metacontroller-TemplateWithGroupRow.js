const libPictTemplate = require('pict-template');

class PictTemplateProviderTemplateWithGroupRow extends libPictTemplate
{
	/**
	 * @param {Object} pFable - The Fable Framework instance
	 * @param {Object} pOptions - The options for the service
	 * @param {String} pServiceHash - The hash of the service
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.addPattern('{~TemplateWithGroupRow:', '~}');
		this.addPattern('{~TWGR:', '~}');
	}

	render(pTemplateHash, pRecord, pContextArray)
	{
		let tmpHash = pTemplateHash.trim();
		let tmpData = (typeof (pRecord) === 'object') ? pRecord : {};

		if (this.pict.LogNoisiness > 4)
		{
			this.log.trace(`PICT Template [TemplateWithGroupRow]::[${tmpHash}] with tmpData:`, tmpData);
		}
		else if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PICT Template [TemplateWithGroupRow]::[${tmpHash}]`);
		}

		let tmpTemplateHash = false;
		let tmpAddressOfData = false;
		let tmpGroup = false;
		let tmpRow = false;

		// This is just a simple 2 part hash (the entity and the ID)
		let tmpHashTemplateSeparator = tmpHash.split(':');

		if (tmpHashTemplateSeparator.length < 3)
		{
			this.log.warn(`TemplateWithGroupRow template requires 4 parameters [${tmpHash}]`);
			return '';
		}

		tmpTemplateHash = tmpHashTemplateSeparator[0];
		tmpAddressOfData = tmpHashTemplateSeparator[1];
		tmpGroup = tmpHashTemplateSeparator[2];
		tmpRow = tmpHashTemplateSeparator[3];

		// No template hash
		if (!tmpTemplateHash)
		{
			this.log.warn(`Pict: TemplateWithGroupRow Render: TemplateHash not resolved for [${tmpHash}]`);
			return `Pict: TemplateWithGroupRow Render: TemplateHash not resolved for [${tmpHash}]`;
		}

		if (!tmpAddressOfData)
		{
			// No address was provided, just render the template with what this template has.
			return this.pict.parseTemplateByHash(tmpTemplateHash, pRecord, null, pContextArray);
		}
		else
		{
			return this.pict.parseTemplateByHash(tmpTemplateHash, this.resolveStateFromAddress(tmpAddressOfData, tmpData, pContextArray, { Group: tmpGroup, RowIndex:tmpRow }), null, pContextArray);
		}
	}

	renderAsync(pTemplateHash, pRecord, fCallback, pContextArray)
	{
		let tmpHash = pTemplateHash.trim();
		let tmpData = (typeof (pRecord) === 'object') ? pRecord : {};
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => { return ''; };

		if (this.pict.LogNoisiness > 4)
		{
			this.log.trace(`PICT Template [TemplateWithGroupRowAsync]::[${tmpHash}] with tmpData:`, tmpData);
		}
		else if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PICT Template [TemplateWithGroupRowAsync]::[${tmpHash}]`);
		}

		let tmpTemplateHash = false;
		let tmpAddressOfData = false;
		let tmpGroup = false;
		let tmpRow = false;

		// This is just a simple 2 part hash (the entity and the ID)
		let tmpHashTemplateSeparator = tmpHash.split(':');

		if (tmpHashTemplateSeparator.length < 3)
		{
			this.log.warn(`TemplateWithGroupRowAsync template requires 4 parameters [${tmpHash}]`);
			return '';
		}

		tmpTemplateHash = tmpHashTemplateSeparator[0];
		tmpAddressOfData = tmpHashTemplateSeparator[1];
		tmpGroup = tmpHashTemplateSeparator[2];
		tmpRow = tmpHashTemplateSeparator[3];

		// No template hash
		if (!tmpTemplateHash)
		{
			this.log.warn(`Pict: TemplateWithGroupRowAsync Render Async: TemplateHash not resolved for [${tmpHash}]`);
			return `Pict: TemplateWithGroupRowAsync Render Async: TemplateHash not resolved for [${tmpHash}]`;
		}

		if (!tmpAddressOfData)
		{
			// No address was provided, just render the template with what this template has.
			// The async portion of this is a mind bender because of how entry can happen dynamically from templates
			return this.pict.parseTemplateByHash(tmpTemplateHash, pRecord,
				(pError, pValue) =>
				{
					if (pError)
					{
						return tmpCallback(pError, '');
					}
					return tmpCallback(null, pValue);
				}, pContextArray);
		}
		else
		{
			return this.pict.parseTemplateByHash(tmpTemplateHash, this.resolveStateFromAddress(tmpAddressOfData, tmpData, pContextArray, { Group: tmpGroup, RowIndex:tmpRow }),
				(pError, pValue) =>
				{
					if (pError)
					{
						return tmpCallback(pError, '');
					}
					return tmpCallback(null, pValue);
				}, pContextArray);
		}
	}
}

module.exports = PictTemplateProviderTemplateWithGroupRow;
