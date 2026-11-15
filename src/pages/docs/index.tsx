import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {ProductCards} from '@site/src/components/Products';
import styles from './styles.module.css';
export default function DocumentationHome() {
  return (
    <Layout
      title="Documentation"
      description="Choose the independently versioned documentation for Namastack Outbox or Namastack Once."
    >
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.container}>
            <span className={styles.eyebrow}>Namastack documentation</span>
            <Heading as="h1">Choose your project.</Heading>
            <p>
              Installation, concepts, API guidance and operations. Each project has its own
              documentation and version history.
            </p>
          </div>
        </header>
        <section className={styles.content}>
          <div className={styles.container}>
            <ProductCards documentation />
          </div>
        </section>
      </main>
    </Layout>
  );
}
