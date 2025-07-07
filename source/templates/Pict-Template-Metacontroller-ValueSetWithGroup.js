const libPictTemplate = require('pict-template');

/**
 * This is a template that will take a value set and render a template for each value in the set.
 *
 * It passes along additional context (the metacontroller group) for dynamic programming tables.
 */
class PictTemplateMetacontrollerValueSet extends libPictTemplate
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
		/** @type {import('pict')} */
		this.fable;
		/** @type {any} */
		this.log;

		this.addPattern('{~MetacontrollerTemplateValueSet:', '~}');
		this.addPattern('{~MTVS:', '~}');
	}

	/**
	 * Renders the PICT Metacontroller Template.
	 *
	 * @param {string} pTemplateHash - The template hash.
	 * @param {object} pRecord - The record object.
	 * @param {array} pContextArray - The context array.
	 * @param {any} [pScope] - A sticky scope that can be used to carry state and simplify template
	 * @returns {string} - The rendered template.
	 */
	render(pTemplateHash, pRecord, pContextArray, pScope)
	{
		let tmpHash = pTemplateHash.trim();
		let tmpData = (typeof (pRecord) === 'object') ? pRecord : {};

		if (this.pict.LogNoisiness > 4)
		{
			this.log.trace(`PICT Metacontroller Template [MetacontrollerTemplateValueSet]::[${tmpHash}] with tmpData:`, tmpData);
		}
		else if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PICT Metacontroller Template [MetacontrollerTemplateValueSet]::[${tmpHash}]`);
		}

		let tmpGroupIndex;
		let tmpTemplateHash;
		let tmpAddressOfData;

		// This is just a simple 2 part hash (the entity and the ID)
		let tmpHashTemplateSeparator = tmpHash.split(':');
		if (tmpHashTemplateSeparator.length < 3)
		{
			this.log.warn(`Metacontroller template requires 3 parameters [${tmpHash}]`);
			return '';
		}
		tmpTemplateHash = tmpHashTemplateSeparator[0];
		tmpGroupIndex = tmpHashTemplateSeparator[1];
		tmpAddressOfData = tmpHashTemplateSeparator[2];

		tmpData = this.resolveStateFromAddress(tmpAddressOfData, tmpData, pContextArray, null, pScope);

		let tmpDataValueSet = [];
		if (Array.isArray(tmpData))
		{
			for (let i = 0; i < tmpData.length; i++)
			{
				tmpDataValueSet.push({ Value: tmpData[i], Key: i, Group: tmpGroupIndex });
			}
		}
		else if (typeof (tmpData) === 'object')
		{
			let tmpValueKeys = Object.keys(tmpData);
			for (let i = 0; i < tmpValueKeys.length; i++)
			{
				tmpDataValueSet.push({ Value: tmpData[tmpValueKeys[i]], Key: tmpValueKeys[i], Group: tmpGroupIndex });
			}
		}
		else
		{
			tmpDataValueSet.push({ Value: tmpData });
		}
		tmpData = tmpDataValueSet;

		if (!tmpData)
		{
			// No address was provided, just render the template with what this template has.
			return this.pict.parseTemplateSetByHash(tmpTemplateHash, pRecord, null, pContextArray, pScope);
		}
		else
		{
			return this.pict.parseTemplateSetByHash(tmpTemplateHash, tmpData, null, pContextArray, pScope);
		}
	}

	/**
	 * Asynchronously renders a template with the provided template hash, record, callback, and context array.
	 *
	 * @param {string} pTemplateHash - The template hash to render.
	 * @param {object} pRecord - The record object to use for rendering the template.
	 * @param {function} fCallback - The callback function to invoke after rendering the template.
	 * @param {array} pContextArray - The context array to use for resolving the data.
	 * @param {any} [pScope] - A sticky scope that can be used to carry state and simplify template
	 *
	 * @return {void}
	 */
	renderAsync(pTemplateHash, pRecord, fCallback, pContextArray, pScope)
	{
		let tmpHash = pTemplateHash.trim();
		let tmpData = (typeof (pRecord) === 'object') ? pRecord : {};
		let tmpCallback = (typeof (fCallback) === 'function') ? fCallback : () => { return ''; };

		if (this.pict.LogNoisiness > 4)
		{
			this.log.trace(`PICT Template [fTemplateValueSetRenderAsync]::[${tmpHash}] with tmpData:`, tmpData);
		}
		else if (this.pict.LogNoisiness > 0)
		{
			this.log.trace(`PICT Template [fTemplateValueSetRenderAsync]::[${tmpHash}]`);
		}

		let tmpTemplateFromMapHash;
		let tmpAddressOfData;

		// This is a 3 part hash with the map address and the key address both
		let tmpTemplateHashPart = tmpHash.split(':');

		if (tmpTemplateHashPart.length < 2)
		{
			this.log.trace(`PICT TemplateFromMap [fTemplateRenderAsync]::[${tmpHash}] failed because there were not three stanzas in the expression [${pTemplateHash}]`);
			return fCallback(null, '');
		}

		tmpTemplateFromMapHash = tmpTemplateHashPart[0]
		tmpAddressOfData = tmpTemplateHashPart[1];

		// No TemplateFromMap hash
		if (!tmpTemplateFromMapHash)
		{
			this.log.warn(`Pict: TemplateFromMap Render Async: TemplateFromMapHash not resolved for [${tmpHash}]`);
			return fCallback(null, '');
		}

		// Now resolve the data
		tmpData = this.resolveStateFromAddress(tmpAddressOfData, tmpData, pContextArray, null, pScope);

		let tmpDataValueSet = [];
		if (Array.isArray(tmpData))
		{
			for (let i = 0; i < tmpData.length; i++)
			{
				tmpDataValueSet.push({ Value: tmpData[i], Key: i, });
			}
		}
		else if (typeof (tmpData) === 'object')
		{
			let tmpValueKeys = Object.keys(tmpData);
			for (let i = 0; i < tmpValueKeys.length; i++)
			{
				tmpDataValueSet.push({ Value: tmpData[tmpValueKeys[i]], Key: tmpValueKeys[i] });
			}
		}
		else
		{
			tmpDataValueSet.push({ Value: tmpData });
		}
		tmpData = tmpDataValueSet;

		if (!tmpData)
		{
			// No address was provided, just render the template with what this template has.
			// The async portion of this is a mind bender because of how entry can happen dynamically from templates
			this.pict.parseTemplateSetByHash(tmpTemplateFromMapHash, pRecord,
				(pError, pValue) =>
				{
					if (pError)
					{
						return tmpCallback(pError, '');
					}
					return tmpCallback(null, pValue);
				}, pContextArray, pScope);
			return;
		}
		else
		{
			this.pict.parseTemplateSetByHash(tmpTemplateFromMapHash, tmpData,
				(pError, pValue) =>
				{
					if (pError)
					{
						return tmpCallback(pError, '');
					}
					return tmpCallback(null, pValue);
				}, pContextArray, pScope);
			return;
		}
	}
}

module.exports = PictTemplateMetacontrollerValueSet;
