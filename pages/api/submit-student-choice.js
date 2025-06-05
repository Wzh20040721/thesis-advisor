import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	const { studentId, selectedDirectionId, isObeyAllocation } = req.body

	if (!studentId || (selectedDirectionId === null && !isObeyAllocation)) {
		return res.status(400).json({ error: '参数不完整' })
	}

	try {
		// 检查是否已有选择记录
		const { data: existing } = await supabase
			.from('student_choices')
			.select('id')
			.eq('student_id', studentId)
			.single()

		const choiceData = {
			student_id: studentId,
			selected_direction_id: isObeyAllocation ? null : selectedDirectionId,
			is_obey_allocation: isObeyAllocation,
			updated_at: new Date().toISOString()
		}

		if (existing) {
			// 更新现有记录
			const { error } = await supabase
				.from('student_choices')
				.update(choiceData)
				.eq('student_id', studentId)

			if (error) throw error
		} else {
			// 创建新记录
			const { error } = await supabase
				.from('student_choices')
				.insert(choiceData)

			if (error) throw error
		}

		res.status(200).json({ success: true, message: '提交成功' })
	} catch (error) {
		console.error('提交学生选择错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}