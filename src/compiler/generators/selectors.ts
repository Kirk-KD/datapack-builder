import { mcfunctionGenerator } from '../generator'

mcfunctionGenerator.forBlock['mc_target_selector'] = function(block) {
	const base = block.getFieldValue('BASE')
	const filters: string[] = []

	for (let i = 0; ; i++) {
		const keyField = block.getField(`KEY_${i}`)
		const valueField = block.getField(`VALUE_${i}`)
		if (!keyField || !valueField) break

		const key = block.getFieldValue(`KEY_${i}`)
		const value = block.getFieldValue(`VALUE_${i}`).trim()
		if (!key || value.length === 0) continue
		filters.push(`${key}=${value}`)
	}

	const selector = filters.length > 0 ? `${base}[${filters.join(',')}]` : base
	return [selector, 0]
}
