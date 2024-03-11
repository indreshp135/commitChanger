import { HeaderMenu } from '../components/Header';
import { AppShell, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { MainComponent } from '../components/MainComponent';

export function HeaderPage() {

  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header
        style={{
          position: 'fixed',
        }}
      >
        <HeaderMenu visible opened={false} handler={() => { }} />
      </AppShell.Header>

      <AppShell.Main style={{
        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[1],
      }}>
        <MainComponent />
      </AppShell.Main>
    </AppShell>
  );
}