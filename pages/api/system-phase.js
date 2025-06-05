import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	try {
		const { data, error } = await supabase
			.from('system_config')
			.select('config_value')
			.eq('config_key', 'system_phase')
			.single()

		if (error) throw error

		res.status(200).json({
			phase: data?.config_value || 'direction_input'
		})
	} catch (error) {
		console.error('获取系统阶段错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}