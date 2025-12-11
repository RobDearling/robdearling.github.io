# Default recipe - list available commands
default:
    @just --list

# Run development server
dev:
    npm run dev

# Build production site
build:
    npm run build

# Generate RSS feed
rss:
    npm run generate-rss

# Create new weekly note
weeknote:
    npm run new-weekly-note

# Clean build artifacts
clean:
    rm -rf .next out

# Full clean including node_modules
clean-all: clean
    rm -rf node_modules

# Install dependencies
install:
    npm install

# Type check the codebase
typecheck:
    npx tsc --noEmit

# Build and verify (build + typecheck)
verify: typecheck build

# Deploy to GitHub Pages (builds and outputs to out/)
deploy: build
    @echo "Site built to out/ directory"
    @echo "GitHub Pages will deploy automatically on push to main"

# Serve the production build locally
serve: build
    npm run start

# Quick rebuild (clean + build)
rebuild: clean build

# Create a new blog post (interactive)
new-post:
    #!/usr/bin/env bash
    echo "Enter post slug (e.g., my-new-post):"
    read -r slug
    echo "Enter post title:"
    read -r title
    date=$(date +%Y-%m-%d)
    cat > "posts/${slug}.md" << EOF
    ---
    title: '${title}'
    date: '${date}'
    ---

    Your content here.
    EOF
    echo "Created posts/${slug}.md"
