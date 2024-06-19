const libPictProvider = require('pict-provider');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForm-Solve",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

class PictSectionFormTemplateProvider extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);
	}

	/**
	 * Checks the solver and returns the solver object if it passes the checks.
	 * 
	 * Automatically converts string solvers to have an Ordinal of 1.
	 * 
	 * @param {string|object} pSolver - The solver to be checked. It can be either a string or an object.
	 * @param {boolean} pFiltered - Indicates whether the solvers should be filtered.
	 * @param {number} pOrdinal - The ordinal value to compare with the solver's ordinal value when filtered.
	 * @returns {object|undefined} - The solver object if it passes the checks, otherwise undefined.
	 */
	checkSolver(pSolver, pFiltered, pOrdinal)
	{
		let tmpSolver = pSolver;
		if (tmpSolver === undefined)
		{
			console.log('wut');
			return;
		}
		if (typeof(tmpSolver) === 'string')
		{
			tmpSolver = {Expression:tmpSolver, Ordinal:1};
		}
		if (!('Expression' in tmpSolver))
		{
			pView.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] group ${tmpGroup.Hash} solver ${k} is missing the Expression property.`);
			return;
		}
		if (!(`Ordinal` in tmpSolver))
		{
			tmpSolver.Ordinal = 1;
		}

		// This filters the solvers
		if (pFiltered && (tmpSolver.Ordinal != pOrdinal))
		{
			return;
		}

		return tmpSolver;
	}

	/**
	 * Runs each recordset solver formulae for a dynamic view group at a given ordinal.
	 * Or for all ordinals if no ordinal is passed.
	 *
	 * @param {array} pGroupSolverArray - An array of Solvers from the groups to solve.
	 * @param {number} pOrdinal - The ordinal value to filter to.  Optional.
	 */
	executeGroupSolvers(pGroupSolverArray, pOrdinal)
	{
		// This is purely for readability of the code below ... uglify optimizes it out.
		let tmpFiltered = (typeof(pOrdinal) === 'undefined') ? false : true;
		
		// Solve the group RecordSet solvers first
		for (let j = 0; j < pGroupSolverArray.length; j++)
		{
			let tmpView = this.pict.views[pGroupSolverArray[j].ViewHash];
			let tmpGroup = tmpView.getGroup(pGroupSolverArray[j].GroupIndex);
			let tmpSolver = this.checkSolver(pGroupSolverArray[j].Solver, tmpFiltered, pOrdinal);
			if (typeof(tmpSolver) === 'undefined')
			{
				continue;
			}

			tmpView.log.trace(`Dynamic View [${tmpView.UUID}]::[${tmpView.Hash}] solving RecordSet ordinal ${tmpSolver.Ordinal} [${tmpSolver.Expression}]`);

			let tmpRecordSet = tmpView.getTabularRecordSet(j);

			if (typeof(tmpRecordSet) == 'object')
			{
				let tmpRecordSetKeys = Object.keys(tmpRecordSet);
				for (let l = 0; l < tmpRecordSetKeys.length; l++)
				{
					let tmpRecord = tmpRecordSet[tmpRecordSetKeys[l]];
					let tmpResultsObject = {};
					let tmpSolutionValue = tmpView.fable.ExpressionParser.solve(tmpSolver.Expression, tmpRecord, tmpResultsObject, tmpGroup.supportingManifest, tmpRecord);
					tmpView.log.trace(`Group ${tmpGroup.Hash} [${tmpSolver.Expression}] record ${l} result was ${tmpSolutionValue}`);
				}
			}
			if (typeof(tmpRecordSet) == 'array')
			{
				for (let l = 0; l < tmpRecordSet.length; l++)
				{
					let tmpRecord = tmpRecordSet[l];
					let tmpResultsObject = {};
					let tmpSolutionValue = tmpView.fable.ExpressionParser.solve(tmpSolver.Expression, tmpRecord, tmpResultsObject, tmpGroup.supportingManifest, tmpRecord);
					tmpView.log.trace(`Group ${tmpGroup.Hash} [${tmpSolver.Expression}] record ${l} result was ${tmpSolutionValue}`);
				}
			}
		}
	}

	/**
	 * Executes the section solvers.
	 *
	 * @param {Array} pViewSectionSolverArray - The array of view section solvers.
	 * @param {number} pOrdinal - The ordinal value.
	 */
	executeSectionSolvers(pViewSectionSolverArray, pOrdinal)
	{
		let tmpFiltered = (typeof(pOrdinal) === 'undefined') ? false : true;
		
		for (let i = 0; i < pViewSectionSolverArray.length; i++)
		{
			let tmpView = this.pict.views[pViewSectionSolverArray[i].ViewHash];
			let tmpSolver = this.checkSolver(pViewSectionSolverArray[i].Solver, tmpFiltered, pOrdinal);
			if (typeof(tmpSolver) === 'undefined')
			{
				continue;
			}

			// TODO: Precompile the solvers (it's super easy)
			tmpView.log.trace(`Dynamic View [${tmpView.UUID}]::[${tmpView.Hash}] solving equation ${i} ordinal ${tmpSolver.Ordinal} [${tmpView.options.Solvers[i]}]`);
			let tmpResultsObject = {};
			let tmpSolutionValue = tmpView.fable.ExpressionParser.solve(tmpSolver.Expression, tmpView.getMarshalDestinationObject(), tmpResultsObject, tmpView.sectionManifest, tmpView.getMarshalDestinationObject());
			tmpView.log.trace(`[${tmpSolver.Expression}] result was ${tmpSolutionValue}`);
		}
	}

	/**
	 * Executes the view solvers for the given array of views.
	 *
	 * @param {Array} pViewSolverArray - The array of view solvers to execute.
	 * @param {number} pOrdinal - The ordinal value.
	 */
	executeViewSolvers(pViewSolverArray, pOrdinal)
	{
		let tmpFiltered = (typeof(pOrdinal) === 'undefined') ? false : true;
		
		for (let i = 0; i < pViewSolverArray.length; i++)
		{
			let tmpSolver = this.checkSolver(pViewSolverArray[i].Solver, tmpFiltered, pOrdinal);
			if (typeof(tmpSolver) === 'undefined')
			{
				continue;
			}
			// Solve a normal view
			tmpView.log.trace(`Dynamic View [${tmpView.UUID}]::[${tmpView.Hash}] running solve() on view [${pViewSolverArray[i].ViewHash}`);
			let tmpView = this.pict.views[pViewSolverArray[i].ViewHash];
			tmpView.solve();
		}
	}

	checkAutoSolveOrdinal (pOrdinal, pOrdinalSet)
	{
		if (!(pOrdinal.toString() in pOrdinalSet))
		{
			pOrdinalSet[pOrdinal.toString()] = { ViewSolvers:[], SectionSolvers:[], GroupSolvers:[] };
		}
		return pOrdinalSet[pOrdinal];
	}

	/**
	 * Solves the views based on the provided view hashes or all views in pict.
	 *
	 * If non-dynamic views are also passed in, they are solved as well.
	 * 
	 * This algorithm is particularly complex because it solves views in 
	 * order across two dimensions:
	 * 
	 * 1. The order of the views in the view hash array.
	 * 2. Precedence order
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
	solveViews(pViewHashes)
	{
		this.log.trace(`Dynamic View Provider [${this.UUID}]::[${this.Hash}] solving views.`);
		let tmpViewHashes = Array.isArray(pViewHashes) ? pViewHashes : Object.keys(this.fable.views);

		let tmpOrdinalsToSolve = {};

		for (let i = 0; i < tmpViewHashes.length; i++)
		{
			let tmpView = this.fable.views[tmpViewHashes[i]];
			if (!tmpView.isPictSectionForm && !tmpView.isPictMetacontroller)
			{
				// This is just a normal view.  We will solve it at the appropriate ordinal.
				let tmpOrdinalContainer = this.checkAutoSolveOrdinal(tmpView.options.AutoSolveOrdinal, tmpOrdinalsToSolve);
				tmpOrdinalContainer.ViewSolvers.push({ViewHash:tmpViewHashes[i]});
			}
			else if (tmpView.isPictSectionForm)
			{
				// These guards are here because the metacontroller view masquerades as a section form view but isn't one.
				for (let j = 0; j < tmpView.sectionDefinition.Groups.length; j++)
				{
					let tmpGroup = tmpView.getGroup(j);
					if (`RecordSetSolvers` in tmpGroup)
					{
						for (let k = 0; k < tmpGroup.RecordSetSolvers.length; k++)
						{
							let tmpSolver = this.checkSolver(tmpGroup.RecordSetSolvers[k]);
							if (tmpSolver)
							{
								let tmpOrdinalContainer = this.checkAutoSolveOrdinal(tmpSolver.Ordinal, tmpOrdinalsToSolve);
								tmpOrdinalContainer.GroupSolvers.push({ViewHash:tmpViewHashes[i], GroupIndex:j, Solver:tmpSolver});
							}
						}
					}
				}
				if (Array.isArray(tmpView.options.Solvers))
				{
					// Add thje section solver(s)
					for (let j = 0; j < tmpView.options.Solvers.length; j++)
					{
						let tmpSolver = this.checkSolver(tmpView.options.Solvers[j]);
						if (tmpSolver)
						{
							let tmpOrdinalContainer = this.checkAutoSolveOrdinal(tmpSolver.Ordinal, tmpOrdinalsToSolve);
							tmpOrdinalContainer.SectionSolvers.push({ViewHash:tmpViewHashes[i], Solver:tmpSolver});
						}
					}
				}
			}
		}

		// Now sort the ordinal container keys
		let tmpOrdinalKeys = Object.keys(tmpOrdinalsToSolve);
		tmpOrdinalKeys.sort();

		// Now enumerate the keys and solve each layer of the solution set
		for (let i = 0; i < tmpOrdinalKeys.length; i++)
		{
			let tmpOrdinalContainer = tmpOrdinalsToSolve[tmpOrdinalKeys[i]];
			this.executeGroupSolvers(tmpOrdinalContainer.GroupSolvers, tmpOrdinalKeys[i]);
			this.executeSectionSolvers(tmpOrdinalContainer.SectionSolvers, tmpOrdinalKeys[i]);
			this.executeViewSolvers(tmpOrdinalContainer.ViewSolvers, tmpOrdinalKeys[i]);
		}
		
		console.log(tmpOrdinalsToSolve);
	}
}

module.exports = PictSectionFormTemplateProvider;
module.exports.default_configuration = _DefaultProviderConfiguration;