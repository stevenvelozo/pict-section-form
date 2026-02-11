export = PictDynamicSolver;
/**
 * The PictDynamicSolver class is a provider that solves configuration-generated dynamic views.
 */
declare class PictDynamicSolver extends libPictProvider {
    /**
     * Creates an instance of the PictDynamicSolver class.
     *
     * @param {import('pict')} pFable - The Pict instance.
     * @param {Record<string, any>} [pOptions] - The options for the provider.
     * @param {string} [pServiceHash] - The service hash for the provider.
     */
    constructor(pFable: import("pict"), pOptions?: Record<string, any>, pServiceHash?: string);
    /** @type {import('pict') & { ExpressionParser: any }} */
    pict: import("pict") & {
        ExpressionParser: any;
    };
    /** @type {import('pict') & { instantiateServiceProviderIfNotExists: (hash: string) => any, ExpressionParser: any }} */
    fable: import("pict") & {
        instantiateServiceProviderIfNotExists: (hash: string) => any;
        ExpressionParser: any;
    };
    _RunSolversRegex: RegExp;
    logSolveOutcome(pSolveOutcome: any): void;
    /**
     * Prepares the solver results map by ensuring it has the necessary structure.
     *
     * @param {Object} pSolverResultsMap - The solver results map to prepare.
     * @returns {Object} - The prepared solver results map.
    */
    prepareSolverResultsMap(pSolverResultsMap: any): any;
    /**
     * Backfills solver dependencies into the solve outcome.
     *
     * @param {Object} pSolveOutcome - The solve outcome object.
     * @returns {Object} - The updated solve outcome with backfilled dependencies.
     */
    backfillSolverDependencies(pSolveOutcome: any): any;
    /**
     * Runs a manual solver expression against the dynamic view marshal destination or the application data.
     *
     * @param {string} pSolverExpression - The solver expression to run.
     * @param {boolean} [pSilent=false] - Whether to suppress debug logging output.
     * @returns {any} - The result of the solver expression.
     */
    runSolver(pSolverExpression: string, pSilent?: boolean): any;
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
    /** @typedef {{ Ordinal: number, Expression: string } | string} Solver */
    /**
     * Execute a set of adhoc solvers.
     *
     * @param {import('../views/Pict-View-DynamicForm.js')} pView - The dynamic view to execute the solvers against.
     * @param {Array<Solver>} pSolvers - An array of solvers to execute.
     * @param {string} pReason - The reason for executing the solvers.
     */
    executeSolvers(pView: import("../views/Pict-View-DynamicForm.js"), pSolvers: Array<string | {
        Ordinal: number;
        Expression: string;
    }>, pReason: string): void;
    lastAdhocSolveOutcome: {
        SolverResultsMap: {};
        StartTimeStamp: number;
        SolveOrdinals: {};
        EndTimeStamp: number;
    };
    /**
     * Runs each Adhoc solver formulae for a dynamic view group at a given ordinal.
     *
     * Or for all ordinals if no ordinal is passed.
     *
     * @param {import('../views/Pict-View-DynamicForm.js')} pView - The dynamic view to execute the solvers against.
     * @param {Array<string>} pAdhocSolverArray - An array of Solvers from the groups to solve.
     * @param {string} pReason - The reason for executing the solvers.
     * @param {number} pOrdinal - The ordinal value to filter to.  Optional.
     * @param {Object} pSolverResultsMap - The solver results map.
     * @param {boolean} [pPreventSolverCycles=false] - Whether to prevent solver cycles.
     */
    executeAdhocSolvers(pView: import("../views/Pict-View-DynamicForm.js"), pAdhocSolverArray: Array<string>, pReason: string, pOrdinal: number, pSolverResultsMap: any, pPreventSolverCycles?: boolean): void;
    /**
     * Runs each RecordSet solver formulae for a dynamic view group at a given ordinal.
     *
     * Or for all ordinals if no ordinal is passed.
     *
     * @param {array} pGroupSolverArray - An array of Solvers from the groups to solve.
     * @param {number} pOrdinal - The ordinal value to filter to.  Optional.
     * @param {Object} pSolverResultsMap - The solver results map.
     * @param {boolean} [pPreventSolverCycles=false] - Whether to prevent solver cycles.
     */
    executeGroupSolvers(pGroupSolverArray: any[], pOrdinal: number, pSolverResultsMap: any, pPreventSolverCycles?: boolean): void;
    /**
     * Executes the section solvers at a given ordinal (or all if no ordinal is passed).
     *
     * @param {Array} pViewSectionSolverArray - The array of view section solvers.
     * @param {number} pOrdinal - The ordinal value.
     * @param {Object} pSolverResultsMap - The solver results map.
     * @param {boolean} [pPreventSolverCycles=false] - Whether to prevent solver cycles.
     */
    executeSectionSolvers(pViewSectionSolverArray: any[], pOrdinal: number, pSolverResultsMap: any, pPreventSolverCycles?: boolean): void;
    /**
     * Executes the view solvers for the given array of view hashes.
     *
     * @param {Array} pViewSolverArray - The array of view solvers to execute.
     * @param {number} pOrdinal - The ordinal value.
     * @param {Object} pSolverResultsMap - The solver results map.
     */
    executeViewSolvers(pViewSolverArray: any[], pOrdinal: number, pSolverResultsMap: any): void;
    /**
     * Executes any validation solvers defined in the form manifest.
     *
     * @param {Object} pSolverResultsMap - The solver results map to use for executing validation solvers.
     * @param {boolean} [pPreventSolverCycles=false] - Whether to prevent solver cycles when executing validation solvers.
     */
    executeValidationSolvers(pSolverResultsMap: any, pPreventSolverCycles?: boolean): void;
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
     * @param {boolean} [pPreventSolverCycles] - An optional context string for the solve operation.
     * TODO: make sure you can't cycle with the same solve context - new solver method to invoke this
     *
     * @return {Array<string>} - An array of view hashes that were solved.
     */
    solveViews(pViewHashes?: any[] | string[], pPreventSolverCycles?: boolean): Array<string>;
    lastSolveOutcome: {
        SolverResultsMap: {};
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