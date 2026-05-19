# Variance

<p align="center">
  <b>Dual-surface AI writing workstation</b><br/>
  <i>Paraphrase + Chat, powered by local browser models or BYOK cloud APIs.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-111111?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-111111?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Vite-7-111111?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-111111?style=for-the-badge&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Transformers.js-2.17-111111?style=for-the-badge" />
</p>

---

## What is Variance?

Variance is a client-side React + TypeScript app that gives you two AI writing surfaces in one experience:

- `Paraphrase` tab: transforms text through a structured multi-stage pipeline.
- `Chat` tab: multi-turn conversation with the same loaded local model or external BYOK provider.

All local inferencing runs in-browser with `@xenova/transformers` (WebGPU/WASM fallback). No backend is required for local mode.

---

## Highlights

- Dual-tab UI (`Paraphrase` + `Chat`) with shared model/provider state
- Tiered execution modes: `Lightweight`, `Balanced`, `Advanced`, `External`
- Local model loading + browser cache via IndexedDB
- BYOK support for OpenAI, Anthropic, and Gemini
- Streaming output UX (paraphrase and chat)
- Semantic guardrails for rewrite drift control
- Hardware-aware recommendations for low-spec devices

---

## Execution Modes

1. `Lightweight`
- Fast rule-based transformation only (no LLM call)

2. `Balanced`
- Single-pass local paragraph rewrite + post-processing operators

3. `Advanced`
- Multi-pass local rewrite + aggressive final polish

4. `External` (BYOK)
- Cloud inference path when local hardware is constrained

---

## External Provider Defaults (Current)

- OpenAI: `gpt-4.1-mini`
- Anthropic: `claude-3-5-haiku-latest`
- Gemini: `gemini-2.5-flash`

Note: model availability can change by account/region/provider policy.

---

## Quick Start

### 1) Install

```bash
npm install
```

### 2) Run dev server

```bash
npm run dev
```

### 3) Build

```bash
npm run build
```

### 4) Preview production build

```bash
npm run preview
```

---

## How to Use

### Paraphrase Tab

1. Paste or type text in the input panel
2. Set variance (0-100)
3. Choose execution mode and model/provider from `Manage Models`
4. Run transform and copy streamed output

### Chat Tab

1. Switch to `Chat` in the top navbar
2. Reuse the same active mode/model/provider
3. Send prompts and continue multi-turn conversation in-session

---

## Project Structure

```text
src/
├── components/
│   ├── ChatPanel.tsx
│   ├── ControlBar.tsx
│   ├── ErrorBoundary.tsx
│   ├── InputPanel.tsx
│   ├── ModelManagerPanel.tsx
│   ├── Navbar.tsx
│   ├── OutputPanel.tsx
│   └── StatusBar.tsx
├── engine/
│   ├── paragraphSegmenter.ts
│   ├── pipelineV3.ts
│   ├── semanticGuard.ts
│   └── structuralAnalysis.ts
├── llm/
│   ├── chatReply.ts
│   ├── externalApi.ts
│   └── paragraphRewrite.ts
├── models/
│   ├── hardwareDetection.ts
│   ├── modelManager.ts
│   └── modelRegistry.ts
├── operators/
├── types/
└── utils/
```

---

## Core Architecture

- `App.tsx` orchestrates dual-tab app state and shared mode/model config
- `runPipelineV3` drives paraphrase stages and fallback paths
- `chatReply.ts` handles local/external chat generation with sanitization/retry logic
- `modelManager.ts` ensures local model reuse and cache-friendly loading
- `externalApi.ts` centralizes BYOK provider calls

---

## Scripts

- `npm run dev` - start local development
- `npm run build` - type-check + production build
- `npm run preview` - preview built app
- `npm run lint` - run ESLint

---

## Current Status

- Active version line: `v0.2` UI
- Architecture baseline: `V3.2` (dual-surface update)
- Chat supports:
  - shared model/provider configuration
  - streaming assistant output
  - local generation retry + response sanitization

---

## Contributing

1. Create a feature branch
2. Keep architecture docs updated when behavior changes
3. Run `npm run build` before opening PR
4. Include screenshots for UI-facing changes

---

