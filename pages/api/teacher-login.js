import { supabase } from '../../lib/supabase'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    try {
        const { data: teacher, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('work_id', username)
            .single()

        if (error || !teacher) {
            return res.status(401).json({ error: '账号或密码错误' })
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, teacher.password)

        if (!isValidPassword) {
            return res.status(401).json({ error: '账号或密码错误' })
        }

        // 不返回密码
        const { password: _, ...teacherInfo } = teacher

        res.status(200).json({
            success: true,
            teacher: teacherInfo
        })
    } catch (error) {
        console.error('登录错误:', error)
        res.status(500).json({ error: '服务器错误' })
    }
}