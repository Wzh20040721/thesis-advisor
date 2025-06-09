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
		const { data: directions, error } = await supabase
			.from('research_directions')
			.select('id, direction_name')
			.eq('teacher_id', teacherId)
			.order('id')

		if (error) throw error

		// 将研究方向转换为数组格式
		const formattedDirections = {
			direction1: directions[0]?.direction_name || '',
			direction2: directions[1]?.direction_name || '',
			direction3: directions[2]?.direction_name || ''
		}

		res.status(200).json({
			directions: formattedDirections
		})
	} catch (error) {
		console.error('获取导师研究方向错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}