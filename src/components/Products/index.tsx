import React, {useId, useState} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import {IconArrowRight, IconBrandGithub, IconCheck} from '@tabler/icons-react';
import SponsorSection from '@site/src/components/SponsorSection';
import outboxVersions from '@site/outbox_versions.json';
import onceVersions from '@site/once_versions.json';
import styles from './styles.module.css';

type Product = 'outbox' | 'once';

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
          <stop stopColor={product === 'once' ? '#b9fff3' : '#fff1a0'} />
          <stop offset=".23" stopColor={product === 'once' ? '#5eead4' : '#ffe259'} />
          <stop offset=".55" stopColor={product === 'once' ? '#148b80' : '#b19a2f'} />
          <stop offset=".8" stopColor={product === 'once' ? '#39cbb7' : '#e3c343'} />
          <stop offset="1" stopColor={product === 'once' ? '#085b55' : '#71601d'} />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={product === 'once' ? '#0f9488' : '#aa8f21'} />
          <stop offset="1" stopColor={product === 'once' ? '#063b38' : '#3e3515'} />
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
            stroke="#b9fff3"
            strokeOpacity=".38"
            strokeWidth="2"
          />
          <ellipse
            cx="200"
            cy="180"
            rx="133"
            ry="91"
            fill="none"
            stroke="#063b38"
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

export function ProductCards({
  documentation = false,
  compact = false,
}: {documentation?: boolean; compact?: boolean}) {
  return (
    <div className={`${styles.productGrid} ${compact ? styles.productChooser : ''}`}>
      {(['outbox', 'once'] as Product[]).map((product) => (
        <article key={product} className={styles.productCard} data-product={product}>
          <div className={styles.cardTop}>
            <span className={styles.eyebrow}>
              {product === 'outbox' ? 'Transactional outbox' : 'Transactional idempotency'}
            </span>
            <span className={styles.release}>
              {product === 'outbox' ? outboxVersions[0] : onceVersions[0]}
            </span>
          </div>
          <div className={styles.cardHeading}>
            <Heading as="h2">
              Namastack{compact ? ' ' : <br />}

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
          {!compact && <ul className={styles.checks}>
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
          </ul>}
          <div className={styles.cardActions}>
            <Link
              className={styles.primary}
              to={documentation ? `/${product}/quickstart/` : `/${product}/`}
            >
              {documentation
                ? 'Start the quickstart'
                : `Explore ${product === 'outbox' ? 'Outbox' : 'Once'}`}
              <IconArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              className={styles.textLink}
              to={documentation ? `/${product}/` : `/${product}/quickstart/`}
            >
              {documentation ? 'Product overview' : 'Quickstart'} →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProductVideo({product}: {product: Product}) {
  const name = product === 'once' ? 'Once' : 'Outbox';
  const file = product === 'once' ? 'namastack-once-v4' : 'namastack-outbox-v11';
  const captions = product === 'once' ? `${file}.en.vtt` : 'namastack-outbox-v10.en.vtt';
  return (
    <figure className={styles.film} data-product={product}>
      <figcaption>
        <span className={styles.eyebrow}>Namastack {name}</span>
        <Heading as="h3">
          {product === 'once' ? 'Once. Transactional idempotency.' : 'Every event matters.'}
        </Heading>
      </figcaption>
      <video
        key={product}
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

const outboxSnippet = `@Transactional
public void place(Order order) {
    orders.save(order);
    outbox.schedule(
        new OrderPlaced(order.id()),
        order.id().toString()
    );
}`;

function ProductSpotlight({product}: {product: Product}) {
  const isOnce = product === 'once';
  return (
    <section
      className={`${styles.spotlight} ${isOnce ? styles.onceSpotlight : ''}`}
      data-product={product}
      aria-labelledby={`${product}-spotlight`}
    >
      <div className={styles.container}>
        <div className={styles.spotlightGrid}>
          <div className={styles.spotlightCopy}>
            <div className={styles.spotlightIdentity}>
              <ProductGlyph product={product} />
              <span className={styles.eyebrow}>Namastack {isOnce ? 'Once' : 'Outbox'}</span>
            </div>
            <Heading as="h2" id={`${product}-spotlight`}>
              {isOnce ? <>Accept the retry.<br />Skip the duplicate.</> : <>Commit the intent.<br />Deliver after the commit.</>}
            </Heading>
            <p>
              {isOnce
                ? 'Retries are part of delivery. Give each operation a stable identity, commit its marker with your business writes, and skip work that already succeeded.'
                : 'Save outgoing work beside your business data in one transaction. Outbox delivers it asynchronously, with per-key ordering and retries when a destination recovers.'}
            </p>
            <div className={styles.actions}>
              <Link className={styles.primary} to={`/${product}/quickstart/`}>
                Build with {isOnce ? 'Once' : 'Outbox'}
                <IconArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className={styles.textLink} to={`/${product}/`}>Explore the documentation →</Link>
            </div>
            {isOnce ? <OnceCode /> : (
              <div className={styles.codePanel}>
                <div className={styles.codeLabel}>One transaction. Business data + outgoing work.</div>
                <CodeBlock language="java">{outboxSnippet}</CodeBlock>
              </div>
            )}
          </div>
          <div className={styles.spotlightMedia}>
            <ProductVideo product={product} />
            <p className={styles.spotlightNote}>
              {isOnce
                ? 'A local transaction protects the business effect. Remote calls stay outside that boundary.'
                : 'Committed work is delivered at least once. Consumers own their acknowledgement and duplicate handling.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductHome() {
  return (
    <main className={styles.page}>
      <header className={styles.homeHero}>
        <div className={styles.container}>
          <div className={styles.homeIntro}>
            <span className={styles.eyebrow}>Namastack · Open source · Spring Boot</span>
            <Heading as="h1">
              Your business commits.<br />
              <em>Reliability follows.</em>
            </Heading>
            <p>
              Keep outgoing work with your business data. Protect incoming operations from duplicates.
              Focused libraries that make your database transaction a reliable foundation.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primary} to="#projects">
                Find your starting point <IconArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className={styles.secondary} to="#together">See how they work together</Link>
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
      <section className={styles.chooserSection} aria-labelledby="projects">
        <div className={styles.container}>
          <div className={styles.chooserHeading}>
            <Heading as="h2" id="projects">Start at the boundary you need.</Heading>
            <p>Use either library independently. Combine them when work crosses services.</p>
          </div>
          <ProductCards compact />
        </div>
      </section>
      <ProductSpotlight product="outbox" />
      <ProductSpotlight product="once" />
      <section className={styles.surface} aria-labelledby="together">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>Better together</span>
            <Heading as="h2" id="together">Deliver reliably. Commit the effect once.</Heading>
            <p>
              Outbox delivers committed work at least once. Once protects the receiving service’s
              local transaction. Preserve the event identity and retain its marker across retries
              to keep repeated delivery from repeating a committed business effect.
            </p>
          </div>
          <ol className={styles.flow}>
            {[
              ['Business transaction', 'Save data + outgoing work', undefined],
              ['Outbox', 'Deliver with ordering + retries', 'outbox'],
              ['Message broker', 'Carry the stable event identity', undefined],
              ['Once', 'Reserve + execute + commit', 'once'],
              ['Business transaction', 'Protect the local business effect', undefined],
            ].map(([step, detail, product], index) => (
              <li key={index} data-product={product}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step}</strong>
                <small>{detail}</small>
              </li>
            ))}
          </ol>
          <Link className={styles.textLink} to="/once/reference/usage/integrations/#effectively-once-business-processing">
            Understand the combined guarantee →
          </Link>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="start-building">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>From an example to your application</span>
            <Heading as="h2" id="start-building">A familiar Spring Boot starting point.</Heading>
            <p>
              Constructor injection, your database, and application-owned migrations.
              Explore working examples and bring your questions to the community.
            </p>
          </div>
          <div className={styles.resourceLinks}>
            <Link to="/docs/">Explore the documentation <IconArrowRight size={19} aria-hidden="true" /></Link>
            <Link href="https://github.com/namastack">Browse the examples on GitHub <IconBrandGithub size={19} aria-hidden="true" /></Link>
            <Link href="https://github.com/namastack/namastack-outbox/discussions">Join the discussion <IconArrowRight size={19} aria-hidden="true" /></Link>
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
    () -> orderService.create(requestId)
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
