import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { studentId, choices } = req.body

    if (!studentId || !choices || choices.length === 0) {
        return res.status(400).json({ error: '参数不完整' })
    }

    try {
        // 验证学生是否存在
        const { data: student } = await supabase
            .from('students')
            .select('student_id, name')
            .eq('student_id', studentId)
            .single()

        if (!student) {
            return res.status(401).json({ error: '学生不存在' })
        }

        // 检查是否已有选择记录
        const { data: existing } = await supabase
            .from('student_choices')
            .select('*')
            .eq('student_id', studentId)
            .single()

        const choiceData = {
            student_id: studentId,
            teacher_id_1: choices[0] || null,
            teacher_id_2: choices[1] || null,
            teacher_id_3: choices[2] || null,
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

        // 删除旧的匹配记录
        await supabase
            .from('teacher_student_matches')
            .delete()
            .eq('student_id', studentId)

        // 创建新的匹配记录
        const matches = choices.map((teacherId, index) => ({
            teacher_id: teacherId,
            student_id: studentId,
            student_name: student.name,
            priority: index + 1,
            status: 'pending'
        }))

        const { error: matchError } = await supabase
            .from('teacher_student_matches')
            .insert(matches)

        if (matchError) throw matchError

        res.status(200).json({ success: true, message: '选择提交成功' })
    } catch (error) {
        console.error('提交选择错误:', error)
        res.status(500).json({ error: '服务器错误' })
    }
}