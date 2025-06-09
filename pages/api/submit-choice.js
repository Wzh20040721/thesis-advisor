import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { studentId, directionId, isObeyAllocation } = req.body

    if (!studentId || (!directionId && !isObeyAllocation)) {
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

        // 检查是否已经提交过选择
        const { data: existingChoice } = await supabase
            .from('student_choices')
            .select('id')
            .eq('student_id', student.id)
            .single()

        const choiceData = {
            student_id: student.id,
            selected_direction_id: directionId || null,
            is_obey_allocation: isObeyAllocation || false
        }

        if (existingChoice) {
            // 更新现有选择
            const { error } = await supabase
                .from('student_choices')
                .update(choiceData)
                .eq('id', existingChoice.id)

            if (error) throw error
        } else {
            // 创建新选择
            const { error } = await supabase
                .from('student_choices')
                .insert(choiceData)

            if (error) throw error
        }

        res.status(200).json({ success: true, message: '选择提交成功' })
    } catch (error) {
        console.error('提交选择错误:', error)
        res.status(500).json({ error: '服务器错误' })
    }
}