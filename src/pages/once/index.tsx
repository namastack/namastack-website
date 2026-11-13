import React from 'react';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import {OnceContent} from '@site/src/components/Products';
export default function OncePage() {
  const description =
    'Transactional idempotency for Spring Boot. Commit a duplicate-detection marker with your business data using JDBC or MongoDB, with annotations, retention and observability.';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Namastack Once',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'JVM',
    programmingLanguage: ['Java', 'Kotlin'],
    description,
    url: 'https://www.namastack.io/once/',
    license: 'https://github.com/namastack/namastack-once/blob/main/LICENSE',
    author: {'@type': 'Organization', name: 'Namastack', url: 'https://www.namastack.io/'},
  };
  return (
    <Layout title="Namastack Once — Transactional idempotency" description={description}>
      <Head>
        <link rel="canonical" href="https://www.namastack.io/once/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.namastack.io/videos/namastack-once-v1.png" />
        <meta property="og:url" content="https://www.namastack.io/once/" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Head>
      <OnceContent />
    </Layout>
  );
}
