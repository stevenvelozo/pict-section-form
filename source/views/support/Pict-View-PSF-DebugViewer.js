const libPictViewFormSupportBase = require(`./Pict-View-PSF-SupportBase.js`);

const defaultViewConfiguration = (
{
	ViewIdentifier: "Pict-Form-DebugViewer",

	DefaultRenderable: 'Pict-Form-DebugViewer-Renderable',
	DefaultDestinationAddress: "#Pict-Form-Extensions-Container",

	RenderOnLoad: false,

	CSS: /*css*/`
	:root{
		--PSFDV-gutter-size: 5px;
		--PSFDV-indentation-size: calc(2 * var(--PSFDV-gutter-size));
		--PSFDV-Global-background-color: #dedede;
		--PSFDV-Global-text-color: #333333;
		--PSFDV-Section-background-color: #efefef;
		--PSFDV-Section-button-color: #5A52A3;
		--PSFDV-Section-button-text-color: #D8D7E5;
		--PSFDV-Section-label-color: #999;
		--PSFDV-Section-Data-background-color: #fafafa;
		--PSFDV-Section-Group-Header-background-color: #ebebff;
		--PSFDV-Section-Group-Row-Header-background-color: #dcf0f0;
		--PSFDV-Solver-Entry-text-color: #bb4a9c;
		--PSFDV-Section-DynamicInput-background-color: #a3ccd8;
		--PSFDV-Section-DynamicInput-button-color: #2b89a4;
		--PSFDV-Section-DynamicInput-button-text-color: #D8D7E5;
	}
	/** Headers	*/
	.PSFDV-Extension-Header {
		font-size: 10px;
		font-weight: bold;
		margin-bottom: var(--PSFDV-gutter-size);
	}
	.PSFDV-Global-Header {
		padding: var(--PSFDV-gutter-size);
		margin: 0;
	}
	.PSFDV-Section-Header {
		padding: var(--PSFDV-gutter-size);
		margin: 0;
	}
	.PSFDV-Content-Header {
		padding: var(--PSFDV-gutter-size);
		margin: 0;
		background-color: var(--PSFDV-Section-background-color);
	}
	.PSFDV-Data-Header {
		font-weight: bold;
		border-bottom: 1px dotted #ccc;
		padding: var(--PSFDV-gutter-size);
	}
	/** Section content */
	.PSFDV-Section { 
		margin: var(--PSFDV-gutter-size);
		padding: var(--PSFDV-gutter-size);
		background-color: var(--PSFDV-Section-background-color);
	}
	.PSFDV-Section-Descriptors { 
		padding: var(--PSFDV-gutter-size) 0;
	}
	.PSFDV-Section-Group { 
		padding: var(--PSFDV-gutter-size);
	}
	.PSFDV-Section-Buttons {
		list-style-type: none;
		padding: 0;
		padding-bottom: var(--PSFDV-gutter-size);
		margin: calc(var(--PSFDV-gutter-size) * 2) var(--PSFDV-gutter-size);
	}
	.PSFDV-Section-Button { 
		display: inline;
		margin-right: calc(var(--PSFDV-gutter-size) * 0.25);
		text-decoration: none;
		background-color: var(--PSFDV-Section-button-color);
		padding: var(--PSFDV-gutter-size);
		border-radius: var(--PSFDV-gutter-size);
	}
	.PSFDV-Section-Button a { 
		text-decoration: none;
		color: var(--PSFDV-Section-button-text-color);
	}
	.PSFDV-Section-Button a:hover { 
		text-decoration: underline;
	}
	.PSFDV-Section-Solver-Entry:not(:last-child) {
		border-bottom: 1px solid #ccc;
	}
	.PSFDV-Solver-Entry { 
		font-family: "Courier New", "Lucida Console", monospace;
		font-weight: bold;
		margin-top: var(--PSFDV-gutter-size);
		padding: var(--PSFDV-gutter-size);
		line-height: 1.2;
		color: var(--PSFDV-Solver-Entry-text-color);
		border-bottom: 1px dotted #ccc;
	}
	.PSFDV-Solver-Result { 
		font-family: "Courier New", "Lucida Console", monospace;
		font-weight: bold;
		margin-top: var(--PSFDV-gutter-size);
		padding: 0 var(--PSFDV-gutter-size);
		line-height: 1.2;
	}
	.PSFDV-Section-ExtraData {
		padding-top: var(--PSFDV-gutter-size);
		background-color: var(--PSFDV-Section-Data-background-color);
	}
	.PSFDV-Section-Group .PSFDV-Content-Header.PSFDV-Section-Group-Header {
		background-color: var(--PSFDV-Section-Group-Header-background-color);
	}
	.PSFDV-Section-Group .PSFDV-Content-Header.PSFDV-Section-Group-Row-Header {
		background-color: var(--PSFDV-Section-Group-Row-Header-background-color);
	}
	.PSFDV-DeEmphasize { 
		color: var(--PSFDV-Section-label-color);
		font-size: smaller;
	}
	.PSFDV-Data { 
		margin-left: var(--PSFDV-indentation-size);
		line-height: 0.85;
		font-size: smaller;
	}
	.PSFDV-Label { 
		min-width: 15%;
		color: var(--PSFDV-Section-label-color);
		margin: var(--PSFDV-gutter-size) 0;
	}
	.PSFDV-Label::after {
		content: ": ";
	}
	.PSFDV-Hidden { 
		display: none;
	}
	.PSFDV-Section-Solver-DynamicInput {
		background-color: #ffffff;
	}
	
	/** empty states */
	.PSFDV-Section-Solvers:empty::before {
		content: "No Section Solvers Defined";
		font-style: italic;
		color: var(--PSFDV-Section-label-color);
		margin-left: var(--PSFDV-indentation-size);
		text-align: center;
		padding: var(--PSFDV-gutter-size);
		display: block;
		font-size: smaller;
	}
	.PSFDV-Group-Solvers:empty::before {
		content: "No Group/RecordSet Solvers Defined";
		font-style: italic;
		color: var(--PSFDV-Section-label-color);
		margin-left: var(--PSFDV-indentation-size);
		text-align: center;
		padding: var(--PSFDV-gutter-size);
		display: block;
		font-size: smaller;
	}

	/** Dynamic Input Section */
	#PSFDV-DynamicInputSection .PSFDV-Section { 
		margin: var(--PSFDV-gutter-size);
		padding: var(--PSFDV-gutter-size);
		background-color: var(--PSFDV-Section-DynamicInput-background-color);
	}

	#PSFDV-DynamicInputSection .PSFDV-Section .PSFDV-Section-Button { 
		background-color: var(--PSFDV-Section-DynamicInput-button-color);
	}
	#PSFDV-DynamicInputSection .PSFDV-Section .PSFDV-Section-Button a { 
		color: var(--PSFDV-Section-DynamicInput-button-text-color);
	}
	#PSFDV-DynamicInputSection .PSFDV-Section .PSFDV-Label,
	#PSFDV-DynamicInputSection .PSFDV-Section .PSFDV-DeEmphasize { 
		color: var(--PSFDV-Section-DynamicInput-button-color);
	}
	#PSFDV-DynamicInputSection .PSFDV-Section-Descriptors { 
		border-left: 5px solid var(--PSFDV-Section-DynamicInput-background-color);
	}
	#PSFDV-DynamicInputSection .PSFDV-Section-Group { 
		border-left: 5px solid var(--PSFDV-Section-DynamicInput-button-color);
	}
`,

	Templates: [
		{
			Hash: "Pict-Form-DebugViewer-Content",
			Template: /*html*/`
<div id="Pict-Form-DebugViewer-Content">
	<h2 class="PSFDV-Global-Header">Pict Inline Form Editing Tool</h2>
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
		<h3 class="PSFDV-Section-Header"><span class="PSFDV-DeEmphasize">Section:</span> {~D:Record.sectionDefinition.Name~}</h3>
		<ul class="PSFDV-Section-Buttons">
			<li class="PSFDV-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.views['{~D:Record.View.Hash~}'].render()">Render</a></li>
			<li class="PSFDV-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.assignContent('{~D:Record.View.options.DefaultDestinationAddress~}','')">Clear</a></li>
			<li class="PSFDV-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.removeClass('#PSFDV-{~D:Record.View.Hash~}-Extra', 'PSFDV-Hidden')">Extra Data</a></li>
		</ul>
		<div id="PSFDV-{~D:Record.View.Hash~}-Extra" class="PSFDV-Hidden PSFDV-Section-ExtraData">
			<p class="PSFDV-Data">
				<span class="PSFDV-Label">Description</span> {~D:Record.sectionDefinition.Description~}
			</p>
			<p class="PSFDV-Data">
				<span class="PSFDV-Label">Hash</span> {~D:Record.View.Hash~}
			</p>
			<p class="PSFDV-Data">
				<span class="PSFDV-Label">HTML ID</span> {~D:Record.View.sectionDefinition.Macro.HTMLID~}
			</p>
			<h4 class="PSFDV-Content-Header">Section Solvers:</h4>
			<div class="PSFDV-Section-Solvers">{~TS:Pict-Form-DebugViewer-SolverEntry:Record.Solvers[]<<~?ExpressionScope,==,Section?~>>~}</div>
			<h4 class="PSFDV-Content-Header">Tabular/RecordSet Solvers:</h4>
			<div class="PSFDV-Group-Solvers">{~TS:Pict-Form-DebugViewer-SolverEntry:Record.Solvers[]<<~?ExpressionScope,==,Group?~>>~}</div>
			<h4 class="PSFDV-Content-Header">Inputs:</h4>
			<div class="PSFDV-Section-Solver-DynamicInput">
				{~TS:Pict-Form-DebugViewer-GroupContainer:Record.View.sectionDefinition.Groups~}
			</div>
			<ul class="PSFDV-Section-Buttons">
				<li class="PSFDV-Section-Button"><a href="javascript:void(0);" onclick="{~P~}.ContentAssignment.addClass('#PSFDV-{~D:Record.View.Hash~}-Extra', 'PSFDV-Hidden')">Hide Extra Data for {~D:Record.View.Hash~}</a></li>
			</ul>
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
				<h5 class="PSFDV-Content-Header PSFDV-Section-Group-Header">
					<span class="PSFDV-DeEmphasize">Group:</span> {~D:Record.Name~} [idx <em>{~D:Record.GroupIndex~}</em>]
				</h5>
				<p class="PSFDV-Data"><span class="PSFDV-Label">Layout</span> {~D:Record.Layout~}</p>
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
						<h6 class="PSFDV-Content-Header PSFDV-Section-Group-Row-Header">
							<span class="PSFDV-DeEmphasize">Row:</span> {~D:Record.Hash~}
						</h6>
						{~TS:Pict-Form-DebugViewer-DescriptorContainer:Record.Inputs~}
					</div>
`
		},
		{
			Hash: "Pict-Form-DebugViewer-DescriptorContainer",
			Template: /*html*/`
						<div class="PSFDV-Section-Descriptor">
							<p class="PSFDV-Data-Header"><span class="PSFDV-DeEmphasize">Input:</span> {~D:Record.Name~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">Hash</span> {~D:Record.Hash~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">DataType</span> {~D:Record.DataType~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">InputType</span> {~D:Record.PictForm.InputType~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">Informary Data Address</span> {~D:Record.PictForm.InformaryDataAddress~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">Input Index</span> {~D:Record.PictForm.InputIndex~}</p>
							<p class="PSFDV-Data"><span class="PSFDV-Label">HTML ID</span> {~D:Record.PictForm.Macro.HTMLID~}</p>
						</div>
					`
		}
	],
	Renderables: [
		{
			RenderableHash: "Pict-Form-DebugViewer-Renderable",
			TemplateHash: "Pict-Form-DebugViewer-Content"
		}
	]
});

class PictFormsInlineEditor extends libPictViewFormSupportBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.DisplayShortName = 'IE';
		this.DisplayLongName = 'InlineEditor';
	}
}

module.exports = PictFormsInlineEditor;

module.exports.default_configuration = defaultViewConfiguration;
