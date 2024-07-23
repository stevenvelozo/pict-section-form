export = ManifestFactory;
declare class ManifestFactory {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    manifest: any;
    referenceManifestFactories: {};
    defaultHashCounter: number;
    /**
     * Initialize the form groups.
     *
     * This function will initialize the form groups of a view based on the manifest.
     *
     * TODO: Figure out if this is the best place for this.  It *is* pretty useful for
     * inferring manifests, so has uses outside of the view lifecycle.
     *
     * @param {Object} pView - The view to initialize form groups for
     */
    initializeFormGroups(pView: any): void;
    addDescriptor(pManifestDescriptor: any): void;
    /**
     * Get a section from the manifest.
     *
     * @param {string} pSectionHash - The section Hash
     *
     * @return {Object} The manifest section object
     */
    getManifestSection(pSectionHash: string): any;
    /**
     * Get a group from a section.
     *
     * @param {string|Object} pManifestSection - The manifest Section -- either a Hash string or the object itself
     * @param {string} pGroupHash - The group Hash
     *
     * @return {Object} The group object
     */
    getManifestGroup(pManifestSection: string | any, pGroupHash: string): any;
    /**
     * Lints a manifest record row.
     * @param {Object} pRecord - The record to be linted.
     * @returns {boolean} - Returns true if the record is valid, false otherwise.
     */
    tabularRowLint(pRecord: any): boolean;
    /**
     * Add a manifest descriptor from a tabular row.
     *
     * @param {Object} tmpRecord - The tabular row record -- expected to have at least a 'Form'
     *
     * @return {Object} the descriptor
     */
    tabularRowAddDescriptor(pManifestFactory: any, pRecord: any): any;
    /**
     * Create some manifests with a "factory" pattern.
     *
     * @param {any} pRecords - The records as an array of objects
     *
     * @return {any} the manifests
     */
    createManifestsFromTabularArray(pRecords: any): any;
}
//# sourceMappingURL=ManifestFactory.d.ts.map