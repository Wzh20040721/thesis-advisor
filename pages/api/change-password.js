import { supabase } from '../../lib/supabase'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { studentId, oldPassword, newPassword } = req.body

    if (!studentId || !oldPassword || !newPassword) {
        return res.status(400).json({ error: '所有字段都不能为空' })
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: '新密码至少6位' })
    }

    try {
        // 获取学生信息
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('student_id', studentId)
            .single()

        if (error || !student) {
            return res.status(401).json({ error: '学生不存在' })
        }

        // 验证旧密码
        const isValidOldPassword = await bcrypt.compare(oldPassword, student.password)

        if (!isValidOldPassword) {
            return res.status(401).json({ error: '旧密码错误' })
        }

        // 加密新密码
        const hashedNewPassword = await bcrypt.hash(newPassword, 10)

        // 更新密码
        const { error: updateError } = await supabase
            .from('students')
            .update({
                password: hashedNewPassword,
                updated_at: new Date().toISOString()
            })
            .eq('student_id', studentId)

        if (updateError) throw updateError

        res.status(200).json({ success: true, message: '密码修改成功' })
    } catch (error) {
        console.error('修改密码错误:', error)
        res.status(500).json({ error: '服务器错误' })
    }
}