'use client'
import { Center } from '@mantine/core';
import { useState, useEffect } from 'react';

export function Loading() {
    const [dots, setDots] = useState('...');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev === '...' ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Center>
      Loading{dots}
    </Center>
  );
}
