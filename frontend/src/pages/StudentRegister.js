import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { AuthPage } from './StudentLogin';

const BRANCHES = ['CSE','ISE','ECE','EEE','ME','CE','AIML','DS','IT','Civil'];
const SECTIONS = ['1','2','3','4','5'];

export default function StudentRegister() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name:'', usn:'', email:'', password:'', semester:'', section:'', branch:'' });
  const [loading, setLoading] = useState(false);
  const set = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/student/register', form);
      login(data.user, data.token, 'student');
      toast.success('Account created! Welcome aboard.');
      nav('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthPage>
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text2)', fontSize:13, marginBottom:24, textDecoration:'none' }}>
        <ArrowLeft size={14} /> Back
      </Link>
      <div className="card fade-up">
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          <div style={{ width:42, height:42, borderRadius:11, background:'rgba(124,111,255,.15)', border:'1px solid rgba(124,111,255,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <GraduationCap size={22} color="var(--accent2)" />
          </div>
          <div>
            <h2 style={{ fontFamily:'Syne', fontSize:19, fontWeight:700 }}>Student Registration</h2>
            <p style={{ color:'var(--text2)', fontSize:12 }}>Create your student account</p>
          </div>
        </div>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label className="lbl">Full Name</label>
            <input className="input" name="name" placeholder="Shree Ram S P" value={form.name} onChange={set} required />
          </div>
          <div className="grid2">
            <div>
              <label className="lbl">USN</label>
              <input className="input mono" name="usn" placeholder="1XX21CS001" value={form.usn} onChange={set} required style={{ textTransform:'uppercase' }} />
            </div>
            <div>
              <label className="lbl">Branch</label>
              <select className="input" name="branch" value={form.branch} onChange={set} required>
                <option value="">Select</option>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>
          <div className="grid2">
            <div>
              <label className="lbl">Semester</label>
              <select className="input" name="semester" value={form.semester} onChange={set} required>
                <option value="">Select</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}{['st','nd','rd','th','th','th','th','th'][s-1]} Sem</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Section</label>
              <select className="input" name="section" value={form.section} onChange={set} required>
                <option value="">Select</option>
                {SECTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="lbl">Email Address</label>
            <input className="input" name="email" type="email" placeholder="student@college.edu" value={form.email} onChange={set} required />
          </div>
          <div>
            <label className="lbl">Password</label>
            <input className="input" name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set} required minLength={6} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop:4, padding:'12px' }}>
            {loading ? <span className="spinner" /> : 'Create Student Account'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--text2)' }}>
          Already have an account? <Link to="/student/login" style={{ color:'var(--accent2)', textDecoration:'none', fontWeight:600 }}>Login</Link>
        </p>
      </div>
    </AuthPage>
  );
}
