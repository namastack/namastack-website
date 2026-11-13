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
npm run verify:site
npm run serve
```

The production build is written to `build/`. Pull requests and pushes to `main` run the Website workflow to typecheck and build the site.

## Products, documentation and independent versions

Public routes:

- `/`: shared Namastack homepage.
- `/outbox/` and `/once/`: product pages.
- `/docs/`: product documentation chooser.
- `/docs/outbox/`: latest Outbox release-line documentation; `/docs/outbox/next/` is development.
- `/docs/once/`: the `0.1.x Preview` documentation snapshot; `/docs/once/next/` is development.

Each product is a separate Docusaurus docs instance. Outbox retains the default instance so its existing version history and CLI remain compatible. Once uses plugin ID `once`.

| Content | Outbox | Once |
|---|---|---|
| Development source | `docs/` | `docs-once/` |
| Versions | `versions.json` | `once_versions.json` |
| Published snapshots | `versioned_docs/` | `once_versioned_docs/` |
| Versioned sidebars | `versioned_sidebars/` | `once_versioned_sidebars/` |
| Development sidebar | `sidebars.ts` | `sidebarsOnce.ts` |

Correct a published snapshot in its product's versioned directory and update development docs where appropriate. Deploying the site never creates a documentation snapshot.

Create an independent new release-line snapshot with one of these commands:

```sh
npm run docs:version:outbox -- 2.0.x
npm run docs:version:once -- 0.2.x
```

Use the actual new documentation line. The wrapper invokes Docusaurus for that product only, then synchronizes `vercel.json` redirects with the version catalog. Commit the snapshot, version list, sidebar and any redirect changes together. The first version in each catalog is served at the product's docs root; older versions keep their version in the URL.

Once is not published as a stable library yet. Its `0.1.x` snapshot is explicitly labeled Preview and uses `0.1.0-SNAPSHOT` examples, with local-source instructions. When publishing its first stable documentation, update the preview labels/banner, artifact coordinates, sitemap exclusion and robots rules together. No library release workflow changes these docs automatically.

The navbar displays only the active product's version selector. Search selects the matching product context and offers both projects globally. Shared sponsorship, contributor and legal pages live outside product versioning.

### Existing links

Former `/docs/quickstart/`, `/docs/reference/`, `/docs/<version>/...` and earlier `/outbox/...` documentation URLs redirect to their corresponding Outbox destinations. `/docs/` remains the shared entry point and `/outbox/` remains the product page. Shared-page links redirect to `/sponsor/`, `/contributing/` and `/legal-notice/`.

`site-products.cjs` owns the legacy route catalog. `npm run sync:redirects` regenerates HTTP redirects; the build plugin emits matching static-host fallbacks. Queries and fragments are preserved. `npm test` checks HTTP routing, and `npm run verify:site` checks generated pages, independent version menus, archives and static redirects after a build.

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

After a production deployment, verify the homepage, both product pages, `/docs/`, both documentation areas, archived versions and legacy redirects on www.namastack.io. URLs, documentation versions and public content retain their existing structure.

## Outbox overview video

The homepage and `/outbox/` embed the Outbox showreel through `OutboxShowreel` in `src/components/MarketingPage/index.tsx`. Assets live in `static/videos/`. When replacing a film, update the video, poster and captions together and change versioned URLs to avoid stale caches.

## Once visual identity and showreel

The Once page uses the golden ring from the Once showreel as a native SVG product mark. The supplied poster, MP4 and converted English captions are under `static/videos/namastack-once-v1.*`. Native video controls, `preload="none"` and versioned asset names match the Outbox video. Update the complete asset set together when replacing the film.

## Origin

Extracted from `namastack/namastack-outbox`, directory `namastack-outbox-docs`, at source commit `8739f6eb89c5ee6d33855767f08890cf1326529e`. The documentation directory's Git history is preserved. The initial extraction does not introduce Once content or change public routes.
