const libPictSectionForm = require('../../source/Pict-Section-Form.js');
//const libPictSectionForm = require('pict-section-form');


module.exports = libPictSectionForm.PictFormApplication;

module.exports.default_configuration.pict_configuration = (
		{
			"Product": "Simple",
			"DefaultFormManifest":
			{
				"Scope": "SuperSimpleForm",

				"Sections": [
					{
						"Hash": "Area",

						"Name": "Rectangular Area Calculator",
						"Description": "Calculate the area of a Rectangle",

						"Solvers":
							[
								"Area = Height * Width",
								"WidthCubeArea = Width ^ 3",
								"HeightCubeArea = Height ^ 3"
							],
						"MetaTemplates":
							[
								{
									"HashPostfix": "-Template-Wrap-Prefix",
									"Template": "<h1>Rectangular Area Micro-app</h1><div><a href=\"#\" onclick=\"_Pict.PictApplication.solve()\">[ solve ]</a></div><hr />"
								}
							]
					}
				],

				"Descriptors":
					{
						"Name":
							{
								"Name":"Rectangular Object's Name",
								"Hash":"Name",
								"DataType":"String"
								,"PictForm": { "Section":"Area", "Row":1, "Width":1 }
							},
						"Type":
							{
								"Name":"Type of Object",
								"Hash":"Type",
								"DataType":"String"
								,"PictForm": { "Section":"Area", "Row":1, "Width":1 }
							},

						"Width":
							{
								"Name":"Width",
								"Hash":"Name",
								"DataType":"Number",
								"Default": 100
								,"PictForm": { "Section":"Area", "Row":2, "Width":1 }
							},
						"Height":
							{
								"Name":"Height",
								"Hash":"Type",
								"DataType":"Number",
								"Default": 100
								,"PictForm": { "Section":"Area", "Row":2, "Width":1 }
							},

						"Solutions.WidthCubeArea":
							{
								"Name":"Area of Width Cubed",
								"Hash":"WidthCubeArea",
								"DataType":"String"
								,"PictForm": { "Section":"Area", "Row":3, "Width":1 }
							},
						"Solutions.HeightCubeArea":
							{
								"Name":"Area of Height Cubed",
								"Hash":"HeightCubeArea",
								"DataType":"String"
								,"PictForm": { "Section":"Area", "Row":3, "Width":1 }
							},

						"Solutions.Area":
							{
								"Name":"Area of Rectangle",
								"Hash":"Area",
								"DataType":"Number"
								,"PictForm": { "Section":"Area", "Row":4, "Width":2 }
							}
					}
			}
		});