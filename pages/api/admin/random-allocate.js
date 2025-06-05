import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	const { adminPassword } = req.body

	if (adminPassword !== 'admin123456') {
		return res.status(401).json({ error: '管理员密码错误' })
	}

	try {
		// 1. 获取所有已被导师选中的学生
		const { data: selectedStudents } = await supabase
			.from('teacher_selections')
			.select('student_id, teacher_id')

		// 创建已选择的记录
		if (selectedStudents && selectedStudents.length > 0) {
			const selectedAllocations = selectedStudents.map(s => ({
				student_id: s.student_id,
				teacher_id: s.teacher_id,
				allocation_type: 'selected'
			}))

			await supabase
				.from('final_allocations')
				.insert(selectedAllocations)
		}

		// 2. 获取所有未被选中的学生
		const selectedStudentIds = selectedStudents?.map(s => s.student_id) || []

		const { data: unallocatedStudents } = await supabase
			.from('student_choices')
			.select('student_id')
			.not('student_id', 'in', `(${selectedStudentIds.join(',')})`)

		if (!unallocatedStudents || unallocatedStudents.length === 0) {
			return res.status(200).json({
				success: true,
				message: '所有学生都已被导师选择，无需随机分配'
			})
		}

		// 3. 获取所有导师，按工号排序
		const { data: teachers } = await supabase
			.from('teachers')
			.select('id, work_id, has_selected_student')
			.order('work_id')

		if (!teachers || teachers.length === 0) {
			return res.status(400).json({ error: '没有可用的导师' })
		}

		// 4. 计算每个导师当前的学生数
		const teacherStudentCount = {}
		teachers.forEach(t => {
			teacherStudentCount[t.id] = t.has_selected_student ? 1 : 0
		})

		// 5. 随机分配算法
		const randomAllocations = []
		const shuffledStudents = [...unallocatedStudents].sort(() => Math.random() - 0.5)

		for (const student of shuffledStudents) {
			// 找到学生数最少的导师
			let minCount = Math.min(...Object.values(teacherStudentCount))
			let availableTeachers = teachers.filter(t => teacherStudentCount[t.id] === minCount)

			// 如果有多个导师学生数相同，按工号顺序选择第一个
			const selectedTeacher = availableTeachers[0]

			randomAllocations.push({
				student_id: student.student_id,
				teacher_id: selectedTeacher.id,
				allocation_type: 'random'
			})

			teacherStudentCount[selectedTeacher.id]++
		}

		// 6. 插入随机分配记录
		if (randomAllocations.length > 0) {
			const { error } = await supabase
				.from('final_allocations')
				.insert(randomAllocations)

			if (error) throw error
		}

		// 7. 更新系统阶段为结果公布
		await supabase
			.from('system_config')
			.update({
				config_value: 'result',
				updated_at: new Date().toISOString()
			})
			.eq('config_key', 'system_phase')

		res.status(200).json({
			success: true,
			message: `随机分配完成，共分配了 ${randomAllocations.length} 名学生`
		})
	} catch (error) {
		console.error('随机分配错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}