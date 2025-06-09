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
			.from('teacher_selections')
			.select(`
				student_id,
				students (
					student_id,
					name
				)
			`)
			.eq('teacher_id', teacherId)
			.single()

		if (error && error.code !== 'PGRST116') {
			throw error
		}

		res.status(200).json({ selection: data })
	} catch (error) {
		console.error('获取导师选择错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}