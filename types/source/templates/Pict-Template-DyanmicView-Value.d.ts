export = PictTemplateGetViewSchemaValue;
/**
 * This is a template that will generate a Metatemplate input, for manual use of metatemplates.
 */
declare class PictTemplateGetViewSchemaValue extends libPictTemplate {
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
    /**
     * Renders a view managed by the metacontroller based on the manifest schema address.
     *
     * @param {string} pTemplateHash - The schema hash of the control.
     * @param {object} pRecord - The record object.
     * @param {function | null} fCallback - The callback function.
     * @param {array} pContextArray - The context array.
     * @param {any} [pScope] - A sticky scope that can be used to carry state and simplify template
     * @returns {string | undefined} - The rendered template or undefined if callback is provided.
     */
    renderAsync(pTemplateHash: string, pRecord: object, fCallback: Function | null, pContextArray: any[], pScope?: any): string | undefined;
}
import libPictTemplate = require("pict-template");
//# sourceMappingURL=Pict-Template-DyanmicView-Value.d.ts.map