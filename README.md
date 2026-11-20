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
- `/outbox/` and `/once/`: product introductions and the starting pages of their documentation, with the same sidebar and version selector as the rest of the docs.
- `/outbox/`: latest Outbox release-line documentation; `/outbox/next/` is development.
- `/once/`: the `0.1.x` release-line documentation, starting with Once `0.1.0`; `/once/next/` is development.
- `/docs/`: a compatibility chooser linking to both products, absent from the primary navigation.

The main navigation links directly to Outbox and Once. Each product starts with an Overview, followed by Quickstart and an always-expanded Reference section with grouped technical topics. Both products use the same Reference landing-page component. Once technical pages live under `/once/reference/`, matching Outbox; former Once topic URLs redirect to the new paths. Outbox migration guides remain dedicated documents within their target version. The upcoming 2.0 guide appears in Next, while 1.x sidebars and overview cards stay within their selected version.

Both projects share `/support-and-update-policy/`. Product support-policy URLs redirect there; each project retains its own `/outbox/security-policy/` or `/once/security-policy/`. These policies are independent of documentation versions.

Each product is a separate Docusaurus docs instance, with plugin IDs `outbox` and `once`. Source folder names are independent of public URLs. Docusaurus derives version-catalog and snapshot-directory names from each plugin ID, so retain these prefixes when adding snapshots.

| Content | Outbox | Once |
|---|---|---|
| Development source | `docs-outbox/` | `docs-once/` |
| Versions | `outbox_versions.json` | `once_versions.json` |
| Published snapshots | `outbox_versioned_docs/` | `once_versioned_docs/` |
| Versioned sidebars | `outbox_versioned_sidebars/` | `once_versioned_sidebars/` |
| Development sidebar | `sidebarsOutbox.ts` | `sidebarsOnce.ts` |

Correct a published snapshot in its product's versioned directory and update development docs where appropriate. Deploying the site never creates a documentation snapshot.

### Documentation release process

After publishing the first stable library release in a new major or minor line, run
**Prepare Docs Release** in this repository's GitHub Actions. Select `outbox` or
`once` and enter the documentation line, for example `2.0.x` for Outbox `2.0.0`.
The workflow snapshots that product's development docs and sidebar from `main`,
synchronizes redirects, runs all website checks, and opens a release pull request.
It also starts Website validation explicitly because pushes made with
`GITHUB_TOKEN` do not trigger pull request workflows.

Before running it, make sure the development docs describe the released library.
Before merging the PR, check dependency examples against the published artifact
version, migration guidance, and the shared security policy. Merge the PR to
publish through the existing Website production workflow. The workflow needs the
repository setting **Allow GitHub Actions to create and approve pull requests**.
It uses `GITHUB_TOKEN`; no cross-repository credentials are required.

Patch releases share their existing documentation line: update that product's
published snapshot and development docs as appropriate through a normal PR.
Prereleases stay in Next. A new snapshot must be a newer line; existing lines
are never overwritten by the release workflow.

For example: publish Outbox `2.0.0`, prepare Outbox docs `2.0.x`, review and merge
the docs PR, then verify `/outbox/`, its quickstart and migration guide, the
version selector, archived `1.11.x` docs and legacy redirects. Once is versioned
and released independently by the same process.

You can also create a new release-line snapshot locally:

```sh
npm run docs:version:outbox -- 2.0.x
npm run docs:version:once -- 0.2.x
```

Use the actual new documentation line. The wrapper invokes Docusaurus for that product only, then synchronizes `vercel.json` redirects with the version catalog. Commit the snapshot, version list, sidebar and any redirect changes together. The first version in each catalog is served at the product's docs root; older versions keep their version in the URL.

Once's first release is `0.1.0`. The `0.1.x` documentation line uses released Maven Central artifacts; `/once/next/` remains the separate development version. The latest released documentation is indexable, while Next and archived release lines are excluded from indexing. No library release workflow changes these docs automatically.

The navbar displays only the active product's version selector. Search selects the matching product context and offers both projects globally. Shared sponsorship, contributor and legal pages live outside product versioning.

### Existing links

Former `/docs/quickstart/`, `/docs/reference/`, `/docs/<version>/...` and `/docs/outbox/...` documentation URLs redirect to their corresponding `/outbox/...` destinations. `/docs/once/...` redirects to `/once/...`. Existing `/outbox/...` documentation URLs are served directly. Latest-version aliases use temporary redirects so they remain valid when a new release line is published. Shared-page links redirect to `/sponsor/`, `/contributing/` and `/legal-notice/`.

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

After a production deployment, verify the homepage, both product pages, `/docs/`, both documentation areas, archived versions and legacy redirects on www.namastack.io. Older documentation URLs redirect to the corresponding product and version; both products retain independent version histories.

## Outbox overview video

The homepage and `/outbox/` embed the Outbox showreel through `ProductVideo` in `src/components/Products/index.tsx`. Assets live in `static/videos/`. When replacing a film, update the video, poster and captions together and change versioned URLs to avoid stale caches.

## Once visual identity and showreel

Once uses teal accents in light and dark mode; Outbox retains the Namastack yellow. Product colors
are scoped by the route through `src/theme/Layout` and by `data-product` on shared-page sections.
The Once mark is a native SVG ring, shared visually with the current showreel.

The homepage and Once documentation use the approved v4 film with stationary text holds. Its MP4,
poster and English captions are under `static/videos/namastack-once-v4.*`. Outbox uses the v11
video and poster with the v10 English captions. Native video controls, `preload="none"` and
versioned URLs keep playback accessible and avoid stale caches.

Homepage sections and video players live in `src/components/Products`. Product documentation
overviews use `src/components/ProductOverview`; the shared sponsorship callout lives in
`src/components/SponsorSection`. Update the video, poster and captions together when replacing a film.

## Origin

Extracted from `namastack/namastack-outbox`, directory `namastack-outbox-docs`, at source commit `8739f6eb89c5ee6d33855767f08890cf1326529e`. The documentation directory's Git history is preserved. The initial extraction does not introduce Once content or change public routes.
