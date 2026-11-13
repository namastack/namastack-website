import React, {useId, useState} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import {
  IconArrowRight,
  IconBrandGithub,
  IconCheck,
  IconDatabase,
  IconFingerprint,
  IconRefresh,
  IconActivity,
  IconShieldCheck,
  IconCode,
} from '@tabler/icons-react';
import {SponsorSection} from '@site/src/components/MarketingPage';
import outboxVersions from '@site/versions.json';
import onceVersions from '@site/once_versions.json';
import styles from './styles.module.css';

type Product = 'outbox' | 'once';
const github = (product: Product) => `https://github.com/namastack/namastack-${product}`;

export function ProductGlyph({product, large = false}: {product: Product; large?: boolean}) {
  const id = useId().replaceAll(':', '');
  return (
    <svg
      viewBox="0 0 400 360"
      className={large ? styles.largeGlyph : styles.glyph}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff1a0" />
          <stop offset=".23" stopColor="#ffe259" />
          <stop offset=".55" stopColor="#b19a2f" />
          <stop offset=".8" stopColor="#e3c343" />
          <stop offset="1" stopColor="#71601d" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#aa8f21" />
          <stop offset="1" stopColor="#3e3515" />
        </linearGradient>
      </defs>
      {product === 'once' ? (
        <g transform="rotate(28 200 180)">
          <ellipse
            cx="200"
            cy="195"
            rx="147"
            ry="105"
            fill="none"
            stroke={`url(#${id}-edge)`}
            strokeWidth="30"
          />
          <ellipse
            cx="200"
            cy="180"
            rx="147"
            ry="105"
            fill="none"
            stroke={`url(#${id}-gold)`}
            strokeWidth="27"
          />
          <ellipse
            cx="200"
            cy="176"
            rx="151"
            ry="109"
            fill="none"
            stroke="#fff1a0"
            strokeOpacity=".38"
            strokeWidth="2"
          />
          <ellipse
            cx="200"
            cy="180"
            rx="133"
            ry="91"
            fill="none"
            stroke="#392f0c"
            strokeOpacity=".6"
            strokeWidth="3"
          />
        </g>
      ) : (
        <g fill="none" stroke={`url(#${id}-gold)`} strokeWidth="5" strokeLinejoin="round">
          <path
            d="M200 48 336 124 336 264 200 338 64 264 64 124Z"
            fill="currentColor"
            fillOpacity=".03"
          />
          <path d="M64 124 200 200 336 124M200 200V338M132 86 268 162" />
          <path d="M93 142 93 246 173 289" strokeOpacity=".25" />
        </g>
      )}
    </svg>
  );
}

export function ProductCards({documentation = false}: {documentation?: boolean}) {
  return (
    <div className={styles.productGrid}>
      {(['outbox', 'once'] as Product[]).map((product) => (
        <article key={product} className={styles.productCard}>
          <div className={styles.cardTop}>
            <span className={styles.eyebrow}>
              {product === 'outbox' ? 'Transactional outbox' : 'Transactional idempotency'}
            </span>
            <span className={styles.release}>
              {product === 'outbox' ? outboxVersions[0] : `${onceVersions[0]} Preview`}
            </span>
          </div>
          <div className={styles.cardHeading}>
            <Heading as="h2">
              Namastack
              <br />
              {product === 'outbox' ? 'Outbox' : 'Once'}
              <span className={styles.dot}>.</span>
            </Heading>
            <ProductGlyph product={product} />
          </div>
          <p>
            {product === 'outbox'
              ? 'Commit outgoing work with your business data. Deliver it asynchronously, with ordering and retries.'
              : 'Commit your business operation and its marker together. Skip duplicate invocations with the same scope and key.'}
          </p>
          <ul className={styles.checks}>
            {(product === 'outbox'
              ? [
                  'At-least-once delivery',
                  'Ordering, retries and horizontal scaling',
                  'JDBC, MongoDB and messaging integrations',
                ]
              : [
                  'Transactional duplicate protection',
                  'Annotations and programmatic APIs',
                  'JDBC, MongoDB and observability',
                ]
            ).map((item) => (
              <li key={item}>
                <IconCheck size={16} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <div className={styles.cardActions}>
            <Link
              className={styles.primary}
              to={documentation ? `/docs/${product}/quickstart/` : `/${product}/`}
            >
              {documentation
                ? 'Start the quickstart'
                : `Explore ${product === 'outbox' ? 'Outbox' : 'Once'}`}
              <IconArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className={styles.textLink} to={`/docs/${product}/`}>
              {documentation ? 'Browse documentation' : 'Documentation'} →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProductVideo({product}: {product: Product}) {
  const name = product === 'once' ? 'Once' : 'Outbox';
  const file = product === 'once' ? 'namastack-once-v1' : 'namastack-outbox-v11';
  const captions = product === 'once' ? `${file}.en.vtt` : 'namastack-outbox-v10.en.vtt';
  return (
    <figure className={styles.film}>
      <figcaption>
        <span className={styles.eyebrow}>Namastack {name}</span>
        <Heading as="h3">
          {product === 'once' ? 'Once. Transactional idempotency.' : 'Every event matters.'}
        </Heading>
      </figcaption>
      <video
        controls
        playsInline
        preload="none"
        width="1920"
        height="1080"
        poster={`/videos/${file}.png`}
        aria-label={`Namastack ${name} overview`}
      >
        <source src={`/videos/${file}.mp4`} type="video/mp4" />
        <track kind="captions" src={`/videos/${captions}`} srcLang="en" label="English" />
        <a href={`/videos/${file}.mp4`}>Download the {name} overview.</a>
      </video>
    </figure>
  );
}

export function ProductHome() {
  return (
    <main className={styles.page}>
      <header className={styles.homeHero}>
        <div className={styles.container}>
          <div className={styles.homeHeroGrid}>
            <div className={styles.homeIntro}>
              <span className={styles.eyebrow}>Open source · Spring Boot</span>
              <Heading as="h1">
                Reliable events.
                <br />
                <em>Idempotent operations.</em>
              </Heading>
              <p>
                Two focused libraries for dependable applications. Deliver committed work with
                Outbox. Protect local business operations from duplicates with Once.
              </p>
              <div className={styles.actions}>
                <Link className={styles.primary} to="#projects">
                  Explore the projects <IconArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link className={styles.secondary} to="/docs/">
                  Read the docs
                </Link>
              </div>
            </div>
            <div className={styles.dualArt} aria-hidden="true">
              <div>
                <ProductGlyph product="outbox" large />
                <span>OUTBOX / DELIVER</span>
              </div>
              <div>
                <ProductGlyph product="once" large />
                <span>ONCE / PROTECT</span>
              </div>
            </div>
          </div>
          <div className={styles.facts}>
            <span>Java & Kotlin</span>
            <span>Your database</span>
            <span>Apache 2.0</span>
            <span>Built for Spring Boot</span>
          </div>
        </div>
      </header>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>The Namastack projects</span>
            <Heading as="h2" id="projects">
              Two boundaries.
              <br />A reliable foundation.
            </Heading>
            <p>
              Start with the capability your application needs. Both libraries work independently
              and fit your existing Spring Boot application.
            </p>
          </div>
          <ProductCards />
        </div>
      </section>
      <section className={styles.surface}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>From producer to consumer</span>
            <Heading as="h2">Use either library, or connect both.</Heading>
            <p>
              Outgoing work commits in the producer’s database. Delivery may repeat. A consumer uses
              a stable identity to protect its own local transaction.
            </p>
          </div>
          <ol className={styles.flow}>
            {[
              'Business transaction',
              'Outbox',
              'Message broker',
              'Once',
              'Business transaction',
            ].map((step, index) => (
              <li key={index}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {step}
              </li>
            ))}
          </ol>
          <Link className={styles.textLink} to="/docs/once/usage/integrations/">
            See how Outbox and Once work together →
          </Link>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>Meet the projects</span>
            <Heading as="h2">A closer look.</Heading>
          </div>
          <div className={styles.filmGrid}>
            <ProductVideo product="outbox" />
            <ProductVideo product="once" />
          </div>
        </div>
      </section>
      <SponsorSection />
    </main>
  );
}

const snippets = {
  annotation: `@Idempotent(scope = "orders.create")
public void create(@IdempotencyKey UUID requestId) {
    orderService.create(requestId);
}`,
  programmatic: `IdempotencyResult<Order> result = once.execute(
    IdempotencyRequest.of("orders.create", requestId),
    () -> IdempotencyResult.executed(
        orderService.create(requestId)
    )
);`,
};

function OnceCode() {
  const [tab, setTab] = useState<keyof typeof snippets>('annotation');
  const id = useId();
  return (
    <div className={styles.codePanel}>
      <div role="tablist" aria-label="Once API" className={styles.codeTabs}>
        {(['annotation', 'programmatic'] as const).map((value) => (
          <button
            type="button"
            role="tab"
            key={value}
            id={`${id}-${value}`}
            aria-selected={tab === value}
            aria-controls={`${id}-panel`}
            tabIndex={tab === value ? 0 : -1}
            onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 'annotation'
                  : event.key === 'End'
                    ? 'programmatic'
                    : value === 'annotation'
                      ? 'programmatic'
                      : 'annotation';
              setTab(next);
              document.getElementById(`${id}-${next}`)?.focus();
            }}
            onClick={() => setTab(value)}
          >
            {value === 'annotation' ? 'Annotation API' : 'Programmatic API'}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${tab}`}>
        <CodeBlock language="java">{snippets[tab]}</CodeBlock>
      </div>
      <p>Once owns the transaction. Invoke this boundary outside an existing transaction.</p>
    </div>
  );
}

const features = [
  {
    icon: IconFingerprint,
    title: 'A stable identity',
    text: 'Explicit scopes and keys identify the operation across retries, redelivery and application instances.',
  },
  {
    icon: IconShieldCheck,
    title: 'One local transaction',
    text: 'Commit the marker and business writes together. An action failure rolls them back together.',
  },
  {
    icon: IconRefresh,
    title: 'Duplicates skip work',
    text: 'A stored marker skips the action. Use an explicit duplicate result when the caller needs to know.',
  },
  {
    icon: IconDatabase,
    title: 'Your existing database',
    text: 'Use JDBC or native MongoDB transactions. Provision the marker store through your migration tooling.',
  },
  {
    icon: IconCode,
    title: 'Two focused APIs',
    text: 'Protect a Spring bean method with an annotation or call IdempotencyOperations directly.',
  },
  {
    icon: IconActivity,
    title: 'Operate with confidence',
    text: 'Configure marker retention and cleanup. Observe execution and cleanup with optional Micrometer instrumentation.',
  },
];

export function OnceContent() {
  return (
    <main className={styles.page}>
      <header className={styles.onceHero}>
        <div className={styles.container}>
          <div className={styles.onceHeroGrid}>
            <div>
              <span className={styles.eyebrow}>Namastack Once · {onceVersions[0]} Preview</span>
              <Heading as="h1">
                Once<span className={styles.dot}>.</span>
              </Heading>
              <p className={styles.onceTagline}>Transactional idempotency.</p>
              <p className={styles.lead}>
                Protect a local business operation with a stable scope and key. Commit its marker
                with your business data, and skip duplicate invocations.
              </p>
              <div className={styles.actions}>
                <Link className={styles.primary} to="/docs/once/quickstart/">
                  Get started <IconArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link className={styles.secondary} href={github('once')}>
                  <IconBrandGithub size={18} aria-hidden="true" /> GitHub
                </Link>
              </div>
              <p className={styles.previewNote}>
                Java & Kotlin · JDBC & MongoDB · Spring Boot
                <br />
                Preview builds: 0.1.0-SNAPSHOT. No stable release yet.
              </p>
            </div>
            <div className={styles.onceArt}>
              <ProductGlyph product="once" large />
              <span>RESERVE / EXECUTE / COMMIT</span>
            </div>
          </div>
        </div>
      </header>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.codeLayout}>
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>A small boundary. A clear contract.</span>
              <Heading as="h2">
                Handle the operation.
                <br />
                Let Once handle the duplicate.
              </Heading>
              <p>
                Keep business logic in your application. Once reserves the identity, runs the
                synchronous action and returns after transaction completion.
              </p>
              <Link className={styles.textLink} to="/docs/once/concepts/transactions/">
                Understand the guarantees →
              </Link>
            </div>
            <OnceCode />
          </div>
          <div className={styles.featureGrid}>
            {features.map(({icon: Icon, title, text}) => (
              <article key={title}>
                <Icon size={24} aria-hidden="true" />
                <Heading as="h3">{title}</Heading>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.surface}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>Watch the overview</span>
            <Heading as="h2">The transaction is the boundary.</Heading>
            <p>
              Remote calls and writes to other database resources sit outside the guarantee. Use
              Outbox for durable outgoing work inside the local transaction.
            </p>
          </div>
          <ProductVideo product="once" />
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>Start with a working example</span>
            <Heading as="h2">Put Once into your application.</Heading>
            <p>
              Provision the marker schema, choose a stable identity and protect your application
              boundary. The guide covers the transaction contract from the first example.
            </p>
          </div>
          <div className={styles.actions}>
            <Link className={styles.primary} to="/docs/once/quickstart/">
              Read the quickstart <IconArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className={styles.secondary} to="/docs/once/examples/">
              Explore the examples
            </Link>
          </div>
        </div>
      </section>
      <SponsorSection />
    </main>
  );
}
