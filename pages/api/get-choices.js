import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { studentId } = req.query

    if (!studentId) {
        return res.status(400).json({ error: '学号不能为空' })
    }

    try {
        // 验证学生是否存在
        const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('student_id', studentId)
            .single()

        if (!student) {
            return res.status(401).json({ error: '学生不存在' })
        }

        const { data, error } = await supabase
            .from('student_choices')
            .select(`
                selected_direction_id,
                is_obey_allocation,
                research_directions (
                    id,
                    direction_name,
                    teacher_id
                )
            `)
            .eq('student_id', student.id)
            .single()

        if (error && error.code !== 'PGRST116') {
            throw error
        }

        res.status(200).json({ choice: data })
    } catch (error) {
        console.error('获取选择错误:', error)
        res.status(500).json({ error: '服务器错误' })
    }
}