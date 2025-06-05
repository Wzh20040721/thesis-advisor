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
		// 获取该导师的所有研究方向
		const { data: directions } = await supabase
			.from('research_directions')
			.select('id, direction_name')
			.eq('teacher_id', teacherId)

		if (!directions || directions.length === 0) {
			return res.status(200).json({ students: [] })
		}

		const directionIds = directions.map(d => d.id)

		// 获取选择这些方向的学生
		const { data: students, error } = await supabase
			.from('student_choices')
			.select(`
        student_id,
        selected_direction_id,
        students (
          name
        ),
        research_directions (
          direction_name
        )
      `)
			.in('selected_direction_id', directionIds)

		if (error) throw error

		// 格式化数据
		const formattedStudents = students?.map(s => ({
			student_id: s.student_id,
			student_name: s.students?.name || '',
			direction_id: s.selected_direction_id,
			direction_name: s.research_directions?.direction_name || ''
		})) || []

		res.status(200).json({ students: formattedStudents })
	} catch (error) {
		console.error('获取选择导师方向的学生错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}