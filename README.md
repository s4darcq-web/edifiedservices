# Edified Services

The Edified Services website is built with Next.js App Router, React, TypeScript
and Tailwind CSS. Shared site components and the reusable button UI are in
`components/`; route pages and metadata are in `app/`; site content is in
`lib/data.ts`.

## Development

```bash
npm install
npm run dev
```

The development server is available at <http://localhost:3000>.

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
- `/dashboard` — Login placeholder
