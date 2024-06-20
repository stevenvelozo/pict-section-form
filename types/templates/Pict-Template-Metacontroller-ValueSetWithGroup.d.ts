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
    render(pTemplateHash: any, pRecord: any, pContextArray: any): any;
    renderAsync(pTemplateHash: any, pRecord: any, fCallback: any, pContextArray: any): any;
}
//# sourceMappingURL=Pict-Template-Metacontroller-ValueSetWithGroup.d.ts.map