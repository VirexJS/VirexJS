import { describe, test, expect } from "bun:test";
import { createJWT, verifyJWT, decodeJWT, JWTError } from "../src/auth/jwt";

const SECRET = "test-secret-key-for-virexjs";

describe("createJWT", () => {
	test("creates a valid JWT string", async () => {
		const token = await createJWT({ userId: "123" }, SECRET);
		expect(typeof token).toBe("string");
		const parts = token.split(".");
		expect(parts).toHaveLength(3);
	});

	test("includes custom payload", async () => {
		const token = await createJWT({ role: "admin", name: "Alice" }, SECRET);
		const decoded = decodeJWT(token);
		expect(decoded.payload.role).toBe("admin");
		expect(decoded.payload.name).toBe("Alice");
	});

	test("sets iat automatically", async () => {
		const token = await createJWT({}, SECRET);
		const decoded = decodeJWT(token);
		expect(decoded.payload.iat).toBeDefined();
		expect(typeof decoded.payload.iat).toBe("number");
	});

	test("sets expiration with expiresIn", async () => {
		const token = await createJWT({}, SECRET, { expiresIn: 3600 });
		const decoded = decodeJWT(token);
		expect(decoded.payload.exp).toBeDefined();
		expect(decoded.payload.exp! - decoded.payload.iat!).toBe(3600);
	});

	test("sets issuer, audience, subject", async () => {
		const token = await createJWT({}, SECRET, {
			issuer: "virexjs",
			audience: "app",
			subject: "user:123",
		});
		const decoded = decodeJWT(token);
		expect(decoded.payload.iss).toBe("virexjs");
		expect(decoded.payload.aud).toBe("app");
		expect(decoded.payload.sub).toBe("user:123");
	});

	test("header is HS256", async () => {
		const token = await createJWT({}, SECRET);
		const decoded = decodeJWT(token);
		expect(decoded.header.alg).toBe("HS256");
		expect(decoded.header.typ).toBe("JWT");
	});
});

describe("verifyJWT", () => {
	test("verifies a valid token", async () => {
		const token = await createJWT({ userId: "123" }, SECRET);
		const payload = await verifyJWT(token, SECRET);
		expect(payload.userId).toBe("123");
	});

	test("throws for wrong secret", async () => {
		const token = await createJWT({}, SECRET);
		expect(verifyJWT(token, "wrong-secret")).rejects.toThrow("Invalid signature");
	});

	test("throws for expired token", async () => {
		const token = await createJWT({}, SECRET, { expiresIn: -1 });
		expect(verifyJWT(token, SECRET)).rejects.toThrow("Token expired");
	});

	test("throws for malformed token", async () => {
		expect(verifyJWT("not.a.jwt.token", SECRET)).rejects.toThrow();
		expect(verifyJWT("invalid", SECRET)).rejects.toThrow("Invalid token format");
	});

	test("throws for tampered payload", async () => {
		const token = await createJWT({ admin: false }, SECRET);
		const parts = token.split(".");
		// Tamper with payload
		const tamperedPayload = btoa(JSON.stringify({ admin: true, iat: 0 }))
			.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
		const tampered = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
		expect(verifyJWT(tampered, SECRET)).rejects.toThrow("Invalid signature");
	});

	test("accepts non-expired token", async () => {
		const token = await createJWT({}, SECRET, { expiresIn: 3600 });
		const payload = await verifyJWT(token, SECRET);
		expect(payload.exp).toBeDefined();
	});

	test("returns all custom claims", async () => {
		const token = await createJWT({
			userId: "u1",
			role: "editor",
			permissions: ["read", "write"],
		}, SECRET);
		const payload = await verifyJWT(token, SECRET);
		expect(payload.userId).toBe("u1");
		expect(payload.role).toBe("editor");
		expect(payload.permissions).toEqual(["read", "write"]);
	});
});

describe("decodeJWT", () => {
	test("decodes without verification", async () => {
		const token = await createJWT({ msg: "hello" }, SECRET);
		const decoded = decodeJWT(token);
		expect(decoded.payload.msg).toBe("hello");
		expect(decoded.header.alg).toBe("HS256");
	});

	test("throws for invalid format", () => {
		expect(() => decodeJWT("invalid")).toThrow("Invalid token format");
	});
});

describe("JWTError", () => {
	test("is an Error instance", () => {
		const err = new JWTError("test");
		expect(err).toBeInstanceOf(Error);
		expect(err.name).toBe("JWTError");
		expect(err.message).toBe("test");
	});
});
