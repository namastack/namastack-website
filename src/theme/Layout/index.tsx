import React, {type ComponentProps} from 'react';
import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import Layout from '@theme-original/Layout';

export default function ProductLayout(props: ComponentProps<typeof Layout>) {
  const {pathname} = useLocation();
  const product = /^\/once(?:\/|$)/.test(pathname) ? 'once' : 'namastack';
  return (
    <>
      <Head><html data-namastack-product={product} /></Head>
      <Layout {...props} />
    </>
  );
}
