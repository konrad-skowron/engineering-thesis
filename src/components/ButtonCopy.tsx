import { IconCheck, IconCopy } from '@tabler/icons-react';
import { Button, CopyButton, Tooltip } from '@mantine/core';

export function ButtonCopy(url: { url: string; }) {
  return (
    <CopyButton value={url.url}>
      {({ copied, copy }) => (
        <Tooltip
          label="Link copied"
          offset={5}
          position="bottom"
          transitionProps={{ duration: 100, transition: 'slide-down' }}
          opened={copied}
        >
          <Button
            variant="default"
            leftSection={
              copied ? (
                <IconCheck size={16} />
              ) : (
                <IconCopy size={16} />
              )
            }
            onClick={copy}
          >
            Copy url
          </Button>
        </Tooltip>
      )}
    </CopyButton>
  );
}