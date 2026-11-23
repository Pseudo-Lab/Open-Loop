---
name: project-motion
description: Plan, render and score a short LinkedIn motion video introducing a Pseudo Lab (가짜연구소) project with this repo. Use when someone asks to make a project intro/promo motion video.
---


# Pseudo Lab project motion video

Makes a 4:5 (1080x1350, 60fps) looping LinkedIn motion video for a Pseudo Lab project, scored with the season track and the fixed ending sting, plus the LinkedIn post copy. Same loop every time: intake → concept → beat map + 4 stills → approval → render → feedback → music → post.

## 0. Setup (this repo)
- Run `npm run doctor` and fix anything it flags (Node 20+, `npm install`, ffmpeg, `pip install librosa numpy pillow`, `npx playwright install chromium`).
- Read `PLAYBOOK.md` first; it is the source of truth for the rules below.
- Season track is NOT in git (Pixabay license forbids standalone redistribution). Each person downloads it from the link in `music/README.md` and saves it as `music/season-track.mp3`. Without it, `make` still produces the silent video.

## 1. Intake (ask before designing)
From the project plan (README/Notion) pull: goal, what makes it distinctive, roadmap/milestones, deliverables, how to join, links. Confirm with the user: video language (English first; Korean is a separate version with new wordplay, never a literal translation), must-include facts, links for the post body. Never put URLs in the video; the end card says "Link in post ↓".

## 2. Concept + beat map
- One green dot (#16A774) connects every scene; decide what the dot stands for in this project (e.g. a node in a knowledge graph).
- 2–3 letter-level wordplays, one per act (remove or insert letters so meaning flips; e.g. Hide Connections → Connections, Legalese → Legal ease, KNOWLEDGE → EDGE). Each needs a reading hold after it resolves.
- Default structure: hook (UI/toggle + cursor) → core metaphor → context (why / series) → roadmap → wordplay → end card (dot → Pseudo Lab logo, sting lands) → loop return (last frame = first frame).
- Brand: canvas #F3F1ED, dark #13222B, surface #F6FAF2, chip #F5FBCC, Hepta Slab + IBM Plex Sans, italic accent word in Fraunces Italic (stand-in for TT Barrels). Green only for dot/lines/large text. Min on-screen text ~30–36px (phone reads at ~0.36x).
- Present a beat-map table, then render 4 stills and get approval BEFORE the full render.

## 3. Build
- `npm run new -- <slug>` copies `projects/_template`. Write scenes in `film.ts`, pacing in `timeline.ts`, copy/stills/music.hit/music.events in `project.ts`.
- Everything is computed from t (no state, timers or Math.random). Idle motion during holds uses `frame.video` (real time), not scene time.
- `npm run build -- <slug>`, `npm run stills -- <slug> stills`, `python3 scripts/sheets.py out/<slug>` → look at `review.png` and `phone.png` yourself before showing the user.
- Publish `out/<slug>/index.html` as an artifact for scrubbing.

## 4. Feedback → fix (keep scene code stable)
- "too fast/slow overall" → `timeline.scaled(k, [excluded scenes])` or segment `d` values.
- "can't read X before it leaves" → add a hold segment where X is complete (two-line sentence ≈ 3s).
- "transition too long" → shorten that hold.
- "too static" → add idle motion keyed on video time.
- "text too small" → `mobile` sizes in `engine/tokens.ts`.
- When changing engine code, verify `projects/legal-kg` frames stay pixel-identical.

## 5. Render + music
- `npm run make -- <slug>` = build → stills → 4 parallel render workers → H.264 veryfast → music (auto offset, key-matched sting, 2-bar low-pass recession into the sting, 3.5s tail) → `REPORT.md`.
- Long commands: run in background; each shell call has a time limit.
- Check `music-report.json`: landing error < 17ms, end silent, ≈ −15.5 LUFS, true peak ≈ −1.5 dB. Pin an approved offset with `music.offset` in project.ts.
- You cannot hear audio: inspect waveform/spectrogram images and loudness curves, and tell the user to listen on earphones and a phone speaker.

## 6. Deliver
- Send the folder `out/<slug>/deliver/` (made by `make`): `<Title>_final.mp4`, `_thumbnail.png` (end card), `_linkedin-post.txt`, `_review.png`. Re-run `npx tsx scripts/deliver.ts <slug>` after editing the post.
- Draft the LinkedIn post (English, then Korean when asked): first line = the video's main wordplay, then what/why/series context, roadmap, how to join, links, hashtags, optional "Music: <artist> via Pixabay".
- For every decision, explain why, pros, cons and what could go wrong. Use TypeScript.