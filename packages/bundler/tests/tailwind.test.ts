import { describe, expect, test } from "bun:test";
import {
	generateTailwindConfig,
	generateTailwindInput,
	isTailwindAvailable,
} from "../src/tailwind";

describe("Tailwind CSS integration", () => {
	test("generateTailwindConfig creates valid config", () => {
		const config = generateTailwindConfig("src");
		expect(config).toContain("content:");
		expect(config).toContain("src/**/*.{tsx,ts,html}");
		expect(config).toContain("theme:");
		expect(config).toContain("plugins:");
		expect(config).toContain("export default");
	});

	test("generateTailwindInput creates CSS with directives", () => {
		const input = generateTailwindInput();
		expect(input).toContain("@tailwind base");
		expect(input).toContain("@tailwind components");
		expect(input).toContain("@tailwind utilities");
	});

	test("isTailwindAvailable returns boolean", () => {
		const result = isTailwindAvailable();
		expect(typeof result).toBe("boolean");
		// May or may not be installed — just check it doesn't throw
	});

	test("config uses custom srcDir", () => {
		const config = generateTailwindConfig("custom/path");
		expect(config).toContain("custom/path/**/*.{tsx,ts,html}");
	});
});
