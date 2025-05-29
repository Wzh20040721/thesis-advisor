import { supabase } from '../../lib/supabase'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { studentId, password } = req.body

    if (!studentId || !password) {
        return res.status(400).json({ error: '学号和密码不能为空' })
    }

    try {
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('student_id', studentId)
            .single()

        if (error || !student) {
            return res.status(401).json({ error: '学号或密码错误' })
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, student.password)

        if (!isValidPassword) {
            return res.status(401).json({ error: '学号或密码错误' })
        }

        // 不返回密码
        const { password: _, ...studentInfo } = student

        res.status(200).json({
            success: true,
            student: studentInfo
        })
    } catch (error) {
        console.error('登录错误:', error)
        res.status(500).json({ error: '服务器错误' })
    }
}