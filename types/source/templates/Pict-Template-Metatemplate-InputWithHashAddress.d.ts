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
    /**
     * Renders the PICT Metacontroller Template.  The Record reference is ignored in this template.
     *
     * @param {string} pTemplateHash - The schema hash of the control.
     * @param {object} pRecord - The record object.
     * @param {function | null} fCallback - The callback function.
     * @param {array} pContextArray - The context array.
     *
     * @return {void}
     */
    renderAsync(pTemplateHash: string, pRecord: object, fCallback: Function | null, pContextArray: any[]): void;
}
import libPictTemplate = require("pict-template");
//# sourceMappingURL=Pict-Template-Metatemplate-InputWithHashAddress.d.ts.map