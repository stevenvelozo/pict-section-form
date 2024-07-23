export = PictDynamicLayout;
/**
 * The PictDynamicLayout class is a provider that generates dynamic layouts based on configuration.
 */
declare class PictDynamicLayout {
    /**
     * Creates an instance of the PictDynamicLayout class.
     *
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
    /**
     * Generate a group layout template for the Dynamically Generated views.
     *
     * @param {object} pView - The view to generate the dynamic group layout for
     * @param {object} pGroup - The group to generate and inject dynamic layout templates
     * @returns
     */
    generateGroupLayoutTemplate(pView: object, pGroup: object): string;
    /**
     * After a group template has been rendered, this lets a layout initialize any controls that
     * are necessary (e.g. a custom input type or such).
     *
     * @param {object} pView  - The view to initialize the newly rendered control for
     * @param {object} pGroup - The group to initialize the newly rendered control for
     * @returns
     */
    onGroupLayoutInitialize(pView: object, pGroup: object): boolean;
    onDataMarshalToForm(pView: any, pGroup: any): boolean;
}
declare namespace PictDynamicLayout {
    export { _DefaultProviderConfiguration as default_configuration };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-DynamicLayout.d.ts.map