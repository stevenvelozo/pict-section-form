export = PictTemplateMetacontrollerValueSet;
/**
 * This is a template that will take a value set and render a template for each value in the set.
 *
 * It passes along additional context (the metacontroller group) for dynamic programming tables.
 */
declare class PictTemplateMetacontrollerValueSet {
    /**
     * @param {Object} pFable - The Fable Framework instance
     * @param {Object} pOptions - The options for the service
     * @param {String} pServiceHash - The hash of the service
     */
    constructor(pFable: any, pOptions: any, pServiceHash: string);
    /**
     * Renders the PICT Metacontroller Template.
     *
     * @param {string} pTemplateHash - The template hash.
     * @param {object} pRecord - The record object.
     * @param {array} pContextArray - The context array.
     * @returns {string} - The rendered template.
     */
    render(pTemplateHash: string, pRecord: object, pContextArray: any[]): string;
    /**
     * Asynchronously renders a template with the provided template hash, record, callback, and context array.
     *
     * @param {string} pTemplateHash - The template hash to render.
     * @param {object} pRecord - The record object to use for rendering the template.
     * @param {function} fCallback - The callback function to invoke after rendering the template.
     * @param {array} pContextArray - The context array to use for resolving the data.
     */
    renderAsync(pTemplateHash: string, pRecord: object, fCallback: Function, pContextArray: any[]): any;
}
//# sourceMappingURL=Pict-Template-Metacontroller-ValueSetWithGroup.d.ts.map