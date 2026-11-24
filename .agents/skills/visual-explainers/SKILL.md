---
name: visual-explainers
description: Author and edit interactive systems explainers for this site's Markdown posts using its local scene studio, diagram documents, and React player.
---

# Visual explainers

Start with a question the reader can answer after observing a change. In the Azure article, the hostname stays fixed while the reader changes where its DNS lookup originates. Sketch the initial picture, the input to vary, the expected result, and the intermediate event that explains it. Check domain-specific claims against primary sources.

## Compose the scenes

- Use the root README for the studio command and Markdown embed format. The layout is shared across scenes. Preserve positions across comparisons so the reader can track a request or object by eye.
- For a new topic, use a new document in `explainers/`. The studio edits the same versioned JSON an agent can edit directly. Read `lib/explainers/document.ts` for the format and validation. Keep IDs stable when editing published scenes.
- Build the smallest diagram that explains the mechanism. Name edges by what travels along them. Keep a control close to the effect it changes and write the caption so the step also makes sense without animation.
- Use authored scenarios for small, discrete alternatives. For computed behavior, register a pure `SceneModel` in `lib/explainers/models.ts`. It receives the selected inputs and current step and returns a frame. Declare any required diagram element IDs. The player owns playback, resets, input controls and reduced motion. Use node overrides for derived labels or emphasis.
- The worked example pairs `explainers/azure-private-endpoints.json` with `posts/7-azure-private-endpoints.md`. Its first two scenes use authored steps. Its final scene uses a model to combine two independent reader choices.

## Embed and verify

Place the studio's fenced embed on its own between Markdown paragraphs. Introduce the question before the figure. Use the following paragraph to interpret a result the reader can actually reproduce.

Run the static build. Open the exported post and exercise its actual branches, including changing inputs during playback, stepping back, and replaying the final step. Check that captions explain the route on a narrow screen and under reduced motion. Run the relevant Playwright tests. For a new model, assert the destination or derived value as well as the visual state. For studio changes, save, reopen, and verify a document through the normal authoring controls.
