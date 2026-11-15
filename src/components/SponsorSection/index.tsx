import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {IconHeartFilled} from '@tabler/icons-react';
import styles from './styles.module.css';

const SPONSOR_URL = 'https://github.com/sponsors/namastack';

export default function SponsorSection() {
  return (
    <section className={styles.sponsorSection}>
      <div className={styles.sponsorCard}>
        <IconHeartFilled aria-hidden="true" />
        <Heading as="h2">Support the work</Heading>
        <p>
          Namastack Outbox and Namastack Once are independently developed and maintained as open-source software.
          Sponsorship supports maintenance, documentation, integrations, and long-term stability.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryButton} href={SPONSOR_URL}>Become a sponsor</Link>
          <Link className={styles.ghostButton} href="https://github.com/namastack">View on GitHub</Link>
        </div>
      </div>
    </section>
  );
}
