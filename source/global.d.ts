declare global {
	export interface Window {
		Chart: typeof import('chart.js').Chart;
	}
	var Chart: typeof import('chart.js').Chart;
}

export {}
