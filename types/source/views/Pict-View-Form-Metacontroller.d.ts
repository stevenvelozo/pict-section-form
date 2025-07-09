export = PictFormMetacontroller;
/**
 * @typedef {(a: any, b: any) => number} SortFunction
 */
/**
 * Class representing a PictFormMetacontroller.
 *
 * The metacontroller creates, manages and runs dynamic views and their lifecycle events.
 *
 * @extends libPictViewClass
 */
declare class PictFormMetacontroller extends libPictViewClass {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    viewMarshalDestination: string;
    lastRenderedViews: any[];
    formTemplatePrefix: any;
    manifest: any;
    /**
     * Marshals data from the view to the model, usually AppData (or configured data store).
     *
     * @returns {any} The result of the superclass's onMarshalFromView method.
     */
    onMarshalFromView(): any;
    /**
     * Marshals the data to the view from the model, usually AppData (or configured data store).
     *
     * @returns {any} The result of the super.onMarshalToView() method.
     */
    onMarshalToView(): any;
    /**
     * Retrieves the marshal destination object.  This is where the model data is stored.
     *
     * @returns {Object} The marshal destination object.
     */
    getMarshalDestinationObject(): any;
    /**
     * Gets a value by hash address.
     * @param {string} pHashAddress
     */
    getValueByHash(pHashAddress: string): any;
    gatherInitialBundle(fCallback: any): any;
    /**
     * Executes after the initialization of the object.
     *
     * @param {ErrorCallback} fCallback - The callback function to be executed after the initialization.
     * @returns {void}
     */
    onAfterInitializeAsync(fCallback: ErrorCallback): void;
    /**
     * Executes the solve operation -- automatically solves all dynamic views that are present.
     *
     * @returns {any} The result of the solve operation.
     */
    onSolve(): any;
    onBeforeFilterViews(pViewFilterState: any): any;
    onAfterFilterViews(pViewFilterState: any): any;
    /**
     * Filters the views based on the provided filter and sort functions.
     *
     * By default, filters views based on the provided filter function and sorts them based on the provided sort function.
     *
     * @param {Function} [fFilterFunction] - The filter function used to determine if a view should be included.
     * @param {SortFunction} [fSortFunction] - The sort function used to sort the filtered views.
     * @returns {Array} - The filtered and sorted views.
     */
    filterViews(fFilterFunction?: Function, fSortFunction?: SortFunction): any[];
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
     * @param {Function} [fFilterFunction] - The filter function used to filter the views.
     * @param {SortFunction} [fSortFunction] - The sort function used to sort the views.
     */
    renderFormSections(fFilterFunction?: Function, fSortFunction?: SortFunction): void;
    /**
     * Regenerates the DyunamicForm section templates based on the provided filter and sort function.
     *
     * @param {Function} [fFormSectionFilter] - (optional) The filter function used to determine which views to include in the regeneration.
     * @param {SortFunction} [fSortFunction] - (optional) The sort function used to determine the order of the views in the regeneration.
     */
    regenerateFormSectionTemplates(fFormSectionFilter?: Function, fSortFunction?: SortFunction): void;
    /**
     * Generates a meta template for the DynamicForm views managed by this Metacontroller.
     *
     * @param {Function} [fFormSectionFilter] - (optional) The filter function to apply on the form section.
     * @param {SortFunction} [fSortFunction] - (optional) The sort function to apply on the form section.
     * @returns {void}
     */
    generateMetatemplate(fFormSectionFilter?: Function, fSortFunction?: SortFunction): void;
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
    manifestDescription: any;
    /**
     * Trigger an event on all inputs on all views.
     * @param {string} pEvent - The event to trigger
     */
    triggerGlobalInputEvent(pEvent: string): void;
    /**
     * Returns whether the object is a Pict Metacontroller.
     *
     * @returns {boolean} True if the object is a Pict Metacontroller, false otherwise.
     */
    get isPictMetacontroller(): boolean;
}
declare namespace PictFormMetacontroller {
    export { default_configuration, SortFunction };
}
import libPictViewClass = require("pict-view");
declare const default_configuration: Record<string, any>;
type SortFunction = (a: any, b: any) => number;
//# sourceMappingURL=Pict-View-Form-Metacontroller.d.ts.map