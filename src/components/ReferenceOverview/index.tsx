import type {ComponentType, ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import {
  IconAppsFilled,
  IconChartBar,
  IconDatabase,
  IconDeviceHeartMonitorFilled,
  IconFileSettingsFilled,
  IconRollercoasterFilled,
  IconShieldCheckeredFilled,
} from '@tabler/icons-react';
import styles from './styles.module.css';

type VersionedReferenceItem = {
  title: string;
  link: string;
  sinceVersion?: string;
  untilVersion?: string;
  excludeInVersion?: string[];
};

type ReferenceGroup = {
  title: string;
  description: string;
  icon: ComponentType<{size?: number; 'aria-hidden'?: boolean}>;
  items: VersionedReferenceItem[];
};

const outboxReferenceGroups: ReferenceGroup[] = [
  {
    title: 'Core Concepts',
    description:
      'Processing model, delivery guarantees, scheduling, handlers, and the processing chain.',
    icon: IconShieldCheckeredFilled,
    items: [
      {title: 'Core Features', link: 'core/'},
      {title: 'Reliability Guarantees', link: 'guarantees/'},
      {title: 'Record Scheduling', link: 'scheduling/'},
      {title: 'Handlers', link: 'handlers/'},
      {title: 'Processing Chain', link: 'processing/'},
      {title: 'Processing Groups', link: 'processing-groups/', sinceVersion: '2.0.x'},
    ],
  },
  {
    title: 'Persistence',
    description: 'Persistence modules, supported databases, schema details, and record retention.',
    icon: IconDatabase,
    items: [
      {title: 'Persistence Modules', link: 'persistence/'},
      {title: 'Database Support', link: 'database/'},
      {title: 'Record Retention', link: 'retention/', sinceVersion: '1.11.x'},
    ],
  },
  {
    title: 'Integrations',
    description: 'Messaging and Spring integrations supported by Namastack Outbox.',
    icon: IconAppsFilled,
    items: [
      {title: 'Messaging Integrations', link: 'messaging/', sinceVersion: '1.1.x'},
      {title: 'Spring Modulith Integration', link: 'spring-modulith/', sinceVersion: '1.7.x'},
    ],
  },
  {
    title: 'Processing & Resilience',
    description: 'Polling, retries, concurrency, and safe behavior during deployments.',
    icon: IconDeviceHeartMonitorFilled,
    items: [
      {title: 'Polling Strategies', link: 'polling/', sinceVersion: '1.1.x'},
      {title: 'Retry Mechanisms', link: 'retry/'},
      {title: 'Virtual Threads Support', link: 'virtual-threads/'},
      {title: 'Rolling Deployments', link: 'rolling-deployments/', sinceVersion: '1.10.x'},
    ],
  },
  {
    title: 'Observability',
    description: 'Metrics, tracing, monitoring, and context propagation.',
    icon: IconChartBar,
    items: [
      {title: 'Monitoring', link: 'monitoring/', untilVersion: '1.1.x'},
      {title: 'Observability', link: 'observability/', sinceVersion: '1.2.x'},
      {title: 'Context Propagation', link: 'context-propagation/'},
    ],
  },
  {
    title: 'Advanced',
    description: 'Performance tuning and payload serialization.',
    icon: IconRollercoasterFilled,
    items: [
      {title: 'Performance Tuning', link: 'performance-tuning/', sinceVersion: '1.7.x'},
      {title: 'Serialization', link: 'serialization/'},
    ],
  },
  {
    title: 'Configuration',
    description: 'Configuration properties, defaults, and available settings.',
    icon: IconFileSettingsFilled,
    items: [{title: 'Configuration', link: 'configuration/'}],
  },
];

const onceReferenceGroups: ReferenceGroup[] = [
  {
    title: 'Core Concepts',
    description: 'Identity, transaction guarantees, and annotation and programmatic APIs.',
    icon: IconShieldCheckeredFilled,
    items: [
      {title: 'Scope and Key', link: 'concepts/identity/'},
      {title: 'Transactions and Guarantees', link: 'concepts/transactions/'},
      {title: 'Annotation API', link: 'usage/annotations/'},
      {title: 'Programmatic API', link: 'usage/programmatic/'},
    ],
  },
  {
    title: 'Persistence',
    description: 'Supported databases, schema provisioning, marker retention, and cleanup.',
    icon: IconDatabase,
    items: [
      {title: 'JDBC Persistence', link: 'persistence/jdbc/'},
      {title: 'MongoDB Persistence', link: 'persistence/mongodb/'},
      {title: 'Retention and Cleanup', link: 'operations/retention/'},
    ],
  },
  {
    title: 'Integrations',
    description: 'Combine Once with Outbox and messaging for effectively-once business processing.',
    icon: IconAppsFilled,
    items: [{title: 'Outbox and Messaging', link: 'usage/integrations/'}],
  },
  {
    title: 'Observability',
    description: 'Execution and cleanup observations, metrics, tracing, and instrumentation.',
    icon: IconChartBar,
    items: [{title: 'Observability', link: 'operations/observability/'}],
  },
  {
    title: 'Advanced',
    description: 'Named Once instances and explicit resource and transaction-manager selection.',
    icon: IconRollercoasterFilled,
    items: [{title: 'Multiple Once Instances', link: 'persistence/multiple-instances/'}],
  },
  {
    title: 'Configuration',
    description: 'Configuration properties, defaults, customization, and troubleshooting.',
    icon: IconFileSettingsFilled,
    items: [{title: 'Configuration', link: 'configuration/'}],
  },
  {
    title: 'Examples',
    description: 'Runnable Java, Kotlin, database, and messaging applications.',
    icon: IconAppsFilled,
    items: [{title: 'Runnable Examples', link: 'examples/'}],
  },
];

function parseVersionParts(version: string): Array<number | null> {
  return version.split('.').map((part) => (part === 'x' ? null : Number(part)));
}

function normalizeParts(parts: Array<number | null>, wildcardMax = false, length = 3): number[] {
  const normalized: number[] = [];

  for (let index = 0; index < length; index += 1) {
    const part = parts[index];
    normalized.push(part == null || Number.isNaN(part) ? (wildcardMax ? 9999 : 0) : part);
  }

  return normalized;
}

function compareVersions(
  version: string,
  boundary: string,
  wildcardMaxForBoundary = false,
): number {
  if (version === 'next' && boundary === 'next') return 0;
  if (version === 'next') return 1;
  if (boundary === 'next') return -1;

  const versionParts = normalizeParts(parseVersionParts(version));
  const boundaryParts = normalizeParts(parseVersionParts(boundary), wildcardMaxForBoundary);

  for (let index = 0; index < Math.max(versionParts.length, boundaryParts.length); index += 1) {
    const versionPart = versionParts[index] ?? 0;
    const boundaryPart = boundaryParts[index] ?? 0;

    if (versionPart < boundaryPart) return -1;
    if (versionPart > boundaryPart) return 1;
  }

  return 0;
}

function matchesWildcard(pattern: string, version: string): boolean {
  if (pattern === version) return true;
  if (pattern === 'next') return version === 'next';

  const patternParts = pattern.split('.');
  const versionParts = version.split('.');

  return patternParts.every((part, index) => part === 'x' || part === versionParts[index]);
}

function isItemVisibleForVersion(item: VersionedReferenceItem, currentVersion: string): boolean {
  if (item.excludeInVersion?.some((pattern) => matchesWildcard(pattern, currentVersion))) {
    return false;
  }

  if (item.sinceVersion && compareVersions(currentVersion, item.sinceVersion) < 0) {
    return false;
  }

  if (item.untilVersion && compareVersions(currentVersion, item.untilVersion, true) > 0) {
    return false;
  }

  return true;
}

function ReferenceGroupCard({
  group,
  currentVersion,
}: {
  group: ReferenceGroup;
  currentVersion: string;
}) {
  const visibleItems = group.items.filter((item) => isItemVisibleForVersion(item, currentVersion));

  if (visibleItems.length === 0) return null;

  const Icon = group.icon;

  return (
    <div className={clsx('col col--6', 'margin-bottom--lg')}>
      <section className={clsx('card', styles.groupCard)}>
        <div className={styles.groupHeader}>
          <Icon size={24} aria-hidden={true} />
          <h2>{group.title}</h2>
        </div>
        <p className={styles.groupDescription}>{group.description}</p>
        <ul className={styles.topicList}>
          {visibleItems.map((item) => (
            <li key={item.title}>
              <Link className={styles.topicLink} to={item.link}>
                <span>{item.title}</span>
                <span aria-hidden={true}>→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

type Product = 'outbox' | 'once';

export default function ReferenceOverview({product = 'outbox'}: {product?: Product}): ReactNode {
  const version = useDocsVersion();
  const currentVersion = version.version === 'current' ? 'next' : version.version;
  const referenceGroups = product === 'once' ? onceReferenceGroups : outboxReferenceGroups;

  return (
    <section className={styles.referenceOverview}>
      <header className={styles.intro}>
        <h1>Reference</h1>
        <p>Technical reference for Namastack {product === 'once' ? 'Once' : 'Outbox'}.</p>
      </header>
      <div className="row">
        {referenceGroups.map((group) => (
          <ReferenceGroupCard key={group.title} group={group} currentVersion={currentVersion} />
        ))}
      </div>
    </section>
  );
}
