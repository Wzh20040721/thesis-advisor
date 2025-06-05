import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	const { studentId } = req.query

	if (!studentId) {
		return res.status(400).json({ error: '缺少学生ID' })
	}

	try {
		const { data, error } = await supabase
			.from('final_allocation_view')
			.select('*')
			.eq('student_id', studentId)
			.single()

		if (error && error.code !== 'PGRST116') {
			throw error
		}

		res.status(200).json({ allocation: data })
	} catch (error) {
		console.error('获取最终分配结果错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}