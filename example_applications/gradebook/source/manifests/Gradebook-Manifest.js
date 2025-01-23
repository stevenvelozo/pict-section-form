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
					"MinimumRowCount": 5,
					"MaximumRowCount": 15,
					"RecordSetAddress": "StudentList",
					"RecordManifest": "Student"
				},
				{
					"Hash": "AssignmentList",
					"Name": "Assignment List",

					"MinimumRowCount": 5,
					"MaximumRowCount": 15,

					"DefaultRows": [{"Title": "Assignment 1: Addition", "AssignmentWeight": "8.675309", "Points": 425, "Weight": 0.25, "DueDate": "2021-12-31T23:59:59.999Z"},
									{"Title": "Assignment 2: Subtraction", "AssignmentWeight": "5.1", "Weight": 0.95, "DueDate": "2021-12-31T23:59:59.999Z"},
									{"Title": "Assignment 3: Multiplication", "AssignmentWeight": 2, "Points": 125, "Weight": 0.75, "DueDate": "2021-12-31T23:59:59.999Z"},
									{"Title": "Assignment 4: Deletion", "AssignmentWeight": "21.90", "Points": 235, "Weight": 0.235, "DueDate": "2021-12-31T23:59:59.999Z"},
									{"Title": "Assignment 5: Division", "AssignmentWeight": "0.2", "Points": 100, "Weight": 0.5, "DueDate": "2021-12-31T23:59:59.999Z"},
									{"Title": "Assignment 6: Exponents", "AssignmentWeight": "0.1", "Points": 50, "Weight": 0.1, "DueDate": "2021-12-31T23:59:59.999Z"},
									{"Title": "Assignment 7: Logarithms", "AssignmentWeight": "0.01", "Points": 10, "Weight": 0.01, "DueDate": "2021-12-31T23:59:59.999Z"},
									{"Title": "Assignment 8: Trigonometry", "AssignmentWeight": "0.001", "Points": 5, "Weight": 0.001, "DueDate": "2021-12-31T23:59:59.999Z"},
									{"Title": "Assignment 9: Calculus", "AssignmentWeight": "0.0001", "Points": 1, "Weight": 0.0001, "DueDate": "2021-12-31T23:59:59.999Z"},
									{"Title": "Assignment 10: Quantum Physics", "AssignmentWeight": "0.00001", "Points": 0, "Weight": 0.00001, "DueDate": "2021-12-31T23:59:59.999Z"}
					],

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