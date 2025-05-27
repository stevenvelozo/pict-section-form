export = PictDynamicFormsTemplates;
/**
 * Represents a class that provides dynamic templates for the Pict form section provider.
 * @extends libPictProvider
 */
declare class PictDynamicFormsTemplates {
    /**
     * Constructs a new instance of the PictProviderDynamicTemplates class.
     * @param {Object} pFable - The pFable object.
     * @param {Object} pOptions - The options object.
     * @param {Object} pServiceHash - The service hash object.
     */
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {any} */
    options: any;
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {any} */
    log: any;
    /**
     * Injects a template set into Pict for the Dynamic Form Section Provider.
     *
     * The TemplateSet object expects to have a `TemplatePrefix` and `Templates` property.
     *
     * The `TemplatePrefix` is used to prefix the hash of the template.
     *
     * The `Templates` property is an array of objects with the following properties:
     * - `HashPostfix` - The postfix to be added to the template hash.  This defines which dynamic template in the Layout it represents.
     * - `Template` - The template string to be injected.
     * - `DefaultInputExtensions` - An optional array of default input extensions to be added to the Dynamic Input provider.
     *
     * The context of the template *is not the data*.  The template context is one of these five things depending on the layout layer:
     * - `Form` - The form object.
     * - `Section` - The section object.
     * - `Group` - The group object.
     * - `Row` - The row object.
     * - `Input` - The input object.
     *
     * @param {Object} pTemplateSet - The template set to be injected.
     */
    injectTemplateSet(pTemplateSet: any): void;
}
declare namespace PictDynamicFormsTemplates {
    export { _DefaultProviderConfiguration as default_configuration };
}
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-DynamicTemplates.d.ts.map