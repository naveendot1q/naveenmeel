import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/theme';

type Post = { id: string; title: string; slug: string; excerpt: string | null; category: string; cover_emoji: string | null; created_at: string; read_time: number | null; };

const SKILLS = [
  { name: 'Networking', icon: '🌐', color: '#3b82f6', items: ['MPLS Networks (B2B)', 'BGP · OSPF · VPN', 'VPC Design & Peering', 'SD-WAN · QoS', 'Network Security'] },
  { name: 'Cloud', icon: '☁️', color: '#10b981', items: ['AWS — EC2, S3, RDS, VPC', 'IAM · ELB · Auto Scaling', 'CloudWatch · CloudTrail · SNS', 'Azure & GCP (working knowledge)', 'Multi-AZ HA Architecture'] },
  { name: 'DevOps & IaC', icon: '⚙️', color: '#8b5cf6', items: ['Terraform (modules, state)', 'Ansible', 'Jenkins · Azure DevOps', 'GitHub Actions', 'Maven · NodeJS (basics)'] },
  { name: 'Containers & K8s', icon: '☸️', color: '#f59e0b', items: ['Docker (containerisation)', 'Kubernetes', 'Nexus3 · Azure Artifacts', 'Container security (TRIVY)', 'OWASP ZAP · Anchore'] },
  { name: 'Monitoring & Ops', icon: '📊', color: '#ef4444', items: ['Prometheus · Grafana', 'ELK Stack', 'AWS CloudWatch', 'Sonarqube (code quality)', 'JIRA · Git · GitHub'] },
  { name: 'Scripting & OS', icon: '🐧', color: '#06b6d4', items: ['Shell Scripting', 'Python (basics)', 'Linux (Ubuntu · RHEL)', 'Windows Server', 'System Hardening'] },
];

const PROJECT_EXPERIENCE = [
  'Implemented and managed AWS infrastructure — EC2, S3, RDS, VPC, IAM, ELB, Auto Scaling, CloudWatch, CloudTrail, SNS',
  'Configured Auto Scaling Groups with ELB for dynamic scaling and cost efficiency',
  'Designed custom VPC architectures with CIDR planning, VPC peering, and VPN for hybrid connectivity',
  'Managed IAM users, groups, roles, and policies to enforce fine-grained access control',
  'Developed Terraform infrastructure including module creation, state management, and version locking',
  'Built CI/CD pipelines using Jenkins and GitLab — reduced deployment times through automation',
  'Containerized applications using Docker for consistent cross-environment deployments',
  'Monitored system performance and logs via AWS CloudWatch',
];

const EDUCATION = [
  { degree: 'B.Tech — Electronics & Communication Engineering', school: 'BK Birla Institute of Engineering & Technology', period: '2018 – 2022', grade: '8.6 CGPA', icon: '🎓' },
  { degree: '12th — Board of Secondary Education, Rajasthan', school: '', period: '', grade: '85.60%', icon: '📚' },
  { degree: '10th — CBSE', school: '', period: '', grade: '10 CGPA', icon: '🏅' },
];

const CAT_COLORS: Record<string, string> = {
  networking: '#3b82f6', cloud: '#10b981', devops: '#8b5cf6', kubernetes: '#f59e0b',
  linux: '#06b6d4', basketball: '#f97316', life: '#ec4899', default: '#94a3b8',
};

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '#contact' },
];

export default function HomePage() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    fetch('/api/posts?limit=3')
      .then(r => r.json())
      .then(d => setRecentPosts(d.posts || []))
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>

      {/* ── NAV ── */}
      <nav className="nav-glass" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--fg)', flexShrink: 0 }}>
            Naveen<span style={{ color: 'var(--accent)' }}>.</span>dev
          </span>
          {/* Desktop nav */}
          <div className="hp-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href}
                style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)', padding: '6px 10px', borderRadius: 6, transition: 'color 0.15s', textDecoration: 'none' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted)')}>
                {label}
              </a>
            ))}
            <button onClick={toggle} className="theme-toggle" style={{ marginLeft: 6 }} title={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
          {/* Mobile nav toggle */}
          <div className="hp-mobile-nav" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
            <button onClick={toggle} className="theme-toggle">{isDark ? '☀️' : '🌙'}</button>
            <button
              onClick={() => setMobileNavOpen(o => !o)}
              style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--fg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mobileNavOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileNavOpen && (
          <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} onClick={() => setMobileNavOpen(false)}
                style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--fg2)', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.12s' }}>
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="about" style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 20px 56px' }}>
        <div className="hp-hero-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(5,150,105,0.08)', border: `1px solid ${isDark ? 'rgba(52,211,153,0.25)' : 'rgba(5,150,105,0.2)'}`, borderRadius: 24, padding: '5px 14px', marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite', flexShrink: 0 }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green)', letterSpacing: '0.04em' }}>Open to Cloud / DevOps roles</span>
            </div>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'var(--fg)', lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: 10 }}>Naveen Meel</h1>
            <p style={{ fontWeight: 700, fontSize: 'clamp(0.95rem,2vw,1.15rem)', color: 'var(--accent)', marginBottom: 18, letterSpacing: '-0.01em' }}>
              NOC Network Engineer @ Airtel · Cloud & DevOps Enthusiast
            </p>
            <p style={{ fontSize: '1rem', color: 'var(--fg2)', lineHeight: 1.8, marginBottom: 18 }}>
              Designing complex MPLS networks for Airtel's B2B customers in Gurugram.
              Passionate about Cloud infrastructure, DevOps automation, and Kubernetes —
              and basketball when I'm not staring at Grafana dashboards.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 24 }}>
              <span>📍 Gurugram, India</span>
              <span>🎓 B.Tech ECE · 8.6 CGPA</span>
              <span>📧 naveenmeel10@gmail.com</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <a href="/blog" className="btn btn-primary">Read the Blog →</a>
              <a href="/Naveen_Resume.pdf" download className="btn btn-ghost">📄 Resume</a>
              <a href="https://www.linkedin.com/in/naveenmeel" target="_blank" rel="noopener" className="btn btn-ghost">LinkedIn ↗</a>
              <a href="https://github.com/naveenmeel" target="_blank" rel="noopener" className="btn btn-ghost">GitHub ↗</a>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              {[{ n: '8.6', l: 'CGPA' }, { n: '1+', l: 'Year @ Airtel' }, { n: '∞', l: 'Packets routed' }].map(({ n, l }) => (
                <div key={l}>
                  <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--fg)', lineHeight: 1, letterSpacing: '-0.02em' }}>{n}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4, fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Photo */}
          <div style={{ flexShrink: 0, position: 'relative' }} className="hp-hero-photo">
            <div style={{ width: 260, height: 260, borderRadius: '50%', padding: 4, background: isDark ? 'conic-gradient(from 0deg,#f97316,transparent 40%,#f97316 60%,transparent 80%,#f97316)' : 'conic-gradient(from 0deg,#ea580c,transparent 40%,#ea580c 60%,transparent 80%,#ea580c)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--bg)', padding: 4 }}>
                <img src="/naveen.jpg" alt="Naveen Meel" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
              </div>
            </div>
            {/* Floating badges — hidden on mobile via CSS */}
            <div className="hp-badge" style={{ position: 'absolute', bottom: 12, left: -16, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--fg)' }}>📡 Airtel · Gurugram</span>
            </div>
            <div className="hp-badge" style={{ position: 'absolute', top: 20, right: -16, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--fg)' }}>🏀 Baller</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '64px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Expertise</p>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--fg)', letterSpacing: '-0.03em', marginBottom: 32 }}>Technical Skills</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 14 }}>
            {SKILLS.map(skill => (
              <div key={skill.name} className="card card-hover" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: `${skill.color}15`, border: `1px solid ${skill.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{skill.icon}</div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--fg)' }}>{skill.name}</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {skill.items.map(item => (
                    <li key={item} style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: skill.color, opacity: 0.7, flexShrink: 0, marginTop: 6 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORK EXPERIENCE ── */}
      <section id="experience" style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 20px' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Career</p>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--fg)', letterSpacing: '-0.03em', marginBottom: 32 }}>Work Experience</h2>
        <div className="card" style={{ padding: '24px 26px', display: 'flex', gap: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--accent)' }} />
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>📡</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--fg)' }}>NOC Network Engineer</span>
                <span style={{ color: 'var(--muted)', margin: '0 8px' }}>·</span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--accent)' }}>Airtel</span>
              </div>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)', padding: '2px 9px', borderRadius: 20, flexShrink: 0 }}>Current</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace', marginBottom: 14 }}>📅 Sep 2025 – Present &nbsp;·&nbsp; 📍 Gurugram, India</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Designing complex MPLS networks for various B2B customers of Airtel',
                'Optimised design tasks, leading to measurable improvement in turnaround for similar network requirements',
              ].map((pt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem', color: 'var(--fg2)', lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>▸</span>{pt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECT EXPERIENCE ── */}
      <section style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '64px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Projects & Pre-Airtel</p>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--fg)', letterSpacing: '-0.03em', marginBottom: 8 }}>Project Experience</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: 32, lineHeight: 1.7 }}>Hands-on cloud, DevOps, and infrastructure work before joining Airtel. I'll be updating this section with detailed project breakdowns soon.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(400px,1fr))', gap: 12 }}>
            {PROJECT_EXPERIENCE.map((pt, i) => (
              <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2, fontSize: '0.875rem' }}>▸</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--fg2)', lineHeight: 1.6 }}>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section id="education" style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 20px' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Academic</p>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--fg)', letterSpacing: '-0.03em', marginBottom: 32 }}>Education</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
          {EDUCATION.map((edu, i) => (
            <div key={i} className="card" style={{ padding: '18px 22px', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{edu.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--fg)', marginBottom: 3, lineHeight: 1.4 }}>{edu.degree}</p>
                {edu.school && <p style={{ fontSize: '0.75rem', color: 'var(--fg2)', marginBottom: 4 }}>{edu.school}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                  {edu.period && <span>📅 {edu.period}</span>}
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>✦ {edu.grade}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RECENT ARTICLES ── */}
      <section id="blog" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '64px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Writing</p>
              <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--fg)', letterSpacing: '-0.03em' }}>Recent Articles</h2>
            </div>
            <a href="/blog" className="btn btn-ghost">All posts →</a>
          </div>
          {recentPosts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
              {recentPosts.map(post => {
                const catColor = CAT_COLORS[post.category] || CAT_COLORS.default;
                const date = new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                return (
                  <a key={post.id} href={`/blog/${post.slug}`} className="card card-hover" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10, textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.5rem' }}>{post.cover_emoji || '📝'}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, background: `${catColor}16`, color: catColor, border: `1px solid ${catColor}40`, padding: '2px 9px', borderRadius: 20 }}>{post.category}</span>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--fg)', lineHeight: 1.4 }}>{post.title}</h3>
                    {post.excerpt && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6, flex: 1 }} className="line-clamp-2">{post.excerpt}</p>}
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'monospace', marginTop: 'auto' }}>{date}{post.read_time ? ` · ${post.read_time} min` : ''}</p>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', marginBottom: 10 }}>✍️</p>
              <p style={{ fontWeight: 700, color: 'var(--fg)', marginBottom: 6 }}>Articles coming soon</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', marginBottom: 20 }}>Working on posts about Networking, Cloud & DevOps.</p>
              <a href="/blog" className="btn btn-primary">Go to Blog →</a>
            </div>
          )}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 20px 80px' }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>Get in touch</p>
        <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--fg)', letterSpacing: '-0.03em', marginBottom: 12 }}>Contact</h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 32, maxWidth: 500 }}>
          Open to Cloud Engineer and DevOps Engineer roles. Feel free to reach out.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
          {[
            { label: '📧 Email', href: 'mailto:naveenmeel10@gmail.com', value: 'naveenmeel10@gmail.com', external: false },
            { label: '📞 Phone', href: 'tel:+918769471595', value: '+91 8769471595', external: false },
            { label: '🔗 LinkedIn', href: 'https://linkedin.com/in/naveenmeel', value: 'linkedin.com/in/naveenmeel', external: true },
            { label: '💻 GitHub', href: 'https://github.com/naveenmeel', value: 'github.com/naveenmeel', external: true },
            { label: '📄 Resume', href: '/Naveen_Resume.pdf', value: 'Download PDF', external: false, download: true },
          ].map(({ label, href, value, external, download }) => (
            <a key={label} href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener' : undefined}
              download={download ? '' : undefined}
              className="card card-hover"
              style={{ padding: '16px 20px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.04em' }}>{label}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)' }}>{value}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', padding: '32px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/naveen.jpg" alt="Naveen Meel" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--fg)' }}>Naveen Meel</span>
            <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>· NOC Network Engineer</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {[{ l: 'Blog', h: '/blog' }, { l: 'LinkedIn', h: 'https://linkedin.com/in/naveenmeel' }, { l: 'GitHub', h: 'https://github.com/naveenmeel' }, { l: 'Resume', h: '/Naveen_Resume.pdf' }].map(({ l, h }) => (
              <a key={l} href={h} target={h.startsWith('http') ? '_blank' : undefined} rel={h.startsWith('http') ? 'noopener' : undefined}
                download={l === 'Resume' ? '' : undefined}
                style={{ fontSize: '0.78rem', color: 'var(--muted)', transition: 'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg)')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted)')}>{l}</a>
            ))}
            <button onClick={toggle} className="theme-toggle" style={{ width: 30, height: 30, fontSize: '0.85rem' }}>{isDark ? '☀️' : '🌙'}</button>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.7rem', color: 'var(--muted)' }}>
          © {new Date().getFullYear()} Naveen Meel · Rajasthan, India
        </p>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        /* Desktop */
        @media (min-width: 641px) {
          .hp-mobile-nav { display: none !important; }
          .hp-desktop-nav { display: flex !important; }
        }
        /* Mobile */
        @media (max-width: 640px) {
          .hp-desktop-nav { display: none !important; }
          .hp-mobile-nav { display: flex !important; }
          .hp-hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .hp-hero-photo { display: flex; justify-content: center; }
          .hp-hero-photo > div { width: 200px !important; height: 200px !important; }
          .hp-badge { display: none !important; }
        }
      `}</style>
    </div>
  );
}
