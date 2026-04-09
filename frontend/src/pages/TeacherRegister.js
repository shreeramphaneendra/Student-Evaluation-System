import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { AuthPage } from './StudentLogin';

const DEPARTMENTS = ['CSE','ISE','ECE','EEE','ME','CE','AIML','DS','IT','Civil'];
const SECTIONS    = ['1','2','3','4','5'];

export default function TeacherRegister() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm]       = useState({ name:'', employeeId:'', email:'', password:'', department:'' });
  const [subjects, setSubjects] = useState([]);
  const [subForm, setSubForm]  = useState({ subjectName:'', subjectCode:'', semester:'', section:'', subjectType:'theory', maxMarks:'40' });
  const [loading, setLoading]  = useState(false);
  const set  = e => setForm({ ...form, [e.target.name]: e.target.value });
  const setSub = e => {
    const updated = { ...subForm, [e.target.name]: e.target.value };
    if (e.target.name === 'subjectType') updated.maxMarks = e.target.value === 'lab' ? '50' : e.target.value === 'none' ? '0' : '40';
    setSubForm(updated);
  };

  const addSubject = () => {
    if (!subForm.subjectName || !subForm.semester || !subForm.section) {
      toast.error('Fill subject name, semester, section'); return;
    }
    setSubjects([...subjects, { ...subForm, id: Date.now() }]);
    setSubForm({ subjectName:'', subjectCode:'', semester:'', section:'', subjectType:'theory', maxMarks:'40' });
  };

  const removeSubject = id => setSubjects(subjects.filter(s => s.id !== id));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, subjects: subjects.map(({ id, ...s }) => ({ ...s, semester: Number(s.semester), maxMarks: Number(s.maxMarks) })) };
      const { data } = await axios.post('/api/auth/teacher/register', payload);
      login(data.user, data.token, 'teacher');
      toast.success('Account created! Welcome.');
      nav('/teacher/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 20% 30%, rgba(34,211,238,.06) 0%, transparent 50%), var(--bg)', padding:'24px', display:'flex', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:620 }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text2)', fontSize:13, marginBottom:24, textDecoration:'none' }}>
          <ArrowLeft size={14}/> Back
        </Link>
        <div className="card fade-up">
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
            <div style={{ width:42, height:42, borderRadius:11, background:'rgba(34,211,238,.12)', border:'1px solid rgba(34,211,238,.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <BookOpen size={22} color="var(--cyan)"/>
            </div>
            <div>
              <h2 style={{ fontFamily:'Syne', fontSize:19, fontWeight:700 }}>Teacher Registration</h2>
              <p style={{ color:'var(--text2)', fontSize:12 }}>Create your account and add subjects you teach</p>
            </div>
          </div>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Basic Info */}
            <div style={{ padding:'16px', background:'var(--bg3)', borderRadius:'var(--r2)', border:'1px solid var(--border)' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Basic Information</p>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label className="lbl">Full Name</label>
                  <input className="input" name="name" placeholder="Prof. Anitha R" value={form.name} onChange={set} required/>
                </div>
                <div className="grid2">
                  <div>
                    <label className="lbl">Employee ID</label>
                    <input className="input mono" name="employeeId" placeholder="EMP001" value={form.employeeId} onChange={set} required style={{ textTransform:'uppercase' }}/>
                  </div>
                  <div>
                    <label className="lbl">Department</label>
                    <select className="input" name="department" value={form.department} onChange={set} required>
                      <option value="">Select</option>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="lbl">Email Address</label>
                  <input className="input" name="email" type="email" placeholder="teacher@college.edu" value={form.email} onChange={set} required/>
                </div>
                <div>
                  <label className="lbl">Password</label>
                  <input className="input" name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set} required minLength={6}/>
                </div>
              </div>
            </div>

            {/* Add Subjects */}
            <div style={{ padding:'16px', background:'var(--bg3)', borderRadius:'var(--r2)', border:'1px solid var(--border)' }}>
              <p style={{ fontSize:11, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Subjects You Teach</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>
                <div className="grid2">
                  <div>
                    <label className="lbl">Subject Name</label>
                    <input className="input" name="subjectName" placeholder="Data Structures" value={subForm.subjectName} onChange={setSub}/>
                  </div>
                  <div>
                    <label className="lbl">Subject Code</label>
                    <input className="input mono" name="subjectCode" placeholder="BCS301" value={subForm.subjectCode} onChange={setSub}/>
                  </div>
                </div>
                <div className="grid3">
                  <div>
                    <label className="lbl">Semester</label>
                    <select className="input" name="semester" value={subForm.semester} onChange={setSub}>
                      <option value="">Sem</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">Section</label>
                    <select className="input" name="section" value={subForm.section} onChange={setSub}>
                      <option value="">Sec</option>
                      {SECTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="lbl">Type</label>
                    <select className="input" name="subjectType" value={subForm.subjectType} onChange={setSub}>
                      <option value="theory">Theory (40)</option>
                      <option value="lab">Lab (50)</option>
                      <option value="none">No CIE</option>
                    </select>
                  </div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={addSubject} style={{ alignSelf:'flex-start' }}>
                  <Plus size={14}/> Add Subject
                </button>
              </div>

              {/* Subject list */}
              {subjects.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {subjects.map(s => (
                    <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'var(--surface2)', borderRadius:'var(--r3)', border:'1px solid var(--border2)' }}>
                      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                        <span style={{ fontWeight:600, fontSize:13 }}>{s.subjectName}</span>
                        {s.subjectCode && <span className="mono" style={{ fontSize:11, color:'var(--text2)' }}>{s.subjectCode}</span>}
                        <span className={`tag ${s.subjectType === 'lab' ? 'tag-cyan' : s.subjectType === 'none' ? 'tag-red' : 'tag-purple'}`}>
                          {s.subjectType === 'none' ? 'No CIE' : s.subjectType === 'lab' ? `Lab (50)` : `Theory (40)`}
                        </span>
                        <span className="tag tag-gold">Sem {s.semester} · {s.section}</span>
                      </div>
                      <button type="button" onClick={() => removeSubject(s.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--red)', padding:4 }}>
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {subjects.length === 0 && (
                <p style={{ color:'var(--text3)', fontSize:12, textAlign:'center', padding:'12px 0' }}>No subjects added yet. You can also add them after registration.</p>
              )}
            </div>

            <button className="btn btn-full" type="submit" disabled={loading}
              style={{ padding:'12px', background:'var(--cyan)', color:'var(--bg)', fontWeight:700, marginTop:4 }}>
              {loading ? <span className="spinner"/> : 'Create Teacher Account'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--text2)' }}>
            Already have an account? <Link to="/teacher/login" style={{ color:'var(--cyan)', textDecoration:'none', fontWeight:600 }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
