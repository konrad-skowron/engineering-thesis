'use client';

import React from 'react';
import { useMantineTheme, useComputedColorScheme } from '@mantine/core';
import { useTranslations } from 'next-intl';

const Completed = () => {
  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme();
  const t = useTranslations('status');

  return (
    <div style={{ display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 
                  colorScheme === 'dark'
                    ? theme.colors.green[3]
                    : theme.colors.green[6],
                  backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(64,192,87,.15)'
                    : 'rgba(64,192,87,.1)',
                  borderRadius: theme.radius.xl, 
                  width: 'fit-content',
                  height: 'fit-content',
                  padding: '0.2rem 0.6rem' }}>
      <span style={{ fontSize: '0.9rem' }}>{t('completed')}</span>
    </div>
  );
};

export default Completed;
