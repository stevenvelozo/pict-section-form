export = PictTemplateControlFromDynamicManifest;
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
declare class PictTemplateControlFromDynamicManifest extends libPictTemplate {
    /**
     * @param {Object} pFable - The Fable Framework instance
     * @param {Object} pOptions - The options for the service
     * @param {String} pServiceHash - The hash of the service
     */
    constructor(pFable: any, pOptions: any, pServiceHash: string);
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {import('pict') & { ManifestFactory: import('../services/ManifestFactory.js') }} */
    fable: import("pict") & {
        ManifestFactory: import("../services/ManifestFactory.js");
    };
    /** @type {any} */
    log: any;
    renderAsync(pTemplateHash: any, pRecord: any, fCallback: any, pContextArray: any): string;
}
declare namespace PictTemplateControlFromDynamicManifest {
    export { Manyfest };
}
import libPictTemplate = require("pict-template");
type Manyfest = {
    reset: () => void;
    clone: () => Manyfest;
    deserialize: (pManifestString: string) => void;
    loadManifest: (pManifest: any) => void;
    serialize: () => string;
    getManifest: () => {
        Scope: string;
        Descriptors: any;
        HashTranslations: any;
    };
    addDescriptor: (pAddress: string, pDescriptor: any) => void;
    getDescriptorByHash: (pHash: string) => any;
    getDescriptor: (pAddress: string) => any;
    eachDescriptor: (fAction: (pDescriptor: any) => void) => void;
    checkAddressExistsByHash: (pObject: any, pHash: string) => boolean;
    checkAddressExists: (pObject: any, pAddress: string) => boolean;
    resolveHashAddress: (pHash: string) => any;
    getValueByHash: (pObject: any, pHash: string) => any;
    getValueAtAddress: (pObject: any, pAddress: string) => any;
    setValueByHash: (pObject: any, pHash: string, pValue: any) => boolean;
    setValueAtAddress: (pObject: any, pAddress: string, pValue: any) => void;
    deleteValueByHash: (pObject: any, pHash: string, pValue: any) => void;
    deleteValueAtAddress: (pObject: any, pAddress: string, pValue: any) => void;
    validate: (pObject: any) => boolean;
    getDefaultValue: (pDescriptor: any) => any;
    populateDefaults: (pObject: any, pOverwriteProperties: boolean) => void;
    populateObject: (pObject: any, pOverwriteProperties: boolean, fFilter: (pDescriptor: any) => boolean) => void;
    serviceType: string;
    options: any;
    scope?: string;
    elementAddresses: Array<string>;
    elementHashes: any;
    elementDescriptors: any;
};
//# sourceMappingURL=Pict-Template-ControlFromDynamicManifest.d.ts.map