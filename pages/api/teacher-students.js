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
            .order('priority', { ascending: true })

        if (error) throw error

        // 按优先级分组
        const students = {
            first: matches.filter(m => m.priority === 1),
            second: matches.filter(m => m.priority === 2),
            third: matches.filter(m => m.priority === 3)
        }

        res.status(200).json({ students })
    } catch (error) {
        console.error('获取学生列表错误:', error)
        res.status(500).json({ error: '服务器错误' })
    }
}