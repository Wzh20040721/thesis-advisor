import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	const { teacherId, studentId } = req.body

	if (!teacherId || !studentId) {
		return res.status(400).json({ error: '参数不完整' })
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

		// 检查导师是否已经选择过学生
		const { data: existing } = await supabase
			.from('teacher_selections')
			.select('id')
			.eq('teacher_id', teacherId)
			.single()

		if (existing) {
			return res.status(400).json({ error: '您已经选择过学生了' })
		}

		// 检查学生是否已被其他导师选择
		const { data: studentSelected } = await supabase
			.from('teacher_selections')
			.select('id')
			.eq('student_id', student.id)
			.single()

		if (studentSelected) {
			return res.status(400).json({ error: '该学生已被其他导师选择' })
		}

		// 创建选择记录
		const { error } = await supabase
			.from('teacher_selections')
			.insert({
				teacher_id: teacherId,
				student_id: student.id
			})

		if (error) throw error

		// 更新导师状态
		await supabase
			.from('teachers')
			.update({
				has_selected_student: true,
				updated_at: new Date().toISOString()
			})
			.eq('id', teacherId)

		res.status(200).json({ success: true, message: '选择成功' })
	} catch (error) {
		console.error('选择学生错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}