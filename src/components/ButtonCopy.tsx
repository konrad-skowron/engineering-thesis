'use client';

import { IconCheck, IconCopy } from '@tabler/icons-react';
import { Button, CopyButton, Tooltip } from '@mantine/core';
import { useTranslations } from 'next-intl';

export function ButtonCopy(url: { url: string; }) {
  const t = useTranslations('copyButton');

  return (
    <CopyButton value={url.url}>
      {({ copied, copy }) => (
        <Tooltip
          label={t('copied')}
          offset={5}
          position="bottom"
          transitionProps={{ duration: 100, transition: 'slide-down' }}
          opened={copied}
        >
          <Button
            variant="default"
            leftSection={
              copied ? (
                <IconCheck size={16} />
              ) : (
                <IconCopy size={16} />
              )
            }
            onClick={copy}
          >
            {t('copyLink')}
          </Button>
        </Tooltip>
      )}
    </CopyButton>
  );
}