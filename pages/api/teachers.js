import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { data: teachers, error } = await supabase
            .from('teachers')
            .select('id, name, field')
            .order('id')

        if (error) throw error

        res.status(200).json({ teachers })
    } catch (error) {
        console.error('获取教师列表错误:', error)
        res.status(500).json({ error: '服务器错误' })
    }
}