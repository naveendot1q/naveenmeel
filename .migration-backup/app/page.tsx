'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

type Post = { id: string; title: string; slug: string; excerpt: string | null; category: string; cover_emoji: string | null; created_at: string; read_time: number | null; };

const SKILLS = [
  { group: 'Network', color: '#3b82f6', items: ['MPLS / BGP / OSPF', 'TCP/IP · LAN/WAN', 'VPN · SD-WAN', 'Network Security', 'VPC Design'] },
  { group: 'Cloud', color: '#10b981', items: ['AWS EC2 · S3 · RDS', 'IAM · VPC · CloudWatch', 'Azure · GCP', 'Auto Scaling · ELB', 'Multi-AZ HA'] },
  { group: 'DevOps', color: '#8b5cf6', items: ['Docker · Kubernetes', 'Terraform · Ansible', 'Jenkins · GitLab CI', 'Prometheus · Grafana', 'ELK Stack'] },
];

const PROJECTS = [
  { n: '01', title: 'Airtel MPLS — Banking', desc: 'Designed high-availability MPLS topologies for B2B enterprise banking clients across Airtel\'s network.', tags: ['MPLS', 'BGP', 'OSPF', 'QoS'], color: '#3b82f6' },
  { n: '02', title: 'AWS Multi-Tier VPC', desc: 'Production VPC with public/private subnets, NAT, VPC peering, VPN to on-prem, and fine-grained IAM.', tags: ['VPC', 'EC2', 'IAM', 'VPN'], color: '#10b981' },
  { n: '03', title: 'CI/CD + Security Gates', desc: 'Jenkins pipeline with SonarQube, TRIVY container scanning, OWASP checks, and K8s auto-deploy.', tags: ['Jenkins', 'Docker', 'K8s', 'TRIVY'], color: '#8b5cf6' },
  { n: '04', title: 'Terraform IaC — AWS', desc: 'Modular Terraform for full AWS provisioning: VPC, EC2, RDS, S3, IAM, ASG with remote S3 state.', tags: ['Terraform', 'AWS', 'S3'], color: '#f59e0b' },
  { n: '05', title: 'RDS Multi-AZ HA', desc: 'Amazon RDS MySQL with Multi-AZ standby, read replicas, and ELB-backed auto-scaling. 99.99% SLA.', tags: ['RDS', 'Multi-AZ', 'ELB'], color: '#10b981' },
  { n: '06', title: 'Observability Stack', desc: 'Prometheus + Grafana dashboards, ELK log aggregation, CloudWatch alerts across hybrid infra.', tags: ['Prometheus', 'Grafana', 'ELK'], color: '#ef4444' },
];

const CERTS = [
  { icon: '☁️', title: 'AWS Solutions Architect', issuer: 'Amazon Web Services' },
  { icon: '🌐', title: 'CCNA', issuer: 'Cisco Systems' },
  { icon: '🔷', title: 'Azure Fundamentals AZ-900', issuer: 'Microsoft' },
  { icon: '🎓', title: 'B.Tech — ECE · 8.6 CGPA', issuer: 'BK Birla Institute · 2018–2022' },
  { icon: '⚙️', title: 'DevOps Foundations', issuer: 'Linux Foundation' },
  { icon: '🐳', title: 'Docker & Kubernetes', issuer: 'CNCF Ecosystem' },
];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetch('/api/posts?limit=3').then(r => r.json()).then(d => setPosts(d.posts || [])).catch(() => {});
  }, []);

  // Intersection observer for fade-in
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).style.opacity = '1'; (e.target as HTMLElement).style.transform = 'translateY(0)'; } });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [posts]);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #f9fafb; --bg2: #f3f4f6; --surface: #ffffff;
          --border: #e5e7eb; --text: #111827; --muted: #6b7280;
          --blue: #3b82f6; --green: #10b981; --purple: #8b5cf6;
          --orange: #f97316; --red: #ef4444;
          --font: 'Inter', system-ui, -apple-system, sans-serif;
          --mono: 'JetBrains Mono', 'Fira Code', monospace;
        }
        html { scroll-behavior: smooth; }
        body { font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        a { color: inherit; text-decoration: none; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: var(--blue); }

        /* NAV */
        .nav { position: fixed; top: 0; width: 100%; z-index: 100; background: rgba(249,250,251,.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
        .nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-size: .95rem; font-weight: 700; letter-spacing: -.02em; color: var(--text); display: flex; align-items: center; gap: 6px; }
        .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--blue); }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-links a { font-size: .82rem; color: var(--muted); padding: 5px 10px; border-radius: 6px; transition: color .15s, background .15s; font-weight: 500; }
        .nav-links a:hover { color: var(--text); background: var(--border); }
        .nav-blog { background: var(--blue)!important; color: #fff!important; font-weight: 600!important; }
        .nav-blog:hover { background: #2563eb!important; }
        .hamburger { display: none; width: 36px; height: 36px; align-items: center; justify-content: center; border: 1px solid var(--border); border-radius: 8px; background: none; cursor: pointer; color: var(--muted); }
        .mobile-nav { display: none; position: fixed; inset: 0; background: var(--bg); z-index: 99; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
        .mobile-nav.open { display: flex; }
        .mobile-nav a { font-size: 1.5rem; font-weight: 700; color: var(--text); }
        .mobile-close { position: absolute; top: 20px; right: 20px; font-size: 1.5rem; background: none; border: none; cursor: pointer; color: var(--muted); }

        /* SECTIONS */
        .wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .sec { padding: 96px 0; }
        .sec-sm { padding: 72px 0; }
        .tag { font-size: .72rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--blue); margin-bottom: 10px; }
        .h2 { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; letter-spacing: -.03em; color: var(--text); line-height: 1.15; margin-bottom: 16px; }
        .lead { font-size: 1.05rem; color: var(--muted); max-width: 560px; line-height: 1.7; }

        /* REVEAL */
        [data-reveal] { opacity: 0; transform: translateY(20px); transition: opacity .5s ease, transform .5s ease; }

        /* HERO */
        .hero { min-height: 100vh; display: flex; align-items: center; padding-top: 56px; background: var(--bg); position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -200px; right: -200px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(59,130,246,.08) 0%, transparent 70%); pointer-events: none; }
        .hero::after { content: ''; position: absolute; bottom: -100px; left: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(16,185,129,.06) 0%, transparent 70%); pointer-events: none; }
        .hero-inner { display: grid; grid-template-columns: 1fr auto; gap: 64px; align-items: center; position: relative; z-index: 1; }
        .hero-status { display: inline-flex; align-items: center; gap: 7px; font-size: .78rem; font-weight: 500; color: var(--green); background: rgba(16,185,129,.08); border: 1px solid rgba(16,185,129,.2); padding: 5px 12px; border-radius: 20px; margin-bottom: 24px; }
        .hero-status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .hero-name { font-size: clamp(3rem, 8vw, 5.5rem); font-weight: 900; letter-spacing: -.04em; line-height: .95; color: var(--text); margin-bottom: 16px; }
        .hero-sub { font-size: 1rem; font-weight: 600; color: var(--muted); letter-spacing: .01em; margin-bottom: 20px; font-family: var(--mono); }
        .hero-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
        .pill { font-size: .72rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; border: 1px solid; }
        .pill-blue { color: var(--blue); border-color: rgba(59,130,246,.3); background: rgba(59,130,246,.06); }
        .pill-green { color: var(--green); border-color: rgba(16,185,129,.3); background: rgba(16,185,129,.06); }
        .pill-purple { color: var(--purple); border-color: rgba(139,92,246,.3); background: rgba(139,92,246,.06); }
        .pill-orange { color: var(--orange); border-color: rgba(249,115,22,.3); background: rgba(249,115,22,.06); }
        .hero-desc { font-size: .95rem; line-height: 1.8; color: var(--muted); max-width: 500px; margin-bottom: 32px; }
        .hero-desc strong { color: var(--text); font-weight: 600; }
        .cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn { display: inline-flex; align-items: center; gap: 7px; font-size: .84rem; font-weight: 600; padding: 10px 22px; border-radius: 8px; border: none; cursor: pointer; transition: all .15s; text-decoration: none; }
        .btn-primary { background: var(--blue); color: #fff; }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(59,130,246,.35); }
        .btn-ghost { background: transparent; color: var(--text); border: 1px solid var(--border); }
        .btn-ghost:hover { background: var(--border); }

        /* HERO VISUAL — 3-panel identity */
        .hero-visual { display: flex; flex-direction: column; gap: 10px; width: 220px; flex-shrink: 0; }
        .id-card { border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; background: var(--surface); transition: box-shadow .2s; }
        .id-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.08); }
        .id-card-label { font-size: .65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; margin-bottom: 8px; }
        .id-card-value { font-size: 1.05rem; font-weight: 700; color: var(--text); }
        .id-card-sub { font-size: .72rem; color: var(--muted); margin-top: 3px; }
        .id-card-icon { font-size: 1.5rem; margin-bottom: 8px; }

        /* ABOUT STRIP */
        .about-strip { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
        .stat-item { padding: 32px 28px; border-right: 1px solid var(--border); }
        .stat-item:last-child { border-right: none; }
        .stat-n { font-size: 2.2rem; font-weight: 900; letter-spacing: -.04em; color: var(--text); line-height: 1; }
        .stat-l { font-size: .72rem; font-weight: 500; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: .06em; }

        /* SKILLS */
        .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .skill-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; transition: box-shadow .2s; }
        .skill-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.07); }
        .skill-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
        .skill-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .skill-card-title { font-size: .88rem; font-weight: 700; color: var(--text); }
        .skill-list { list-style: none; display: flex; flex-direction: column; gap: 7px; }
        .skill-list li { font-size: .8rem; color: var(--muted); display: flex; align-items: center; gap: 8px; }
        .skill-list li::before { content: ''; width: 4px; height: 4px; border-radius: 50%; background: currentColor; flex-shrink: 0; opacity: .5; }

        /* EXPERIENCE */
        .exp-bg { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .exp-list { display: flex; flex-direction: column; gap: 0; }
        .exp-item { display: grid; grid-template-columns: 160px 1fr; gap: 32px; padding: 32px 0; border-bottom: 1px solid var(--border); }
        .exp-item:last-child { border-bottom: none; }
        .exp-period { font-size: .75rem; font-weight: 600; color: var(--muted); font-family: var(--mono); padding-top: 2px; }
        .exp-company { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 3px; }
        .exp-role { font-size: .82rem; color: var(--blue); font-weight: 600; margin-bottom: 10px; }
        .exp-desc { font-size: .84rem; color: var(--muted); line-height: 1.7; margin-bottom: 12px; }
        .exp-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag-chip { font-size: .68rem; font-weight: 500; padding: 2px 9px; border-radius: 4px; background: var(--bg2); color: var(--muted); border: 1px solid var(--border); }

        /* PROJECTS */
        .proj-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .proj-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 22px; display: flex; flex-direction: column; gap: 10px; transition: box-shadow .2s, transform .2s; }
        .proj-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.08); transform: translateY(-2px); }
        .proj-num { font-size: .7rem; font-weight: 700; font-family: var(--mono); }
        .proj-title { font-size: .92rem; font-weight: 700; color: var(--text); line-height: 1.3; }
        .proj-desc { font-size: .78rem; color: var(--muted); line-height: 1.65; flex: 1; }
        .proj-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .proj-tag { font-size: .65rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; }

        /* CERTS */
        .certs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .cert-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; display: flex; align-items: flex-start; gap: 14px; transition: box-shadow .2s; }
        .cert-card:hover { box-shadow: 0 3px 14px rgba(0,0,0,.07); }
        .cert-icon { font-size: 1.5rem; flex-shrink: 0; line-height: 1; }
        .cert-title { font-size: .84rem; font-weight: 700; color: var(--text); margin-bottom: 3px; }
        .cert-issuer { font-size: .72rem; color: var(--muted); }

        /* BASKETBALL */
        .bball-sec { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .bball-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .bball-text p { font-size: .9rem; color: var(--muted); line-height: 1.8; margin-bottom: 14px; }
        .bball-text p strong { color: var(--text); font-weight: 600; }
        .bball-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 24px; }
        .bs { text-align: center; padding: 16px 10px; background: var(--bg2); border: 1px solid var(--border); border-radius: 10px; }
        .bs-n { font-size: 1.6rem; font-weight: 900; letter-spacing: -.03em; color: var(--orange); }
        .bs-l { font-size: .65rem; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); margin-top: 3px; }
        .court-diagram { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 28px; display: flex; flex-direction: column; gap: 14px; }
        .court-row { display: flex; align-items: center; gap: 12px; }
        .court-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .court-label { font-size: .82rem; font-weight: 600; color: var(--text); }
        .court-val { font-size: .75rem; color: var(--muted); margin-top: 1px; }
        .divider { height: 1px; background: var(--border); }

        /* CONTACT */
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
        .contact-links { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
        .c-link { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; font-size: .84rem; color: var(--text); transition: border-color .15s, box-shadow .15s; }
        .c-link:hover { border-color: var(--blue); box-shadow: 0 2px 10px rgba(59,130,246,.1); }
        .c-link-icon { width: 32px; height: 32px; border-radius: 6px; background: var(--bg2); display: flex; align-items: center; justify-content: center; font-size: .9rem; flex-shrink: 0; }
        .c-form { display: flex; flex-direction: column; gap: 14px; }
        .f-label { font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); display: block; margin-bottom: 5px; }
        .f-input, .f-textarea { width: 100%; background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; font-size: .88rem; font-family: var(--font); border-radius: 8px; outline: none; transition: border-color .15s; }
        .f-input:focus, .f-textarea:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
        .f-textarea { resize: vertical; min-height: 100px; }

        /* POSTS */
        .posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .post-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 8px; transition: box-shadow .2s, transform .2s; height: 100%; }
        .post-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.08); transform: translateY(-2px); }
        .post-emoji { font-size: 1.6rem; line-height: 1; }
        .post-cat-badge { font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; padding: 2px 8px; border-radius: 4px; display: inline-block; }
        .post-title { font-size: .92rem; font-weight: 700; color: var(--text); line-height: 1.35; }
        .post-card:hover .post-title { color: var(--blue); }
        .post-excerpt { font-size: .78rem; color: var(--muted); line-height: 1.6; flex: 1; }
        .post-meta { font-size: .7rem; color: var(--muted); font-family: var(--mono); }
        .posts-empty { text-align: center; padding: 48px 24px; color: var(--muted); font-size: .88rem; border: 1px dashed var(--border); border-radius: 12px; }

        /* FOOTER */
        .footer { border-top: 1px solid var(--border); padding: 28px 0; }
        .footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .footer-copy { font-size: .78rem; color: var(--muted); }
        .footer-copy span { color: var(--text); font-weight: 600; }
        .footer-back { font-size: .75rem; color: var(--muted); background: none; border: none; cursor: pointer; }
        .footer-back:hover { color: var(--blue); }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; gap: 40px; }
          .hero-visual { flex-direction: row; width: 100%; overflow-x: auto; }
          .id-card { min-width: 160px; }
          .stat-row { grid-template-columns: repeat(2, 1fr); }
          .stat-item:nth-child(2) { border-right: none; }
          .skills-grid, .proj-grid, .certs-grid, .posts-grid { grid-template-columns: 1fr 1fr; }
          .bball-inner, .contact-grid { grid-template-columns: 1fr; gap: 40px; }
          .exp-item { grid-template-columns: 1fr; gap: 8px; }
          .nav-links { display: none; }
          .hamburger { display: flex; }
        }
        @media (max-width: 560px) {
          .skills-grid, .proj-grid, .certs-grid, .posts-grid { grid-template-columns: 1fr; }
          .stat-row { grid-template-columns: repeat(2, 1fr); }
          .bball-stats { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <button className="mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
        {['About','Skills','Experience','Projects','Contact'].map(s => (
          <a key={s} href={`#${s.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{s}</a>
        ))}
        <Link href="/blog" onClick={() => setMenuOpen(false)} style={{color:'var(--blue)'}}>Blog →</Link>
      </div>

      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="logo"><div className="logo-dot"></div>Naveen Meel</a>
          <div className="nav-links">
            {['about','skills','experience','projects','contact'].map(s => (
              <a key={s} href={`#${s}`} style={{textTransform:'capitalize'}}>{s}</a>
            ))}
            <Link href="/blog" className="nav-blog" style={{padding:'5px 12px',borderRadius:'6px',fontSize:'.82rem',fontWeight:600}}>Blog</Link>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div className="wrap">
          <div className="hero-inner">
            <div>
              <div className="hero-status"><div className="hero-status-dot"></div>Open to Cloud & DevOps Roles</div>
              <h1 className="hero-name">Naveen<br/>Meel</h1>
              <p className="hero-sub">Network · Cloud · DevOps · Basketball</p>
              <div className="hero-pills">
                <span className="pill pill-blue">🌐 Network Engineering</span>
                <span className="pill pill-green">☁️ AWS · GCP · Azure</span>
                <span className="pill pill-purple">⚙️ DevOps & CI/CD</span>
                <span className="pill pill-orange">🏀 Point Guard</span>
              </div>
              <p className="hero-desc">NOC Network Engineer at <strong>Airtel</strong>, designing MPLS networks for enterprise B2B clients. Former <strong>VLSI Engineer</strong>. Cloud practitioner across AWS, GCP & Azure. Based in Rajasthan, India.</p>
              <div className="cta-row">
                <a href="#contact" className="btn btn-primary">Get in touch</a>
                <a href="#projects" className="btn btn-ghost">View projects</a>
              </div>
            </div>
            <div className="hero-visual" data-reveal>
              <div className="id-card">
                <div className="id-card-icon">🌐</div>
                <div className="id-card-label" style={{color:'var(--blue)'}}>Network</div>
                <div className="id-card-value">MPLS · BGP</div>
                <div className="id-card-sub">Airtel NOC Engineer</div>
              </div>
              <div className="id-card">
                <div className="id-card-icon">☁️</div>
                <div className="id-card-label" style={{color:'var(--green)'}}>Cloud</div>
                <div className="id-card-value">AWS Certified</div>
                <div className="id-card-sub">EC2 · VPC · RDS · IAM</div>
              </div>
              <div className="id-card">
                <div className="id-card-icon">🏀</div>
                <div className="id-card-label" style={{color:'var(--orange)'}}>Court</div>
                <div className="id-card-value">Point Guard</div>
                <div className="id-card-sub">10+ years · 5v5</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="about-strip" id="about">
        <div className="wrap">
          <div className="stat-row">
            {[['3+','Years Experience'],['3','Cloud Platforms'],['10+','DevOps Tools'],['8.6','B.Tech CGPA']].map(([n,l]) => (
              <div key={l} className="stat-item" data-reveal>
                <div className="stat-n">{n}</div>
                <div className="stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <section className="sec" id="skills">
        <div className="wrap">
          <div className="tag">Technical Stack</div>
          <h2 className="h2">Skills & Tools</h2>
          <p className="lead" style={{marginBottom:40}}>From packet routing to cloud infra to containerised pipelines — the full stack.</p>
          <div className="skills-grid">
            {SKILLS.map(s => (
              <div key={s.group} className="skill-card" data-reveal>
                <div className="skill-card-head">
                  <div className="skill-dot" style={{background:s.color}}></div>
                  <span className="skill-card-title" style={{color:s.color}}>{s.group}</span>
                </div>
                <ul className="skill-list" style={{color:s.color}}>
                  {s.items.map(i => <li key={i}>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <div className="exp-bg" id="experience">
        <div className="wrap sec-sm">
          <div className="tag">Career</div>
          <h2 className="h2">Work Experience</h2>
          <div className="exp-list" style={{marginTop:40}}>
            <div className="exp-item" data-reveal>
              <div className="exp-period">Sep 2025 – Present<br/><span style={{color:'var(--green)',fontSize:'.7rem'}}>● Current</span></div>
              <div>
                <div className="exp-company">Airtel</div>
                <div className="exp-role">NOC Network Engineer</div>
                <div className="exp-desc">Designing complex MPLS networks for B2B enterprise banking clients. Optimised network design workflows and collaborating cross-functionally to deliver high-availability, low-latency connectivity.</div>
                <div className="exp-tags">
                  {['MPLS','BGP','OSPF','B2B Enterprise','NOC','Network Design'].map(t => <span key={t} className="tag-chip">{t}</span>)}
                </div>
              </div>
            </div>
            <div className="exp-item" data-reveal>
              <div className="exp-period">2022 – 2025</div>
              <div>
                <div className="exp-company">Cloud & DevOps Projects</div>
                <div className="exp-role">Cloud & DevOps Engineer (Project-based)</div>
                <div className="exp-desc">AWS infrastructure (EC2, S3, RDS, VPC, IAM, ELB, Auto Scaling). CI/CD pipelines via Jenkins & GitLab. Terraform IaC modules. Docker containerisation. Monitoring with Prometheus, Grafana, and ELK.</div>
                <div className="exp-tags">
                  {['AWS','Terraform','Docker','Kubernetes','Jenkins','Prometheus','Grafana'].map(t => <span key={t} className="tag-chip">{t}</span>)}
                </div>
              </div>
            </div>
            <div className="exp-item" data-reveal>
              <div className="exp-period">2018 – 2022</div>
              <div>
                <div className="exp-company">VLSI / ECE Domain</div>
                <div className="exp-role">VLSI Design & Verification (Academic + Internship)</div>
                <div className="exp-desc">RTL design with Verilog/SystemVerilog. Verification methodologies. Strong foundation in digital logic and signal processing — the bedrock of modern networking hardware.</div>
                <div className="exp-tags">
                  {['Verilog','SystemVerilog','RTL Design','Digital Logic','ECE'].map(t => <span key={t} className="tag-chip">{t}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <section className="sec" id="projects">
        <div className="wrap">
          <div className="tag">Portfolio</div>
          <h2 className="h2">Key Projects</h2>
          <p className="lead" style={{marginBottom:40}}>Real-world network, cloud, and DevOps work.</p>
          <div className="proj-grid">
            {PROJECTS.map(p => (
              <div key={p.n} className="proj-card" data-reveal>
                <div className="proj-num" style={{color:p.color}}>{p.n}</div>
                <div className="proj-title">{p.title}</div>
                <div className="proj-desc">{p.desc}</div>
                <div className="proj-tags">
                  {p.tags.map(t => <span key={t} className="proj-tag" style={{background:`${p.color}12`,color:p.color}}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certs */}
      <div className="exp-bg">
        <div className="wrap sec-sm">
          <div className="tag">Credentials</div>
          <h2 className="h2">Certifications & Education</h2>
          <div className="certs-grid" style={{marginTop:36}}>
            {CERTS.map(c => (
              <div key={c.title} className="cert-card" data-reveal>
                <div className="cert-icon">{c.icon}</div>
                <div>
                  <div className="cert-title">{c.title}</div>
                  <div className="cert-issuer">{c.issuer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Basketball */}
      <div className="bball-sec">
        <div className="wrap sec-sm">
          <div className="bball-inner">
            <div className="bball-text" data-reveal>
              <div className="tag">Off the Clock</div>
              <h2 className="h2">On the Court</h2>
              <p>Basketball is my parallel operating system. <strong>Reading the defense</strong> before a play is the same instinct as reading a network topology before a change window.</p>
              <p>Point guard mentality — <strong>see the full picture, control the tempo, elevate everyone around you</strong>. Same approach in engineering: architect the system, then let the team execute.</p>
              <p>In both: <strong>the best players adapt in real time</strong>. Build the plan, adjust when reality hits, never lose composure.</p>
              <div className="bball-stats">
                <div className="bs"><div className="bs-n">PG</div><div className="bs-l">Position</div></div>
                <div className="bs"><div className="bs-n">10+</div><div className="bs-l">Yrs</div></div>
                <div className="bs"><div className="bs-n">5v5</div><div className="bs-l">Format</div></div>
              </div>
            </div>
            <div className="court-diagram" data-reveal>
              <div style={{fontSize:'.72rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--muted)',marginBottom:4}}>The Parallel</div>
              {[
                { icon:'🏀', bg:'rgba(249,115,22,.1)', label:'Point Guard', val:'Controls tempo, reads the floor' },
                { icon:'🌐', bg:'rgba(59,130,246,.1)', label:'Network Architect', val:'Designs topology, routes traffic' },
                { icon:'☁️', bg:'rgba(16,185,129,.1)', label:'Cloud Engineer', val:'Scales infra, maintains uptime' },
                { icon:'⚙️', bg:'rgba(139,92,246,.1)', label:'DevOps', val:'Automates delivery, monitors health' },
              ].map((row, i) => (
                <div key={row.label}>
                  {i > 0 && <div className="divider"></div>}
                  <div className="court-row" style={{paddingTop: i > 0 ? 14 : 0, paddingBottom: 0}}>
                    <div className="court-icon" style={{background:row.bg}}>{row.icon}</div>
                    <div>
                      <div className="court-label">{row.label}</div>
                      <div className="court-val">{row.val}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <section className="sec" id="contact">
        <div className="wrap">
          <div className="tag">Let's Connect</div>
          <h2 className="h2">Get in Touch</h2>
          <div className="contact-grid" style={{marginTop:40}}>
            <div data-reveal>
              <p style={{fontSize:'.9rem',color:'var(--muted)',lineHeight:1.8,marginBottom:8}}>Whether you're hiring for Cloud or DevOps, want to talk network architecture, or run a few drills — reach out. Based in Rajasthan, open to remote or relocation.</p>
              <div className="contact-links">
                {[
                  {icon:'✉️', label:'naveenmeel10@gmail.com', href:'mailto:naveenmeel10@gmail.com'},
                  {icon:'📱', label:'+91 87694 71595', href:'tel:+918769471595'},
                  {icon:'💼', label:'linkedin.com/in/naveenmeel', href:'https://www.linkedin.com/in/naveenmeel'},
                  {icon:'⌥', label:'GitHub — naveenmeel', href:'https://github.com/naveenmeel'},
                ].map(l => (
                  <a key={l.label} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} className="c-link">
                    <div className="c-link-icon">{l.icon}</div>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="c-form" data-reveal>
              <div><label className="f-label">Name</label><input id="cName" className="f-input" placeholder="Your name"/></div>
              <div><label className="f-label">Email</label><input type="email" className="f-input" placeholder="your@email.com"/></div>
              <div><label className="f-label">Subject</label><input className="f-input" placeholder="Cloud Engineer role · Collaboration · etc."/></div>
              <div><label className="f-label">Message</label><textarea className="f-textarea" placeholder="Tell me about the opportunity..."/></div>
              <button className="btn btn-primary" style={{alignSelf:'flex-start'}} onClick={() => { const n=(document.getElementById('cName') as HTMLInputElement)?.value; if(!n?.trim()){alert('Please add your name');return;} alert('Sent! I\'ll reply soon.'); }}>Send Message</button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      <div className="exp-bg">
        <div className="wrap sec-sm">
          <div className="tag">Writing</div>
          <h2 className="h2">Latest Posts</h2>
          <p className="lead" style={{marginBottom:36}}>Notes on networking, cloud, DevOps, and life off the court.</p>
          {posts.length === 0 ? (
            <div className="posts-empty">
              <div style={{fontSize:'2rem',marginBottom:10}}>✍️</div>
              <p>No posts yet — <Link href="/blog" style={{color:'var(--blue)'}}>visit the blog</Link> to get started.</p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map(post => {
                const catColors: Record<string,string> = { networking:'var(--blue)', cloud:'var(--green)', devops:'var(--purple)', basketball:'var(--orange)', tech:'var(--blue)', life:'#ec4899' };
                const c = catColors[post.category?.toLowerCase()] || 'var(--blue)';
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`} style={{display:'block',height:'100%'}}>
                    <div className="post-card" data-reveal>
                      <div className="post-emoji">{post.cover_emoji || '📝'}</div>
                      <span className="post-cat-badge" style={{background:`${c}14`,color:c}}>{post.category}</span>
                      <div className="post-title">{post.title}</div>
                      {post.excerpt && <div className="post-excerpt">{post.excerpt.slice(0,90)}…</div>}
                      <div className="post-meta">{fmt(post.created_at)}{post.read_time ? ` · ${post.read_time} min read` : ''}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          <div style={{textAlign:'center',marginTop:8}}>
            <Link href="/blog" className="btn btn-ghost">View all posts →</Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-inner">
            <div className="footer-copy">© 2025 <span>Naveen Meel</span> · Built with Next.js & Supabase</div>
            <button className="footer-back" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>↑ Back to top</button>
          </div>
        </div>
      </footer>
    </>
  );
}
