import React from 'react';
import {useLocation} from '@docusaurus/router';
import DocsVersionDropdownNavbarItem from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';
import type {Props} from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';

export default function ProductVersionNavbarItem(props: Props) {
  const {pathname} = useLocation();
  const normalized = {
    ...props,
    dropdownItemsBefore: props.dropdownItemsBefore ?? [],
    dropdownItemsAfter: props.dropdownItemsAfter ?? [],
  };
  if (pathname.startsWith('/docs/outbox/')) {
    return <DocsVersionDropdownNavbarItem {...normalized} docsPluginId="default" />;
  }
  if (pathname.startsWith('/docs/once/')) {
    return <DocsVersionDropdownNavbarItem {...normalized} docsPluginId="once" />;
  }
  return null;
}
