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
  if (pathname.startsWith('/outbox/')) {
    return <DocsVersionDropdownNavbarItem {...normalized} docsPluginId="outbox" />;
  }
  if (pathname.startsWith('/once/')) {
    return <DocsVersionDropdownNavbarItem {...normalized} docsPluginId="once" />;
  }
  return null;
}
