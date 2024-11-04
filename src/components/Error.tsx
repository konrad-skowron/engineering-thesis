import Link from 'next/link'
import { Title, Text, Button, Container, Group } from '@mantine/core';
import classes from './Error.module.css';
 
export default function Error() {
  return (
    <Container className={classes.root}>
    <div className={classes.label}>404</div>
    <Title className={classes.title}>Nothing to see here</Title>
    <Text c="dimmed" size="lg" ta="center" className={classes.description}>
      Page you are trying to open does not exist. You may have mistyped the address, or the page has been moved to another URL. If you think this is an error contact support.
    </Text>
    <Group justify="center">
    <Link href="/">
      <Button variant="subtle" size="md">
        Take me back to home page
      </Button>
    </Link>
    </Group>
  </Container>
  )
}