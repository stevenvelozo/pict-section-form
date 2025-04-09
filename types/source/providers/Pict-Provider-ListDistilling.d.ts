export = PictListDistilling;
/**
 * The PictListDistilling class is a provider that filters lists based on input rules.
 */
declare class PictListDistilling {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {import('pict')} */
    fable: import("pict");
    /** @type {any} */
    log: any;
    /**
      * Filter a list of options based on the filtering rules in a dynamic form input.
      *
      * Example Configuration:
      * ...
            "ListFilterRules": [
                    {
                        "Filter": "Colour Entry Filter",
                        "FilterType": "Explicit",
                        "FilterValueComparison": "==",
                        "FilterValueAddress": "Listopia.Filters.Colour",
                        "IgnoreEmptyValue": true
                    },
                    {
                        "Filter": "Colour List Distilling Filter",
                        "FilterType": "CrossMap",
                        "JoinListAddress": "View.sectionDefinition.Intersections.Colors.FruitSelectionColorsJoin",
                        "JoinListAddressGlobal": true,
                        "JoinListValueAddress": "GUIDColors",
                        "ExternalValueAddress": "GUIDFruitSelection",
                        "FilterToValueAddress": "Listopia.Fruit",
                        "IgnoreEmpty": true
                    }
                ],
      * ...
      *
      * @param {Object} pView - The pict view the list is within
      * @param {*} pInput - The input within the dynamic forms view
      * @param {*} pList - The raw list of options to filter
      * @returns
      */
    filterList(pView: any, pInput: any, pList: any): any;
}
declare namespace PictListDistilling {
    export { _DefaultProviderConfiguration as default_configuration };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-ListDistilling.d.ts.map