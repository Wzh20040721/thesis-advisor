import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	const { teacherId, directions } = req.body

	if (!teacherId || !directions) {
		return res.status(400).json({ error: '参数不完整' })
	}

	// 验证研究方向长度
	const validateDirection = (direction) => {
		if (!direction) return true // 允许空值
		const length = direction.length
		return length >= 10 && length <= 30
	}

	if (!validateDirection(directions.direction1) || 
		!validateDirection(directions.direction2) || 
		!validateDirection(directions.direction3)) {
		return res.status(400).json({ error: '研究方向长度必须在10-30个字符之间' })
	}

	try {
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

		// 只有当有研究方向时才插入
		if (directionsToInsert.length > 0) {
			const { error: insertError } = await supabase
				.from('research_directions')
				.insert(directionsToInsert)

			if (insertError) throw insertError
		}

		res.status(200).json({ success: true, message: '研究方向保存成功' })
	} catch (error) {
		console.error('保存研究方向错误:', error)
		res.status(500).json({ error: '服务器错误' })
	}
}