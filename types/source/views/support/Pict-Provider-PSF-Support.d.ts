export = PictSupportExtension;
/**
 * Represents a class that provides dynamic templates for the Pict form section provider.
 * @extends libPictProvider
 */
declare class PictSupportExtension extends libPictProvider {
    /**
     * Constructs a new instance of the PictProviderDynamicTemplates class.
     * @param {Object} pFable - The pFable object.
     * @param {Object} pOptions - The options object.
     * @param {Object} pServiceHash - The service hash object.
     */
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    SupportViews: {};
    registerSupportView(pView: any): void;
    getSupportViewLinks(): {
        Hash: any;
        Link: string;
        ShortName: any;
        LongName: any;
        OnClick: string;
    }[];
}
declare namespace PictSupportExtension {
    export { _DefaultProviderConfiguration as default_configuration };
}
import libPictProvider = require("pict-provider");
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-PSF-Support.d.ts.map