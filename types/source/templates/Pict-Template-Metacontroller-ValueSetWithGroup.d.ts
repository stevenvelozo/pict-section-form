export = PictTemplateMetacontrollerValueSet;
/**
 * This is a template that will take a value set and render a template for each value in the set.
 *
 * It passes along additional context (the metacontroller group) for dynamic programming tables.
 */
declare class PictTemplateMetacontrollerValueSet extends libPictTemplate {
    /**
     * @param {Object} pFable - The Fable Framework instance
     * @param {Object} pOptions - The options for the service
     * @param {String} pServiceHash - The hash of the service
     */
    constructor(pFable: any, pOptions: any, pServiceHash: string);
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {import('pict')} */
    fable: import("pict");
    /** @type {any} */
    log: any;
    /**
     * Asynchronously renders a template with the provided template hash, record, callback, and context array.
     *
     * @param {string} pTemplateHash - The template hash to render.
     * @param {object} pRecord - The record object to use for rendering the template.
     * @param {function} fCallback - The callback function to invoke after rendering the template.
     * @param {array} pContextArray - The context array to use for resolving the data.
     * @param {any} [pScope] - A sticky scope that can be used to carry state and simplify template
     * @param {any} [pState] - A catchall state object for plumbing data through template processing.
     *
     * @return {void}
     */
    renderAsync(pTemplateHash: string, pRecord: object, fCallback: Function, pContextArray: any[], pScope?: any, pState?: any): void;
}
import libPictTemplate = require("pict-template");
//# sourceMappingURL=Pict-Template-Metacontroller-ValueSetWithGroup.d.ts.map