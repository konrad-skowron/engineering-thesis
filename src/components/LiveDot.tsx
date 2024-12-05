import React, { useEffect, useState } from 'react';
import { useMantineTheme, useMantineColorScheme } from '@mantine/core';

const LiveDot = () => {
  const [visible, setVisible] = useState(true);
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color:
        colorScheme === 'dark'
          ? theme.colors.red[3]
          : theme.colors.red[6],
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(250,82,82,.15)'
          : 'rgba(250,82,82,.1)',
      borderRadius: theme.radius.xl,
      width: 'fit-content',
      height: 'fit-content',
      padding: '0.2rem 0.6rem'
    }}>
      <span style={{ marginRight: '0.4rem', fontSize: '0.9rem' }}>Live</span>
      <div
        style={{
          width: '0.6rem',
          height: '0.6rem',
          borderRadius: '50%',
          backgroundColor:
            colorScheme === 'dark'
              ? theme.colors.red[3]
              : theme.colors.red[6],
          opacity: visible ? 1 : 0.4,
          transition: 'opacity 1s ease',
        }}
      ></div>
    </div>
  );
};

export default LiveDot;
