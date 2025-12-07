'use client';

import { Container, Text, Button, Group, ThemeIcon, SimpleGrid, rem, Title, Paper, Stack, Box } from '@mantine/core';
import { IconBrandOpenSource, IconShieldCheck, IconAdCircleOff, IconUserPlus, IconForms, IconShare, IconChartBar, IconRulerMeasure, IconListNumbers, IconTextSize, IconNumbers, IconCircleDot, IconSquareCheck, IconChevronDown, IconClock, IconPalette, IconFileDownload, IconChartLine, IconSchool, IconBriefcase, IconBook, IconShoppingCart } from '@tabler/icons-react';
import classes from './LandingPage.module.css';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function LandingPage() {
  const t = useTranslations('landing');

  const features = [
    {
      icon: IconBrandOpenSource,
      title: t('features.openSource.title'),
      description: t('features.openSource.description'),
    },
    {
      icon: IconShieldCheck,
      title: t('features.privacy.title'),
      description: t('features.privacy.description'),
    },
    {
      icon: IconAdCircleOff,
      title: t('features.noAds.title'),
      description: t('features.noAds.description'),
    }
  ];

  const steps = [
    {
      icon: IconUserPlus,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      number: '1'
    },
    {
      icon: IconForms,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      number: '2'
    },
    {
      icon: IconShare,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      number: '3'
    },
    {
      icon: IconChartBar,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
      number: '4'
    }
  ];

  const useCases = [
    {
      icon: IconSchool,
      title: t('useCases.research.title'),
      description: t('useCases.research.description'),
      color: 'blue'
    },
    {
      icon: IconBriefcase,
      title: t('useCases.employee.title'),
      description: t('useCases.employee.description'),
      color: 'cyan'
    },
    {
      icon: IconBook,
      title: t('useCases.education.title'),
      description: t('useCases.education.description'),
      color: 'teal'
    },
    {
      icon: IconShoppingCart,
      title: t('useCases.customer.title'),
      description: t('useCases.customer.description'),
      color: 'violet'
    }
  ];

  const questionTypes = [
    {
      icon: IconRulerMeasure,
      title: t('questionTypes.continuous.title'),
      description: t('questionTypes.continuous.description'),
      color: 'blue'
    },
    {
      icon: IconListNumbers,
      title: t('questionTypes.discrete.title'),
      description: t('questionTypes.discrete.description'),
      color: 'cyan'
    },
    {
      icon: IconTextSize,
      title: t('questionTypes.text.title'),
      description: t('questionTypes.text.description'),
      color: 'teal'
    },
    {
      icon: IconNumbers,
      title: t('questionTypes.number.title'),
      description: t('questionTypes.number.description'),
      color: 'green'
    },
    {
      icon: IconCircleDot,
      title: t('questionTypes.singleChoice.title'),
      description: t('questionTypes.singleChoice.description'),
      color: 'violet'
    },
    {
      icon: IconSquareCheck,
      title: t('questionTypes.multipleChoice.title'),
      description: t('questionTypes.multipleChoice.description'),
      color: 'grape'
    },
    {
      icon: IconChevronDown,
      title: t('questionTypes.dropdown.title'),
      description: t('questionTypes.dropdown.description'),
      color: 'indigo'
    }
  ];

  const capabilities = [
    {
      icon: IconClock,
      title: t('capabilities.realTime.title'),
      description: t('capabilities.realTime.description')
    },
    {
      icon: IconPalette,
      title: t('capabilities.customizable.title'),
      description: t('capabilities.customizable.description')
    },
    {
      icon: IconFileDownload,
      title: t('capabilities.export.title'),
      description: t('capabilities.export.description')
    },
    {
      icon: IconChartLine,
      title: t('capabilities.analytics.title'),
      description: t('capabilities.analytics.description')
    }
  ];

  const items = features.map((feature) => (
    <div key={feature.title} className={classes.icon}>
      <ThemeIcon
        size={50}
        radius="md"
        variant="gradient"
        gradient={{ deg: 133, from: 'blue', to: 'cyan' }}
        mr="md"
        mb="sm"
      >
        <feature.icon style={{ width: rem(26), height: rem(26) }} stroke={1.5} />
      </ThemeIcon>
      <div>
        <Text fz="md" fw={500} className={classes.smallTitle}>
          {feature.title}
        </Text>
        <Text c="dimmed" fz="sm">
          {feature.description}
        </Text>
      </div>
    </div>
  ));

  return (
    <div className={classes.wrapper}>
      <Container className={classes.inner} id='about'>
        <h1 className={classes.title}>
          {t('title')}{' '}
          <Text component="span" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} inherit>
            {t('titleHighlight')}
          </Text>
          {' '}{t('titleEnd')}
        </h1>

        <Text className={classes.description} c="placeholder">
          {t('description')}
        </Text>

        <SimpleGrid cols={3} spacing="xl" mt="xl" visibleFrom='sm'>
          {items}
        </SimpleGrid>
        <SimpleGrid cols={1} spacing="xl" mt="xl" hiddenFrom='sm'>
          {items}
        </SimpleGrid>

        <Group className={classes.controls} mt="xl">
          <Link href="/account" style={{ textDecoration: 'none' }}>      
            <Button
              size="xl"
              className={classes.control}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              radius='md'
            >
              {t('getStarted')}
            </Button>
          </Link>
        </Group>

        <Title order={2} ta="center" mt={80} mb="xl">
          {t('howItWorks.title')}
        </Title>
        
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl" mb={60}>
          {steps.map((step) => (
            <Paper key={step.number} p="lg" radius="md" withBorder style={{ height: '100%' }}>
              <Stack gap="md">
                <Group>
                  <ThemeIcon
                    size={50}
                    radius="md"
                    variant="gradient"
                    gradient={{ deg: 133, from: 'blue', to: 'cyan' }}
                  >
                    <step.icon style={{ width: rem(26), height: rem(26) }} stroke={1.5} />
                  </ThemeIcon>
                  <Text size="xl" fw={700} c="blue">
                    {step.number}
                  </Text>
                </Group>
                <div>
                  <Text fw={600} size="lg" mb="xs">
                    {step.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {step.description}
                  </Text>
                </div>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>

        <Title order={2} ta="center" mt={60} mb="xl">
          {t('useCases.title')}
        </Title>
        
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb={60}>
          {useCases.map((useCase) => (
            <Paper key={useCase.title} p="lg" radius="md" withBorder style={{ height: '100%' }}>
              <Stack gap="md" align="center" ta="center">
                <ThemeIcon
                  size={55}
                  radius="md"
                  variant="light"
                  color={useCase.color}
                >
                  <useCase.icon style={{ width: rem(30), height: rem(30) }} stroke={1.5} />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="md" mb="xs">
                    {useCase.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {useCase.description}
                  </Text>
                </div>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>

        <Title order={2} ta="center" mt={60} mb="xl">
          {t('questionTypes.title')}
        </Title>
        
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg" mb={60}>
          {questionTypes.map((type) => (
            <Paper key={type.title} p="md" radius="md" withBorder style={{ height: '100%' }}>
              <Stack gap="sm">
                <ThemeIcon
                  size={50}
                  radius="md"
                  variant="light"
                  color={type.color}
                >
                  <type.icon style={{ width: rem(28), height: rem(28) }} stroke={1.5} />
                </ThemeIcon>
                <div>
                  <Text fw={600} size="md" mb="xs">
                    {type.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {type.description}
                  </Text>
                </div>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>

        <Title order={2} ta="center" mt={60} mb="xl">
          {t('capabilities.title')}
        </Title>
        
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb={80}>
          {capabilities.map((capability) => (
            <Box key={capability.title}>
              <Group mb="xs">
                <ThemeIcon
                  size={40}
                  radius="md"
                  variant="light"
                  gradient={{ deg: 133, from: 'blue', to: 'cyan' }}
                >
                  <capability.icon style={{ width: rem(22), height: rem(22) }} stroke={1.5} />
                </ThemeIcon>
              </Group>
              <Text fw={600} size="md" mb="xs">
                {capability.title}
              </Text>
              <Text size="sm" c="dimmed">
                {capability.description}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </div>
  );
}