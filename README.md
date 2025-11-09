# SOAPify – AI-Accelerated Clinical Documentation

SOAPify is a multi-modal assistant that helps physicians and medical trainees transform free-form encounters into structured SOAP notes. The application combines typed or dictated input, OpenAI-generated documentation, inline explainability, and a secure Supabase workspace so clinicians can spend more time with patients and less time on paperwork.

---

## Table of Contents
1. [Key Features](#key-features)
2. [Architecture & Technology](#architecture--technology)
3. [Local Setup](#local-setup)
4. [Environment Variables](#environment-variables)
5. [Database Schema](#database-schema)
6. [How to Run the Demo](#how-to-run-the-demo)
7. [Available Commands](#available-commands)
8. [Screenshots](#screenshots)
9. [Future Improvements](#future-improvements)
10. [License](#license)

---

## Key Features
- **AI-powered SOAP generation** – GPT-4o mini turns narrative notes into complete Subjective, Objective, Assessment, and Plan sections, inferring sensible plans even when clinicians omit them.
- **Voice dictation** – Browser-based recording streams audio to OpenAI Whisper. Transcripts automatically append to the raw notes editor.
- **Inline editing & explainability** – Each SOAP section includes “Edit” and “Explain” controls so clinicians can tweak wording and understand the AI’s clinical reasoning.
- **Assistant chatbot** – A dedicated assistant page surfaces quick differential diagnoses, red-flag checks, and patient education wording via GPT-4o mini.
- **Secure workspace** – Supabase authentication, row-level security, and a folder/document model let clinicians organize notes, move them between folders, or delete sensitive information.
- **Session persistence** – Users remain logged in across refreshes and local server restarts via Supabase’s client-side session caching.

---

## Architecture & Technology
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Lucide icons
- **State & Utilities**: React hooks, custom profile store, class-variance-authority helpers
- **Backend / APIs**: Next.js API routes (`/api/generate-soap`, `/api/explain-soap`, `/api/transcribe`, `/api/clinical-assistant`)
- **Authentication & Data**: Supabase (PostgreSQL, auth, storage) with row-level security policies
- **AI Services**: OpenAI GPT-4o mini (SOAP generation, explanations, chatbot) and OpenAI Whisper (speech-to-text)
- **Tooling**: npm, Git/GitHub, Vercel runtime for serverless API routes

---

## Local Setup

> **Prerequisites**
> - Node.js 18+
> - npm 9+
> - Supabase project (database + API credentials)
> - OpenAI account with API access (GPT-4o mini + Whisper)

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-org>/<your-repo>.git
   cd <your-repo>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (see next section)

4. **Apply database schema** – open the Supabase SQL editor and run the commands in [`supabase/schema.sql`](./supabase/schema.sql) to create the `folders` and `documents` tables plus policies.

5. **Start the development server**
   ```bash
   npm run dev
   ```
   The app runs at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables
Copy `.env.local.example` (if present) or create `.env.local` at the project root:

```bash
cp .env.local.example .env.local    # if the example file exists
```

Fill in the following keys:

```ini
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
OPENAI_API_KEY=<openai-key-with-gpt-4o-and-whisper-access>
```

> **Note**: If you need server-side Supabase operations beyond the anon key, also configure `SUPABASE_SERVICE_ROLE_KEY` (never expose it to the client).

---

## Database Schema

The schema is defined in [`supabase/schema.sql`](./supabase/schema.sql) and includes:
- `folders` – stores physician-created folders with metadata
- `documents` – stores SOAP notes (title, JSON content, folder association)
- Row-level security policies enforcing that users can only access their own rows

Run the SQL script in the Supabase dashboard > SQL Editor before you start the app.

---

## How to Run the Demo
1. **Launch** `npm run dev` and navigate to [http://localhost:3000](http://localhost:3000).
2. **Create an account** via Supabase auth (Sign Up) and log in.
3. **Optional** – create a folder from the dashboard to organize notes.
4. **Open the editor** (`/dashboard/editor`) and either:
   - Type a clinical encounter in the raw notes textbox, or
   - Click **Start Dictation**, describe the encounter aloud, then stop recording once finished.
5. Click **Generate SOAP Notes** and review each section.
6. Use **Edit** to tweak wording and **Explain** to see the AI’s reasoning.
7. Save the note. You’ll return to the dashboard where the document now appears (either in the folder or workspace).
8. Test the **Assistant** tab to ask diagnostic questions or draft patient education text.

> For judges: a sample encounter to paste into the editor is provided in the repository’s documentation (see README “Sample Encounter”).

---

## Available Commands
| Command              | Description                              |
|----------------------|------------------------------------------|
| `npm install`        | Install dependencies                     |
| `npm run dev`        | Start the Next.js development server     |
| `npm run build`      | Create an optimized production build     |
| `npm start`          | Run the production build (after build)   |
| `npm run lint`       | Lint TypeScript/JavaScript files         |

---

## Screenshots

> Replace the placeholders below with actual images in `docs/screenshots/` before final submission.

- **Dashboard overview**
  ![Dashboard Overview](docs/screenshots/dashboard.png)
- **SOAP note editor with AI output**
  ![SOAP Editor](docs/screenshots/editor.png)
- **Assistant chatbot**
  ![Assistant Chatbot](docs/screenshots/assistant.png)

---

## Future Improvements
- **Domain-specialized models** – fine-tune or build specialty-specific models (cardiology, pediatrics) for more nuanced plans.
- **Contextual grounding** – connect to EHR data (labs, meds) to further personalize AI recommendations.
- **Offline & local-first support** – cache dictations and drafts for clinics with unreliable connectivity.
- **Explainability enhancements** – extend “Explain” to include references to clinical guidelines or PDF summaries.
- **Collaborative review** – add an attending review workflow with comment threads and approval signatures.

---

## License

This project is released under the MIT License. See [LICENSE](./LICENSE) for details.
