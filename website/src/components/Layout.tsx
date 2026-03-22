import { Head } from "virexjs";

const NAV = [
	{ href: "/", label: "Home" },
	{ href: "/docs", label: "Docs" },
	{ href: "/features", label: "Features" },
	{ href: "/examples", label: "Examples" },
	{ href: "https://github.com/VirexJS/VirexJS", label: "GitHub" },
];

export default function Layout(props: { children: unknown; title?: string }) {
	return (
		<div>
			<Head>
				<title>{props.title ?? "VirexJS — Ship HTML, not JavaScript"}</title>
				<meta name="description" content="A full-stack web framework built on Bun. Zero client JS by default, islands architecture, 1098 tests." />
				<link rel="icon" href="/favicon.svg" />
				<style>{globalCSS()}</style>
			</Head>
			<nav class="nav">
				<div class="container nav-inner">
					<a href="/" class="logo">
						<span class="logo-icon">V</span>
						VirexJS
					</a>
					<div class="nav-links">
						{NAV.map((item) => (
							<a
								href={item.href}
								class="nav-link"
								{...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
							>
								{item.label}
							</a>
						))}
					</div>
				</div>
			</nav>
			<main>{props.children}</main>
			<footer class="footer">
				<div class="container">
					<p>MIT License - ECOSTACK TECHNOLOGY OU</p>
					<p class="footer-links">
						<a href="https://github.com/VirexJS/VirexJS">GitHub</a>
						<span> | </span>
						<a href="https://www.npmjs.com/package/virexjs">npm</a>
						<span> | </span>
						<a href="/docs">Docs</a>
					</p>
				</div>
			</footer>
		</div>
	);
}

function globalCSS(): string {
	return `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,-apple-system,sans-serif;color:#1a1a2e;background:#fff;line-height:1.6}
a{color:inherit;text-decoration:none}
code{font-family:'Fira Code',monospace;background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:0.9em}
pre{background:#0f172a;color:#e2e8f0;padding:24px;border-radius:12px;overflow-x:auto;font-size:14px;line-height:1.7}
pre code{background:none;padding:0}
.container{max-width:1100px;margin:0 auto;padding:0 24px}

.nav{border-bottom:1px solid #e2e8f0;background:#fff;position:sticky;top:0;z-index:100}
.nav-inner{display:flex;align-items:center;justify-content:space-between;height:60px}
.logo{font-weight:800;font-size:18px;display:flex;align-items:center;gap:8px}
.logo-icon{background:#2563eb;color:#fff;width:28px;height:28px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-size:14px}
.nav-links{display:flex;gap:4px}
.nav-link{padding:6px 14px;border-radius:6px;font-size:14px;color:#64748b;font-weight:500}
.nav-link:hover{background:#f1f5f9;color:#1e293b}

.hero{text-align:center;padding:80px 24px 60px}
.hero-badge{display:inline-block;padding:4px 14px;background:#eff6ff;color:#2563eb;border-radius:20px;font-size:13px;font-weight:600;margin-bottom:20px}
.hero h1{font-size:3.5rem;font-weight:800;line-height:1.1;margin-bottom:16px;letter-spacing:-0.02em}
.hero h1 span{background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:20px;color:#64748b;max-width:600px;margin:0 auto 32px}
.hero-buttons{display:flex;gap:12px;justify-content:center}
.btn{padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block}
.btn-primary{background:#2563eb;color:#fff}
.btn-primary:hover{background:#1d4ed8}
.btn-secondary{background:#f1f5f9;color:#1e293b}
.btn-secondary:hover{background:#e2e8f0}

.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#e2e8f0;border-radius:12px;overflow:hidden;margin:0 auto 60px;max-width:700px}
.stat{background:#fff;padding:24px;text-align:center}
.stat-value{font-size:32px;font-weight:800;color:#1e293b}
.stat-label{font-size:13px;color:#94a3b8;margin-top:4px}

.section{padding:60px 0}
.section-alt{background:#f8fafc}
.section h2{font-size:2rem;font-weight:700;margin-bottom:12px;text-align:center}
.section .subtitle{color:#64748b;text-align:center;margin-bottom:40px;font-size:17px}

.features{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feature{padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#fff}
.feature h3{font-size:16px;margin-bottom:6px}
.feature p{font-size:14px;color:#64748b;line-height:1.5}

.comparison{width:100%;border-collapse:collapse;margin-bottom:20px}
.comparison th,.comparison td{padding:12px 16px;text-align:left;border-bottom:1px solid #e2e8f0;font-size:14px}
.comparison th{font-weight:600;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.05em}
.comparison td:first-child{font-weight:600}
.comparison .highlight{color:#2563eb;font-weight:700}

.code-block{margin:40px auto;max-width:700px}
.code-header{background:#1e293b;color:#94a3b8;padding:10px 20px;border-radius:12px 12px 0 0;font-size:13px;font-family:monospace}
.code-block pre{border-radius:0 0 12px 12px;margin:0}

.footer{border-top:1px solid #e2e8f0;padding:24px 0;text-align:center;color:#94a3b8;font-size:13px}
.footer-links{margin-top:4px}
.footer-links a{color:#64748b}
.footer-links a:hover{color:#2563eb}

@media(max-width:768px){
.hero h1{font-size:2.2rem}
.features{grid-template-columns:1fr}
.stats{grid-template-columns:repeat(2,1fr)}
.nav-links{display:none}
}
`;
}
