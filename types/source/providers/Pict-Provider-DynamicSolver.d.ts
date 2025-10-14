export = PictDynamicSolver;
/**
 * The PictDynamicSolver class is a provider that solves configuration-generated dynamic views.
 */
declare class PictDynamicSolver extends libPictProvider {
    /**
     * Creates an instance of the PictDynamicSolver class.
     *
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {import('pict') & { instantiateServiceProviderIfNotExists: (hash: string) => any, ExpressionParser: any }} */
    fable: import("pict") & {
        instantiateServiceProviderIfNotExists: (hash: string) => any;
        ExpressionParser: any;
    };
    /**
     * Checks the solver and returns the solver object if it passes the checks.
     *
     * Automatically converts string solvers to have an Ordinal of 1.
     *
     * @param {string|object} pSolver - The solver to be checked. It can be either a string or an object.
     * @param {boolean} [pFiltered=false] - Indicates whether the solvers should be filtered.
     * @param {number} [pOrdinal] - The ordinal value to compare with the solver's ordinal value when filtered.
     * @returns {object|undefined} - The solver object if it passes the checks, otherwise undefined.
     */
    checkSolver(pSolver: string | object, pFiltered?: boolean, pOrdinal?: number): object | undefined;
    /**
     * Runs each RecordSet solver formulae for a dynamic view group at a given ordinal.
     *
     * Or for all ordinals if no ordinal is passed.
     *
     * @param {array} pGroupSolverArray - An array of Solvers from the groups to solve.
     * @param {number} pOrdinal - The ordinal value to filter to.  Optional.
     */
    executeGroupSolvers(pGroupSolverArray: any[], pOrdinal: number): void;
    /**
     * Executes the section solvers at a given ordinal (or all if no ordinal is passed).
     *
     * @param {Array} pViewSectionSolverArray - The array of view section solvers.
     * @param {number} pOrdinal - The ordinal value.
     */
    executeSectionSolvers(pViewSectionSolverArray: any[], pOrdinal: number): void;
    /**
     * Executes the view solvers for the given array of view hashes.
     *
     * @param {Array} pViewSolverArray - The array of view solvers to execute.
     * @param {number} pOrdinal - The ordinal value.
     */
    executeViewSolvers(pViewSolverArray: any[], pOrdinal: number): void;
    /**
     * Checks if the given ordinal exists in the provided ordinal set.
     *
     * If not, it adds the ordinal to the set.
     *
     * @param {number} pOrdinal - The ordinal to check.
     * @param {Object} pOrdinalSet - The ordinal set to check against.
     * @returns {Object} - The ordinal object from the ordinal set.
     */
    checkAutoSolveOrdinal(pOrdinal: number, pOrdinalSet: any): any;
    /**
     * Solves the views based on the provided view hashes or all views in pict.
     *
     * If non-dynamic views are also passed in, they are solved as well.
     *
     * This algorithm is particularly complex because it solves views in
     * order across two dimensions:
     *
     * 1. The order of the views in the view hash array.
     * 2. Precedence order (based on Ordinal)
     *
     * The way it manages the precedence order solving is by enumerating the
     * view hash array multiple times until it exhausts the solution set.
     *
     * In dynamic views, when there are collisions in precedence order between
     * Section Solvers and Group RecordSet Solvers, it prefers the RecordSet
     * solvers first.  The thinking behind this is that a RecordSet solver is
     * a "tier down" from the core Section it resides within.  These are
     * leaves on the tree.

     * @param {Array|string[]} [pViewHashes] - An optional array of view hashes to solve. If not provided, all views in the fable will be solved.
     */
    solveViews(pViewHashes?: any[] | string[]): void;
    lastSolveOutcome: {
        StartTimeStamp: number;
        ViewHashes: any[];
        SolveOrdinals: {};
        EndTimeStamp: number;
    };
}
declare namespace PictDynamicSolver {
    export { _DefaultProviderConfiguration as default_configuration };
}
import libPictProvider = require("pict-provider");
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-DynamicSolver.d.ts.map