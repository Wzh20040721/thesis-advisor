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
		console.log('开始获取导师研究方向，teacherId:', teacherId);
		
		// 获取该导师的所有研究方向
		const { data: directions, error: directionsError } = await supabase
			.from('research_directions')
			.select('id, direction_name')
			.eq('teacher_id', teacherId)

		if (directionsError) {
			console.error('获取研究方向错误:', directionsError);
			throw directionsError;
		}

		console.log('获取到的研究方向:', directions);

		if (!directions || directions.length === 0) {
			console.log('该导师没有研究方向');
			return res.status(200).json({ students: [] })
		}

		const directionIds = directions.map(d => d.id)
		console.log('研究方向ID列表:', directionIds);

		// 获取选择这些方向的学生
		const { data: students, error: studentsError } = await supabase
			.from('student_choices')
			.select(`
				student_id,
				selected_direction_id,
				students (
					name,
					student_id
				),
				research_directions (
					direction_name
				)
			`)
			.in('selected_direction_id', directionIds)
			.order('updated_at', { ascending: false })

		if (studentsError) {
			console.error('获取学生选择错误:', studentsError);
			throw studentsError;
		}

		console.log('获取到的学生选择:', students);

		// 格式化数据
		const formattedStudents = students?.map(s => ({
			student_id: s.students?.student_id,
			name: s.students?.name || '',
			direction_name: s.research_directions?.direction_name || ''
		})) || []

		console.log('格式化后的学生数据:', formattedStudents);

		res.status(200).json({ students: formattedStudents })
	} catch (error) {
		console.error('获取选择导师方向的学生错误:', error)
		res.status(500).json({ 
			error: '服务器错误',
			details: error.message,
			code: error.code
		})
	}
}