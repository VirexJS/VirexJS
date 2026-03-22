import { Head } from "virexjs";
import ThemeToggle from "../islands/ThemeToggle";

const NAV = [
	{ href: "/", label: "Home" },
	{ href: "/docs", label: "Docs" },
	{ href: "/features", label: "Features" },
	{ href: "/examples", label: "Examples" },
];

export default function Layout(props: { children: unknown; title?: string }) {
	return (
		<div>
			<Head>
				<title>{props.title ?? "VirexJS — Ship HTML, not JavaScript"}</title>
				<meta name="description" content="A full-stack web framework built on Bun. Zero client JS, islands architecture, 1098 tests, zero dependencies." />
				<link rel="icon" href="/favicon.svg" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
				<style>{css()}</style>
			</Head>

			{/* Navbar */}
			<nav class="navbar">
				<div class="container navbar-inner">
					<a href="/" class="logo">
						<div class="logo-icon">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
							</svg>
						</div>
						<span>VirexJS</span>
					</a>
					<div class="nav-links">
						{NAV.map((item) => (
							<a href={item.href} class="nav-link">{item.label}</a>
						))}
						<a href="https://github.com/VirexJS/VirexJS" class="nav-link nav-github" target="_blank" rel="noopener">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
						</a>
					</div>
				</div>
			</nav>

			<main>{props.children}</main>

			{/* Footer */}
			<footer class="footer">
				<div class="container">
					<div class="footer-grid">
						<div class="footer-brand">
							<div class="logo" style={{ marginBottom: "12px" }}>
								<div class="logo-icon">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
									</svg>
								</div>
								<span>VirexJS</span>
							</div>
							<p class="footer-desc">Ship HTML, not JavaScript.<br/>Built on Bun. Zero dependencies.</p>
						</div>
						<div>
							<h4 class="footer-title">Resources</h4>
							<a href="/docs" class="footer-link">Documentation</a>
							<a href="/features" class="footer-link">Features</a>
							<a href="/examples" class="footer-link">Examples</a>
						</div>
						<div>
							<h4 class="footer-title">Community</h4>
							<a href="https://github.com/VirexJS/VirexJS" class="footer-link" target="_blank" rel="noopener">GitHub</a>
							<a href="https://www.npmjs.com/package/virexjs" class="footer-link" target="_blank" rel="noopener">npm</a>
							<a href="https://github.com/VirexJS/VirexJS/issues" class="footer-link" target="_blank" rel="noopener">Issues</a>
						</div>
						<div>
							<h4 class="footer-title">Legal</h4>
							<a href="https://github.com/VirexJS/VirexJS/blob/main/LICENSE" class="footer-link" target="_blank" rel="noopener">MIT License</a>
							<span class="footer-link">ECOSTACK TECHNOLOGY OU</span>
						</div>
					</div>
					<div class="footer-bottom">
						<p>Built with VirexJS — this site ships interactive islands on static hosting.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

function css(): string {
	return `
:root{--bg:#09090b;--bg-card:#18181b;--bg-card-hover:#1f1f23;--border:#27272a;--border-hover:#3f3f46;--text:#fafafa;--text-muted:#a1a1aa;--text-dim:#71717a;--primary:#3b82f6;--primary-hover:#2563eb;--primary-glow:rgba(59,130,246,0.15);--gradient:linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899);--radius:12px;--font:-apple-system,system-ui,'Inter',sans-serif;--mono:'JetBrains Mono',monospace}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
code{font-family:var(--mono);font-size:0.875em;background:rgba(59,130,246,0.1);color:#93c5fd;padding:2px 6px;border-radius:4px}
pre{background:#0c0c0e;border:1px solid var(--border);padding:20px 24px;border-radius:var(--radius);overflow-x:auto;font-size:13px;line-height:1.7;font-family:var(--mono)}
pre code{background:none;padding:0;color:#e2e8f0}
.container{max-width:1200px;margin:0 auto;padding:0 24px}

/* Navbar */
.navbar{position:sticky;top:0;z-index:100;background:rgba(9,9,11,0.8);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.navbar-inner{display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px;color:var(--text)}
.logo-icon{width:32px;height:32px;background:var(--gradient);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff}
.nav-links{display:flex;align-items:center;gap:2px}
.nav-link{padding:8px 16px;border-radius:8px;font-size:14px;color:var(--text-muted);font-weight:500;transition:all 0.15s}
.nav-link:hover{color:var(--text);background:var(--bg-card)}
.nav-github{padding:8px 10px}

/* Hero */
.hero{text-align:center;padding:100px 24px 80px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:800px;height:800px;background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%);pointer-events:none}
.hero-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;background:var(--bg-card);border:1px solid var(--border);border-radius:20px;font-size:13px;color:var(--text-muted);font-weight:500;margin-bottom:24px}
.hero-badge .dot{width:6px;height:6px;border-radius:50%;background:#22c55e;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.hero h1{font-size:4.5rem;font-weight:900;line-height:1.05;margin-bottom:20px;letter-spacing:-0.03em}
.hero h1 .gradient{background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero .subtitle{font-size:20px;color:var(--text-muted);max-width:560px;margin:0 auto 36px;line-height:1.5}
.hero-buttons{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* Buttons */
.btn{padding:12px 28px;border-radius:10px;font-weight:600;font-size:15px;display:inline-flex;align-items:center;gap:8px;transition:all 0.15s;border:none;cursor:pointer}
.btn-primary{background:var(--primary);color:#fff}
.btn-primary:hover{background:var(--primary-hover);box-shadow:0 0 20px var(--primary-glow)}
.btn-outline{background:transparent;color:var(--text);border:1px solid var(--border)}
.btn-outline:hover{background:var(--bg-card);border-color:var(--border-hover)}

/* Stats */
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border-radius:var(--radius);overflow:hidden;margin:0 auto 80px;max-width:800px;border:1px solid var(--border)}
.stat-card{background:var(--bg);padding:28px;text-align:center}
.stat-value{font-size:36px;font-weight:800;letter-spacing:-0.02em}
.stat-value.blue{color:var(--primary)}
.stat-value.green{color:#22c55e}
.stat-value.purple{color:#a855f7}
.stat-value.amber{color:#f59e0b}
.stat-label{font-size:13px;color:var(--text-dim);margin-top:4px;font-weight:500}

/* Sections */
.section{padding:80px 0}
.section-header{text-align:center;margin-bottom:48px}
.section-header h2{font-size:2.5rem;font-weight:800;letter-spacing:-0.02em;margin-bottom:12px}
.section-header p{color:var(--text-muted);font-size:18px;max-width:500px;margin:0 auto}

/* Feature cards */
.card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.card{padding:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);transition:all 0.2s}
.card:hover{border-color:var(--border-hover);background:var(--bg-card-hover);transform:translateY(-2px)}
.card-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;font-size:20px}
.card h3{font-size:16px;font-weight:700;margin-bottom:6px}
.card p{font-size:14px;color:var(--text-muted);line-height:1.5}

/* Demo section */
.demo-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.demo-card{padding:24px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius)}
.demo-card h3{font-size:16px;font-weight:700;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center}
.demo-card p{font-size:13px;color:var(--text-muted);margin-bottom:16px}
.tag{font-size:11px;padding:3px 10px;border-radius:20px;font-weight:600}
.tag-green{background:rgba(34,197,94,0.1);color:#4ade80}
.tag-blue{background:rgba(59,130,246,0.1);color:#60a5fa}

/* Code block */
.code-block{max-width:800px;margin:0 auto}
.code-tabs{display:flex;gap:2px;margin-bottom:0}
.code-header{background:#111113;border:1px solid var(--border);border-bottom:none;padding:10px 20px;border-radius:var(--radius) var(--radius) 0 0;font-size:13px;font-family:var(--mono);color:var(--text-dim)}
.code-block pre{border-radius:0 0 var(--radius) var(--radius);margin:0;border-top:none}

/* Comparison table */
.table-wrap{border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;max-width:800px;margin:0 auto}
.comparison{width:100%;border-collapse:collapse}
.comparison th{padding:14px 20px;text-align:left;font-size:12px;font-weight:600;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.08em;background:var(--bg-card);border-bottom:1px solid var(--border)}
.comparison td{padding:14px 20px;font-size:14px;border-bottom:1px solid var(--border)}
.comparison tr:last-child td{border-bottom:none}
.comparison tr:hover td{background:var(--bg-card)}
.comparison td:first-child{font-weight:600;color:var(--text)}
.comparison .highlight{color:var(--primary);font-weight:700}
.comparison .muted{color:var(--text-dim)}

/* Footer */
.footer{border-top:1px solid var(--border);padding:60px 0 32px;margin-top:40px}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px}
.footer-brand .footer-desc{color:var(--text-dim);font-size:14px;line-height:1.6}
.footer-title{font-size:13px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px}
.footer-link{display:block;font-size:14px;color:var(--text-dim);padding:4px 0;transition:color 0.15s}
.footer-link:hover{color:var(--text)}
.footer-bottom{border-top:1px solid var(--border);padding-top:20px;text-align:center;font-size:13px;color:var(--text-dim)}

/* Responsive */
@media(max-width:768px){
.hero h1{font-size:2.5rem}
.card-grid{grid-template-columns:1fr}
.demo-grid{grid-template-columns:1fr}
.stats-grid{grid-template-columns:repeat(2,1fr)}
.nav-links{display:none}
.footer-grid{grid-template-columns:1fr 1fr}
}
`;
}
