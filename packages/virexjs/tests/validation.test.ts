import { describe, expect, test } from "bun:test";
import { boolean, number, parseBody, string, validate } from "../src/validation/index";

// ─── string validators ─────────────────────────────────────────────────────

describe("string validators", () => {
	test("required passes for non-empty", () => {
		const result = validate({ name: string().required() }, { name: "Alice" });
		expect(result.success).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	test("required fails for empty", () => {
		const result = validate({ name: string().required() }, { name: "" });
		expect(result.success).toBe(false);
		expect(result.errors[0]?.field).toBe("name");
		expect(result.errors[0]?.rule).toBe("required");
	});

	test("required fails for undefined", () => {
		const result = validate({ name: string().required() }, {});
		expect(result.success).toBe(false);
	});

	test("min length", () => {
		expect(validate({ pw: string().min(8) }, { pw: "short" }).success).toBe(false);
		expect(validate({ pw: string().min(8) }, { pw: "longpassword" }).success).toBe(true);
	});

	test("max length", () => {
		expect(validate({ bio: string().max(5) }, { bio: "toolong" }).success).toBe(false);
		expect(validate({ bio: string().max(5) }, { bio: "ok" }).success).toBe(true);
	});

	test("pattern", () => {
		const schema = { code: string().pattern(/^[A-Z]{3}$/) };
		expect(validate(schema, { code: "ABC" }).success).toBe(true);
		expect(validate(schema, { code: "abc" }).success).toBe(false);
		expect(validate(schema, { code: "ABCD" }).success).toBe(false);
	});

	test("email", () => {
		const schema = { email: string().email() };
		expect(validate(schema, { email: "user@example.com" }).success).toBe(true);
		expect(validate(schema, { email: "not-email" }).success).toBe(false);
		expect(validate(schema, { email: "" }).success).toBe(true); // empty is ok if not required
	});

	test("url", () => {
		const schema = { website: string().url() };
		expect(validate(schema, { website: "https://example.com" }).success).toBe(true);
		expect(validate(schema, { website: "not-a-url" }).success).toBe(false);
	});

	test("trim", () => {
		const result = validate({ name: string().trim() }, { name: "  hello  " });
		expect(result.data.name).toBe("hello");
	});

	test("custom validator", () => {
		const schema = {
			slug: string().custom((v) => {
				if (typeof v === "string" && v.includes(" ")) return "No spaces allowed";
				return null;
			}),
		};
		expect(validate(schema, { slug: "hello-world" }).success).toBe(true);
		expect(validate(schema, { slug: "hello world" }).success).toBe(false);
	});

	test("custom error messages", () => {
		const result = validate(
			{ name: string().required("Name is required").min(2, "Too short") },
			{ name: "" },
		);
		expect(result.errors[0]?.message).toBe("Name is required");
	});

	test("default value", () => {
		const result = validate({ role: string().default("user") }, {});
		expect(result.data.role).toBe("user");
	});
});

// ─── number validators ──────────────────────────────────────────────────────

describe("number validators", () => {
	test("coerces string to number", () => {
		const result = validate({ age: number() }, { age: "25" });
		expect(result.data.age).toBe(25);
	});

	test("min value", () => {
		expect(validate({ age: number().min(0) }, { age: "-1" }).success).toBe(false);
		expect(validate({ age: number().min(0) }, { age: "5" }).success).toBe(true);
	});

	test("max value", () => {
		expect(validate({ qty: number().max(100) }, { qty: "150" }).success).toBe(false);
		expect(validate({ qty: number().max(100) }, { qty: "50" }).success).toBe(true);
	});

	test("required with number", () => {
		expect(validate({ n: number().required() }, {}).success).toBe(false);
		expect(validate({ n: number().required() }, { n: "0" }).success).toBe(true);
	});
});

// ─── boolean validators ─────────────────────────────────────────────────────

describe("boolean validators", () => {
	test("coerces string to boolean", () => {
		expect(validate({ agree: boolean() }, { agree: "true" }).data.agree).toBe(true);
		expect(validate({ agree: boolean() }, { agree: "false" }).data.agree).toBe(false);
		expect(validate({ agree: boolean() }, { agree: "1" }).data.agree).toBe(true);
		expect(validate({ agree: boolean() }, { agree: "0" }).data.agree).toBe(false);
		expect(validate({ agree: boolean() }, { agree: "on" }).data.agree).toBe(true);
		expect(validate({ agree: boolean() }, { agree: "off" }).data.agree).toBe(false);
	});
});

// ─── chained validators ─────────────────────────────────────────────────────

describe("chained validators", () => {
	test("multiple rules chain", () => {
		const schema = {
			name: string().required().min(2).max(50).trim(),
			email: string().required().email(),
			age: number().min(0).max(150),
		};

		const valid = validate(schema, {
			name: "  Alice  ",
			email: "alice@example.com",
			age: "30",
		});
		expect(valid.success).toBe(true);
		expect(valid.data.name).toBe("Alice");
		expect(valid.data.age).toBe(30);

		const invalid = validate(schema, {
			name: "",
			email: "bad",
			age: "200",
		});
		expect(invalid.success).toBe(false);
		expect(invalid.errors.length).toBeGreaterThanOrEqual(2);
	});

	test("stops on first error per field", () => {
		const schema = { name: string().required().min(5) };
		const result = validate(schema, { name: "" });
		// Should only report "required", not "min"
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]?.rule).toBe("required");
	});
});

// ─── parseBody ──────────────────────────────────────────────────────────────

describe("parseBody", () => {
	test("parses JSON body", async () => {
		const req = new Request("http://localhost/api", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "Alice", email: "alice@test.com" }),
		});
		const result = await parseBody(req, {
			name: string().required(),
			email: string().required().email(),
		});
		expect(result.success).toBe(true);
		expect(result.data.name).toBe("Alice");
	});

	test("validates JSON body", async () => {
		const req = new Request("http://localhost/api", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: "", email: "bad" }),
		});
		const result = await parseBody(req, {
			name: string().required(),
			email: string().email(),
		});
		expect(result.success).toBe(false);
	});

	test("handles empty body", async () => {
		const req = new Request("http://localhost/api", {
			method: "POST",
			headers: { "Content-Type": "text/plain" },
		});
		const result = await parseBody(req, {
			name: string().default("anon"),
		});
		expect(result.data.name).toBe("anon");
	});
});
