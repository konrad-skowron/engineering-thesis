'use client'
import cx from 'clsx';
import { Text, Container, Group, ActionIcon, useMantineColorScheme, useComputedColorScheme, rem } from '@mantine/core';
import { IconBrandGithub, IconMail, IconSun, IconMoon } from '@tabler/icons-react';
import classes from './Footer.module.css';

export function Footer() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Text c="dimmed" size="sm">
          © 2025 Survey Maker. Build by Konrad Skowron.
        </Text>

        <Group gap={0} className={classes.links} justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" color="gray" variant="subtle">
            <a href="https://github.com/konrad-skowron/engineering-thesis" style={{ color: 'inherit' }}>
                <IconBrandGithub style={{ width: rem(18), height: rem(18) }} stroke={1.5} title="Source code" />
            </a>
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <a href="mailto:260654@student.pwr.edu.pl" style={{ color: 'inherit' }}>
                <IconMail style={{ width: rem(18), height: rem(18) }} stroke={1.5} title="Email" />
            </a>
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle"
            onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle color scheme"
          >
            <IconSun className={cx(classes.icon, classes.light)} style={{ width: rem(18), height: rem(18) }} stroke={1.5} title="Light mode" />
            <IconMoon className={cx(classes.icon, classes.dark)} style={{ width: rem(18), height: rem(18) }} stroke={1.5} title="Dark mode" /> 
          </ActionIcon>
        </Group>
      </Container>
    </div>
  );
}
