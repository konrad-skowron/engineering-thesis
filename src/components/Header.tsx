'use client'
import cx from 'clsx';
import classes from './Header.module.css';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Logo } from './Logo';
import {
  IconLogout,
  IconHome,
  IconSettings,
  IconChevronDown
} from '@tabler/icons-react';
import {
  Menu,
  Burger,
  Button,
  Group,
  Center,
  Container,
  Avatar,
  UnstyledButton,
  Text,
  rem,
  Skeleton,
  Drawer,
  SimpleGrid
} from '@mantine/core';
import Link from "next/link";
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';

const links = [
  { link: '/account', label: 'Dashboard' },
  { link: '/create', label: 'Create Survey' },
  {
    link: '#1',
    label: 'Support',
    links: [
      { link: '/about', label: 'About' },
      { link: '/contact', label: 'Contact' },
      { link: '/faq', label: 'FAQ' },
    ],
  },
];

export function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    if (opened) {
      toggle();
    }
    router.push('/');
    signOut();
  };

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link}>{item.label}</Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
          <Menu.Target>
            <a
              href={link.link}
              className={classes.link}
            >
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size="0.9rem" stroke={1.5} />
              </Center>
            </a>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <a
        key={link.label}
        href={link.link}
        className={classes.link}
      >
        {link.label}
      </a>
    );
  });

  return (
    <header className={classes.header}>
      <Container size="md">
        <div className={classes.inner}>
          <Logo />

          <Group gap={5} visibleFrom="sm">
            {items}
          </Group>

          <Skeleton visible={loading} width={loading ? '20%' : 'auto'} height={loading ? 35 : 'auto'}>
            {!user && !loading ? (
              <>
                <Group visibleFrom="xs">
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Button variant="default">Log in</Button>
                  </Link>
                  <Link href="/register" style={{ textDecoration: 'none' }}>
                    <Button>Sign up</Button>
                  </Link>
                </Group>
                <Group hiddenFrom="xs" gap={0}>
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Button variant="default">Log in</Button>
                  </Link>
                </Group>
              </>
            ) : (
              <Group justify="space-between">
                <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
                <Menu
                  width={260}
                  position="bottom-end"
                  transitionProps={{ transition: 'pop-top-right' }}
                  onClose={() => setUserMenuOpened(false)}
                  onOpen={() => setUserMenuOpened(true)}
                  withinPortal
                >
                  <Menu.Target>
                    <UnstyledButton
                      className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                    >
                      <Group gap={7}>
                        <Avatar src={user?.photoURL} alt='user photo' radius="xl" size={32} />
                        <Text fw={500} size="sm" lh={1} mr={3} visibleFrom="xs">
                          {user?.displayName || user?.email}
                        </Text>
                        <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                      </Group>
                    </UnstyledButton>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      onClick={() => router.push('/account')}
                      leftSection={
                        <IconHome
                          style={{ width: rem(16), height: rem(16) }}
                          stroke={1.5}
                        />
                      }
                    >
                      Dashboard
                    </Menu.Item>

                    <Menu.Item
                      onClick={() => router.push('/settings')}
                      leftSection={
                        <IconSettings style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                      }
                    >
                      Settings
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                      onClick={handleSignOut}
                      leftSection={
                        <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                      }
                    >
                      Sign out
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>)}
          </Skeleton>
        </div>
      </Container>

      <Drawer opened={opened} onClose={toggle} size="16rem" title="Survey Maker" position="top" offset={10} radius="md" overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}>
        <Group>
          <Avatar src={user?.photoURL} alt='user photo' radius="xl" size={64} />
          <Text fw={500} size="m" lh={1} mr={3}>
            {user?.displayName || user?.email}
            {user?.displayName &&
              <>
                <br />
                <Text size="xs" c="dimmed" component="span">
                  {user?.email}
                </Text>
              </>}
          </Text>
        </Group>
        <SimpleGrid cols={2} mt="lg">
          <Button variant="default" justify="left" onClick={() => router.push('/account')} leftSection={<IconHome />}>Dashboard</Button>
          <Button variant="default" justify="left" onClick={() => router.push('/settings')} leftSection={<IconSettings />}>Settings</Button>
          <Button variant="default" justify="left" onClick={handleSignOut} leftSection={<IconLogout />}>Sign out</Button>
        </SimpleGrid>
      </Drawer>
    </header>
  );
}