# Rob Dearling's site

Run `npm ci` on the Node version in `.nvmrc`. Use `npm run dev` for the site and `npm run build` for its static export in `out/`.

## Make an interactive explainer

1. Run `npm run studio` and open [the local editor](http://127.0.0.1:3100). Choose **New explainer**, or open **azure-private-endpoints** to explore the worked example.
2. In **Layout**, add nodes and boundaries. Drag them or enter coordinates. Choose **Connect nodes**, then select a source and a destination. Name the connection and choose a solid flow or dashed lookup. Add bends in the inspector to route a line around other nodes.
3. In **Scenes**, give each scene a stable ID and a reader-facing question or description. Choose the active connections and caption for each step. Add a scenario to compare outcomes on the same layout.
4. In **Preview**, try the reader's controls. Save the document, then copy the Markdown embed into a post between paragraphs. For example:

   ````markdown
   ```explainer
   azure-private-endpoints/private-dns
   ```
   ````

5. Run the site to read the post in context. Commit the Markdown post and its `explainers/<slug>.json` together. The public site renders an initial diagram at build time and adds playback in the browser. The studio writes files locally.

The studio and reader share a React/SVG renderer. For behavior that depends on reader inputs, register a TypeScript model in [the model registry](lib/explainers/models.ts). The [visual-explainers agent skill](.agents/skills/visual-explainers/SKILL.md) describes the authoring workflow.

Run `npm run test:e2e` to check the site in desktop Chromium and mobile WebKit. Install the Playwright browsers with `npx playwright install chromium webkit` the first time.
