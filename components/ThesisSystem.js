import React, { useState, useEffect } from 'react';
import { User, UserCheck, Edit, Save, CheckCircle, AlertCircle, Lock, Settings, UserPlus, LogOut, Eye, EyeOff, GraduationCap, BookOpen, Users, Star } from 'lucide-react';

const ThesisSystem = () => {
    const [userType, setUserType] = useState('student');
    const [studentInfo, setStudentInfo] = useState(null);
    const [teacherInfo, setTeacherInfo] = useState(null);
    const [studentLogin, setStudentLogin] = useState({ studentId: '', password: '' });
    const [teacherLogin, setTeacherLogin] = useState({ username: '', password: '' });
    const [selectedAdvisors, setSelectedAdvisors] = useState([]);
    const [previousSelections, setPreviousSelections] = useState([]);
    const [advisors, setAdvisors] = useState([]);
    const [students, setStudents] = useState([]);
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

    // 获取教师列表
    useEffect(() => {
        fetchTeachers();
    }, []);

    // 当学生登录后，获取历史选择
    useEffect(() => {
        if (studentInfo) {
            fetchStudentChoices();
        }
    }, [studentInfo]);

    // 当导师登录后，获取学生列表
    useEffect(() => {
        if (teacherInfo) {
            fetchTeacherStudents();
        }
    }, [teacherInfo]);

    const fetchTeachers = async () => {
        try {
            const response = await fetch('/api/teachers');
            const data = await response.json();
            if (data.teachers) {
                setAdvisors(data.teachers);
            }
        } catch (error) {
            console.error('获取教师列表失败:', error);
        }
    };

    const fetchStudentChoices = async () => {
        try {
            const response = await fetch(`/api/get-choices?studentId=${studentInfo.student_id}`);
            const data = await response.json();
            if (data.choices) {
                setPreviousSelections(data.choices);
                setSelectedAdvisors(data.choices);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('获取学生选择失败:', error);
        }
    };

    const fetchTeacherStudents = async () => {
        try {
            const response = await fetch(`/api/teacher-students?teacherId=${teacherInfo.id}`);
            const data = await response.json();
            if (data.students) {
                // 合并所有优先级的学生，不再区分志愿优先级
                const allStudents = [
                    ...data.students.first,
                    ...data.students.second,
                    ...data.students.third
                ];
                setStudents(allStudents);
            }
        } catch (error) {
            console.error('获取学生列表失败:', error);
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

    const handleAdvisorSelect = (advisorId) => {
        if (!isEditing && previousSelections.length > 0) return;

        if (selectedAdvisors.includes(advisorId)) {
            setSelectedAdvisors(selectedAdvisors.filter(id => id !== advisorId));
        } else if (selectedAdvisors.length < 3) {
            setSelectedAdvisors([...selectedAdvisors, advisorId]);
        }
    };

    const handleSubmit = async () => {
        if (!studentInfo || selectedAdvisors.length === 0) return;

        setLoading(true);
        try {
            const response = await fetch('/api/submit-choice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: studentInfo.student_id,
                    choices: selectedAdvisors
                })
            });

            const data = await response.json();

            if (response.ok) {
                setPreviousSelections(selectedAdvisors);
                setIsEditing(false);
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

    const handleStudentLogout = () => {
        setStudentInfo(null);
        setSelectedAdvisors([]);
        setPreviousSelections([]);
        setIsEditing(false);
    };

    const handleTeacherLogout = () => {
        setTeacherInfo(null);
        setTeacherLogin({ username: '', password: '' });
        setStudents([]);
    };

    const startEditing = () => setIsEditing(true);
    const cancelEditing = () => {
        setSelectedAdvisors(previousSelections);
        setIsEditing(false);
    };

    // CSS样式定义 - 修复输入框溢出问题，取消滚动
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
        advisorCard: {
            padding: '16px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '12px',
            backgroundColor: 'white'
        },
        advisorCardSelected: {
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
        }
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
                        <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>毕业论文导师选择系统</p>
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
                                    <p style={{color: '#6b7280', margin: 0, fontSize: '14px'}}>加入毕业论文导师选择系统</p>
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
                                    <button
                                        onClick={() => setShowRegister(false)}
                                        style={{...styles.button, flex: 1, background: '#6b7280'}}
                                    >
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

    const renderStudentView = () => (
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
                                <h1 style={{fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0}}>毕业论文导师选择</h1>
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

            {/* 主内容区域 - 限制高度，不允许滚动 */}
            <div style={{flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>

                {/* 已完成选择的状态 */}
                {previousSelections.length > 0 && !isEditing && (
                    <div style={{marginBottom: '16px'}}>
                        <div style={styles.card}>
                            <div style={{background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: 'white', padding: '16px'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <CheckCircle size={24} style={{marginRight: '8px'}} />
                                        <div>
                                            <h3 style={{fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px'}}>选择已完成</h3>
                                            <p style={{opacity: 0.9, margin: 0, fontSize: '12px'}}>您已成功提交导师选择</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startEditing}
                                        style={{...styles.button, background: 'rgba(255,255,255,0.2)', fontSize: '12px', padding: '8px 12px'}}
                                    >
                                        <Edit size={14} />
                                        修改选择
                                    </button>
                                </div>
                            </div>
                            <div style={{padding: '16px', maxHeight: '120px', overflow: 'auto'}}>
                                {previousSelections.map((id, index) => (
                                    <div key={id} style={{display: 'flex', alignItems: 'center', padding: '8px', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', borderRadius: '8px', marginBottom: '6px', border: '1px solid #10b981'}}>
                                        <div style={{width: '24px', height: '24px', background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', fontSize: '12px', fontWeight: 'bold'}}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 style={{fontSize: '14px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 2px'}}>{advisors.find(a => a.id === id)?.name}</h4>
                                            <p style={{color: '#6b7280', margin: 0, fontSize: '12px'}}>{advisors.find(a => a.id === id)?.field}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 修改模式提示 */}
                {isEditing && (
                    <div style={{marginBottom: '16px', padding: '12px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '16px', border: '1px solid #f59e0b'}}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <Edit size={20} color="#d97706" style={{marginRight: '8px'}} />
                                <div>
                                    <h3 style={{fontSize: '14px', fontWeight: 'bold', color: '#92400e', margin: '0 0 2px'}}>修改模式</h3>
                                    <p style={{color: '#d97706', fontSize: '12px', margin: 0}}>您可以重新选择导师</p>
                                </div>
                            </div>
                            <button
                                onClick={cancelEditing}
                                style={{...styles.button, background: '#6b7280', fontSize: '12px', padding: '6px 12px'}}
                            >
                                取消修改
                            </button>
                        </div>
                    </div>
                )}

                {/* 选择导师区域 */}
                {(previousSelections.length === 0 || isEditing) && (
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                        <div style={styles.card}>
                            <div style={{...styles.gradientHeader, textAlign: 'left', padding: '16px'}}>
                                <div style={{display: 'flex', alignItems: 'center'}}>
                                    <BookOpen size={24} style={{marginRight: '8px'}} />
                                    <div>
                                        <h2 style={{fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px'}}>选择您的导师</h2>
                                        <p style={{opacity: 0.9, margin: 0, fontSize: '12px'}}>最多可选择3位导师，将按您的选择顺序作为志愿优先级</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{padding: '16px', flex: 1, overflow: 'auto', maxHeight: '300px'}}>
                                {advisors.map((advisor) => (
                                    <div
                                        key={advisor.id}
                                        onClick={() => handleAdvisorSelect(advisor.id)}
                                        style={{
                                            ...styles.advisorCard,
                                            ...(selectedAdvisors.includes(advisor.id) ? styles.advisorCardSelected : {}),
                                            padding: '12px'
                                        }}
                                    >
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <div style={{display: 'flex', alignItems: 'center'}}>
                                                <div style={{width: '40px', height: '40px', background: selectedAdvisors.includes(advisor.id) ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px'}}>
                                                    <User size={20} color="white" />
                                                </div>
                                                <div>
                                                    <h3 style={{fontSize: '14px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px'}}>{advisor.name}</h3>
                                                    <p style={{color: '#6b7280', margin: 0, fontSize: '12px'}}>{advisor.field}</p>
                                                </div>
                                            </div>
                                            <div>
                                                {selectedAdvisors.includes(advisor.id) && (
                                                    <div style={{width: '32px', height: '32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'}}>
                                                        {selectedAdvisors.indexOf(advisor.id) + 1}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 当前选择预览 */}
                {(previousSelections.length === 0 || isEditing) && selectedAdvisors.length > 0 && (
                    <div style={{marginTop: '16px'}}>
                        <div style={{padding: '12px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '16px', border: '1px solid #f59e0b'}}>
                            <h3 style={{fontSize: '14px', fontWeight: 'bold', color: '#92400e', margin: '0 0 8px'}}>当前选择预览</h3>
                            <div style={{maxHeight: '80px', overflow: 'auto'}}>
                                {selectedAdvisors.map((id, index) => (
                                    <div key={id} style={{display: 'inline-block', marginRight: '8px', marginBottom: '4px', padding: '4px 8px', background: 'rgba(245, 158, 11, 0.2)', borderRadius: '8px', fontSize: '12px'}}>
                                        {index + 1}. {advisors.find(a => a.id === id)?.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 提交按钮 */}
                {(previousSelections.length === 0 || isEditing) && (
                    <div style={{textAlign: 'center', marginTop: '16px'}}>
                        <button
                            onClick={handleSubmit}
                            disabled={selectedAdvisors.length === 0 || loading}
                            style={{...styles.button, padding: '12px 32px', fontSize: '16px', opacity: (selectedAdvisors.length === 0 || loading) ? 0.5 : 1}}
                        >
                            {loading ? (
                                <>
                                    <div style={{width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px'}}></div>
                                    提交中...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {isEditing ? '保存修改' : '确认提交'}
                                </>
                            )}
                        </button>
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

    const renderTeacherLogin = () => (
        <div style={{...styles.pageContainer, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
            <div style={styles.loginContainer}>
                <div style={{...styles.card, ...styles.loginCard}}>
                    <div style={{...styles.gradientHeader, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
                        <div style={{width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'}}>
                            <Users size={30} />
                        </div>
                        <h1 style={{fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px'}}>导师端</h1>
                        <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>毕业论文导师选择系统</p>
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

    const renderTeacherView = () => (
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
                                <h1 style={{fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0}}>导师查看系统</h1>
                                <p style={{fontSize: '12px', color: '#6b7280', margin: 0}}>{teacherInfo?.name} - {teacherInfo?.field}</p>
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
                <div style={styles.card}>
                    <div style={{...styles.gradientHeader, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', textAlign: 'left', padding: '20px'}}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <BookOpen size={32} style={{marginRight: '12px'}} />
                            <div>
                                <h2 style={{fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px'}}>选择您的学生</h2>
                                <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>以下学生将您作为导师候选，本系统仅用于信息收集</p>
                            </div>
                        </div>
                    </div>

                    <div style={{padding: '20px', height: 'calc(100vh - 200px)', overflow: 'auto'}}>
                        {students.length > 0 ? (
                            <div>
                                {students.map((student, index) => (
                                    <div key={student.id} style={{padding: '16px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #22c55e', borderRadius: '16px', marginBottom: '12px', transition: 'all 0.3s ease'}}>
                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                            <div style={{width: '48px', height: '48px', background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', fontSize: '16px', fontWeight: 'bold'}}>
                                                {index + 1}
                                            </div>
                                            <div style={{flex: 1}}>
                                                <h3 style={{fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 4px'}}>学号: {student.student_id}</h3>
                                                <p style={{color: '#6b7280', fontSize: '14px', margin: 0}}>姓名: {student.student_name}</p>
                                            </div>
                                            <div style={{width: '24px', height: '24px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <User size={16} color="#16a34a" />
                                            </div>
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
                                <p style={{color: '#9ca3af', margin: 0}}>目前还没有学生选择您作为导师候选</p>
                            </div>
                        )}

                        <div style={{marginTop: '20px', padding: '16px', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', borderRadius: '16px', border: '1px solid #3b82f6'}}>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <div style={{display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '12px 16px'}}>
                                    <AlertCircle size={24} color="#1d4ed8" style={{marginRight: '12px'}} />
                                    <div style={{textAlign: 'center'}}>
                                        <p style={{fontSize: '14px', fontWeight: 'bold', color: '#1e40af', margin: '0 0 2px'}}>
                                            选择您的学生总数: {students.length} 人
                                        </p>
                                        <p style={{fontSize: '12px', color: '#3730a3', margin: 0}}>
                                            本系统仅用于收集学生的导师选择信息，不涉及最终分配
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showTeacherChangePassword && renderPasswordModal(true)}
            </div>
        </div>
    );

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
                    <h1 style={{fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px'}}>毕业论文导师选择系统</h1>
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
                        <span style={{fontSize: '12px', opacity: 0.8, marginTop: '4px'}}>选择导师</span>
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
                        <span style={{fontSize: '12px', opacity: 0.8, marginTop: '4px'}}>查看学生</span>
                    </button>
                </div>
            </div>

            {/* 右侧登录界面 */}
            <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'}}>
                {userType === 'student' ? (
                    <div style={{...styles.card, width: '100%', maxWidth: '450px'}}>
                        <div style={{...styles.gradientHeader, background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'}}>
                            <div style={{width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'}}>
                                <GraduationCap size={30} />
                            </div>
                            <h1 style={{fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px'}}>学生端</h1>
                            <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>毕业论文导师选择系统</p>
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
                                        style={{...styles.button, width: '100%', padding: '12px', fontSize: '16px', marginBottom: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', opacity: (!studentLogin.studentId.trim() || !studentLogin.password.trim() || loading) ? 0.5 : 1}}
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
                                            style={{background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', fontSize: '14px', fontWeight: '600'}}
                                        >
                                            <UserPlus size={14} style={{marginRight: '6px'}} />
                                            还没有账号？立即注册
                                        </button>
                                    </div>

                                    <div style={{padding: '12px', background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', borderRadius: '12px'}}>
                                        <p style={{margin: 0, fontSize: '12px', color: '#5b21b6'}}>
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
                                        <p style={{color: '#6b7280', margin: 0, fontSize: '14px'}}>加入毕业论文导师选择系统</p>
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
                                        <button
                                            onClick={() => setShowRegister(false)}
                                            style={{...styles.button, flex: 1, background: '#6b7280'}}
                                        >
                                            返回登录
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{...styles.card, width: '100%', maxWidth: '450px'}}>
                        <div style={{...styles.gradientHeader, background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'}}>
                            <div style={{width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'}}>
                                <Users size={30} />
                            </div>
                            <h1 style={{fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px'}}>导师端</h1>
                            <p style={{opacity: 0.9, margin: 0, fontSize: '14px'}}>毕业论文导师选择系统</p>
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
                )}
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