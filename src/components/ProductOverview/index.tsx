import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Head from '@docusaurus/Head';
import {useDoc, useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import {IconArrowRight, IconBrandGithub} from '@tabler/icons-react';
import {ProductGlyph, ProductVideo} from '@site/src/components/Products';
import styles from './styles.module.css';

type Product = 'outbox' | 'once';
const information = {
  outbox: {
    name: 'Outbox',
    tagline: 'Transactional event delivery.',
    description:
      'Commit outgoing work with your business data. Deliver it asynchronously with ordering, retries and observability.',
    steps: [
      ['Commit together', 'Business data and the Outbox record share one local transaction.'],
      [
        'Deliver reliably',
        'Committed work is processed asynchronously with at-least-once delivery.',
      ],
      [
        'Recover from failure',
        'Retries and per-key ordering keep delivery moving when a destination recovers.',
      ],
    ],
  },
  once: {
    name: 'Once',
    tagline: 'Transactional idempotency.',
    description:
      'Protect a local business operation with a stable scope and key. Commit its marker with your business data and skip duplicate invocations.',
    steps: [
      [
        'Identify the operation',
        'A stable scope and key identify the same operation across retries and redelivery.',
      ],
      [
        'Commit together',
        'Once owns the local transaction for the marker and the protected business writes.',
      ],
      [
        'Skip duplicates',
        'A stored marker skips the action. A failure rolls back both marker and business writes.',
      ],
    ],
  },
};

export default function ProductOverview({product}: {product: Product}) {
  const {metadata} = useDoc();
  const version = useDocsVersion();
  const root = metadata.permalink.replace(/\/$/, '');
  const info = information[product];
  const referenceRoot = `${root}/reference`;
  const hasV2Migration = version.version === 'current' || Number.parseInt(version.version, 10) >= 2;
  const cards = [
    {
      title: 'Quickstart',
      description: 'Install a starter and run your first working example.',
      to: `${root}/quickstart/`,
    },
    {
      title: 'Reference',
      description: 'Understand the transaction boundary and the core processing model.',
      to: `${referenceRoot}/`,
    },
    {
      title: 'Configuration',
      description: 'Find properties, defaults and operational settings.',
      to: `${referenceRoot}/configuration/`,
    },
    product === 'outbox'
      ? hasV2Migration
        ? {
            title: 'Upgrade to 2.0',
            description:
              'Upgrade from 1.11.1 with guidance on transactions, persistence and configuration.',
            to: `${root}/migrations/2-0-0/`,
          }
        : {
            title: 'Delivery guarantees',
            description:
              'Understand ordering, retries and consumer responsibilities for this version.',
            to: `${root}/reference/guarantees/`,
          }
      : {
          title: 'Integrations and examples',
          description: 'Use Once with Outbox and messaging.',
          to: `${referenceRoot}/usage/integrations/`,
        },
  ];
  return (
    <div className={styles.overview}>
      <Head>
        <meta
          property="og:image"
          content={
            product === 'once'
              ? 'https://www.namastack.io/videos/namastack-once-v1.png'
              : 'https://www.namastack.io/img/og-image-v3.png'
          }
        />
      </Head>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Namastack · Spring Boot</span>
          <Heading as="h1">
            {info.name}
            <span className={styles.dot}>.</span>
          </Heading>
          <p className={styles.tagline}>{info.tagline}</p>
          <p className={styles.description}>{info.description}</p>
          <div className={styles.actions}>
            <Link className={styles.primary} to={`${root}/quickstart/`}>
              Get started <IconArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              className={styles.secondary}
              href={`https://github.com/namastack/namastack-${product}`}
            >
              <IconBrandGithub size={17} aria-hidden="true" /> GitHub
            </Link>
          </div>
        </div>
        <div className={styles.mark}>
          <ProductGlyph product={product} large />
        </div>
      </header>
      <section className={styles.section} aria-label={`${info.name} execution model`}>
        <div className={styles.steps}>
          {info.steps.map(([title, text], index) => (
            <article key={title}>
              <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>
              <Heading as="h2">{title}</Heading>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      {product === 'once' && (
        <aside className={styles.boundary}>
          <strong>One local transaction.</strong> Invoke Once outside an existing transaction. The
          protected action and its marker commit together; remote effects and writes to another
          database are outside this guarantee. Once skips duplicates without replaying a previous
          return value.{' '}
          <Link to={`${referenceRoot}/concepts/transactions/`}>
            Read the transaction guarantees →
          </Link>
        </aside>
      )}
      <section className={styles.section}>
        <Heading as="h2">Start building with {info.name}.</Heading>
        <p className={styles.description}>
          Use the sidebar to explore this version, or start with one of these guides.
        </p>
        <div className={styles.guides}>
          {cards.map((card) => (
            <Link key={card.title} className={styles.guide} to={card.to}>
              <Heading as="h3">
                {card.title}
                <IconArrowRight size={16} aria-hidden="true" />
              </Heading>
              <p>{card.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <Heading as="h2">Meet Namastack {info.name}.</Heading>
        <ProductVideo product={product} />
      </section>
    </div>
  );
}
