import React from 'react';
import { useMantineTheme, useMantineColorScheme } from '@mantine/core';

const Closed = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <div style={{ display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 
                  colorScheme === 'dark'
                    ? theme.colors.green[6]
                    : theme.colors.green[8],
                  backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(47, 158, 68, 0.1)'
                    : 'rgba(47, 158, 68, 0.2)',
                  borderRadius: theme.radius.xl, 
                  width: 'fit-content',
                  height: 'fit-content',
                  padding: '0.2rem 0.6rem' }}>
      <span style={{ fontSize: '0.9rem' }}>Completed</span>
    </div>
  );
};

export default Closed;
