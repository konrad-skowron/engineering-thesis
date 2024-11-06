import { Text, Container, Group, ActionIcon, rem } from '@mantine/core';
import { IconBrandGithub, IconMail } from '@tabler/icons-react';
import classes from './Footer.module.css';

export function Footer() {
  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Text c="dimmed" size="sm">
          © 2024 Konrad Skowron. All rights reserved.
        </Text>

        <Group gap={0} className={classes.links} justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" color="gray" variant="subtle">
            <a href="mailto:260654@student.pwr.edu.pl" style={{ color: 'inherit' }}>
                <IconMail style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
            </a>
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <a href="https://github.com/konrad-skowron/engineering-thesis" style={{ color: 'inherit' }}>
                <IconBrandGithub style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
            </a>
          </ActionIcon>
        </Group>
      </Container>
    </div>
  );
}