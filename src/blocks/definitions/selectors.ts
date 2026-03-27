const targetSelectors: any[] = [
	{
		"type": "mc_target_selector",
		"tooltip": "Build a target selector with optional filter arguments",
		"helpUrl": "",
		"message0": "target selector %1",
		"args0": [
			{
				"type": "field_dropdown",
				"name": "BASE",
				"options": [
					["@s", "@s"],
					["@p", "@p"],
					["@a", "@a"],
					["@e", "@e"],
					["@r", "@r"],
					["@n", "@n"]
				]
			}
		],
		"output": "mc_selector",
		"mutator": "mc_selector_mutator"
	}
]

export default targetSelectors