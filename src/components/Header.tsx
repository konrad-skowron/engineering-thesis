'use client'
import cx from 'clsx';
import classes from './Header.module.css';
import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { Logo } from './Logo';
import {
  IconLogout,
  IconHeart,
  IconStar,
  IconMessage,
  IconSettings,
  IconPlayerPause,
  IconTrash,
  IconSwitchHorizontal,
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
} from '@mantine/core';
import Link from "next/link";
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

const links = [
  { link: '/', label: 'Home' },
  { link: '/account', label: 'Dashboard' },
  {
    link: '#1',
    label: 'Support',
    links: [
      { link: '/faq', label: 'FAQ' },
      { link: '/demo', label: 'Book a demo' },
      { link: '/forums', label: 'Forums' },
    ],
  },
];

export function Header() {
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
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

          {!user ? (
            <Group visibleFrom="sm">
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button variant="default">Log in</Button>
              </Link>
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <Button>Sign up</Button>
              </Link>
            </Group>
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
                      <Avatar src={user?.photoURL} alt={user?.displayName || 'user photo'} radius="xl" size={32} />
                      <Text fw={500} size="sm" lh={1} mr={3}>
                        {user?.displayName}
                      </Text>
                      <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={
                      <IconHeart
                        style={{ width: rem(16), height: rem(16) }}
                        stroke={1.5}
                      />
                    }
                  >
                    Liked posts
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconStar
                        style={{ width: rem(16), height: rem(16) }}
                        stroke={1.5}
                      />
                    }
                  >
                    Saved posts
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconMessage
                        style={{ width: rem(16), height: rem(16) }}
                        stroke={1.5}
                      />
                    }
                  >
                    Your comments
                  </Menu.Item>

                  <Menu.Label>Settings</Menu.Label>
                  <Menu.Item
                    leftSection={
                      <IconSettings style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    }
                  >
                    Account settings
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconSwitchHorizontal style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    }
                  >
                    Change account
                  </Menu.Item>
                  <Menu.Item
                    onClick={handleSignOut}
                    leftSection={
                      <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    }
                  >
                    Sign out
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Label>Danger zone</Menu.Label>
                  <Menu.Item
                    leftSection={
                      <IconPlayerPause style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    }
                  >
                    Pause subscription
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                  >
                    Delete account
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>)}
        </div>
      </Container>
    </header>
  );
}