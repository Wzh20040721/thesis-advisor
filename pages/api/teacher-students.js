import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { teacherId } = req.query

    if (!teacherId) {
        return res.status(400).json({ error: '教师ID不能为空' })
    }

    try {
        const { data: matches, error } = await supabase
            .from('teacher_student_matches')
            .select('*')
            .eq('teacher_id', teacherId)

        if (error) throw error

        // 获取已选择的学生
        const { data: selectedStudent } = await supabase
            .from('teacher_selections')
            .select(`
                student_id,
                students (
                    student_id,
                    name
                )
            `)
            .eq('teacher_id', teacherId)
            .single()

        // 获取最终分配结果
        const { data: finalAllocations } = await supabase
            .from('final_allocations')
            .select(`
                student_id,
                allocation_type,
                students (
                    student_id,
                    name
                )
            `)
            .eq('teacher_id', teacherId)

        res.status(200).json({ 
            matches: matches || [],
            selectedStudent: selectedStudent || null,
            finalAllocations: finalAllocations || []
        })
    } catch (error) {
        console.error('获取学生列表错误:', error)
        res.status(500).json({ error: '服务器错误' })
    }
}