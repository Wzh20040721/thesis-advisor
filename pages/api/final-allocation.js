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
		// 获取学生ID
		const { data: student } = await supabase
			.from('students')
			.select('id')
			.eq('student_id', studentId)
			.single()

		if (!student) {
			return res.status(400).json({ error: '学生不存在' })
		}

		const { data, error } = await supabase
			.from('final_allocations')
			.select(`
				allocation_type,
				teachers (
					work_id,
					name
				)
			`)
			.eq('student_id', student.id)
			.single()

		if (error && error.code !== 'PGRST116') {
			throw error
		}

		res.status(200).json({ 
			allocation: data ? {
				teacher_work_id: data.teachers?.work_id,
				teacher_name: data.teachers?.name,
				allocation_type: data.allocation_type
			} : null
		})
	} catch (error) {
		console.error('获取最终分配结果错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}