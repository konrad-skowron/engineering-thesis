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
  Container,
  Avatar,
  UnstyledButton,
  Text,
  rem,
  Skeleton,
  Drawer,
  SimpleGrid,
  Box
} from '@mantine/core';
import Link from "next/link";
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const links = [
  { link: '/account', label: 'Dashboard' },
  { link: '/create', label: 'Create Survey' },
  { link: '/settings', label: 'Settings' },
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
          <Group gap={5} hiddenFrom="sm" visibleFrom="xs">
            {items[0]}
            {items[1]}
          </Group>

          <Skeleton visible={loading} width={loading ? '20%' : 'auto'} height={loading ? 35 : 'auto'}>
            {!user && !loading ? (
              <>
                <Group visibleFrom="sm">
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Button variant="default">Log in</Button>
                  </Link>
                  <Link href="/register" style={{ textDecoration: 'none' }}>
                    <Button>Sign up</Button>
                  </Link>
                </Group>
                <Box hiddenFrom="sm">
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Button variant="default">Log in</Button>
                  </Link>
                </Box>
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
                        <Text fw={500} size="sm" lh={1} mr={3} visibleFrom="sm">
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

      <Drawer opened={opened} onClose={toggle} size="15rem"
        title={<Group gap="xs"><Image src="/favicon.ico" alt="logo" width={24} height={24} /><b>Survey Maker</b></Group>}
        position="top" offset={10} radius="md" overlayProps={{ blur: 4 }}>
        <Group>
          <Avatar src={user?.photoURL} alt='user photo' radius="xl" size={56} />
          <Text fw={500} lh={1} mr={3}>
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
          <Button variant="default" justify="left" onClick={() => { router.push('/account'); toggle(); }} leftSection={<IconHome size={16} />}>Dashboard</Button>
          <Button variant="default" justify="left" onClick={() => { router.push('/settings'); toggle(); }} leftSection={<IconSettings size={16} />}>Settings</Button>
          <Button variant="default" justify="left" onClick={handleSignOut} leftSection={<IconLogout size={16} />}>Sign out</Button>
        </SimpleGrid>
      </Drawer>
    </header>
  );
}