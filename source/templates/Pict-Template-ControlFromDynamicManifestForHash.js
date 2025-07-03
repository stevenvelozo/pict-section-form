const libPictTemplate = require('pict-template');

/**
 * This is a template that will generate a Metatemplate input, for manual use of metatemplates.
 */
class PictTemplateControlFromDynamicManifest extends libPictTemplate
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

		this.addPattern('{~DynamicInputForHash:', '~}');
		this.addPattern('{~DIH:', '~}');
	}

	/**
	 * Renders a view managed by the metacontroller based on the manifest schema hash.
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
	 * Renders a view managed by the metacontroller based on the manifest schema hash.
	 *
	 * @param {string} pTemplateHash - The schema hash of the control.
	 * @param {object} pRecord - The record object.
	 * @param {function | null} fCallback - The callback function.
	 * @param {array} pContextArray - The context array.
	 * @returns {string | undefined} - The rendered template or undefined if callback is provided.
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
			this.log.error(`PictTemplateControlFromDynamicManifest: Cannot find descriptor for hash [${tmpHash}]`);
			if (typeof fCallback === 'function')
			{
				return fCallback(null, '');
			}
			return '';
		}
		const tmpView = this.pict.views[descriptor.PictForm.ViewHash];

		this.pict.providers.MetatemplateMacros.buildInputMacros(tmpView, descriptor);

		// Now generate the metatemplate
		const tmpTemplate = tmpMetatemplateGenerator.getInputMetatemplateTemplateReference(tmpView, descriptor.DataType, descriptor.PictForm.InputType,
			`getInput("${descriptor.PictForm.GroupIndex}","${descriptor.PictForm.RowIndex}","${descriptor.PictForm.InputIndex}")`);

		// Now parse it and return it.
		return this.pict.parseTemplate(tmpTemplate, descriptor, fCallback, [tmpView]);
	}
}

module.exports = PictTemplateControlFromDynamicManifest;
