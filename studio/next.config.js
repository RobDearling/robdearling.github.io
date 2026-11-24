const path = require('node:path');

// Resolve the content root in the server process, independent of the CLI cwd.
process.env.EXPLAINER_DIRECTORY ||= path.join(__dirname, '..', 'explainers');
module.exports = {
  reactStrictMode: true,
  distDir: process.env.STUDIO_BUILD_DIR || '.next',
  experimental: { externalDir: true },
};
