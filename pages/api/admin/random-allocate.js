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
			.select(`
				student_id,
				teacher_id
			`)

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

		// 2. 获取所有未被选中的学生，按学号排序
		const selectedStudentIds = selectedStudents?.map(s => s.student_id) || []

		const { data: unallocatedStudents } = await supabase
			.from('students')
			.select('id, student_id')
			.not('id', 'in', `(${selectedStudentIds.join(',')})`)
			.order('student_id')

		if (!unallocatedStudents || unallocatedStudents.length === 0) {
			return res.status(200).json({
				success: true,
				message: '所有学生都已被导师选择，无需随机分配'
			})
		}

		// 3. 获取所有导师，按工号排序
		const { data: teachers } = await supabase
			.from('teachers')
			.select('id, work_id, max_students')
			.order('work_id')

		if (!teachers || teachers.length === 0) {
			return res.status(400).json({ error: '没有可用的导师' })
		}

		// 4. 计算每个导师当前的学生数
		const teacherStudentCount = {}
		teachers.forEach(t => {
			teacherStudentCount[t.id] = 0
		})

		// 5. 基于编号的轮流分配算法
		const randomAllocations = []
		let currentTeacherIndex = 0

		// 遍历所有未分配的学生
		for (const student of unallocatedStudents) {
			let allocated = false
			
			// 从当前导师开始，尝试分配
			for (let i = 0; i < teachers.length; i++) {
				// 计算实际要检查的导师索引（循环使用）
				const teacherIndex = (currentTeacherIndex + i) % teachers.length
				const teacher = teachers[teacherIndex]

				// 检查导师是否还有名额
				if (teacherStudentCount[teacher.id] < teacher.max_students) {
					// 分配学生给该导师
					randomAllocations.push({
						student_id: student.id,
						teacher_id: teacher.id,
						allocation_type: 'random'
					})
					teacherStudentCount[teacher.id]++
					// 更新下一个要检查的导师索引
					currentTeacherIndex = (teacherIndex + 1) % teachers.length
					allocated = true
					break
				}
			}

			// 如果无法分配（所有导师都已满），记录错误
			if (!allocated) {
				console.error(`无法为学生 ${student.student_id} 分配导师：所有导师都已满`)
			}
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
			message: `分配完成，共分配了 ${randomAllocations.length} 名学生`
		})
	} catch (error) {
		console.error('分配错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}