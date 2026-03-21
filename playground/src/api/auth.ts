import { defineTable } from "@virexjs/db";
import { createJWT, defineAPIRoute, JWTError, json, string, validate, verifyJWT } from "virexjs";

const JWT_SECRET = "virexjs-demo-secret-change-in-production";

// Users table
const users = defineTable("users", {
	id: "integer primary key autoincrement",
	email: "text not null unique",
	name: "text not null",
	password_hash: "text not null",
	created_at: "text not null",
});

// Seed admin user
try {
	if (users.count() === 0) {
		users.insert({
			email: "admin@virexjs.dev",
			name: "Admin",
			password_hash: await hashPassword("admin123"),
			created_at: new Date().toISOString(),
		});
		users.insert({
			email: "demo@virexjs.dev",
			name: "Demo User",
			password_hash: await hashPassword("demo123"),
			created_at: new Date().toISOString(),
		});
	}
} catch {
	// Already seeded
}

/** POST /api/auth — login or register based on action field */
export const POST = defineAPIRoute(async ({ request }) => {
	const body = await request.json();
	const action = String(body.action ?? "login");

	if (action === "register") {
		return handleRegister(body);
	}
	if (action === "login") {
		return handleLogin(body);
	}
	if (action === "me") {
		return handleMe(request);
	}

	return json({ error: "Unknown action" }, { status: 400 });
});

/** GET /api/auth — get current user from JWT */
export const GET = defineAPIRoute(({ request }) => {
	return handleMe(request);
});

async function handleRegister(body: Record<string, unknown>) {
	const result = validate(
		{
			email: string().required("Email required").email("Invalid email"),
			name: string().required("Name required").min(2),
			password: string().required("Password required").min(6, "Min 6 characters"),
		},
		body,
	);

	if (!result.success) {
		return json({ error: result.errors[0]?.message }, { status: 400 });
	}

	// Check if email exists
	const existing = users.findOne({ email: result.data.email as string });
	if (existing) {
		return json({ error: "Email already registered" }, { status: 409 });
	}

	const user = users.insert({
		email: result.data.email as string,
		name: result.data.name as string,
		password_hash: await hashPassword(result.data.password as string),
		created_at: new Date().toISOString(),
	});

	const token = await createJWT(
		{ userId: user.id, email: user.email, name: user.name },
		JWT_SECRET,
		{ expiresIn: 86400 },
	);

	return json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

async function handleLogin(body: Record<string, unknown>) {
	const email = String(body.email ?? "");
	const password = String(body.password ?? "");

	if (!email || !password) {
		return json({ error: "Email and password required" }, { status: 400 });
	}

	const user = users.findOne({ email });
	if (!user) {
		return json({ error: "Invalid credentials" }, { status: 401 });
	}

	const valid = await verifyPassword(password, user.password_hash as string);
	if (!valid) {
		return json({ error: "Invalid credentials" }, { status: 401 });
	}

	const token = await createJWT(
		{ userId: user.id, email: user.email, name: user.name },
		JWT_SECRET,
		{ expiresIn: 86400 },
	);

	return json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

async function handleMe(request: Request) {
	const authHeader = request.headers.get("Authorization");
	if (!authHeader?.startsWith("Bearer ")) {
		return json({ error: "Not authenticated" }, { status: 401 });
	}

	try {
		const payload = await verifyJWT(authHeader.slice(7), JWT_SECRET);
		return json({ user: { userId: payload.userId, email: payload.email, name: payload.name } });
	} catch (err) {
		if (err instanceof JWTError) {
			return json({ error: err.message }, { status: 401 });
		}
		return json({ error: "Invalid token" }, { status: 401 });
	}
}

// Simple password hashing using Web Crypto
async function hashPassword(password: string): Promise<string> {
	const data = new TextEncoder().encode(password + JWT_SECRET);
	const hash = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(hash))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
	const computed = await hashPassword(password);
	return computed === hash;
}
