export = PictTemplateMetatemplateInputTemplate;
/**
 * This is a template that will generate a Metatemplate input, for manual use of metatemplates.
 */
declare class PictTemplateMetatemplateInputTemplate extends libPictTemplate {
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
    currentInputIndex: number;
    renderAsync(pTemplateHash: any, pRecord: any, fCallback: any, pContextArray: any): string;
}
import libPictTemplate = require("pict-template");
//# sourceMappingURL=Pict-Template-Metatemplate-Input.d.ts.map