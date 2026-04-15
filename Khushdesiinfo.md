# KhusDesiConverter

## Overview

AI-powered multi-layer language converter that transforms input text into 5 variations using a structured selection flow: persona, language section/language, and tone. Built for expressive global, Indian regional, and Indianized English-mixed communication styles, with theme customization and AI audio output.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **AI**: OpenAI via Replit AI Integrations (text conversion and TTS)
- **Validation**: Zod (`zod/v4`) for conversion route; manual validation for TTS route
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Features

- Persona-first UX with searchable, grouped persona chips/cards
- Large persona catalog across Trending, Professional, Student, Emotional, Fun, Lifestyle, Science, Humanities, Spiritual, Philosophy, Foreign Philosophy, Indian Philosophy, and Belief System groups
- Last selected persona persists in browser storage with key `khus-desi-persona`
- Three language sections:
  - International global languages
  - Indian regional and South Asian languages grouped by region
  - Indianized English-mixed “-ish” styles
- Tone options shown after language selection: Formal, GenZ Male, GenZ Female
- Debounced auto-conversion while typing, no manual submit required
- Recent result cache for fast switching between options
- Copy-to-clipboard for each variation
- Advanced theme system with system auto-detect and persisted theme key `khus-desi-converter-theme`
- Theme modes: Light, Dark, Neon, Glass, Purple AI, Student, Business, Space, Religious, Peaceful, Philosophy
- Header logo uses `attached_assets/Picsart_26-04-14_04-56-47-885_1776130410586.jpg`
- Browser/app icons are generated into `artifacts/khus-desi-converter/public/` as `favicon.ico`, `favicon.png`, `app-logo.png`, `icons/app-icon-192.png`, `icons/app-icon-512.png`, and `icons/apple-touch-icon.png`
- Contact button links to `mailto:proreme123@gmail.com?subject=KhusDesiConverter%20Feedback`
- AI TTS audio generation with Listen and Save Audio controls for input and generated output cards
- Voice style and playback speed controls
- Optional browser speech input button when supported
- “made by AdaMo 🧡” footer

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/khus-desi-converter run dev` — run frontend locally

## Architecture

- Frontend: `artifacts/khus-desi-converter/` — React + Vite app at `/`
- Backend: `artifacts/api-server/` — Express server at `/api`
- AI Integration: `lib/integrations-openai-ai-server/` — OpenAI client
- API Spec: `lib/api-spec/openapi.yaml` — OpenAPI contract
- Codegen: `lib/api-client-react/` — Generated React Query hooks

## API Endpoints

- `POST /api/convert` — Convert text with persona, language section, language, and tone; returns 5 variations
- `POST /api/tts` — Generate AI speech audio for input or output text; returns binary audio
- `GET /api/healthz` — Health check
