# ECM / FAD Compliance Spec — corso.unozen.ai

Mapping of AGENAS requirements to concrete platform features. Sources are the
official documents (Manuale formazione continua del professionista sanitario v2.0
25/03/2024; Allegato A requisiti accreditamento; Allegato F Formazione a Distanza;
Allegato D calcolo durata; Allegato B/I scheda qualità; Allegato C attestato;
Manuale delle verifiche dei provider v1.0).

This course is **FAD asincrona** (e-learning, on-demand video + slides + AI tutor),
delivered to **Psicologi** (and Psicoterapeuti). Obligation: 150 crediti / triennio
2023-2025; max 50 crediti per single event.

---

## Track 1 — Provider accreditation (organizational, NOT platform)

Out of scope for code, but the platform must support whichever is chosen:

- **Self-accredited**: company needs ECM in statutory object, REA, Italian HQ not
  co-located with commercial health business, Comitato Scientifico (≥3 sectoral / ≥5
  general, incl. a psychologist), named Coordinator + Admin + IT lead + Quality lead,
  a written Piano della Qualità, anti-mafia + financial declarations. Provisional →
  standard accreditation (on-site/in-event inspection). Months-long.
- **Partner with accredited provider**: we host content + platform; partner badges the
  course (Responsabile Scientifico = a domain expert) and transmits to COGEAPS. Platform
  must export the *tracciato unico* (participants + outcomes) to them.

Either way the platform requirements below are identical.

---

## Track 2 — Platform (FAD) requirements → features

Legend: ✅ done · ⚠️ partial · ❌ to build

### A. Content & duration
- **A1** Durable, repeatable content (Allegato F). ✅ Vimeo video + slides per lesson.
- **A2** Official **duration calculation** (Allegato D) → drives credit count:
  - audio/video lesson = its real length
  - text = 6000 chars (spaces incl.) ≈ 8 min (up to 10 min for hard/foreign text)
  - table/image without audio = 2 min each
  - + *tempo di approfondimento* up to **50%** of consultation time
  - + practical-exercise time if any
  - ❌ Build: per-lesson duration fields + a computed total shown to admin; credits set
    from this by the (eventual) provider/Comitato.
- **A3** Content currency: provider must update obsolete content, dating updates. ⚠️
  Admin already edits content; add an "updated_at / nota di aggiornamento" surfaced field.

### B. Identity & access
- **B1** Deliver only via inspectable platform; give Ente a discente-level login that stays
  valid through the event. ❌ Build: a read-only "ispettore" account + how-to.
- **B2** Identity verification: credentials + time-expiring token (email/SMS/app), or
  webcam/biometric (Allegato F). ⚠️ You have magic-link (email-based, single channel).
  Magic link ≈ credentials+email token, likely sufficient for FAD asincrona; document it.

### C. Fruition & presence (verifica presenza-partecipazione)
- **C1** Track **all** operations via log/report (Allegato A "Sistema informatico" + F).
  ❌ Build: `ecm_activity_log` capturing login, lesson open, video progress, page views,
  quiz start/submit, survey submit — with timestamps, per discente.
- **C2** Enforce fruition: test only unlockable **after** content consumed. ❌ Build:
  mark lesson "fruita" when video watched to threshold (e.g. ≥90%) + min dwell time from
  A2 duration; quiz gated on all lessons fruite.
- **C3** Presence distinct per discente. ✅ enrollments/progress are per-user; C1 adds detail.

### D. Learning assessment (verifica dell'apprendimento)
- **D1** Final **quiz** after content. ❌ Build quiz engine.
  - Question bank per course; double the questions shown is recommended (anti-cheat),
    randomized order.
  - Pass threshold: **≥75%** correct (standard ECM FAD).
  - During attempt: may show only **which** questions were wrong — never the right answer.
  - Correct answers revealed only **after event close**.
  - Questionnaire submission = proof of participation too.
  - If a teacher/author wrote >25% of Qs they can't also be discente on those — not relevant
    for us now (single provider authoring), but schema should store question authorship.
  - Re-takes allowed; quality survey filled only **once** even across retakes (see E2).
- **D2** Credit acquisition date = date test passed (or content end if no test). ❌ store on pass.

### E. Quality survey (scheda qualità percepita) — Allegato B (FAD model)
- **E1** Mandatory; without it **no credits**. The exact 5 questions (FAD/Blended-con-FAD):
  1. Rilevanza argomenti (1–5)
  2. Qualità educativa del programma (1–5)
  3. Utilità per formazione/aggiornamento (1–5)
  4. Tempo dedicato vs ore previste (molto inf. → molto sup.)
  5. Percezione influenza sponsor/interessi commerciali (nessuna → molto rilevante) — *compulsory even with no sponsor*
- **E2** **Anonymous**: stored UNLINKED to the discente. Record only a "survey delivered=true"
  flag on the user's participation; store the answers in a **separate** table with no user FK.
  Filled only once per discente even if assessment repeated.
  ❌ Build: `ecm_quality_survey` (no user_id) + `participation.survey_done boolean`.

### F. Certificate / attestato (Allegato C)
- **F1** Release attestato **only after**: presence verified + test passed + survey done.
  ❌ Build gated PDF generation.
- **F2** Attestato fields (Allegato C / tracciato unico minimi):
  Ente accreditante, ID Provider, ID Evento, edition; participant CF, nome, cognome,
  ruolo/tipo crediti, libero prof./dipendente, **crediti acquisiti**, **data acquisizione**,
  professione, disciplina, sponsor/reclutamento; signature of legal rep or Resp. Scientifico.
  ❌ Build: capture CF + professione/disciplina at enrollment; PDF template.
- **F3** Attestato di partecipazione (no credits) optionally for those who didn't pass —
  must NOT show credits. ❌ optional later.

### G. Transmission & retention
- **G1** **XML export** (*tracciato unico*) of participants + outcomes for COGEAPS + Ente.
  90 days from event end to transmit. ❌ Build export (CSV now, XML to partner's spec).
- **G2** **5-year retention** of durable material, presence, assessment, survey, logs.
  ⚠️ Supabase persists; add explicit archival export + don't hard-delete.
- **G3** Reclutamento + conflict-of-interest declarations from discente pre-event. ❌ Build
  a one-checkbox declaration at enrollment (likely "non reclutato", no sponsor).

### H. Misc rules already satisfied
- No advertising of health products on platform/site (Allegato F §4.19). ✅
- Single non-modular event, ≤50 credits. ✅ by design.

---

## Build phases (platform)

1. **Schema** — migration adding: `ecm_activity_log`, `quizzes`, `quiz_questions`,
   `quiz_options`, `quiz_attempts`, `quiz_answers`, `ecm_quality_survey` (anonymous),
   `ecm_participation` (per enrollment: fruition %, quiz_passed_at, survey_done,
   attestato_issued_at), lesson duration fields, user CF/professione/disciplina.
2. **Fruition tracking** — video-progress + dwell logging; lesson "fruita"; activity log.
3. **Quiz engine** — bank, randomized attempt, ≥75% gating after fruition, wrong-only feedback.
4. **Quality survey** — Allegato B form, anonymous storage, gates credit.
5. **Certificate** — gated Allegato C PDF; capture CF/professione at enrollment.
6. **Export** — participants + outcomes (CSV → XML to provider spec); retention/archive.
7. **Inspector access + Piano Qualità docs** — read-only account, duration display.

Phases 1–3 are the blocking core. 4–5 complete the credit lifecycle. 6–7 are for the
provider/Ente handoff.
