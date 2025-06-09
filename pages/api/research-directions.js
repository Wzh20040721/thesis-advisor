import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	try {
		// 获取所有研究方向
		const { data: directions, error } = await supabase
			.from('research_directions')
			.select(`
        id,
        direction_name,
        teacher_id,
        teachers (
          work_id,
          name
        )
      `)
			.order('id')

		if (error) throw error

		res.status(200).json({ directions: directions || [] })
	} catch (error) {
		console.error('获取研究方向错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}