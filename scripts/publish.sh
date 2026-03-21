#!/bin/bash
set -e

echo "⚡ VirexJS — Publish to npm"
echo ""

# Pre-flight checks
echo "• Running tests..."
bun test
echo ""

echo "• TypeScript check..."
bunx tsc --noEmit
echo ""

echo "• Lint check..."
bun run lint
echo ""

echo "✓ All checks passed"
echo ""

# Publish order: dependencies first
echo "• Publishing @virexjs/router..."
cd packages/router && npm publish --access public && cd ../..

echo "• Publishing @virexjs/bundler..."
cd packages/bundler && npm publish --access public && cd ../..

echo "• Publishing @virexjs/db..."
cd packages/db && npm publish --access public && cd ../..

echo "• Publishing virexjs..."
cd packages/virexjs && npm publish --access public && cd ../..

echo ""
echo "✓ All packages published!"
echo ""
echo "Tag and push:"
echo "  git tag v0.1.0"
echo "  git push origin main --tags"
