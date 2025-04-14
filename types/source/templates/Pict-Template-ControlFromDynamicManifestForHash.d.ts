export = PictTemplateControlFromDynamicManifest;
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
    /**
     * Renders a view managed by the metacontroller based on the manifest schema hash.
     *
     * @param {string} pTemplateHash - The schema hash of the control.
     * @param {object} pRecord - The record object.
     * @param {function} fCallback - The callback function.
     * @param {array} pContextArray - The context array.
     * @returns {string} - The rendered template.
     */
    renderAsync(pTemplateHash: string, pRecord: object, fCallback: Function, pContextArray: any[]): string;
}
import libPictTemplate = require("pict-template");
//# sourceMappingURL=Pict-Template-ControlFromDynamicManifestForHash.d.ts.map