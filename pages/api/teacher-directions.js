import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	const { teacherId } = req.query

	if (!teacherId) {
		return res.status(400).json({ error: '缺少教师ID' })
	}

	try {
		const { data, error } = await supabase
			.from('teachers')
			.select('research_direction_1, research_direction_2, research_direction_3')
			.eq('id', teacherId)
			.single()

		if (error) throw error

		res.status(200).json({
			directions: {
				direction1: data?.research_direction_1 || '',
				direction2: data?.research_direction_2 || '',
				direction3: data?.research_direction_3 || ''
			}
		})
	} catch (error) {
		console.error('获取导师研究方向错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}