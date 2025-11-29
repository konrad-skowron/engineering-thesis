'use client';

import { useLocale } from 'next-intl';
import { ActionIcon, Menu, rem } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';

const locales = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
];

export function LanguageSwitcher() {
  const currentLocale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon size="lg" color="gray" variant="subtle" aria-label="Change language">
          <IconLanguage style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {locales.map((locale) => (
          <Menu.Item
            key={locale.code}
            onClick={() => handleLocaleChange(locale.code)}
            style={{ fontWeight: currentLocale === locale.code ? 'bold' : 'normal' }}
          >
            {locale.flag} {locale.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
