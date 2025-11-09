# SOAPify

SOAPify is a clinical documentation assistant that streamlines SOAP note creation. Clinicians can dictate or type encounter details, generate structured notes with AI, and explore the reasoning behind each section before saving everything in a secure Supabase workspace.

## What the project does
- **Multi-modal note capture** – capture raw encounters via free text or microphone dictation; audio is sent to OpenAI Whisper and appended to the note editor.
- **AI-generated SOAP output** – GPT-4o mini returns complete Subjective, Objective, Assessment, and Plan sections, even when the input omits a plan. Clinicians can revise each section directly in the editor.
- **Explainability built in** – every section features an “Explain” button that surfaces the AI’s rationale in a few concise bullet points.
- **Assistant chatbot** – an integrated clinical assistant answers follow-up questions, suggests differentials, and drafts patient-friendly explanations.
- **Secure organization** – Supabase manages user authentication and row-level security. Notes live in `folders` and `documents` tables, and clinicians can move or delete them as needed.

## Local setup

### Requirements
- Node.js 18 or later
- npm 9 or later
- Supabase project (database + API keys)
- OpenAI API key with access to GPT-4o mini and Whisper

### Steps
1. Clone the repository and install packages:
   ```bash
   git clone https://github.com/<your-org>/<your-repo>.git
   cd <your-repo>
   npm install
   ```
2. Create a `.env.local` file in the project root and provide:
   ```ini
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   OPENAI_API_KEY=<openai-api-key>
   ```
   Only the anon key is needed on the client. If you add server-only Supabase logic, keep the service role key out of public builds.
3. Apply the database schema: open the Supabase SQL editor and run [`supabase/schema.sql`](./supabase/schema.sql). This creates the `folders` and `documents` tables plus row-level security policies.
4. Start the development server:
   ```bash
   npm run dev
   ```
   The app is available at [http://localhost:3000](http://localhost:3000).

## Running the demo
1. Sign up or log in through Supabase authentication.
2. (Optional) Create a folder on the dashboard to organize notes.
3. Open the editor. Type an encounter or click **Start Dictation** to record audio; once you stop recording the transcript appears in the raw notes box.
4. Select **Generate SOAP Notes**. Review the output, use **Edit** or **Explain** where needed, and save the note.
5. Saving returns you to the dashboard, where the document is listed under Workspace or the chosen folder. You can move, rename, or delete it from there.
6. Explore the **Assistant** page to ask clarifying questions or draft follow-up guidance.

A sample encounter to try:
```
42-year-old female presents with three days of left flank pain radiating to the groin, nausea, and two episodes of vomiting. Denies fever or chills. History of kidney stones ten years ago. Exam: afebrile, BP 128/76, HR 94; left CVA tenderness, abdomen soft, no rebound. UA pending.
```

## Tech stack
- Next.js (App Router), React, TypeScript
- Tailwind CSS, shadcn/ui, Lucide icons
- Supabase (auth, PostgreSQL, storage)
- OpenAI GPT-4o mini (SOAP generation, section explanations, chatbot)
- OpenAI Whisper (speech-to-text transcription)

## Future work
- Embed clinical guidelines and structured patient history to better ground AI responses
- Offer specialty-specific models for cardiology, pediatrics, etc.
- Cache dictations locally for offline clinics
- Add reviewer workflows so attending physicians can annotate or approve interns’ notes

SOAPify demonstrates that multi-modal input, targeted AI models, and human-centered editing can deliver documentation that is both fast and reliable.
