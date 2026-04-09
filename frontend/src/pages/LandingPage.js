import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, Zap, BarChart2, Shield } from 'lucide-react';

export default function LandingPage() {
  const nav = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 30% 20%, rgba(124,111,255,.1) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(34,211,238,.06) 0%, transparent 50%), var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px' }}>

      {/* Logo */}
      <div className="fade-up" style={{ textAlign:'center', marginBottom:'56px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'14px' }}>
          <div style={{ width:50, height:50, borderRadius:14, background:'linear-gradient(135deg,#7c6fff,#22d3ee)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 36px rgba(124,111,255,.45)' }}>
            <BarChart2 size={26} color="#fff" />
          </div>
          <span style={{ fontFamily:'Syne', fontWeight:800, fontSize:30, letterSpacing:'-.02em' }}>
            Eval<span style={{ color:'var(--accent)' }}>Pro</span>
          </span>
        </div>
       
        {/* Feature pills */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:18, flexWrap:'wrap' }}>
          {['Theory & Lab CIE','8 Semester System','Auto Calculation','Excel-style Sheet'].map(f => (
            <span key={f} className="tag tag-purple" style={{ fontSize:11 }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Role cards */}
      <div className="fade-up2" style={{ display:'flex', gap:20, flexWrap:'wrap', justifyContent:'center' }}>

        {/* Student */}
        <RoleCard
          icon={<GraduationCap size={26} color="#b8b0ff" />}
          iconBg="rgba(124,111,255,.15)"
          iconBorder="rgba(124,111,255,.3)"
          hoverShadow="0 20px 48px rgba(124,111,255,.25)"
          hoverBorder="var(--accent)"
          title="Student"
          desc="View your CIE marks, track performance across all subjects, and see your assigned teachers and assignments."
          features={['Live CIE breakdown','Theory & Lab marks','Teacher assignments','Semester overview']}
          onLogin={() => nav('/student/login')}
          onRegister={() => nav('/student/register')}
          loginStyle={{ background:'var(--accent)', color:'#fff' }}
        />

        {/* Teacher */}
        <RoleCard
          icon={<BookOpen size={26} color="#22d3ee" />}
          iconBg="rgba(34,211,238,.12)"
          iconBorder="rgba(34,211,238,.25)"
          hoverShadow="0 20px 48px rgba(34,211,238,.2)"
          hoverBorder="var(--cyan)"
          title="Teacher"
          desc="Manage CIE evaluation sheets, enter marks for entire sections, upload assignments, and track class performance."
          features={['Excel-style CIE sheet','Auto CIE calculation','Multi-subject teaching','Assignment upload']}
          onLogin={() => nav('/teacher/login')}
          onRegister={() => nav('/teacher/register')}
          loginStyle={{ background:'var(--cyan)', color:'var(--bg)' }}
        />
      </div>

      <p className="fade-up3" style={{ marginTop:40, color:'var(--text3)', fontSize:12 }}>
        Built for VTU & Affiliated Engineering Colleges · Theory (40) & Lab (50) CIE
      </p>
    </div>
  );
}

function RoleCard({ icon, iconBg, iconBorder, hoverShadow, hoverBorder, title, desc, features, onLogin, onRegister, loginStyle }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width:290, background:'var(--surface)', borderRadius:18, padding:'30px 26px',
        border: `1px solid ${hov ? hoverBorder : 'var(--border)'}`,
        boxShadow: hov ? hoverShadow : 'none',
        transform: hov ? 'translateY(-4px)' : 'none',
        transition:'all .28s',
      }}
    >
      <div style={{ width:50, height:50, borderRadius:13, background:iconBg, border:`1px solid ${iconBorder}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
        {icon}
      </div>
      <h2 style={{ fontFamily:'Syne', fontSize:21, fontWeight:700, marginBottom:8 }}>{title}</h2>
      <p style={{ color:'var(--text2)', fontSize:13, lineHeight:1.65, marginBottom:18 }}>{desc}</p>
      <ul style={{ listStyle:'none', marginBottom:24, display:'flex', flexDirection:'column', gap:6 }}>
        {features.map(f => (
          <li key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text2)' }}>
            <Zap size={11} color="var(--gold)" style={{ flexShrink:0 }} />{f}
          </li>
        ))}
      </ul>
      <div style={{ display:'flex', gap:10 }}>
        <button className="btn btn-sm" onClick={onLogin} style={{ ...loginStyle, flex:1, justifyContent:'center' }}>Login</button>
        <button className="btn btn-ghost btn-sm" onClick={onRegister} style={{ flex:1, justifyContent:'center' }}>Register</button>
      </div>
    </div>
  );
}
