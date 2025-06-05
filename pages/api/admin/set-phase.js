import { supabase } from '@/lib/supabase'

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	const { phase, adminPassword } = req.body

	// 简单的管理员密码验证（生产环境应使用更安全的方式）
	if (adminPassword !== 'admin123456') {
		return res.status(401).json({ error: '管理员密码错误' })
	}

	const validPhases = ['direction_input', 'student_selection', 'teacher_selection', 'allocation', 'result']
	if (!validPhases.includes(phase)) {
		return res.status(400).json({ error: '无效的系统阶段' })
	}

	try {
		const { error } = await supabase
			.from('system_config')
			.update({
				config_value: phase,
				updated_at: new Date().toISOString()
			})
			.eq('config_key', 'system_phase')

		if (error) throw error

		// 如果进入分配阶段，自动执行随机分配
		if (phase === 'allocation') {
			// 这里可以调用随机分配的逻辑
			// 为了简化，这里不实现
		}

		res.status(200).json({ success: true, message: '系统阶段更新成功' })
	} catch (error) {
		console.error('设置系统阶段错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}