import type { PageProps } from "virexjs";
import { Link, useHead } from "virexjs";
import Marketing from "../layouts/Marketing";

const PLANS = [
	{ name: "Free", price: "$0", features: ["1 project", "100 requests/day", "Community support"] },
	{ name: "Pro", price: "$19/mo", features: ["10 projects", "10K requests/day", "Email support", "Custom domain"], popular: true },
	{ name: "Team", price: "$49/mo", features: ["Unlimited projects", "100K requests/day", "Priority support", "SSO", "API access"] },
];

export default function Home(_props: PageProps) {
	const head = useHead({
		title: "SaaS Starter — Built with VirexJS",
		description: "A production-ready SaaS template with auth, dashboard, and billing.",
		og: { title: "SaaS Starter", type: "website" },
	});

	return (
		<Marketing>
			{head}

			{/* Hero */}
			<section style={{ textAlign: "center", padding: "64px 16px", maxWidth: "700px", margin: "0 auto" }}>
				<span style={{ display: "inline-block", padding: "4px 12px", background: "#e8f0fe", color: "#0066cc", borderRadius: "16px", fontSize: "13px", fontWeight: "500", marginBottom: "16px" }}>
					Built with VirexJS
				</span>
				<h1 style={{ fontSize: "3rem", margin: "0 0 16px", lineHeight: "1.1" }}>
					Ship your SaaS
					<br />
					<span style={{ color: "#0066cc" }}>in days, not months.</span>
				</h1>
				<p style={{ color: "#6b7280", fontSize: "18px", margin: "0 0 32px", lineHeight: "1.6" }}>
					Auth, dashboard, billing, and API — all pre-built with zero JavaScript shipped to the client.
				</p>
				<div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
					<Link href="/auth/register" style={{ padding: "14px 32px", background: "#0066cc", color: "#fff", borderRadius: "8px", fontSize: "16px", fontWeight: "600" }}>
						Start Free
					</Link>
					<Link href="/dashboard" style={{ padding: "14px 32px", background: "#f3f4f6", color: "#111", borderRadius: "8px", fontSize: "16px", fontWeight: "600" }}>
						View Demo
					</Link>
				</div>
			</section>

			{/* Features */}
			<section id="features" style={{ padding: "48px 16px", maxWidth: "900px", margin: "0 auto" }}>
				<h2 style={{ textAlign: "center", fontSize: "24px", margin: "0 0 32px" }}>Everything you need</h2>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
					{[
						{ title: "Authentication", desc: "JWT + sessions, login/register, password hashing" },
						{ title: "Dashboard", desc: "Project management, user settings, admin panel" },
						{ title: "Database", desc: "SQLite ORM with typed CRUD and migrations" },
						{ title: "API Routes", desc: "REST endpoints with validation and rate limiting" },
						{ title: "Zero JS", desc: "Pure HTML pages, islands only where needed" },
						{ title: "Deploy Ready", desc: "Docker, Fly.io, Railway — one command deploy" },
					].map((f) => (
						<div style={{ padding: "20px", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
							<h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>{f.title}</h3>
							<p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>{f.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* Pricing */}
			<section id="pricing" style={{ padding: "48px 16px", background: "#f9fafb" }}>
				<div style={{ maxWidth: "900px", margin: "0 auto" }}>
					<h2 style={{ textAlign: "center", fontSize: "24px", margin: "0 0 32px" }}>Simple pricing</h2>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
						{PLANS.map((plan) => (
							<div style={{
								padding: "24px",
								border: plan.popular ? "2px solid #0066cc" : "1px solid #e5e7eb",
								borderRadius: "12px",
								background: "#fff",
								position: "relative",
							}}>
								{plan.popular && (
									<span style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", padding: "2px 12px", background: "#0066cc", color: "#fff", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
										Popular
									</span>
								)}
								<h3 style={{ margin: "0 0 4px", fontSize: "20px" }}>{plan.name}</h3>
								<div style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 16px" }}>{plan.price}</div>
								<ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
									{plan.features.map((f) => (
										<li style={{ padding: "4px 0", color: "#6b7280", fontSize: "14px" }}>
											{"\u2713 "}{f}
										</li>
									))}
								</ul>
								<Link href="/auth/register" style={{
									display: "block",
									textAlign: "center",
									padding: "10px",
									background: plan.popular ? "#0066cc" : "#f3f4f6",
									color: plan.popular ? "#fff" : "#111",
									borderRadius: "6px",
									fontWeight: "500",
								}}>
									Get Started
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>
		</Marketing>
	);
}
