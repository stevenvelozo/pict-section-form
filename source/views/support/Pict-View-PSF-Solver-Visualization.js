const libPictViewFormSupportBase = require(`./Pict-View-PSF-SupportBase.js`);

const defaultViewConfiguration = (
{
	ViewIdentifier: "Pict-Form-Solver",

	DefaultRenderable: 'Pict-Form-Solver-Renderable',
	DefaultDestinationAddress: "#Pict-Form-Extensions-Container",

	RenderOnLoad: false,

	CSS: /*css*/``,

	Templates: [
		{
			Hash: "Pict-Form-Solver-Content",
			Template: /*html*/`
<div id="Pict-Form-Solver-Content">
	<h2 class="PSFS-Global-Header">Pict Solver Visualization</h2>
	<ul class="PSFExt-Section-Buttons">
		<li class="PSFExt-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.views.PictFormMetacontroller.solve(); {~P~}.views.PictFormMetacontroller.marshalFormSections(); {~P~}.views['{~D:Context[0].Hash~}'].render();">Solve</a></li>
	</ul>
	{~TS:Pict-Form-Solver-Entries:Context[0].getDynamicState().Solvers~}
</div>
`
		},
		{
			Hash: "Pict-Form-Solver-Entries",
			Template: /*html*/`
	<div id="PSFExt-Section-{~D:Record.Hash~}" class="PSFExt-Section">
		<h3 class="PSFExt-Section-Header">
			<span class="PSFExt-DeEmphasize">{~D:Record.ExpressionScope~} {~D:Record.SectionOrdinal~}.G.{~D:Record.GroupOrdinal~}</span> Ord</span>{~D:Record.Ordinal~} <span class="PSFExt-DeEmphasize">Ind</span>{~D:Record.Index~}
			[ <a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.toggleClass('#PSFExt-{~D:Record.ExpressionScope~}-{~D:Record.ViewHash~}-S{~D:Record.SectionOrdinal~}-G{~D:Record.GroupOrdinal~}-{~D:Record.Index~}-ExpressionContainer', 'PSFExt-Hidden');">Edit</a> ]
			[ <a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.toggleClass('#PSFExt-{~D:Record.ExpressionScope~}-{~D:Record.ViewHash~}-S{~D:Record.SectionOrdinal~}-G{~D:Record.GroupOrdinal~}-{~D:Record.Index~}-ExtraDataContainer', 'PSFExt-Hidden');">More</a> ]
		</h3>
		
		<div id="PSFExt-{~D:Record.ExpressionScope~}-{~D:Record.ViewHash~}-S{~D:Record.SectionOrdinal~}-G{~D:Record.GroupOrdinal~}-{~D:Record.Index~}-ExpressionContainer" class="PSFExt-Hidden">
			<p class="PSFExt-Data">
				<textarea id="PSFExt-{~D:Record.ExpressionScope~}-{~D:Record.ViewHash~}-S{~D:Record.SectionOrdinal~}-G{~D:Record.GroupOrdinal~}-{~D:Record.Index~}-ExpressionEditbox" class="PSFExt-ExpressionEditbox">{~D:Record.Expression~}</textarea>
			</p>
			<ul class="PSFExt-Section-Buttons">
				<li class="PSFExt-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.views['{~D:Context[0].Hash~}'].updateExpressionFromElement('#PSFExt-{~D:Record.ExpressionScope~}-{~D:Record.ViewHash~}-S{~D:Record.SectionOrdinal~}-G{~D:Record.GroupOrdinal~}-{~D:Record.Index~}-ExpressionEditbox', '{~D:Record.ExpressionScope~}', '{~D:Record.ViewHash~}', {~D:Record.SectionOrdinal~}, {~D:Record.Index~}, '#PSFExt-{~D:Record.ExpressionScope~}-{~D:Record.ViewHash~}-S{~D:Record.SectionOrdinal~}-G{~D:Record.GroupOrdinal~}-{~D:Record.Index~}-Display'); {~P~}.ContentAssignment.addClass('#PSFExt-{~D:Record.ExpressionScope~}-{~D:Record.ViewHash~}-S{~D:Record.SectionOrdinal~}-G{~D:Record.GroupOrdinal~}-{~D:Record.Index~}-ExpressionContainer', 'PSFExt-Hidden');">Apply</a></li>
			</ul>
		</div>
		<div id="PSFExt-{~D:Record.ExpressionScope~}-{~D:Record.ViewHash~}-S{~D:Record.SectionOrdinal~}-G{~D:Record.GroupOrdinal~}-{~D:Record.Index~}-Extra" class="PSFExt-Section-ExtraData">
			<p class="PSFExt-Solver-Entry" id="PSFExt-{~D:Record.ExpressionScope~}-{~D:Record.ViewHash~}-S{~D:Record.SectionOrdinal~}-G{~D:Record.GroupOrdinal~}-{~D:Record.Index~}-Display">{~D:Record.Expression~}</p>
			<p class="PSFExt-Data">
				<span class="PSFExt-Label">Value</span> {~TBT:Record.Value:object,array:Pict-Form-RecordValueDisplayComplex:Record:Pict-Form-RecordValueDisplaySimple~}
			</p>
		</div>
		<div id="PSFExt-{~D:Record.ExpressionScope~}-{~D:Record.ViewHash~}-S{~D:Record.SectionOrdinal~}-G{~D:Record.GroupOrdinal~}-{~D:Record.Index~}-ExtraDataContainer" class="PSFExt-Section-ExtraData PSFExt-Hidden">
			<h5 class="PSFExt-Content-Header PSFExt-Section-Group-Header">{~D:Record.LastResultsObject.PostfixTokenObjects.length~} Postfix Tokens</h5>
			{~TS:Pict-Form-Solver-PostfixToken:Record.LastResultsObject.PostfixTokenObjects~}
			<h5 class="PSFExt-Content-Header PSFExt-Section-Group-Header">Virtual Symbols</h5>
			{~TVS:Pict-Form-Solver-VirtualSymbols:Record.LastResultsObject.VirtualSymbols~}
			<h5 class="PSFExt-Content-Header PSFExt-Section-Group-Header">{~D:Record.LastResultsObject.PostfixTokenObjects.length~} Postfix Solve List</h5>
			{~TVS:Pict-Form-Solver-PostFixSolveEntry:Record.LastResultsObject.PostfixSolveList~}
		</div>
	</div>
`
		},
		{
			Hash: "Pict-Form-Solver-PostfixToken",
			Template: /*html*/`
			<p class="PSFExt-Data">
				<span class="PSFExt-Label">{~D:Record.Type~}</span> <span class="PSFExt-Token">{~D:Record.Token~}</span>
			</p>
`
		},
		{
			Hash: "Pict-Form-Solver-VirtualSymbols",
			Template: /*html*/`
			<p class="PSFExt-Data">
				<span class="PSFExt-Label">{~D:Record.Key~}</span> {~TBT:Record.Value:object,array:Pict-Form-RecordValueDisplayComplex:Record:Pict-Form-RecordValueDisplaySimple~}
			</p>
`
		},
		{
			Hash: "Pict-Form-RecordValueDisplayComplex",
			Template: /*html*/`
			<!-- Complex Value -->
			{~TBT:Record.Value:array:Pict-Form-RecordValueDisplayArray:Record:Pict-Form-RecordValueDisplayObject~}
`
		},
		{
			Hash: "Pict-Form-RecordValueDisplayObject",
			Template: /*html*/`JSON Object
			<!-- RAW Object
{~DJ:Record.Value~}
			-->`
		},
		{
			Hash: "Pict-Form-RecordValueDisplayArray",
			Template: /*html*/`JSON Array ({~D:Record.Value.length~} items)
			<!-- RAW Array
{~DJ:Record.Value~}
			-->`
		},
		{
			Hash: "Pict-Form-RecordValueDisplaySimple",
			Template: /*html*/`{~D:Record.Value~}`
		},
		{
			Hash: "Pict-Form-Solver-PostFixSolveEntry",
			Template: /*html*/`
			<div>
				<h6 class="PSFExt-Content-Header PSFExt-Data-Header">Postfix Solve Entry #{~D:Record.Key~} Symbol <span class="PSFExt-Token">{~D:Record.Value.VirtualSymbolName~}</span></h6>
				<table class="PSFExt-Data-Table">
					<th>
						<tr><td></td><td>Left</td><td>Operation</td><td>Right</td></tr>
					</th>
					<tr>
						<td>Virtual Symbol</td>
						<td> {~D:Record.Value.LeftValue.VirtualSymbolName~} </td>
						<td> {~D:Record.Value.Operation.VirtualSymbolName~} </td>
						<td> {~D:Record.Value.RightValue.VirtualSymbolName~} </td>
					</tr>
					<tr>
						<td>Value</td>
						<td> {~TBT:Record.Value.LeftValue.Value:object,array:Pict-Form-RecordValueDisplayComplex:Record.Value.LeftValue:Pict-Form-RecordValueDisplaySimple~} </td>
						<td></td>
						<td> {~TBT:Record.Value.RightValue.Value:object,array:Pict-Form-RecordValueDisplayComplex:Record.Value.RightValue:Pict-Form-RecordValueDisplaySimple~} </td>
					</tr>
					<tr>
						<td>Tokens</td>
						<td> {~D:Record.Value.LeftValue.Token~} </td>
						<td> {~D:Record.Value.Operation.Token~} </td>
						<td> {~D:Record.Value.RightValue.Token~} </td>
					</tr>
					<tr>
						<td>Type</td>
						<td> {~D:Record.Value.LeftValue.Type~} </td>
						<td> {~D:Record.Value.Operation.Type~} </td>
						<td> {~D:Record.Value.RightValue.Type~} </td>
					</tr>
					<tr>
						<td>Solve Layer</td>
						<td> {~D:Record.Value.LeftValue.SolveLayerStack~} </td>
						<td></td>
						<td> {~D:Record.Value.RightValue.SolveLayerStack~} </td>
					</tr>
				</table>
			</div>
`
		},
	],
	Renderables: [
		{
			RenderableHash: "Pict-Form-Solver-Renderable",
			TemplateHash: "Pict-Form-Solver-Content"
		}
	]
});

class PictFormsSolver extends libPictViewFormSupportBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.DisplayShortName = 'SV';
		this.DisplayLongName = 'SolverVisualization';
	}
}

module.exports = PictFormsSolver;

module.exports.default_configuration = defaultViewConfiguration;
