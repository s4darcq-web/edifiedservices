# Edified Services

The Edified Services website is built with Next.js App Router, React, TypeScript
and Tailwind CSS. Shared site components and the reusable button UI are in
`components/`; route pages and metadata are in `app/`; site content is in
`content/` and `lib/`.

## Development

```bash
npm install
npm run dev
```

The development server is available at <http://localhost:3000>.

## Content administration

The admin editor is available at `/admin`. It can edit the Home, Courses,
About Us, and Services page headings and introductory copy, add Markdown
content to those pages, and create, edit, publish, unpublish, or delete pages.
New pages are available at `/pages/<slug>`. Content is stored in
`content/pages.json`; no database is used.

Saving commits the updated JSON file to the configured GitHub branch using the
GitHub Contents API. Connect that branch to your deployment platform (for
example, a GitHub-connected Vercel project) so the commit triggers a rebuild.
With no GitHub settings in local development, saves update `content/pages.json`
on the development computer instead.

The repository includes a local-only `.env.local` so you can sign in during
development with `admin` / `admin01234`. It is ignored by Git. With no GitHub
settings present, the local editor reads and writes `content/pages.json`
directly; restart the dev server after saving to rebuild the site's imported
content. This local mode does not create a Git commit.

## Local student learning portal

Students use `/dashboard` to create an account or sign in. The admin uses
`/admin`, then **Classes & students** to create classes, enroll registered
students, set mentor names and schedules, post announcements, and reply to
classroom chats as the mentor. Student chat refreshes automatically every
eight seconds. The public navbar **Login** button opens the student portal;
administrator sign-in remains at `/admin`.

The student portal stores password hashes, registrations, classes, and
messages in `.local/portal.json`, an ignored local file. It is a database-free
demo for one development computer, not a real-time service. **Do not use real
student information or expose this portal to the internet.** Portal APIs reject
production mode. Before real deployment, use private persistent storage and
production-ready authentication; Git-based website copy remains separate.

For production, configure these as server-side environment variables in your
deployment platform (do not upload `.env.local`):

- `ADMIN_USERNAME` and `ADMIN_PASSWORD` — administrator credentials (the
  example uses `admin` / `admin01234`; change the password before deployment).
- `ADMIN_SESSION_SECRET` — a random secret of at least 32 characters.
- `GITHUB_TOKEN` — a fine-grained GitHub token with Contents: Read and write
  access to this repository.
- `GITHUB_REPOSITORY` — repository in `owner/name` format.
- `GITHUB_BRANCH` — branch that receives content commits.

Never expose these values through `NEXT_PUBLIC_*` variables. The admin editor
requires server-side credentials and a reachable GitHub API.

## Validation and production

```bash
npm run lint
npx tsc --noEmit
npm run build
npm start
```

The app uses the Webpack build and development mode because this Windows
environment blocks the installed native Turbopack binding.

## Routes

- `/` — Home
- `/courses/` — Course catalogue
- `/courses/[slug]/` — Course details
- `/about-us/` — About Edified
- `/our-services/` — Services
- `/admin` — Admin login and file-backed page editor
- `/dashboard` — Student sign-in, classes, announcements, and classroom chat (local demo only)
- `/pages/[slug]` — Custom pages
