const libPictTemplate = require('pict-template');

/**
 * This is a template that will generate a Metatemplate input, for manual use of metatemplates.
 */
class PictTemplateGetViewSchemaValueByHash extends libPictTemplate
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

		this.addPattern('{~SchemaValueForHash:', '~}');
		this.addPattern('{~SVH:', '~}');
	}

	/**
	 * Renders a view managed by the metacontroller based on the manifest schema address.
	 *
	 * @param {string} pTemplateHash - The schema hash of the control.
	 * @param {object} pRecord - The record object.
	 * @param {array} pContextArray - The context array.
	 * @returns {string} - The rendered template.
	 */
	render(pTemplateHash, pRecord, pContextArray)
	{
		return this.renderAsync(pTemplateHash, pRecord, null, pContextArray);
	}

	/**
	 * Renders a view managed by the metacontroller based on the manifest schema address.
	 *
	 * @param {string} pTemplateHash - The schema hash of the control.
	 * @param {object} pRecord - The record object.
	 * @param {function} fCallback - The callback function.
	 * @param {array} pContextArray - The context array.
	 * @returns {string} - The rendered template.
	 */
	renderAsync(pTemplateHash, pRecord, fCallback, pContextArray)
	{
		const tmpMetatemplateGenerator = this.pict.providers.MetatemplateGenerator;
		const tmpHash = pTemplateHash.trim();
		/** @type{import('../views/Pict-View-Form-Metacontroller.js')} */
		const metacontroller = this.pict.views.PictFormMetacontroller;
		/** @type {import('./Pict-Template-ControlFromDynamicManifest.js').Manyfest} */
		const manifest = metacontroller.manifest;
		const descriptor = manifest.getDescriptorByHash(tmpHash);
		if (!descriptor)
		{
			this.log.error(`PictTemplateGetViewSchemaValueByHash: Cannot find descriptor for hash [${tmpHash}]`);
			return '';
		}
		/** @type {import('../views/Pict-View-DynamicForm.js')} */
		const tmpView = this.pict.views[descriptor.PictForm.ViewHash];

		const value = tmpView.getValueByHash(tmpHash);

		return value ? String(value) : '';
	}
}

module.exports = PictTemplateGetViewSchemaValueByHash;
