export = PictTemplateInputWithViewAndHashAddressTemplate;
/**
 * This is a template that will generate a dynamic input using a provided dynamic view (by hash) and a hash address.
 */
declare class PictTemplateInputWithViewAndHashAddressTemplate extends libPictTemplate {
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
     * Renders an arbitrary PICT input by hash, with a custom data type, input type and label.  The Record reference is ignored in this template.
     *
     * @param {string} pTemplateHash - The schema hash of the control.
     * @param {object} pRecord - The record object.
     * @param {function | null} fCallback - The callback function.
     * @param {array} pContextArray - The context array.
     * @param {any} [pScope] - A sticky scope that can be used to carry state and simplify template
     * @param {any} [pState] - A catchall state object for plumbing data through template processing.
     *
     * @return {void}
     */
    renderAsync(pTemplateHash: string, pRecord: object, fCallback: Function | null, pContextArray: any[], pScope?: any, pState?: any): void;
}
import libPictTemplate = require("pict-template");
//# sourceMappingURL=Pict-Template-Metatemplate-InputWithViewAndHashAddress.d.ts.map