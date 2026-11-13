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
npm test
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

The Website workflow deploys successful `main` builds when the repository variable `VERCEL_DEPLOY_ENABLED` is `true`. Pull request Actions jobs only validate the site; Vercel's Git integration builds and publishes their preview deployments. Deployment to production can also be started manually with **Run workflow** on `main`.

Configure these GitHub Actions repository secrets:

- `VERCEL_TOKEN`: a Vercel token permitted to deploy the project.
- `VERCEL_ORG_ID`: the existing Vercel team/account ID.
- `VERCEL_PROJECT_ID`: the existing Vercel project ID.

Keep `VERCEL_DEPLOY_ENABLED` unset until the project and credentials are configured. Existing production traffic is unaffected while deployment is disabled.

### Production project

Deployments reuse the existing Vercel project named `namastack-outbox`, preserving www.namastack.io and its existing domain configuration. Its Git integration connects to `namastack/namastack-website` for previews; this repository's Website workflow owns production deployments.

### Pull request previews

Vercel builds non-production branches and posts the preview URL on their pull requests. New pushes update the preview automatically. Fork previews may require approval in Vercel.

`vercel.json` disables automatic Git deployments for `main` with `git.deploymentEnabled.main: false`. Other branches remain enabled by default. This keeps production deployment in the Website workflow after validation succeeds.

To reconnect the integration, first ensure that configuration is on `main`, then select `namastack/namastack-website` in the existing Vercel project's **Settings → Git**. The Vercel GitHub app must have access to this repository. Keep the production branch set to `main` and PR deployment comments enabled.

### Project settings

Project settings:

- Root Directory: repository root (empty).
- Node.js: 22.x.
- Install Command: `npm ci`.
- Build Command: `npm run build`.
- Output Directory: `build`.

The workflow pulls project settings, builds with the pinned Vercel CLI, adds the legacy HTTP redirects from `vercel.json` before filesystem routes, and deploys the prebuilt output. Domains and existing deployments remain on the same Vercel project. Keep library publishing/signing and Codecov credentials in the library repository; only the three Vercel secrets belong here.

After a production deployment, verify the homepage, `/outbox/`, `/docs/quickstart/`, archived versions and legacy redirects on www.namastack.io. URLs, documentation versions and public content retain their existing structure.

## Outbox overview video

The homepage and `/outbox/` embed the showreel through `OutboxShowreel` in `src/components/MarketingPage/index.tsx`. Assets live in `static/videos/`. When replacing a film, update the video, poster and captions together and change versioned URLs to avoid stale caches.

## Origin

Extracted from `namastack/namastack-outbox`, directory `namastack-outbox-docs`, at source commit `8739f6eb89c5ee6d33855767f08890cf1326529e`. The documentation directory's Git history is preserved. The initial extraction does not introduce Once content or change public routes.
