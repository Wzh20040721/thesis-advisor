import React, { useState, useEffect } from 'react';
import { Settings, ChevronRight, AlertCircle, CheckCircle, Clock, Users, UserCheck, Shuffle, BookOpen } from 'lucide-react';

const AdminPanel = () => {
	const [currentPhase, setCurrentPhase] = useState('');
	const [password, setPassword] = useState('');
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');

	const phases = [
		{
			value: 'direction_input',
			name: '研究方向填写',
			icon: <BookOpen size={20} />,
			description: '导师填写研究方向',
			color: '#8b5cf6'
		},
		{
			value: 'student_selection',
			name: '学生选择',
			icon: <Users size={20} />,
			description: '学生选择研究方向或服从分配',
			color: '#3b82f6'
		},
		{
			value: 'teacher_selection',
			name: '导师选择',
			icon: <UserCheck size={20} />,
			description: '导师从申请学生中选择',
			color: '#10b981'
		},
		{
			value: 'allocation',
			name: '系统分配',
			icon: <Shuffle size={20} />,
			description: '系统自动分配剩余学生',
			color: '#f59e0b'
		},
		{
			value: 'result',
			name: '结果公布',
			icon: <CheckCircle size={20} />,
			description: '查看最终分配结果',
			color: '#06b6d4'
		}
	];

	useEffect(() => {
		if (isAuthenticated) {
			fetchCurrentPhase();
		}
	}, [isAuthenticated]);

	const fetchCurrentPhase = async () => {
		try {
			const response = await fetch('/api/system-phase');
			const data = await response.json();
			setCurrentPhase(data.phase);
		} catch (error) {
			console.error('获取当前阶段失败:', error);
		}
	};

	const handleLogin = () => {
		if (password === 'admin123456') {
			setIsAuthenticated(true);
			setMessage('');
		} else {
			setMessage('密码错误！');
		}
	};

	const handlePhaseChange = async (newPhase) => {
		if (!window.confirm(`确定要切换到"${phases.find(p => p.value === newPhase)?.name}"阶段吗？`)) {
			return;
		}

		setLoading(true);
		setMessage('');

		try {
			const response = await fetch('/api/admin/set-phase', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					phase: newPhase,
					adminPassword: 'admin123456'
				})
			});

			const data = await response.json();

			if (response.ok) {
				setCurrentPhase(newPhase);
				setMessage(`成功切换到：${phases.find(p => p.value === newPhase)?.name}`);

				// 如果是分配阶段，询问是否执行随机分配
				if (newPhase === 'allocation') {
					setTimeout(() => {
						if (window.confirm('是否立即执行随机分配？')) {
							handleRandomAllocate();
						}
					}, 1000);
				}
			} else {
				setMessage(data.error || '切换失败');
			}
		} catch (error) {
			setMessage('网络错误，请重试');
		} finally {
			setLoading(false);
		}
	};

	const handleRandomAllocate = async () => {
		if (!window.confirm('确定要执行随机分配吗？这将分配所有未被选中的学生。')) {
			return;
		}

		setLoading(true);
		setMessage('');

		try {
			const response = await fetch('/api/admin/random-allocate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					adminPassword: 'admin123456'
				})
			});

			const data = await response.json();

			if (response.ok) {
				setMessage(data.message);
				fetchCurrentPhase(); // 刷新当前阶段
			} else {
				setMessage(data.error || '分配失败');
			}
		} catch (error) {
			setMessage('网络错误，请重试');
		} finally {
			setLoading(false);
		}
	};

	if (!isAuthenticated) {
		return (
			<div style={{
				minHeight: '100vh',
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '20px'
			}}>
				<div style={{
					background: 'white',
					borderRadius: '20px',
					padding: '40px',
					boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
					width: '100%',
					maxWidth: '400px'
				}}>
					<div style={{textAlign: 'center', marginBottom: '30px'}}>
						<div style={{
							width: '60px',
							height: '60px',
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							borderRadius: '15px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							margin: '0 auto 20px'
						}}>
							<Settings size={30} color="white" />
						</div>
						<h1 style={{fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px'}}>
							系统管理面板
						</h1>
						<p style={{color: '#6b7280', fontSize: '14px'}}>请输入管理员密码</p>
					</div>

					<div style={{marginBottom: '20px'}}>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
							placeholder="请输入管理员密码"
							style={{
								width: '100%',
								padding: '12px 16px',
								border: '2px solid #e5e7eb',
								borderRadius: '10px',
								fontSize: '16px',
								outline: 'none',
								transition: 'all 0.3s'
							}}
						/>
					</div>

					<button
						onClick={handleLogin}
						style={{
							width: '100%',
							padding: '12px',
							background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
							color: 'white',
							border: 'none',
							borderRadius: '10px',
							fontSize: '16px',
							fontWeight: 'bold',
							cursor: 'pointer',
							transition: 'all 0.3s'
						}}
					>
						登录
					</button>

					{message && (
						<div style={{
							marginTop: '20px',
							padding: '12px',
							background: '#fee2e2',
							borderRadius: '10px',
							color: '#dc2626',
							fontSize: '14px',
							textAlign: 'center'
						}}>
							{message}
						</div>
					)}
				</div>
			</div>
		);
	}

	return (
		<div style={{
			minHeight: '100vh',
			background: '#f3f4f6',
			padding: '20px'
		}}>
			<div style={{
				maxWidth: '800px',
				margin: '0 auto'
			}}>
				<div style={{
					background: 'white',
					borderRadius: '20px',
					boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
					overflow: 'hidden'
				}}>
					<div style={{
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						padding: '30px',
						color: 'white'
					}}>
						<h1 style={{fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px'}}>
							系统管理面板
						</h1>
						<p style={{opacity: 0.9, fontSize: '16px'}}>
							管理毕业论文导师分配系统的运行阶段
						</p>
					</div>

					<div style={{padding: '30px'}}>
						<div style={{marginBottom: '30px'}}>
							<h2 style={{fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px'}}>
								系统运行阶段
							</h2>

							<div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
								{phases.map((phase, index) => {
									const isCurrent = phase.value === currentPhase;
									const isPast = phases.findIndex(p => p.value === currentPhase) > index;

									return (
										<div
											key={phase.value}
											onClick={() => !loading && handlePhaseChange(phase.value)}
											style={{
												display: 'flex',
												alignItems: 'center',
												padding: '20px',
												borderRadius: '12px',
												border: `2px solid ${isCurrent ? phase.color : '#e5e7eb'}`,
												background: isCurrent ? `${phase.color}10` : (isPast ? '#f9fafb' : 'white'),
												cursor: loading ? 'not-allowed' : 'pointer',
												transition: 'all 0.3s',
												opacity: loading ? 0.7 : 1
											}}
										>
											<div style={{
												width: '40px',
												height: '40px',
												borderRadius: '10px',
												background: isCurrent ? phase.color : (isPast ? '#9ca3af' : '#e5e7eb'),
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												color: 'white',
												marginRight: '16px'
											}}>
												{phase.icon}
											</div>

											<div style={{flex: 1}}>
												<div style={{
													fontSize: '16px',
													fontWeight: 'bold',
													color: isCurrent ? phase.color : (isPast ? '#6b7280' : '#1f2937'),
													marginBottom: '4px'
												}}>
													{phase.name}
												</div>
												<div style={{
													fontSize: '14px',
													color: isPast ? '#9ca3af' : '#6b7280'
												}}>
													{phase.description}
												</div>
											</div>

											{isCurrent && (
												<div style={{
													padding: '4px 12px',
													background: phase.color,
													color: 'white',
													borderRadius: '6px',
													fontSize: '12px',
													fontWeight: 'bold'
												}}>
													当前阶段
												</div>
											)}

											<ChevronRight size={20} color={isPast ? '#9ca3af' : '#6b7280'} style={{marginLeft: '12px'}} />
										</div>
									);
								})}
							</div>
						</div>

						{currentPhase === 'allocation' && (
							<div style={{
								marginTop: '30px',
								padding: '20px',
								background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
								borderRadius: '12px',
								border: '1px solid #f59e0b'
							}}>
								<h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#92400e', marginBottom: '12px'}}>
									系统分配操作
								</h3>
								<p style={{color: '#b45309', marginBottom: '16px', fontSize: '14px'}}>
									当前处于系统分配阶段，您可以执行随机分配操作。
								</p>
								<button
									onClick={handleRandomAllocate}
									disabled={loading}
									style={{
										padding: '10px 20px',
										background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
										color: 'white',
										border: 'none',
										borderRadius: '8px',
										fontSize: '14px',
										fontWeight: 'bold',
										cursor: loading ? 'not-allowed' : 'pointer',
										opacity: loading ? 0.7 : 1
									}}
								>
									{loading ? '处理中...' : '执行随机分配'}
								</button>
							</div>
						)}

						{message && (
							<div style={{
								marginTop: '20px',
								padding: '16px',
								background: message.includes('成功') ? '#d1fae5' : '#fee2e2',
								borderRadius: '10px',
								color: message.includes('成功') ? '#065f46' : '#dc2626',
								fontSize: '14px',
								display: 'flex',
								alignItems: 'center'
							}}>
								{message.includes('成功') ? <CheckCircle size={20} style={{marginRight: '8px'}} /> : <AlertCircle size={20} style={{marginRight: '8px'}} />}
								{message}
							</div>
						)}

						<div style={{
							marginTop: '30px',
							padding: '20px',
							background: '#f9fafb',
							borderRadius: '12px'
						}}>
							<h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px'}}>
								操作说明
							</h3>
							<ul style={{margin: 0, paddingLeft: '20px', color: '#6b7280', fontSize: '14px', lineHeight: '1.8'}}>
								<li>点击任意阶段可以切换到该阶段</li>
								<li>切换阶段前请确保当前阶段的操作已完成</li>
								<li>进入"系统分配"阶段后，可以执行随机分配</li>
								<li>随机分配会自动将系统切换到"结果公布"阶段</li>
								<li>请按照正常流程顺序操作，避免跳跃阶段</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminPanel;