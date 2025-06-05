import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	const { teacherId, directions } = req.body

	if (!teacherId || !directions) {
		return res.status(400).json({ error: '参数不完整' })
	}

	try {
		// 更新导师的研究方向
		const { error: updateError } = await supabase
			.from('teachers')
			.update({
				research_direction_1: directions.direction1,
				research_direction_2: directions.direction2,
				research_direction_3: directions.direction3,
				updated_at: new Date().toISOString()
			})
			.eq('id', teacherId)

		if (updateError) throw updateError

		// 删除旧的研究方向记录
		await supabase
			.from('research_directions')
			.delete()
			.eq('teacher_id', teacherId)

		// 插入新的研究方向记录
		const directionsToInsert = []
		if (directions.direction1) {
			directionsToInsert.push({
				direction_name: directions.direction1,
				teacher_id: teacherId
			})
		}
		if (directions.direction2) {
			directionsToInsert.push({
				direction_name: directions.direction2,
				teacher_id: teacherId
			})
		}
		if (directions.direction3) {
			directionsToInsert.push({
				direction_name: directions.direction3,
				teacher_id: teacherId
			})
		}

		if (directionsToInsert.length > 0) {
			const { error: insertError } = await supabase
				.from('research_directions')
				.insert(directionsToInsert)

			if (insertError) throw insertError
		}

		res.status(200).json({ success: true, message: '保存成功' })
	} catch (error) {
		console.error('保存研究方向错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}