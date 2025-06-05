import React, { useState, useEffect } from 'react';
import { User, UserCheck, Edit, Save, CheckCircle, AlertCircle, Lock, Settings, UserPlus, LogOut, Eye, EyeOff, GraduationCap, BookOpen, Users, Star, FileText, Clock, Shuffle } from 'lucide-react';

const ThesisSystem = () => {
    const [userType, setUserType] = useState('student');
    const [studentInfo, setStudentInfo] = useState(null);
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [studentLogin, setStudentLogin] = useState({ studentId: '', password: '' });
    const [teacherLogin, setTeacherLogin] = useState({ username: '', password: '' });
    const [selectedDirection, setSelectedDirection] = useState(null);
    const [isObeyAllocation, setIsObeyAllocation] = useState(false);
    const [researchDirections, setResearchDirections] = useState([]);
    const [teacherDirections, setTeacherDirections] = useState(['', '', '']);
    const [directionStudents, setDirectionStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [finalAllocation, setFinalAllocation] = useState(null);
    const [systemPhase, setSystemPhase] = useState('direction_input'); // direction_input, student_selection, teacher_selection, allocation, result
    const [showResult, setShowResult] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showTeacherChangePassword, setShowTeacherChangePassword] = useState(false);
    const [registerData, setRegisterData] = useState({ studentId: '', password: '', name: '', email: '' });
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [teacherPasswordData, setTeacherPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState({ login: false, old: false, new: false, confirm: false });

    // 获取系统当前阶段
    useEffect(() => {
        fetchSystemPhase();
    }, []);

    // 根据不同阶段和用户类型获取数据
    useEffect(() => {
        if (systemPhase === 'student_selection' && !teacherInfo) {
            fetchResearchDirections();
        }
    }, [systemPhase, teacherInfo]);

    // 学生登录后获取选择或分配结果
    useEffect(() => {
        if (studentInfo) {
            if (systemPhase === 'student_selection' || systemPhase === 'teacher_selection') {
                fetchStudentChoice();
            } else if (systemPhase === 'result') {
                fetchFinalAllocation();
            }
        }
    }, [studentInfo, systemPhase]);

    // 导师登录后获取相关数据
    useEffect(() => {
        if (teacherInfo) {
            if (systemPhase === 'direction_input') {
                fetchTeacherDirections();
            } else if (systemPhase === 'student_selection' || systemPhase === 'teacher_selection') {
                fetchDirectionStudents();
                if (systemPhase === 'teacher_selection') {
                    fetchTeacherSelection();
                }
            } else if (systemPhase === 'result') {
                fetchTeacherFinalStudents();
            }
        }
    }, [teacherInfo, systemPhase]);

    const fetchSystemPhase = async () => {
        try {
            const response = await fetch('/api/system-phase');
            const data = await response.json();
            if (data.phase) {
                setSystemPhase(data.phase);
            }
        } catch (error) {
            console.error('获取系统阶段失败:', error);
        }
    };

    const fetchResearchDirections = async () => {
        try {
            const response = await fetch('/api/research-directions');
            const data = await response.json();
            if (data.directions) {
                setResearchDirections(data.directions);
            }
        } catch (error) {
            console.error('获取研究方向失败:', error);
        }
    };

    const fetchTeacherDirections = async () => {
        try {
            const response = await fetch(`/api/teacher-directions?teacherId=${teacherInfo.id}`);
            const data = await response.json();
            if (data.directions) {
                setTeacherDirections([
                    data.directions.direction1 || '',
                    data.directions.direction2 || '',
                    data.directions.direction3 || ''
                ]);
            }
        } catch (error) {
            console.error('获取导师研究方向失败:', error);
        }
    };

    const fetchStudentChoice = async () => {
        try {
            const response = await fetch(`/api/student-choice?studentId=${studentInfo.student_id}`);
            const data = await response.json();
            if (data.choice) {
                if (data.choice.is_obey_allocation) {
                    setIsObeyAllocation(true);
                } else {
                    setSelectedDirection(data.choice.selected_direction_id);
                }
            }
        } catch (error) {
            console.error('获取学生选择失败:', error);
        }
    };

    const fetchDirectionStudents = async () => {
        try {
            console.log('开始获取学生选择，teacherId:', teacherInfo.id);
            const response = await fetch(`/api/direction-students?teacherId=${teacherInfo.id}`);
            const data = await response.json();
            
            if (!response.ok) {
                console.error('获取学生选择失败:', data);
                throw new Error(data.error || '获取学生选择失败');
            }

            if (data.students) {
                console.log('获取到的学生数据:', data.students);
                // 格式化学生数据
                const formattedStudents = data.students.map(student => ({
                    student_id: student.student_id,
                    name: student.student_name,
                    direction_name: student.direction_name
                }));
                console.log('格式化后的学生数据:', formattedStudents);
                setDirectionStudents(formattedStudents);
            } else {
                console.log('没有找到学生数据');
                setDirectionStudents([]);
            }
        } catch (error) {
            console.error('获取选择导师方向的学生失败:', error);
            setDirectionStudents([]);
        }
    };

    const fetchTeacherSelection = async () => {
        try {
            const response = await fetch(`/api/teacher-selection?teacherId=${teacherInfo.id}`);
            const data = await response.json();
            if (data.selection) {
                setSelectedStudent(data.selection.student_id);
            }
        } catch (error) {
            console.error('获取导师选择失败:', error);
        }
    };

    const fetchFinalAllocation = async () => {
        try {
            const response = await fetch(`/api/final-allocation?studentId=${studentInfo.student_id}`);
            const data = await response.json();
            if (data.allocation) {
                setFinalAllocation(data.allocation);
            }
        } catch (error) {
            console.error('获取最终分配结果失败:', error);
        }
    };

    const fetchTeacherFinalStudents = async () => {
        try {
            const response = await fetch(`/api/teacher-final-students?teacherId=${teacherInfo.id}`);
            const data = await response.json();
            if (data.students) {
                setDirectionStudents(data.students);
            }
        } catch (error) {
            console.error('获取导师最终学生名单失败:', error);
        }
    };

    const handleStudentRegister = async () => {
        const trimmedData = {
            studentId: registerData.studentId.trim(),
            password: registerData.password.trim(),
            name: registerData.name.trim(),
            email: registerData.email.trim()
        };

        if (!trimmedData.studentId || !trimmedData.password || !trimmedData.name) {
            alert('学号、密码和姓名不能为空');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/student-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trimmedData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('注册成功！请登录');
                setShowRegister(false);
                setRegisterData({ studentId: '', password: '', name: '', email: '' });
            } else {
                alert(data.error || '注册失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentLogin = async () => {
        const trimmedLogin = {
            studentId: studentLogin.studentId.trim(),
            password: studentLogin.password.trim()
        };

        if (!trimmedLogin.studentId || !trimmedLogin.password) {
            alert('学号和密码不能为空');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/student-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trimmedLogin)
            });

            const data = await response.json();

            if (response.ok) {
                setStudentInfo(data.student);
                setStudentLogin({ studentId: '', password: '' });
            } else {
                alert(data.error || '登录失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherLogin = async () => {
        const trimmedLogin = {
            username: teacherLogin.username.trim(),
            password: teacherLogin.password.trim()
        };

        if (!trimmedLogin.username || !trimmedLogin.password) {
            alert('用户名和密码不能为空');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/teacher-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trimmedLogin)
            });

            const data = await response.json();

            if (response.ok) {
                setTeacherInfo(data.teacher);
            } else {
                alert(data.error || '登录失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDirections = async () => {
        const directions = teacherDirections.filter(d => d.trim());
        if (directions.length === 0) {
            alert('请至少填写一个研究方向');
            return;
        }

        // 检查是否有重复
        const uniqueDirections = [...new Set(directions)];
        if (uniqueDirections.length !== directions.length) {
            alert('研究方向不能重复');
            return;
        }

        // 检查长度
        const invalidDirection = directions.find(d => d.length < 5 || d.length > 15);
        if (invalidDirection) {
            alert('每个研究方向应在5-15个字之间');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/save-directions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: teacherInfo.id,
                    directions: {
                        direction1: teacherDirections[0] || null,
                        direction2: teacherDirections[1] || null,
                        direction3: teacherDirections[2] || null
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShowResult(true);
                setTimeout(() => setShowResult(false), 3000);
            } else {
                alert(data.error || '保存失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSubmit = async () => {
        if (!selectedDirection && !isObeyAllocation) {
            alert('请选择一个研究方向或选择服从分配');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/submit-student-choice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: studentInfo.student_id,
                    selectedDirectionId: isObeyAllocation ? null : selectedDirection,
                    isObeyAllocation: isObeyAllocation
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShowResult(true);
                setTimeout(() => setShowResult(false), 3000);
            } else {
                alert(data.error || '提交失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStudent = async (studentId) => {
        if (selectedStudent) {
            alert('您已经选择过学生了');
            return;
        }

        if (!window.confirm(`确定要选择学号为 ${studentId} 的学生吗？选择后不可更改。`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/select-student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: teacherInfo.id,
                    studentId: studentId
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSelectedStudent(studentId);
                setShowResult(true);
                setTimeout(() => setShowResult(false), 3000);
            } else {
                alert(data.error || '选择失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentLogout = () => {
        setStudentInfo(null);
        setSelectedDirection(null);
        setIsObeyAllocation(false);
        setFinalAllocation(null);
    };

    const handleTeacherLogout = () => {
        setTeacherInfo(null);
        setTeacherLogin({ username: '', password: '' });
        setTeacherDirections(['', '', '']);
        setDirectionStudents([]);
        setSelectedStudent(null);
    };

    const handleChangePassword = async () => {
        const trimmedData = {
            oldPassword: passwordData.oldPassword.trim(),
            newPassword: passwordData.newPassword.trim(),
            confirmPassword: passwordData.confirmPassword.trim()
        };

        if (!trimmedData.oldPassword || !trimmedData.newPassword || !trimmedData.confirmPassword) {
            alert('所有字段都不能为空');
            return;
        }

        if (trimmedData.newPassword !== trimmedData.confirmPassword) {
            alert('新密码和确认密码不一致');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: studentInfo.student_id,
                    oldPassword: trimmedData.oldPassword,
                    newPassword: trimmedData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('密码修改成功！');
                setShowChangePassword(false);
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(data.error || '修改失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherChangePassword = async () => {
        const trimmedData = {
            oldPassword: teacherPasswordData.oldPassword.trim(),
            newPassword: teacherPasswordData.newPassword.trim(),
            confirmPassword: teacherPasswordData.confirmPassword.trim()
        };

        if (!trimmedData.oldPassword || !trimmedData.newPassword || !trimmedData.confirmPassword) {
            alert('所有字段都不能为空');
            return;
        }

        if (trimmedData.newPassword !== trimmedData.confirmPassword) {
            alert('新密码和确认密码不一致');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/change-teacher-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: teacherInfo.id,
                    oldPassword: trimmedData.oldPassword,
                    newPassword: trimmedData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('密码修改成功！');
                setShowTeacherChangePassword(false);
                setTeacherPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(data.error || '修改失败');
            }
        } catch (error) {
            alert('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    // CSS样式定义
    const styles = {
        // 通用样式
        pageContainer: {
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            overflow: 'hidden'
        },
        card: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden'
        },
        gradientHeader: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            textAlign: 'center'
        },
        button: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
        },
        input: {
            width: 'calc(100% - 32px)',
            padding: '12px 16px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            backgroundColor: '#f8fafc',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxSizing: 'border-box'
        },
        // 特定组件样式
        loginContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '20px'
        },
        loginCard: {
            width: '100%',
            maxWidth: '450px'
        },
        formGroup: {
            marginBottom: '16px'
        },
        label: {
            display: 'block',
            marginBottom: '6px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#374151'
        },
        directionCard: {
            padding: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '12px',
            backgroundColor: 'white'
        },
        directionCardSelected: {
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.05)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.15)'
        },
        successAlert: {
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '12px 0'
        },
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        modalContent: {
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            maxHeight: '80vh',
            overflow: 'auto'
        },
        phaseIndicator: {
            padding: '12px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            borderRadius: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white',
            fontWeight: '600'
        }
    };

    const getPhaseInfo = () => {
        const phases = {
            direction_input: {
                name: '研究方向填写阶段',
                icon: <FileText size={20} />,
                description: '导师填写研究方向'
            },
            student_selection: {
                name: '学生选择阶段',
                icon: <Users size={20} />,
                description: '学生选择感兴趣的研究方向'
            },
            teacher_selection: {
                name: '导师选择阶段',
                icon: <UserCheck size={20} />,
                description: '导师选择学生'
            },
            allocation: {
                name: '系统分配阶段',
                icon: <Shuffle size={20} />,
                description: '系统进行随机分配'
            },
            result: {
                name: '结果公布阶段',
                icon: <CheckCircle size={20} />,
                description: '查看最终分配结果'
            }
        };
        return phases[systemPhase] || phases.direction_input;
    };

    const renderStudentLogin = () => (
        <div style={styles.pageContainer}>
            <div style={styles.loginContainer}>
                <div style={{...styles.card, ...styles.loginCard}}>
                    <div style={styles.gradientHeader}>
                        <div style={{width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'}}>
                            <GraduationCap size={30} />
                        </div>
                        <h1 style={{fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px'}}>学生端</h1>
                        <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>毕业论文导师分配系统</p>
                    </div>

                    <div style={{padding: '24px'}}>
                        {!showRegister ? (
                            <>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <User size={14} style={{marginRight: '6px', display: 'inline'}} />
                                        学号
                                    </label>
                                    <input
                                        type="text"
                                        value={studentLogin.studentId}
                                        onChange={(e) => setStudentLogin({...studentLogin, studentId: e.target.value})}
                                        placeholder="请输入学号"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        <Lock size={14} style={{marginRight: '6px', display: 'inline'}} />
                                        密码
                                    </label>
                                    <div style={{position: 'relative'}}>
                                        <input
                                            type={showPassword.login ? "text" : "password"}
                                            value={studentLogin.password}
                                            onChange={(e) => setStudentLogin({...studentLogin, password: e.target.value})}
                                            placeholder="请输入密码"
                                            style={{...styles.input, paddingRight: '45px'}}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword({...showPassword, login: !showPassword.login})}
                                            style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'}}
                                        >
                                            {showPassword.login ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleStudentLogin}
                                    disabled={!studentLogin.studentId.trim() || !studentLogin.password.trim() || loading}
                                    style={{...styles.button, width: '100%', padding: '12px', fontSize: '16px', marginBottom: '12px', opacity: (!studentLogin.studentId.trim() || !studentLogin.password.trim() || loading) ? 0.5 : 1}}
                                >
                                    {loading ? (
                                        <>
                                            <div style={{width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                                            登录中...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={16} />
                                            立即登录
                                        </>
                                    )}
                                </button>

                                <div style={{textAlign: 'center', marginBottom: '16px'}}>
                                    <button
                                        onClick={() => setShowRegister(true)}
                                        style={{background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '14px', fontWeight: '600'}}
                                    >
                                        <UserPlus size={14} style={{marginRight: '6px'}} />
                                        还没有账号？立即注册
                                    </button>
                                </div>

                                <div style={{padding: '12px', background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', borderRadius: '12px'}}>
                                    <p style={{margin: 0, fontSize: '12px', color: '#1e40af'}}>
                                        <strong style={{display: 'flex', alignItems: 'center', marginBottom: '6px'}}>
                                            <Star size={12} style={{marginRight: '6px'}} />
                                            测试账号
                                        </strong>
                                        学号：2021001 密码：123456<br />
                                        学号：2021002 密码：123456
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{textAlign: 'center', marginBottom: '16px'}}>
                                    <h2 style={{fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 6px'}}>创建账号</h2>
                                    <p style={{color: '#6b7280', margin: 0, fontSize: '14px'}}>加入毕业论文导师分配系统</p>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>学号</label>
                                    <input
                                        type="text"
                                        value={registerData.studentId}
                                        onChange={(e) => setRegisterData({...registerData, studentId: e.target.value})}
                                        placeholder="请输入学号"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>姓名</label>
                                    <input
                                        type="text"
                                        value={registerData.name}
                                        onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                                        placeholder="请输入真实姓名"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>邮箱（可选）</label>
                                    <input
                                        type="email"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                        placeholder="请输入邮箱地址"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>密码（至少6位）</label>
                                    <input
                                        type="password"
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                        placeholder="请设置登录密码"
                                        style={styles.input}
                                    />
                                </div>

                                <div style={{display: 'flex', gap: '10px'}}>
                                    <button
                                        onClick={handleStudentRegister}
                                        disabled={loading}
                                        style={{...styles.button, flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', opacity: loading ? 0.5 : 1}}
                                    >
                                        {loading ? '注册中...' : '立即注册'}
                                    </button>
                                    <button onClick={() => setShowRegister(false)} style={{...styles.button, flex: 1, background: '#6b7280'}}>
                                        返回登录
                                    </button>
                                </div>
                                            </>
                                            )}
                                            </div>
                                            </div>
                                            </div>
                                            </div>
                                            );

    const renderPasswordModal = (isTeacher = false) => {
                                            const data = isTeacher ? teacherPasswordData : passwordData;
                                            const setData = isTeacher ? setTeacherPasswordData : setPasswordData;
                                            const handleChange = isTeacher ? handleTeacherChangePassword : handleChangePassword;
                                            const onClose = () => {
                                            if (isTeacher) {
                                            setShowTeacherChangePassword(false);
                                            setTeacherPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                        } else {
                                            setShowChangePassword(false);
                                            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                        }
                                        };

                                            return (
                                            <div style={styles.modal}>
                                        <div style={styles.modalContent}>
                                            <div style={{textAlign: 'center', marginBottom: '20px'}}>
                                                <div style={{width: '50px', height: '50px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'}}>
                                                    <Settings size={24} color="white" />
                                                </div>
                                                <h2 style={{fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 6px'}}>修改密码</h2>
                                                <p style={{color: '#6b7280', margin: 0, fontSize: '14px'}}>请输入当前密码和新密码</p>
                                            </div>

                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>当前密码</label>
                                                <div style={{position: 'relative'}}>
                                                    <input
                                                        type={showPassword.old ? "text" : "password"}
                                                        value={data.oldPassword}
                                                        onChange={(e) => setData({...data, oldPassword: e.target.value})}
                                                        placeholder="请输入当前密码"
                                                        style={{...styles.input, paddingRight: '45px'}}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({...showPassword, old: !showPassword.old})}
                                                        style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'}}
                                                    >
                                                        {showPassword.old ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>新密码（至少6位）</label>
                                                <div style={{position: 'relative'}}>
                                                    <input
                                                        type={showPassword.new ? "text" : "password"}
                                                        value={data.newPassword}
                                                        onChange={(e) => setData({...data, newPassword: e.target.value})}
                                                        placeholder="请输入新密码"
                                                        style={{...styles.input, paddingRight: '45px'}}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                                                        style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'}}
                                                    >
                                                        {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>确认新密码</label>
                                                <div style={{position: 'relative'}}>
                                                    <input
                                                        type={showPassword.confirm ? "text" : "password"}
                                                        value={data.confirmPassword}
                                                        onChange={(e) => setData({...data, confirmPassword: e.target.value})}
                                                        placeholder="请再次输入新密码"
                                                        style={{...styles.input, paddingRight: '45px'}}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                                                        style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'}}
                                                    >
                                                        {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{display: 'flex', gap: '10px'}}>
                                                <button
                                                    onClick={handleChange}
                                                    disabled={loading}
                                                    style={{...styles.button, flex: 1, opacity: loading ? 0.5 : 1}}
                                                >
                                                    {loading ? '修改中...' : '确认修改'}
                                                </button>
                                                <button
                                                    onClick={onClose}
                                                    style={{...styles.button, flex: 1, background: '#6b7280'}}
                                                >
                                                    取消
                                                </button>
                                            </div>
                                        </div>
                                </div>
                                );
                                };

    const renderStudentView = () => {
        const phaseInfo = getPhaseInfo();

        return (
        <div style={{...styles.pageContainer, display: 'flex', flexDirection: 'column'}}>
            {/* 顶部导航 */}
            <div style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', padding: '12px 0'}}>
            <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <GraduationCap size={24} color="white" />
            </div>
            <div>
            <h1 style={{fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0}}>毕业论文导师分配系统</h1>
            <p style={{fontSize: '12px', color: '#6b7280', margin: 0}}>欢迎，{studentInfo.name} ({studentInfo.student_id})</p>
            </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <button
            onClick={() => setShowChangePassword(true)}
            style={{...styles.button, background: 'rgba(255,255,255,0.8)', color: '#374151', border: '1px solid rgba(0,0,0,0.1)', fontSize: '12px', padding: '8px 12px'}}
            >
            <Settings size={14} />
            修改密码
            </button>
            <button
            onClick={handleStudentLogout}
            style={{...styles.button, background: '#ef4444', fontSize: '12px', padding: '8px 12px'}}
            >
            <LogOut size={14} />
            退出登录
            </button>
            </div>
            </div>
            </div>
            </div>

            {/* 主内容区域 */}
            <div style={{flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>

            {/* 系统阶段指示器 */}
            <div style={styles.phaseIndicator}>
            {phaseInfo.icon}
            <div>
            <div style={{fontSize: '16px'}}>{phaseInfo.name}</div>
            <div style={{fontSize: '12px', opacity: 0.9}}>{phaseInfo.description}</div>
            </div>
            </div>

            {/* 根据不同阶段显示不同内容 */}
            {systemPhase === 'direction_input' && (
            <div style={styles.card}>
            <div style={{...styles.gradientHeader, textAlign: 'left', padding: '16px'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
            <Clock size={24} style={{marginRight: '8px'}} />
            <div>
            <h2 style={{fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px'}}>系统尚未开放</h2>
            <p style={{opacity: 0.9, margin: 0, fontSize: '12px'}}>请等待导师填写研究方向后再进行选择</p>
            </div>
            </div>
            </div>
            <div style={{padding: '16px', textAlign: 'center'}}>
            <p style={{color: '#6b7280', margin: 0}}>当前处于导师填写研究方向阶段，请耐心等待。</p>
            </div>
            </div>
            )}

            {systemPhase === 'student_selection' && (
            <>
            {/* 已完成选择的状态 */}
            {(selectedDirection || isObeyAllocation) && !isEditing && (
            <div style={{marginBottom: '16px'}}>
            <div style={styles.card}>
            <div style={{background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: 'white', padding: '16px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <CheckCircle size={24} style={{marginRight: '8px'}} />
                <div>
                    <h3 style={{fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px'}}>选择已完成</h3>
                    <p style={{opacity: 0.9, margin: 0, fontSize: '12px'}}>
                        {isObeyAllocation ? '您已选择服从分配' : `您已选择研究方向：${researchDirections.find(d => d.id === selectedDirection)?.direction_name}`}
                    </p>
                </div>
            </div>
            <button
                onClick={() => setIsEditing(true)}
                style={{...styles.button, background: 'rgba(255,255,255,0.2)', fontSize: '12px', padding: '8px 12px'}}
            >
                <Edit size={14} />
                修改选择
            </button>
            </div>
            </div>
            </div>
            </div>
            )}

            {/* 选择研究方向 */}
            {(!selectedDirection && !isObeyAllocation) || isEditing ? (
            <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
            <div style={styles.card}>
            <div style={{...styles.gradientHeader, textAlign: 'left', padding: '16px'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
            <BookOpen size={24} style={{marginRight: '8px'}} />
            <div>
                <h2 style={{fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px'}}>选择研究方向</h2>
                <p style={{opacity: 0.9, margin: 0, fontSize: '12px'}}>请选择一个感兴趣的研究方向或选择服从分配</p>
            </div>
            </div>
            </div>
            <div style={{padding: '16px', flex: 1, overflow: 'auto', maxHeight: '400px'}}>
            {/* 服从分配选项 */}
            <div
                onClick={() => {
                    setIsObeyAllocation(true);
                    setSelectedDirection(null);
                    handleStudentSubmit(); // 选择后立即提交
                }}
                style={{
                    ...styles.directionCard,
                    ...(isObeyAllocation ? styles.directionCardSelected : {}),
                    marginBottom: '20px',
                    background: isObeyAllocation ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderColor: isObeyAllocation ? '#f59e0b' : '#fbbf24'
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Shuffle size={24} color={isObeyAllocation ? 'white' : '#f59e0b'} style={{marginRight: '12px'}} />
                        <div>
                            <h3 style={{fontSize: '16px', fontWeight: 'bold', color: isObeyAllocation ? 'white' : '#92400e', margin: '0 0 4px'}}>服从分配</h3>
                            <p style={{color: isObeyAllocation ? 'rgba(255,255,255,0.9)' : '#b45309', margin: 0, fontSize: '14px'}}>由系统随机分配导师</p>
                        </div>
                    </div>
                    {isObeyAllocation && (
                        <CheckCircle size={20} color="white" />
                    )}
                </div>
            </div>

            {/* 研究方向列表 */}
            <h4 style={{fontSize: '14px', color: '#6b7280', marginBottom: '12px'}}>或选择具体研究方向：</h4>
            {researchDirections.map((direction) => (
                <div
                    key={direction.id}
                    onClick={() => {
                        setSelectedDirection(direction.id);
                        setIsObeyAllocation(false);
                        handleStudentSubmit(); // 选择后立即提交
                    }}
                    style={{
                        ...styles.directionCard,
                        ...(selectedDirection === direction.id ? styles.directionCardSelected : {}),
                        padding: '12px'
                    }}
                >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <div style={{width: '40px', height: '40px', background: selectedDirection === direction.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px'}}>
                                <FileText size={20} color="white" />
                            </div>
                            <div>
                                <h3 style={{fontSize: '14px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px'}}>{direction.direction_name}</h3>
                                <p style={{color: '#6b7280', margin: 0, fontSize: '12px'}}>研究方向</p>
                            </div>
                        </div>
                        {selectedDirection === direction.id && (
                            <CheckCircle size={20} color="#667eea" />
                        )}
                    </div>
                </div>
            ))}
            </div>
            </div>

            {/* 提交按钮 - 始终显示 */}
            <div style={{textAlign: 'center', marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '16px'}}>
                <button
                    onClick={handleStudentSubmit}
                    disabled={(!selectedDirection && !isObeyAllocation) || loading}
                    style={{
                        ...styles.button,
                        padding: '12px 32px',
                        fontSize: '16px',
                        minWidth: '160px',
                        opacity: ((!selectedDirection && !isObeyAllocation) || loading) ? 0.5 : 1
                    }}
                >
                    {loading ? (
                        <>
                            <div style={{width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px'}}></div>
                            提交中...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            确认提交
                        </>
                    )}
                </button>
                {isEditing && (
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            fetchStudentChoice();
                        }}
                        style={{
                            ...styles.button,
                            padding: '12px 32px',
                            fontSize: '16px',
                            minWidth: '160px',
                            background: '#6b7280'
                        }}
                    >
                        取消修改
                    </button>
                )}
            </div>
            </div>
            ) : null}
            </>
            )}

            {(systemPhase === 'teacher_selection' || systemPhase === 'allocation') && (
            <div style={styles.card}>
            <div style={{...styles.gradientHeader, textAlign: 'left', padding: '16px'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
            <Clock size={24} style={{marginRight: '8px'}} />
            <div>
            <h2 style={{fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px'}}>等待分配中</h2>
            <p style={{opacity: 0.9, margin: 0, fontSize: '12px'}}>
            {systemPhase === 'teacher_selection' ? '导师正在选择学生' : '系统正在进行随机分配'}
            </p>
            </div>
            </div>
            </div>
            <div style={{padding: '16px'}}>
            <p style={{color: '#6b7280', margin: '0 0 8px'}}>
            您的选择：{isObeyAllocation ? '服从分配' : researchDirections.find(d => d.id === selectedDirection)?.direction_name}
            </p>
            <p style={{color: '#6b7280', margin: 0}}>请耐心等待最终结果。</p>
            </div>
            </div>
            )}

            {systemPhase === 'result' && finalAllocation && (
            <div style={styles.card}>
            <div style={{background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: 'white', padding: '20px'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
            <CheckCircle size={32} style={{marginRight: '12px'}} />
            <div>
            <h2 style={{fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px'}}>分配结果</h2>
            <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>您的导师已确定</p>
            </div>
            </div>
            </div>
            <div style={{padding: '24px', textAlign: 'center'}}>
            <div style={{marginBottom: '16px'}}>
            <div style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'}}>
            <User size={40} color="white" />
            </div>
            <h3 style={{fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px'}}>{finalAllocation.teacher_name}</h3>
            <p style={{color: '#6b7280', fontSize: '16px', margin: '0 0 4px'}}>{finalAllocation.teacher_field}</p>
            <p style={{color: '#9ca3af', fontSize: '14px', margin: 0}}>
            分配方式：{finalAllocation.allocation_type === 'selected' ? '导师选择' : '系统分配'}
            </p>
            </div>
            </div>
            </div>
            )}

            {showResult && (
            <div style={{position: 'fixed', bottom: '20px', right: '20px', ...styles.successAlert, animation: 'bounce 1s infinite'}}>
            <CheckCircle size={20} />
            <span style={{fontWeight: 'bold', fontSize: '14px'}}>
            {isEditing ? '修改成功！' : '提交成功！'}
            </span>
            </div>
            )}

            {showChangePassword && renderPasswordModal(false)}
            </div>

            <style jsx>{`
            @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
            }
            
            @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
            }
            40% {
            transform: translateY(-10px);
            }
            60% {
            transform: translateY(-5px);
            }
            }
            `}</style>
            </div>
    );
    };

    const renderTeacherLogin = () => (
    <div style={{...styles.pageContainer, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
        <div style={styles.loginContainer}>
            <div style={{...styles.card, ...styles.loginCard}}>
                <div style={{...styles.gradientHeader, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
                    <div style={{width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'}}>
                        <Users size={30} />
                    </div>
                    <h1 style={{fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px'}}>导师端</h1>
                    <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>毕业论文导师分配系统</p>
                </div>

                <div style={{padding: '24px'}}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            <User size={14} style={{marginRight: '6px', display: 'inline'}} />
                            导师账号
                        </label>
                        <input
                            type="text"
                            value={teacherLogin.username}
                            onChange={(e) => setTeacherLogin({...teacherLogin, username: e.target.value})}
                            placeholder="请输入导师账号"
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            <Lock size={14} style={{marginRight: '6px', display: 'inline'}} />
                            密码
                        </label>
                        <div style={{position: 'relative'}}>
                            <input
                                type={showPassword.login ? "text" : "password"}
                                value={teacherLogin.password}
                                onChange={(e) => setTeacherLogin({...teacherLogin, password: e.target.value})}
                                placeholder="请输入密码"
                                style={{...styles.input, paddingRight: '45px'}}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword({...showPassword, login: !showPassword.login})}
                                style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'}}
                            >
                                {showPassword.login ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleTeacherLogin}
                        disabled={!teacherLogin.username.trim() || !teacherLogin.password.trim() || loading}
                        style={{...styles.button, width: '100%', padding: '12px', fontSize: '16px', marginBottom: '16px', background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', opacity: (!teacherLogin.username.trim() || !teacherLogin.password.trim() || loading) ? 0.5 : 1}}
                    >
                        {loading ? (
                            <>
                                <div style={{width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                                登录中...
                            </>
                        ) : (
                            <>
                                <Lock size={16} />
                                立即登录
                            </>
                        )}
                    </button>

                    <div style={{padding: '12px', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', borderRadius: '12px'}}>
                        <p style={{margin: 0, fontSize: '12px', color: '#065f46'}}>
                            <strong style={{display: 'flex', alignItems: 'center', marginBottom: '6px'}}>
                                <Star size={12} style={{marginRight: '6px'}} />
                                测试账号
                            </strong>
                            账号：zhang001 密码：123456<br />
                            账号：li002 密码：123456
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );

    const renderTeacherView = () => {
    const phaseInfo = getPhaseInfo();

    return (
    <div style={{...styles.pageContainer, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', display: 'flex', flexDirection: 'column'}}>
    {/* 顶部导航 */}
    <div style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', padding: '12px 0'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{width: '40px', height: '40px', background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Users size={24} color="white" />
                    </div>
                    <div>
                        <h1 style={{fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0}}>导师管理系统</h1>
                        <p style={{fontSize: '12px', color: '#6b7280', margin: 0}}>{teacherInfo?.name} - {teacherInfo?.work_id}</p>
                    </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <button
                        onClick={() => setShowTeacherChangePassword(true)}
                        style={{...styles.button, background: 'rgba(255,255,255,0.8)', color: '#374151', border: '1px solid rgba(0,0,0,0.1)', fontSize: '12px', padding: '8px 12px'}}
                    >
                        <Settings size={14} />
                        修改密码
                    </button>
                    <button
                        onClick={handleTeacherLogout}
                        style={{...styles.button, background: '#ef4444', fontSize: '12px', padding: '8px 12px'}}
                    >
                        <LogOut size={14} />
                        退出登录
                    </button>
                </div>
            </div>
        </div>
    </div>

    {/* 主内容区域 */}
    <div style={{flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '20px', overflow: 'hidden'}}>

        {/* 系统阶段指示器 */}
        <div style={styles.phaseIndicator}>
            {phaseInfo.icon}
            <div>
                <div style={{fontSize: '16px'}}>{phaseInfo.name}</div>
                <div style={{fontSize: '12px', opacity: 0.9}}>{phaseInfo.description}</div>
            </div>
        </div>

        {/* 研究方向填写阶段 */}
        {systemPhase === 'direction_input' && (
            <div style={styles.card}>
                <div style={{...styles.gradientHeader, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', textAlign: 'left', padding: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <FileText size={32} style={{marginRight: '12px'}} />
                        <div>
                            <h2 style={{fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px'}}>填写研究方向</h2>
                            <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>请填写1-3个研究方向（每个5-15字），学生将根据这些方向进行选择</p>
                        </div>
                    </div>
                </div>

                <div style={{padding: '20px'}}>
                    {[0, 1, 2].map((index) => (
                        <div key={index} style={styles.formGroup}>
                            <label style={styles.label}>研究方向（选填）</label>
                            <input
                                type="text"
                                value={teacherDirections[index]}
                                onChange={(e) => {
                                    const newDirections = [...teacherDirections];
                                    newDirections[index] = e.target.value;
                                    setTeacherDirections(newDirections);
                                }}
                                placeholder={`请输入研究方向${index + 1}（5-15字）`}
                                style={styles.input}
                                maxLength={15}
                            />
                        </div>
                    ))}

                    <div style={{marginTop: '20px', textAlign: 'center'}}>
                        <button
                            onClick={handleSaveDirections}
                            disabled={!teacherDirections[0].trim() || loading}
                            style={{...styles.button, padding: '12px 32px', fontSize: '16px', opacity: (!teacherDirections[0].trim() || loading) ? 0.5 : 1}}
                        >
                            {loading ? '保存中...' : '保存研究方向'}
                        </button>
                    </div>

                    <div style={{marginTop: '16px', padding: '12px', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderRadius: '12px', border: '1px solid #3b82f6'}}>
                        <p style={{fontSize: '12px', color: '#1d4ed8', margin: 0}}>
                            <strong>注意事项：</strong><br />
                            • 研究方向将展示给学生选择，请认真填写<br />
                            • 每个方向应在5-15个字之间，简明扼要<br />
                            • 尽量避免与其他导师重复的方向<br />
                            • 保存后在本阶段结束前仍可修改
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* 学生选择阶段 - 导师等待 */}
        {systemPhase === 'student_selection' && (
            <div style={styles.card}>
                <div style={{...styles.gradientHeader, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', textAlign: 'left', padding: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Clock size={32} style={{marginRight: '12px'}} />
                        <div>
                            <h2 style={{fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px'}}>学生选择中</h2>
                            <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>学生正在选择研究方向，请耐心等待</p>
                        </div>
                    </div>
                </div>
                <div style={{padding: '20px'}}>
                    {/* <h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px'}}>您的研究方向：</h3> */}
                    {teacherDirections.filter(d => d).map((direction, index) => (
                        <div key={index} style={{padding: '12px', background: '#f3f4f6', borderRadius: '8px', marginBottom: '8px', display: 'none'}}>
                            <span style={{color: '#374151'}}>方向 {index + 1}：{direction}</span>
                        </div>
                    ))}
                    
                    {/* 显示已选择的学生 */}
                    <div style={{marginTop: '0'}}>
                        <h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px'}}>已选择您方向的学生：</h3>
                        {directionStudents.length > 0 ? (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                {directionStudents.map((student, index) => (
                                    <div key={index} style={{
                                        padding: '16px',
                                        background: 'white',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <div>
                                                <h4 style={{fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px'}}>
                                                    {student.name} ({student.student_id})
                                                </h4>
                                                <p style={{color: '#6b7280', margin: 0, fontSize: '14px'}}>
                                                    选择方向：{student.direction_name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                padding: '20px',
                                background: '#f9fafb',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <p style={{color: '#6b7280', margin: 0}}>暂无学生选择您的研究方向</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* 导师选择学生阶段 */}
        {systemPhase === 'teacher_selection' && (
            <div style={styles.card}>
                <div style={{...styles.gradientHeader, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', textAlign: 'left', padding: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <UserCheck size={32} style={{marginRight: '12px'}} />
                        <div>
                            <h2 style={{fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px'}}>选择学生</h2>
                            <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>
                                {selectedStudent ? '您已完成选择' : '请从选择您研究方向的学生中选择一位（可以不选）'}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{padding: '20px', height: 'calc(100vh - 280px)', overflow: 'auto'}}>
                    {selectedStudent ? (
                        <div style={{textAlign: 'center', padding: '40px'}}>
                            <div style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
                                <CheckCircle size={40} color="white" />
                            </div>
                            <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#065f46', margin: '0 0 8px'}}>选择完成</h3>
                            <p style={{color: '#047857', fontSize: '16px'}}>
                                您已选择学号为 <strong>{selectedStudent}</strong> 的学生
                            </p>
                        </div>
                    ) : (
                        <>
                            {directionStudents.length > 0 ? (
                                <div>
                                    <div style={{marginBottom: '16px', padding: '12px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '12px'}}>
                                        <p style={{fontSize: '14px', color: '#92400e', margin: 0}}>
                                            <strong>提示：</strong>共有 {directionStudents.length} 位学生选择了您的研究方向
                                        </p>
                                    </div>
                                    {directionStudents
                                        .slice()
                                        .sort((a, b) => String(a.student_id).localeCompare(String(b.student_id)))
                                        .map((student, index) => (
                                        <div key={student.student_id} style={{padding: '16px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #22c55e', borderRadius: '16px', marginBottom: '12px', transition: 'all 0.3s ease'}}>
                                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                                <div style={{display: 'flex', alignItems: 'center'}}>
                                                    <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', fontSize: '16px', fontWeight: 'bold'}}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px'}}>
                                                            {student.name}（{student.student_id}）
                                                        </h3>
                                                        <p style={{color: '#6b7280', fontSize: '14px', margin: 0}}>
                                                            选择方向：{student.direction_name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleSelectStudent(student.student_id)}
                                                    style={{...styles.button, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', padding: '8px 20px'}}>
                                                    选择该学生
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{textAlign: 'center', padding: '40px 0'}}>
                                    <div style={{width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
                                        <Users size={40} color="#9ca3af" />
                                    </div>
                                    <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#6b7280', margin: '0 0 8px'}}>暂无学生选择</h3>
                                    <p style={{color: '#9ca3af', margin: 0}}>目前还没有学生选择您的研究方向</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        )}

        {/* 系统分配阶段 */}
        {systemPhase === 'allocation' && (
            <div style={styles.card}>
                <div style={{...styles.gradientHeader, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', textAlign: 'left', padding: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Shuffle size={32} style={{marginRight: '12px'}} />
                        <div>
                            <h2 style={{fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px'}}>系统分配中</h2>
                            <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>系统正在进行学生分配，请稍候</p>
                        </div>
                    </div>
                </div>
                <div style={{padding: '20px', textAlign: 'center'}}>
                    <div style={{display: 'inline-block', padding: '20px'}}>
                        <div style={{width: '60px', height: '60px', border: '4px solid #10b981', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'}}></div>
                        <p style={{color: '#6b7280', margin: 0}}>系统正在处理未分配的学生...</p>
                    </div>
                </div>
            </div>
        )}

        {/* 结果公布阶段 */}
        {systemPhase === 'result' && (
            <div style={styles.card}>
                <div style={{...styles.gradientHeader, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', textAlign: 'left', padding: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <CheckCircle size={32} style={{marginRight: '12px'}} />
                        <div>
                            <h2 style={{fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px'}}>最终学生名单</h2>
                            <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>您的学生分配结果</p>
                        </div>
                    </div>
                </div>

                <div style={{padding: '20px'}}>
                    {directionStudents.length > 0 ? (
                        <div>
                            {directionStudents.map((student, index) => (
                                <div key={student.student_id} style={{padding: '16px', background: student.allocation_type === 'selected' ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: `1px solid ${student.allocation_type === 'selected' ? '#3b82f6' : '#f59e0b'}`, borderRadius: '16px', marginBottom: '12px'}}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <div style={{width: '48px', height: '48px', background: student.allocation_type === 'selected' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', fontSize: '16px', fontWeight: 'bold'}}>
                                            {index + 1}
                                        </div>
                                        <div style={{flex: 1}}>
                                            <h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px'}}>
                                                {student.student_name}
                                            </h3>
                                            <p style={{color: '#6b7280', fontSize: '14px', margin: 0}}>
                                                学号：{student.student_id}
                                            </p>
                                        </div>
                                        <div style={{textAlign: 'right'}}>
       <span style={{fontSize: '12px', color: student.allocation_type === 'selected' ? '#1d4ed8' : '#d97706', fontWeight: '600'}}>
         {student.allocation_type === 'selected' ? '主动选择' : '系统分配'}
       </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div style={{marginTop: '20px', padding: '16px', background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', borderRadius: '16px', textAlign: 'center'}}>
                                <p style={{fontSize: '16px', color: '#374151', margin: 0}}>
                                    共有 <strong>{directionStudents.length}</strong> 位学生
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{textAlign: 'center', padding: '40px 0'}}>
                            <div style={{width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
                                <Users size={40} color="#9ca3af" />
                            </div>
                            <h3 style={{fontSize: '20px', fontWeight: 'bold', color: '#6b7280', margin: '0 0 8px'}}>暂无学生</h3>
                            <p style={{color: '#9ca3af', margin: 0}}>本次分配您没有学生</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {showResult && (
            <div style={{position: 'fixed', bottom: '20px', right: '20px', ...styles.successAlert, animation: 'bounce 1s infinite'}}>
                <CheckCircle size={20} />
                <span style={{fontWeight: 'bold', fontSize: '14px'}}>操作成功！</span>
            </div>
        )}

        {showTeacherChangePassword && renderPasswordModal(true)}
    </div>

        <style jsx>{`
    @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
    }
    
    @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
    }
    40% {
    transform: translateY(-10px);
    }
    60% {
    transform: translateY(-5px);
    }
    }
    `}</style>
    </div>
    );
    };

    // 如果已登录，不显示顶部切换按钮
    if (studentInfo || teacherInfo) {
        return userType === 'student'
            ? renderStudentView()
            : renderTeacherView();
    }

    return (
        <div style={{...styles.pageContainer, background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex'}}>
            {/* 左侧选择器 */}
            <div style={{width: '300px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRight: '1px solid rgba(255, 255, 255, 0.2)', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{textAlign: 'center', marginBottom: '30px'}}>
                    <div style={{width: '60px', height: '60px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
                        <GraduationCap size={32} color="white" />
                    </div>
                    <h1 style={{fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px'}}>毕业论文导师分配系统</h1>
                    <p style={{color: '#6b7280', fontSize: '14px', margin: 0}}>选择您的身份</p>
                </div>

                <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    <button
                        onClick={() => setUserType('student')}
                        style={{
                            width: '100%',
                            padding: '20px',
                            borderRadius: '16px',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            border: userType === 'student' ? 'none' : '2px solid #8b5cf6',
                            background: userType === 'student'
                                ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                                : 'rgba(255,255,255,0.8)',
                            color: userType === 'student' ? 'white' : '#8b5cf6',
                            boxShadow: userType === 'student' ? '0 8px 25px rgba(139, 92, 246, 0.3)' : '0 4px 15px rgba(0,0,0,0.05)'
                        }}
                    >
                        <User size={24} style={{marginBottom: '8px'}} />
                        <span>学生端</span>
                        <span style={{fontSize: '12px', opacity: 0.8, marginTop: '4px'}}>选择研究方向</span>
                    </button>

                    <button
                        onClick={() => setUserType('teacher')}
                        style={{
                            width: '100%',
                            padding: '20px',
                            borderRadius: '16px',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            border: userType === 'teacher' ? 'none' : '2px solid #10b981',
                            background: userType === 'teacher'
                                ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                                : 'rgba(255,255,255,0.8)',
                            color: userType === 'teacher' ? 'white' : '#10b981',
                            boxShadow: userType === 'teacher' ? '0 8px 25px rgba(16, 185, 129, 0.3)' : '0 4px 15px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Users size={24} style={{marginBottom: '8px'}} />
                        <span>导师端</span>
                        <span style={{fontSize: '12px', opacity: 0.8, marginTop: '4px'}}>管理研究方向</span>
                    </button>
                </div>
            </div>

            {/* 右侧登录界面 */}
            <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
                {userType === 'student' ? renderStudentLogin() : renderTeacherLogin()}
            </div>

            <style jsx>{`
       @keyframes spin {
         0% { transform: rotate(0deg); }
         100% { transform: rotate(360deg); }
       }
       
       @keyframes bounce {
         0%, 20%, 50%, 80%, 100% {
           transform: translateY(0);
         }
         40% {
           transform: translateY(-10px);
         }
         60% {
           transform: translateY(-5px);
         }
       }
     `}</style>
        </div>
    );
};

export default ThesisSystem;