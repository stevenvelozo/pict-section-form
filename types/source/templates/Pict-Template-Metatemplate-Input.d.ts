export = PictTemplateMetatemplateInputTemplate;
/**
 * This is a template that will generate a Metatemplate input, for manual use of metatemplates.
 */
declare class PictTemplateMetatemplateInputTemplate {
    /**
     * @param {Object} pFable - The Fable Framework instance
     * @param {Object} pOptions - The options for the service
     * @param {String} pServiceHash - The hash of the service
     */
    constructor(pFable: any, pOptions: any, pServiceHash: string);
    currentInputIndex: number;
    /**
     * Renders the PICT Metacontroller Template.  The Record reference is ignored in this template.
     *
     * @param {string} pTemplateHash - The template hash.
     * @param {object} pRecord - The record object.
     * @param {array} pContextArray - The context array.
     * @returns {string} - The rendered template.
     */
    render(pTemplateHash: string, pRecord: object, pContextArray: any[]): string;
    renderAsync(pTemplateHash: any, pRecord: any, fCallback: any, pContextArray: any): any;
}
//# sourceMappingURL=Pict-Template-Metatemplate-Input.d.ts.map