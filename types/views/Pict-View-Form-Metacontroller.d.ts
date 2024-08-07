export = PictFormMetacontroller;
declare class PictFormMetacontroller extends libPictViewClass {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    viewMarshalDestination: string;
    lastRenderedViews: any[];
    formTemplatePrefix: string;
    onAfterInitializeAsync(fCallback: any): void;
    onAfterRender(): boolean;
    /**
     * Filters the views based on the provided filter and sort functions.
     *
     * By default, filters views based on the provided filter function and sorts them based on the provided sort function.
     *
     * @param {Function} fFilterFunction - The filter function used to determine if a view should be included.
     * @param {Function} fSortFunction - The sort function used to sort the filtered views.
     * @returns {Array} - The filtered and sorted views.
     */
    filterViews(fFilterFunction: Function, fSortFunction: Function): any[];
    /**
     * Renders a specific dynamic form section based on the provided form section hash.
     *
     * For this to work, we need the container for the section to be available on the form.
     *
     * @param {string} pFormSectionHash - The hash of the form section to render.
     * @returns {void}
     */
    renderSpecificFormSection(pFormSectionHash: string): void;
    /**
     * Renders the default dynamic form sections based on the provided form section hash.
     *
     * @returns {void}
     */
    renderDefaultFormSections(): void;
    /**
     * Renders the form sections based on the provided filter and sort functions.
     *
     * If no filter and sort functions are provided, render all form sections.
     *
     * @param {Function} fFilterFunction - The filter function used to filter the views.
     * @param {Function} fSortFunction - The sort function used to sort the views.
     */
    renderFormSections(fFilterFunction: Function, fSortFunction: Function): void;
    /**
     * Regenerates the DyunamicForm section templates based on the provided filter and sort function.
     *
     * @param {Function} fFormSectionFilter - (optional) The filter function used to determine which views to include in the regeneration.
     * @param {Function} fSortFunction - (optional) The sort function used to determine the order of the views in the regeneration.
     */
    regenerateFormSectionTemplates(fFormSectionFilter: Function, fSortFunction: Function): void;
    /**
     * Generates a meta template for the DynamicForm views managed by this Metacontroller.
     *
     * @param {Function} fFormSectionFilter - (optional) The filter function to apply on the form section.
     * @param {Function} fSortFunction - (optional) The sort function to apply on the form section.
     * @returns {void}
     */
    generateMetatemplate(fFormSectionFilter: Function, fSortFunction: Function): void;
    /**
     * Retrieves a safe clone of the section definition for a given manyfest section description object.
     *
     * @param {object} pSectionObject - The section object.
     * @returns {object|boolean} - The section definition if successful, otherwise false.
     */
    getSectionDefinition(pSectionObject: object): object | boolean;
    /**
     * Bootstraps Pict DynamicForm views from a Manyfest description JSON object.
     *
     * @param {Object} pManifestDescription - The manifest description object.
     * @returns {Array} - An array of section definitions.
     */
    bootstrapPictFormViewsFromManifest(pManifestDescription: any): any[];
    get isPictMetacontroller(): boolean;
}
declare namespace PictFormMetacontroller {
    export { default_configuration };
}
import libPictViewClass = require("pict-view");
declare namespace default_configuration {
    let AutoRender: boolean;
    let AutoPopulateDefaultObject: boolean;
    let AutoSolveBeforeRender: boolean;
    let AutoPopulateAfterRender: boolean;
    let DefaultRenderable: string;
    let DefaultDestinationAddress: string;
    let AutoMarshalDataOnSolve: boolean;
    let OnlyRenderDynamicSections: boolean;
    let MetaTemplateHash: string;
    let Templates: {
        Hash: string;
        Template: string;
    }[];
    let Renderables: {
        RenderableHash: string;
        TemplateHash: string;
        DestinationAddress: string;
    }[];
}
//# sourceMappingURL=Pict-View-Form-Metacontroller.d.ts.map