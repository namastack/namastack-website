import React from 'react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import DocItemLayout from '@theme-original/DocItem/Layout';
import type DocItemLayoutType from '@theme/DocItem/Layout';
import type {WrapperProps} from '@docusaurus/types';
import styles from './styles.module.css';

type Props = WrapperProps<typeof DocItemLayoutType>;
export default function DocItemLayoutWrapper(props: Props): React.ReactNode {
  const once = useLocation().pathname.startsWith('/docs/once/');
  return (
    <>
      <nav className={styles.products} aria-label="Product documentation">
        <Link
          to="/docs/outbox/"
          className={!once ? styles.active : undefined}
          aria-current={!once ? 'true' : undefined}
        >
          Outbox
        </Link>
        <Link
          to="/docs/once/"
          className={once ? styles.active : undefined}
          aria-current={once ? 'true' : undefined}
        >
          Once <span className={styles.circle} aria-hidden="true" />
        </Link>
      </nav>
      {once && (
        <aside className={styles.preview}>
          Preview documentation · Once 0.1.0-SNAPSHOT. No stable release is published yet.
        </aside>
      )}
      <DocItemLayout {...props} />
    </>
  );
}
