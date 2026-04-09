import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function StudentLogin() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/student/login', form);
      login(data.user, data.token, 'student');
      toast.success(`Welcome back, ${data.user.name}!`);
      nav('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthPage>
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text2)', fontSize:13, marginBottom:24, textDecoration:'none' }}>
        <ArrowLeft size={14} /> Back to home
      </Link>
      <div className="card fade-up" style={{ maxWidth:440, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          <div style={{ width:42, height:42, borderRadius:11, background:'rgba(124,111,255,.15)', border:'1px solid rgba(124,111,255,.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <GraduationCap size={22} color="var(--accent2)" />
          </div>
          <div>
            <h2 style={{ fontFamily:'Syne', fontSize:19, fontWeight:700 }}>Student Login</h2>
            <p style={{ color:'var(--text2)', fontSize:12 }}>Access your evaluation dashboard</p>
          </div>
        </div>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label className="lbl">Email Address</label>
            <input className="input" type="email" placeholder="student@college.edu" value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
          </div>
          <div>
            <label className="lbl">Password</label>
            <div style={{ position:'relative' }}>
              <input className="input" type={showPw ? 'text' : 'password'} placeholder="Your password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} required style={{ paddingRight:42 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text3)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop:4, padding:'12px' }}>
            {loading ? <span className="spinner" /> : 'Login to Dashboard'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text2)' }}>
          No account? <Link to="/student/register" style={{ color:'var(--accent2)', textDecoration:'none', fontWeight:600 }}>Register here</Link>
        </p>
      </div>
    </AuthPage>
  );
}

export function AuthPage({ children }) {
  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 20% 30%, rgba(124,111,255,.08) 0%, transparent 50%), var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:480 }}>{children}</div>
    </div>
  );
}
