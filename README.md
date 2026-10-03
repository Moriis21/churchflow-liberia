# ChurchFlow Liberia

Church management platform for maintaining member records, ministry operations, media resources, invitations, payments, and church communications.

Live application: [https://churchflow-liberia.vercel.app](https://churchflow-liberia.vercel.app)

## Status

Active web application

## Key capabilities

- Member and ministry administration
- Church invitations and two factor authentication support
- Media resources, blog content, and daily scriptures
- Payment records, reporting, and GDPR data workflows
- InsForge backend integration

## Technology

- React
- Vite
- Tailwind CSS
- InsForge
- Framer Motion
- Recharts

## Local development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

### Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | `vite` |
| `npm run sitemap` | `node scripts/generate-sitemap.mjs` |
| `npm run prebuild` | `node scripts/generate-sitemap.mjs` |
| `npm run build` | `vite build` |
| `npm run lint` | `eslint .` |
| `npm run preview` | `vite preview` |

## Configuration

Copy the provided environment template to a local environment file, then supply values for the variables required by your deployment.

Variables documented in `.env.example`:

- `CHURCHFLOW_LOGIN_URL`
- `FROM_EMAIL`
- `RESEND_API_KEY`
- `VITE_INSFORGE_ANON_KEY`
- `VITE_INSFORGE_URL`

Never commit production credentials or private keys.

## Project structure

| Path | Purpose |
| --- | --- |
| `insforge/` | InsForge backend configuration and functions |
| `migrations/` | Database migrations |
| `public/` | Static assets |
| `scripts/` | Maintenance and build scripts |
| `src/` | Primary application source code |

## Security

- Keep credentials and production environment files out of version control.
- Review authentication, authorization, database policies, and input validation before production use.
- Run the available lint, type checking, test, and build commands before deployment.

## License

No license file is currently included. All rights are reserved unless the repository owner states otherwise.

## Maintainer

Morris L. Dorley Jr, [@Moriis21](https://github.com/Moriis21)

