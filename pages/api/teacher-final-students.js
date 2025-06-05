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
			.from('final_allocations')
			.select(`
        student_id,
        allocation_type,
        students (
          name
        )
      `)
			.eq('teacher_id', teacherId)
			.order('allocation_type')

		if (error) throw error

		const formattedStudents = data?.map(s => ({
			student_id: s.student_id,
			student_name: s.students?.name || '',
			allocation_type: s.allocation_type
		})) || []

		res.status(200).json({ students: formattedStudents })
	} catch (error) {
		console.error('获取导师最终学生名单错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}