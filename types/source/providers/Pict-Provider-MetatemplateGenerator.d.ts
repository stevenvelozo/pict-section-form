export = PictMetatemplateGenerator;
/**
 * Class representing a Pict Metatemplate Generator.
 * @extends libPictProvider
 */
declare class PictMetatemplateGenerator {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {any} */
    log: any;
    dynamicInputView: boolean;
    baseTemplatePrefix: string;
    onInitializeAsync(fCallback: any): any;
    createOnDemandMetatemplateView(): void;
    /**
     * Retrieves the metatemplate template reference in raw format.
     *
     * @param {Object} pView - The view object.
     * @param {string} pTemplatePostfix - The template postfix.
     * @param {string} pRawTemplateDataAddress - The raw template data address.
     * @returns {string} The metatemplate template reference in raw format, or false if it doesn't exist.
     */
    getMetatemplateTemplateReferenceRaw(pView: any, pTemplatePostfix: string, pRawTemplateDataAddress: string): string;
    /**
     * Retrieves the metatemplate template reference.
     *
     * @param {Object} pView - The view object.
     * @param {string} pTemplatePostfix - The template postfix.
     * @param {string} pViewDataAddress - The view data address.
     * @returns {string} The metatemplate template reference.
     */
    getMetatemplateTemplateReference(pView: any, pTemplatePostfix: string, pViewDataAddress: string): string;
    /**
     * Retrieves the metatemplate template reference for the given input view, data type, input type, and view data address.
     *
     * @param {Object} pView - The input view.
     * @param {string} pDataType - The data type.
     * @param {string} pInputType - The input type.
     * @param {string} pViewDataAddress - The view data address.
     * @returns {string} The metatemplate template reference.
     */
    getInputMetatemplateTemplateReference(pView: any, pDataType: string, pInputType: string, pViewDataAddress: string): string;
    /**
     * Generates a tabular input metatemplate template reference.
     *
     * @param {Object} pView - The view.
     * @param {string} pDataType - The data type.
     * @param {string} pInputType - The input type.
     * @param {string} pViewDataAddress - The view data address.
     * @param {number} pGroupIndex - The group index.
     * @param {number} pRowIndex - The row index.
     * @returns {string} The tabular input metatemplate template reference.
     */
    getTabularInputMetatemplateTemplateReference(pView: any, pDataType: string, pInputType: string, pViewDataAddress: string, pGroupIndex: number, pRowIndex: number): string;
    /**
     * Retrieves the metatemplate template reference for the given vertical input view, data type, input type, and view data address.
     *
     * @param {Object} pView - The input view.
     * @param {string} pDataType - The data type.
     * @param {string} pInputType - The input type.
     * @param {string} pViewDataAddress - The view data address.
     * @returns {string} The metatemplate template reference.
     */
    getVerticalInputMetatemplateTemplateReference(pView: any, pDataType: string, pInputType: string, pViewDataAddress: string): string;
    /**
     * Retrieves the group layout provider based on the given view and group.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @returns {Object} The group layout provider.
     */
    getGroupLayoutProvider(pView: any, pGroup: any): any;
    /**
     * Rebuilds the custom template for the given view.
     *
     * This uses the layout providers for each group.
     *
     * @param {Object} pView - The view object.
     */
    rebuildCustomTemplate(pView: any): void;
}
declare namespace PictMetatemplateGenerator {
    export { _DefaultProviderConfiguration as default_configuration };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-MetatemplateGenerator.d.ts.map