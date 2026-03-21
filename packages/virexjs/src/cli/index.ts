#!/usr/bin/env bun
export {};

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
	case "dev":
		await import("./dev").then((m) => m.dev(args.slice(1)));
		break;
	case "build":
		await import("./build").then((m) => m.build(args.slice(1)));
		break;
	case "preview":
		await import("./preview").then((m) => m.preview(args.slice(1)));
		break;
	case "init":
		await import("./init").then((m) => m.init(args.slice(1)));
		break;
	case "--version":
	case "-v":
		console.log("virexjs 0.1.0");
		break;
	case "--help":
	case "-h":
	default:
		printHelp();
}

function printHelp(): void {
	console.log(`
  ⚡ VirexJS v0.1.0 — Ship HTML, not JavaScript.

  Usage: virex <command>

  Commands:
    init      Create a new VirexJS project
    dev       Start development server with HMR
    build     Build for production
    preview   Preview production build locally

  Options:
    --help    Show this help message
    --version Show version number
`);
}
