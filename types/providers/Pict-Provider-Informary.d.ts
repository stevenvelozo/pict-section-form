export = PictDynamicFormsInformary;
/**
 * Represents a provider for dynamic forms in the PICT system.
 * Extends the `libPictProvider` class.
 */
declare class PictDynamicFormsInformary {
    /**
     * Creates an instance of the `PictDynamicFormsInformary` class.
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
    genericManifest: any;
    /**
     * Retrieves all form elements for a given form hash.
     *
     * @param {string} pFormHash - The hash of the form.
     * @returns {HTMLElement[]} - An array of HTML elements representing the form elements.
     */
    getFormElements(pFormHash: string): HTMLElement[];
    /**
     * Get a full content browser address based on the form, datum and optionally the container and index.
     *
     * This can be used in getDomElementByAddress or jquery selectors to return the element.
     *
     * @param {string} pFormHash - The form hash.
     * @param {string} pDatumHash - The datum hash.
     * @param {string|null} pContainer - The container (optional).
     * @param {number} pIndex - The index.
     * @returns {string} The content browser address.
     */
    getContentBrowserAddress(pFormHash: string, pDatumHash: string, pContainer: string | null, pIndex: number): string;
    /**
     * Returns the composed container address string for a given container, index, and datum hash.
     *
     * @param {string} pContainer - The container name.
     * @param {number} pIndex - The index of the container.
     * @param {string} pDatumHash - The datum hash.
     * @returns {string} The composed container address.
     */
    getComposedContainerAddress(pContainer: string, pIndex: number, pDatumHash: string): string;
    /**
     * Marshals form data to the provided application state data object using the given form hash and manifest.
     *
     * @param {object} pAppStateData - The application state data object to marshal the form data to.
     * @param {string} pFormHash - The form hash representing the form elements.
     * @param {object} pManifest - The manifest object used to map form data to the application state data.
     */
    marshalFormToData(pAppStateData: object, pFormHash: string, pManifest: object): void;
    /**
     * Marshals data from some application state object to a specific subset of browser form elements.
     *
     * @param {object} pAppStateData - The application state data to marshal into the form.  Usually AppData but can be other objects.
     * @param {string} pFormHash - The hash of the form to marshal data into.  This is the data-i-form attribute.
     * @param {object} pManifest - The manifest object.  If not provided, the generic manifest is used.
     */
    marshalDataToForm(pAppStateData: object, pFormHash: string, pManifest: object): void;
}
declare namespace PictDynamicFormsInformary {
    export { _DefaultProviderConfiguration as default_configuration };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-Informary.d.ts.map