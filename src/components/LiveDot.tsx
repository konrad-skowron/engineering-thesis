import React, { useEffect, useState } from 'react';
import { useMantineTheme, useMantineColorScheme } from '@mantine/core';

const LiveDot = () => {
  const [visible, setVisible] = useState(true);
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex',
                  alignItems: 'center',
                  color: theme.colors.red[7], 
                  backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(255, 168, 168, 0.1)'
                    : 'rgba(255, 168, 168, 0.3)',
                  borderRadius: 'var(--mantine-radius-md)', 
                  width: 'fit-content', 
                  padding: '0 8px' }}>
      <span style={{ marginRight: '8px' }}>LIVE</span>
      <div
        style={{
          width: '11px',
          height: '11px',
          borderRadius: '50%',
          backgroundColor: theme.colors.red[7],
          opacity: visible ? 1 : 0.4,
          transition: 'opacity 1s ease',
        }}
      ></div>
    </div>
  );
};

export default LiveDot;
