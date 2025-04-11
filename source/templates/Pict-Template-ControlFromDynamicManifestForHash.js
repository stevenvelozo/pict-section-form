const libPictTemplate = require('pict-template');

/**
 * @typedef {{
       reset: () => void,
       clone: () => Manyfest,
       deserialize: (pManifestString: string) => void,
       loadManifest: (pManifest: any) => void,
       serialize: () => string,
       getManifest: () => { Scope: string, Descriptors: any, HashTranslations: any, },
       addDescriptor: (pAddress: string, pDescriptor: any) => void,
       getDescriptorByHash: (pHash: string) => any,
       getDescriptor: (pAddress: string) => any,
       eachDescriptor: (fAction: (pDescriptor: any) => void) => void,
       checkAddressExistsByHash : (pObject: any, pHash: string) => boolean,
       checkAddressExists : (pObject: any, pAddress: string) => boolean,
       resolveHashAddress: (pHash: string) => any,
       getValueByHash : (pObject: any, pHash: string) => any,
       getValueAtAddress : (pObject: any, pAddress: string) => any,
       setValueByHash: (pObject: any, pHash: string, pValue: any) => boolean,
       setValueAtAddress : (pObject: any, pAddress: string, pValue: any) => void,
       deleteValueByHash: (pObject: any, pHash: string, pValue: any) => void,
       deleteValueAtAddress : (pObject: any, pAddress: string, pValue: any) => void,
       validate: (pObject: any) => boolean,
       getDefaultValue: (pDescriptor: any) => any,
       populateDefaults: (pObject: any, pOverwriteProperties: boolean) => void,
       populateObject: (pObject: any, pOverwriteProperties: boolean, fFilter: (pDescriptor: any) => boolean) => void,
       serviceType: string,
       options: any,
       scope?: string,
       elementAddresses: Array<string>,
       elementHashes: Object,
       elementDescriptors: Object,
 * }} Manyfest
 */


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
	 * Renders the PICT Metacontroller Template.  The Record reference is ignored in this template.
	 *
	 * @param {string} pTemplateHash - The template hash.
	 * @param {object} pRecord - The record object.
	 * @param {array} pContextArray - The context array.
	 * @returns {string} - The rendered template.
	 */
	render(pTemplateHash, pRecord, pContextArray)
	{
		return this.renderAsync(pTemplateHash, pRecord, null, pContextArray);
	}

	renderAsync(pTemplateHash, pRecord, fCallback, pContextArray)
	{
		const tmpMetatemplateGenerator = this.pict.providers.MetatemplateGenerator;
		const tmpHash = pTemplateHash.trim();
		/** @type{import('../views/Pict-View-Form-Metacontroller.js')} */
		const metacontroller = this.pict.views.PictFormMetacontroller;
		/** @type {Manyfest} */
		const manifest = metacontroller.manifest;
		const descriptor = manifest.getDescriptorByHash(tmpHash);
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
