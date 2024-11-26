import { useState, useEffect, useRef } from 'react';
import { IconList } from '@tabler/icons-react';
import { Box, Group, Text } from '@mantine/core';
import cx from 'clsx';
import classes from './TableOfContents.module.css';

export function TableOfContents({ links }: { links: { label: string; link: string; order: number }[] }) {
  const [active, setActive] = useState(0);
  const isManualClick = useRef(false); 

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (isManualClick.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = links.findIndex((item) => `${item.link}` === `#${entry.target.id}`);
          if (index !== -1) {
            setActive(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px 0px -100% 0px',
      threshold: 0,
    });

    links.forEach((item) => {
      const section = document.querySelector(item.link);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [links]);

  const items = links.map((item, index) => (
    <Box<'a'>
      component="a"
      href={item.link}
      onClick={(event: any) => {
        event.preventDefault();
        isManualClick.current = true;
        document.querySelector(item.link)?.scrollIntoView({ behavior: 'smooth' });
        event.stopPropagation();
        setActive(index);

        setTimeout(() => {
          isManualClick.current = false;
        }, 500);
      }}
      key={item.label}
      className={cx(classes.link, { [classes.linkActive]: active === index })}
      style={{ paddingLeft: `calc(${item.order} * var(--mantine-spacing-md))` }}
    >
      {item.label}
    </Box>
  ));

  return (
    <Box visibleFrom="xl" className={classes.root} >
      <Box w='fit-content' ml='auto' pr='xl'>
        <Group mb="md">
          <IconList size={18} stroke={2}/>
          <Text>Questions</Text>
        </Group>
        {items}
      </Box>
    </Box>
  );
}