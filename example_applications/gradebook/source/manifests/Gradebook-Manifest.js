module.exports = (
{
	"Scope": "Gradebook",

	"Sections": [
		{
			"Hash": "ClassManagement",
			"Name": "My Classroom",
			"Groups": [
				{
					"Hash": "StudentList",
					"Name": "Student List",

					"Layout": "Tabular",
					"RecordSetAddress": "StudentList",
					"RecordManifest": "Student"
				},
				{
					"Hash": "AssignmentList",
					"Name": "Assignment List",

					"Layout": "Tabular",
					"RecordSetAddress": "AssignmentList",
					"RecordManifest": "Assignment"
				}
			]
		},
	],

	"Descriptors":
	{
		"StudentList":
			{
				"Name": "Student Roster",
				"Hash": "StudentData",
				"DataType": "Array",
				"Default": []
				, "PictForm": { "Section":"ClassManagement", "Group":"StudentList" }
			},
		"AssignmentList":
			{
				"Name": "Curriculum",
				"Hash": "StudentData",
				"DataType": "Array",
				"Default": []
				, "PictForm": { "Section":"ClassManagement", "Group":"AssignmentList" }
			}

	},

	"ReferenceManifests":
	{
		"Student": require(`./Student-Manifest.json`),
		"Assignment": require(`./Assignment-Manifest.json`)
	}
});