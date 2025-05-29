import { supabase } from '../../lib/supabase'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { studentId, password, name, email } = req.body

    if (!studentId || !password || !name) {
        return res.status(400).json({ error: '学号、密码和姓名不能为空' })
    }

    if (password.length < 6) {
        return res.status(400).json({ error: '密码至少6位' })
    }

    try {
        // 检查学号是否已存在
        const { data: existing } = await supabase
            .from('students')
            .select('student_id')
            .eq('student_id', studentId)
            .single()

        if (existing) {
            return res.status(400).json({ error: '学号已存在' })
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10)

        // 创建学生记录
        const { error } = await supabase
            .from('students')
            .insert({
                student_id: studentId,
                password: hashedPassword,
                name,
                email: email || null
            })

        if (error) throw error

        res.status(200).json({ success: true, message: '注册成功' })
    } catch (error) {
        console.error('注册错误:', error)
        res.status(500).json({ error: '服务器错误' })
    }
}