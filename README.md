# Namastack website

The website at [www.namastack.io](https://www.namastack.io), built with Docusaurus and hosted on Vercel. Website content and documentation versions are maintained and published independently of library releases.

## Development

Use Node.js 22 and npm (the committed `package-lock.json` is authoritative).

```sh
npm ci
npm start
```

```sh
npm run typecheck
npm run build
npm run serve
```

The production build is written to `build/`. Pull requests and pushes to `main` run the Website workflow to typecheck and build the site.

## Content and versions

- `src/pages/`: homepage, product page and documentation landing page.
- `docs/`: development documentation, published under `/docs/next/`.
- `versioned_docs/`: published Outbox documentation snapshots.
- `versioned_sidebars/` and `versions.json`: navigation and version history.
- `static/`: images, videos and other public assets.

Correct released documentation in its `versioned_docs/version-<line>/` directory. Update `docs/` too if the correction applies to development. Deploying the website does not create a documentation version.

To create a new Outbox documentation line independently of a library release:

```sh
npm run docusaurus -- docs:version 1.12.x
```

Use the actual new `major.minor.x` line. The first entry in `versions.json` becomes the stable documentation under `/docs/`; earlier lines retain `/docs/<line>/`. In `vercel.json`, update the legacy `/outbox/<line>/:path*` redirects: the new latest line targets `/docs/:path*` temporarily, and the previous line targets `/docs/<previous-line>/:path*` permanently. Review, build and commit the snapshot, sidebar, version list and redirects together. No release workflow in the library repository modifies this repository.

## Vercel deployment

The Website workflow deploys successful `main` builds when the repository variable `VERCEL_DEPLOY_ENABLED` is `true`. Pull requests never receive deployment credentials or deploy to production. Deployment can also be started manually with **Run workflow** on `main`.

Configure these GitHub Actions repository secrets:

- `VERCEL_TOKEN`: a Vercel token permitted to deploy the project.
- `VERCEL_ORG_ID`: the existing Vercel team/account ID.
- `VERCEL_PROJECT_ID`: the existing Vercel project ID.

Keep `VERCEL_DEPLOY_ENABLED` unset until the project and credentials are configured. Existing production traffic is unaffected while deployment is disabled.

### Initial migration from the Outbox repository

1. Reuse the existing Vercel project to retain its domains and production configuration.
2. Change its Root Directory from `namastack-outbox-docs` to the repository root (empty). The build command is `npm run build`, install command is `npm ci`, output directory is `build`, and Node.js version is 22.x.
3. Disconnect the old Outbox Git integration. This repository uses GitHub Actions for deployment, so no Vercel Git connection is needed; do not leave the old connection active with the changed root directory.
4. Configure the three secrets above in this repository, then set `VERCEL_DEPLOY_ENABLED=true` and run the Website workflow on `main`.
5. Verify the homepage, `/outbox/`, `/docs/quickstart/`, archived versions and legacy redirects on www.namastack.io.
6. After production verification, merge the Outbox extraction PR and remove the three obsolete Vercel secrets from Outbox. Keep Codecov and all library publishing/signing credentials there.

The Vercel project-settings change and Git disconnection must be performed together before deployment is enabled. URLs, documentation versions, redirects and public content retain their existing structure during this migration.

## Outbox overview video

The homepage and `/outbox/` embed the showreel through `OutboxShowreel` in `src/components/MarketingPage/index.tsx`. Assets live in `static/videos/`. When replacing a film, update the video, poster and captions together and change versioned URLs to avoid stale caches.

## Origin

Extracted from `namastack/namastack-outbox`, directory `namastack-outbox-docs`, at source commit `8739f6eb89c5ee6d33855767f08890cf1326529e`. The documentation directory's Git history is preserved. The initial extraction does not introduce Once content or change public routes.
