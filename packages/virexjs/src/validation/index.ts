/**
 * VirexJS form validation — lightweight, type-safe, zero dependencies.
 *
 * Define schemas with chainable validators and validate data
 * from form submissions or API requests.
 */

/** Validation error for a single field */
export interface ValidationError {
	field: string;
	message: string;
	rule: string;
}

/** Validation result */
export interface ValidationResult<T> {
	success: boolean;
	data: T;
	errors: ValidationError[];
}

/** Field validator with chainable rules */
export interface FieldValidator<T = unknown> {
	/** Mark field as required */
	required: (message?: string) => FieldValidator<T>;
	/** Minimum length (string) or value (number) */
	min: (value: number, message?: string) => FieldValidator<T>;
	/** Maximum length (string) or value (number) */
	max: (value: number, message?: string) => FieldValidator<T>;
	/** Match a regex pattern */
	pattern: (regex: RegExp, message?: string) => FieldValidator<T>;
	/** Custom validation function */
	custom: (fn: (value: T) => string | null) => FieldValidator<T>;
	/** Email format validation */
	email: (message?: string) => FieldValidator<T>;
	/** URL format validation */
	url: (message?: string) => FieldValidator<T>;
	/** Trim whitespace (transform, not validation) */
	trim: () => FieldValidator<T>;
	/** Set a default value */
	default: (value: T) => FieldValidator<T>;
	/** Internal: get the rules */
	_rules: ValidationRule[];
	_transforms: TransformFn[];
	_defaultValue: T | undefined;
}

type TransformFn = (value: unknown) => unknown;

interface ValidationRule {
	name: string;
	validate: (value: unknown) => string | null;
}

function createFieldValidator<T = unknown>(): FieldValidator<T> {
	const rules: ValidationRule[] = [];
	const transforms: TransformFn[] = [];
	let defaultValue: T | undefined;

	const validator: FieldValidator<T> = {
		_rules: rules,
		_transforms: transforms,
		_defaultValue: undefined,

		required(message?: string) {
			rules.push({
				name: "required",
				validate: (v) => {
					if (v === undefined || v === null || v === "") {
						return message ?? "This field is required";
					}
					return null;
				},
			});
			return validator;
		},

		min(value: number, message?: string) {
			rules.push({
				name: "min",
				validate: (v) => {
					if (typeof v === "string" && v.length < value) {
						return message ?? `Must be at least ${value} characters`;
					}
					if (typeof v === "number" && v < value) {
						return message ?? `Must be at least ${value}`;
					}
					return null;
				},
			});
			return validator;
		},

		max(value: number, message?: string) {
			rules.push({
				name: "max",
				validate: (v) => {
					if (typeof v === "string" && v.length > value) {
						return message ?? `Must be at most ${value} characters`;
					}
					if (typeof v === "number" && v > value) {
						return message ?? `Must be at most ${value}`;
					}
					return null;
				},
			});
			return validator;
		},

		pattern(regex: RegExp, message?: string) {
			rules.push({
				name: "pattern",
				validate: (v) => {
					if (typeof v === "string" && !regex.test(v)) {
						return message ?? "Invalid format";
					}
					return null;
				},
			});
			return validator;
		},

		custom(fn: (value: T) => string | null) {
			rules.push({
				name: "custom",
				validate: (v) => fn(v as T),
			});
			return validator;
		},

		email(message?: string) {
			rules.push({
				name: "email",
				validate: (v) => {
					if (typeof v === "string" && v.length > 0) {
						const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
						if (!emailRegex.test(v)) {
							return message ?? "Invalid email address";
						}
					}
					return null;
				},
			});
			return validator;
		},

		url(message?: string) {
			rules.push({
				name: "url",
				validate: (v) => {
					if (typeof v === "string" && v.length > 0) {
						try {
							new URL(v);
						} catch {
							return message ?? "Invalid URL";
						}
					}
					return null;
				},
			});
			return validator;
		},

		trim() {
			transforms.push((v) => (typeof v === "string" ? v.trim() : v));
			return validator;
		},

		default(value: T) {
			defaultValue = value;
			validator._defaultValue = value;
			return validator;
		},
	};

	return validator;
}

/** Create a string field validator */
export function string(): FieldValidator<string> {
	return createFieldValidator<string>();
}

/** Create a number field validator */
export function number(): FieldValidator<number> {
	const v = createFieldValidator<number>();
	v._transforms.push((val) => {
		if (typeof val === "string" && val.length > 0) {
			const n = Number(val);
			return Number.isNaN(n) ? val : n;
		}
		return val;
	});
	return v;
}

/** Create a boolean field validator */
export function boolean(): FieldValidator<boolean> {
	const v = createFieldValidator<boolean>();
	v._transforms.push((val) => {
		if (val === "true" || val === "1" || val === "on") return true;
		if (val === "false" || val === "0" || val === "off" || val === "") return false;
		return val;
	});
	return v;
}

/** Schema definition — map of field names to validators */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Schema = Record<string, FieldValidator<any>>;

/**
 * Validate data against a schema.
 *
 * Usage:
 *   import { validate, string, number } from "virexjs";
 *
 *   const schema = {
 *     name: string().required().min(2).max(50).trim(),
 *     email: string().required().email(),
 *     age: number().min(0).max(150),
 *   };
 *
 *   // In API route:
 *   const body = await request.json();
 *   const result = validate(schema, body);
 *   if (!result.success) {
 *     return Response.json({ errors: result.errors }, { status: 400 });
 *   }
 *   // result.data is typed and validated
 */
export function validate<S extends Schema>(
	schema: S,
	data: Record<string, unknown>,
): ValidationResult<{ [K in keyof S]: unknown }> {
	const errors: ValidationError[] = [];
	const result: Record<string, unknown> = {};

	for (const [field, validator] of Object.entries(schema)) {
		let value = data[field];

		// Apply default
		if ((value === undefined || value === null) && validator._defaultValue !== undefined) {
			value = validator._defaultValue;
		}

		// Apply transforms
		for (const transform of validator._transforms) {
			value = transform(value);
		}

		// Run validation rules
		for (const rule of validator._rules) {
			const error = rule.validate(value);
			if (error) {
				errors.push({ field, message: error, rule: rule.name });
				break; // Stop on first error per field
			}
		}

		result[field] = value;
	}

	return {
		success: errors.length === 0,
		data: result as { [K in keyof S]: unknown },
		errors,
	};
}

/**
 * Parse and validate a Request body (JSON or FormData).
 *
 * Usage:
 *   const result = await parseBody(request, schema);
 */
export async function parseBody<S extends Schema>(
	request: Request,
	schema: S,
): Promise<ValidationResult<{ [K in keyof S]: unknown }>> {
	const contentType = request.headers.get("Content-Type") ?? "";
	let data: Record<string, unknown>;

	if (contentType.includes("application/json")) {
		data = await request.json();
	} else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
		const formData = await request.formData();
		data = {};
		for (const [key, value] of formData.entries()) {
			data[key] = value;
		}
	} else {
		data = {};
	}

	return validate(schema, data);
}
