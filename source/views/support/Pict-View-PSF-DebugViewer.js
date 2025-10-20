const libPictViewFormSupportBase = require(`./Pict-View-PSF-SupportBase.js`);

const defaultViewConfiguration = (
{
	ViewIdentifier: "Pict-Form-DebugViewer",

	DefaultRenderable: 'Pict-Form-DebugViewer-Renderable',
	DefaultDestinationAddress: "#Pict-Form-Extensions-Container",

	RenderOnLoad: false,

	CSS: /*css*/`
	#Pict-Form-Extensions-Container { position: absolute; left: 75%; top: 0px; width: 25%; background-color: blanchedalmond; margin: 2px; }
	#PSFDV-SectionList .PSFDV-Section { margin: 2px; padding: 2px; background-color: aliceblue; }
	#PSFDV-DynamicInputSection .PSFDV-Section { margin: 2px; padding: 2px; background-color: #c8fe44; }
	.PSFDV-Section-Group, .PSFDV-Section-Descriptors { margin-left: 5px; }
	.PSFDV-Section-Buttons { font-face: orange; }
	.PSFDV-Solver-Entry { margin-left: 10px; margin-left: 5px; font-family: "Courier New", "Lucida Console", monospace; white-space: nowrap; overflow: scroll; }
	.PSFDV-Solver-Result { font-family: "Courier New", "Lucida Console", monospace; background-color: #eefaee; white-space: nowrap; overflow: scroll; }
	.PSFDV-DataHeader { font-weight: bold; }
	.PSFDV-DeEmphasize { font-weight: light; font-size: smaller; }
	.PSFDV-Data { margin-left: 10px; line-height: 0.5; font-size: smaller; }
	.PSFDV-Label { font-weight: light; min-width: 15%; color: #334481; }
	.PSFDV-Hidden { display: none; }
`,

	Templates: [
		{
			Hash: "Pict-Form-DebugViewer-Content",
			Template: /*html*/`
<div>
	<h2>Pict Inline Form Editor</h2>
	{~T:Pict-Form-DebugViewer-MetacontrollerContainer~}
</div>`
		},
		{
			Hash: "Pict-Form-DebugViewer-MetacontrollerContainer",
			Template: /*html*/`
	<p class="PSFDV-Data"><span class="PSFDV-Label">Scope:</span> {~D:Context[0].getDynamicState().Scope~}</p>
	<div id="PSFDV-SectionList">
		{~TS:Pict-Form-DebugViewer-SectionContainer:Context[0].getDynamicState().SectionViews~}
	</div>
	<hr>
	<div id="PSFDV-DynamicInputSection">
		{~T:Pict-Form-DebugViewer-SectionContainer:Context[0].getDynamicState().DynamicInputView~}
	</div>
`
		},
		{
			Hash: "Pict-Form-DebugViewer-SectionContainer",
			Template: /*html*/`
	<div id="PSFDV-Section-{~D:Record.Hash~}" class="PSFDV-Section">
		<h3><span class="PSFDV-DeEmphasize">Section:</span> {~D:Record.sectionDefinition.Name~}</h3>
		<div class="PSDV-Section-Buttons"><a href="#" onclick="{~P~}.views['{~D:Record.View.Hash~}'].render()">[ render ]</a> <a href="#" onclick="{~P~}.ContentAssignment.assignContent('{~D:Record.View.options.DefaultDestinationAddress~}','')">[ clear ]</a> <a href="#" onclick="{~P~}.ContentAssignment.removeClass('#PSFDV-{~D:Record.View.Hash~}-Extra', 'PSFDV-Hidden')">[ Extra Data ]</a></div>
		<div id="PSFDV-{~D:Record.View.Hash~}-Extra" class="PSFDV-Hidden">
			<p class="PSFDV-Data"><span class="PSFDV-Label">Description:</span> {~D:Record.sectionDefinition.Description~}</p>
			<p class="PSFDV-Data"><span class="PSFDV-Label">Hash:</span> {~D:Record.View.Hash~}</p>
			<p class="PSFDV-Data"><span class="PSFDV-Label">HTML ID:</span> {~D:Record.View.sectionDefinition.Macro.HTMLID~}</p>
			<h4>Section Solvers:</h4>
			<div class="PSFDV-Section-Solvers">
				{~TS:Pict-Form-DebugViewer-SolverEntry:Record.Solvers[]<<~?ExpressionScope,==,Section?~>>~}
			</div>
			<h4>Tabular/RecordSet Solvers:</h4>
			<div class="PSFDV-Group-Solvers">
				{~TS:Pict-Form-DebugViewer-SolverEntry:Record.Solvers[]<<~?ExpressionScope,==,Group?~>>~}
			</div>
			<h4>Inputs:</h4>
			<div class="PSFDV-Section-Solver-DynamicInput">
				{~TS:Pict-Form-DebugViewer-GroupContainer:Record.View.sectionDefinition.Groups~}
			</div>
			<a href="#" onclick="{~P~}.ContentAssignment.addClass('#PSFDV-{~D:Record.View.Hash~}-Extra', 'PSFDV-Hidden')">[ Hide Extra Data for {~D:Record.View.Hash~} ]</a>
		</div>
	</div>
`
		},
		{
			Hash: "Pict-Form-DebugViewer-SolverEntry",
			Template: /*html*/`
			<div class="PSFDV-Section-Solver-Entry">
				<p class="PSFDV-Solver-Entry">{~D:Record.Expression~}</p>
				<p class="PSFDV-Data"><span class="PSFDV-Label">Last Result</span> <span class="PSFDV-Solver-Result">{~D:Record.LastResult~}</span></p>
				<p class="PSFDV-Data"><span class="PSFDV-Label">Sequence</span> Ordinal [{~D:Record.Ordinal~}] Index [{~D:Record.Index~}]</p>
			</div>
			`
		},
		{
			Hash: "Pict-Form-DebugViewer-GroupContainer",
			Template: /*html*/`
			<div class="PSFDV-Section-Group">
				<h8><span class="PSFDV-DeEmphasize">Group:</span> {~D:Record.Name~} [idx <em>{~D:Record.GroupIndex~}</em>]</h8>
				<p class="PSFDV-Data"><span class="PSFDV-Label">Layout:</span> {~D:Record.Layout~}</p>
				<div class="PSFDV-Section-Rows">
					{~TS:Pict-Form-DebugViewer-RowContainer:Record.Rows~}
				</div>
			</div>
			`
		},
		{
			Hash: "Pict-Form-DebugViewer-RowContainer",
			Template: /*html*/`
					<div class="PSFDV-Section-Descriptors">
						<h9>Row {~D:Record.Hash~}</h9>
						{~TS:Pict-Form-DebugViewer-DescriptorContainer:Record.Inputs~}
					</div>
`
		},
		{
			Hash: "Pict-Form-DebugViewer-DescriptorContainer",
			Template: /*html*/`
						<div class="PSFDV-Section-Descriptor">
							<p class="PSFDV-DataHeader"><span class="PSFDV-DeEmphasize">Input:</span> {~D:Record.Name~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">Hash</span> {~D:Record.Hash~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">DataType</span> {~D:Record.DataType~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">InputType</span> {~D:Record.PictForm.InputType~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">Informary Data Address</span> {~D:Record.PictForm.InformaryDataAddress~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">Input Index</span> {~D:Record.PictForm.InputIndex~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">HTML ID</span> {~D:Record.PictForm.Macro.HTMLID~}</p>
						</div>
					`
		},
		{
			Hash: "Pict-Form-DebugViewer-Container",
			Template: /*html*/`<div id="Pict-Form-Extensions-Container"></div>`
		}
	],
	Renderables: [
		{
			RenderableHash: "Pict-Form-DebugViewer-Renderable",
			TemplateHash: "Pict-Form-DebugViewer-Content"
		},
		{
			RenderableHash: "Pict-Form-DebugViewer-Container",
			TemplateHash: "Pict-Form-DebugViewer-Container",
			ContentDestinationAddress: 'body',
			RenderMethod: 'append_once',
			TestAddress: "#Pict-Form-Extensions-Container",
		}
	]
});

class PictFormsInlineEditor extends libPictViewFormSupportBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = PictFormsInlineEditor;

module.exports.default_configuration = defaultViewConfiguration;
