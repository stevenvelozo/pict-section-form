const libPictTemplate = require('pict-template');

/**
 * This is a template that will generate a Metatemplate input, for manual use of metatemplates.
 */
class PictTemplateGetViewSchemaValue extends libPictTemplate
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

		this.addPattern('{~SchemaValue:', '~}');
		this.addPattern('{~SV:', '~}');
	}

	/**
	 * Renders a view managed by the metacontroller based on the manifest schema address.
	 *
	 * @param {string} pTemplateHash - The schema hash of the control.
	 * @param {object} pRecord - The record object.
	 * @param {array} pContextArray - The context array.
	 * @param {any} [pScope] - A sticky scope that can be used to carry state and simplify template
	 * @param {any} [pState] - A catchall state object for plumbing data through template processing.
	 * @returns {string} - The rendered template.
	 */
	render(pTemplateHash, pRecord, pContextArray, pScope, pState)
	{
		return this.renderAsync(pTemplateHash, pRecord, null, pContextArray, pScope, pState);
	}

	/**
	 * Renders a view managed by the metacontroller based on the manifest schema address.
	 *
	 * @param {string} pTemplateHash - The schema hash of the control.
	 * @param {object} pRecord - The record object.
	 * @param {function | null} fCallback - The callback function.
	 * @param {array} pContextArray - The context array.
	 * @param {any} [pScope] - A sticky scope that can be used to carry state and simplify template
	 * @param {any} [pState] - A catchall state object for plumbing data through template processing.
	 * @returns {string | undefined} - The rendered template or undefined if callback is provided.
	 */
	renderAsync(pTemplateHash, pRecord, fCallback, pContextArray, pScope, pState)
	{
		const [ tmpSchemaAddress, tmpTemplateHash ] = pTemplateHash.trim().split('^');
		/** @type{import('../views/Pict-View-Form-Metacontroller.js')} */
		const metacontroller = this.pict.views.PictFormMetacontroller;
		/** @type {import('./Pict-Template-ControlFromDynamicManifest.js').Manyfest} */
		const manifest = metacontroller ? metacontroller.manifest : this.pict.manifest;
		const descriptor = manifest.getDescriptor(tmpSchemaAddress);
		if (!descriptor)
		{
			this.log.error(`PictTemplateGetViewSchemaValue: Cannot find descriptor for address [${tmpSchemaAddress}]`);
			if (typeof fCallback === 'function')
			{
				return fCallback(null, '');
			}
			return '';
		}
		/** @type {import('../views/Pict-View-DynamicForm.js')} */
		const tmpView = this.pict.views[descriptor.PictForm.ViewHash];

		const value = tmpView.getValueByHash(tmpSchemaAddress);

		if (tmpTemplateHash)
		{
			const tmpRecord = { Value: value, ParentRecord: pRecord, View: tmpView, Descriptor: descriptor };
			if (typeof fCallback !== 'function')
			{
				return this.pict.parseTemplateByHash(tmpTemplateHash, tmpRecord, null, pContextArray, pScope, pState);
			}
			return this.pict.parseTemplateByHash(tmpTemplateHash, tmpRecord,
				(pError, pValue) =>
				{
					if (pError)
					{
						return fCallback(pError, '');
					}
					return fCallback(null, pValue);
				}, pContextArray, pScope, pState);
		}

		if (typeof(fCallback) === 'function')
		{
			fCallback(null, value ? String(value) : '');
		}
		else
		{
			return value ? String(value) : '';
		}
	}
}

module.exports = PictTemplateGetViewSchemaValue;
