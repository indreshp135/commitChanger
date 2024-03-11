import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from '@mantine/notifications';
import { theme } from "./theme";
import { HeaderPage } from "./pages";

export default function App() {
  return (<MantineProvider theme={theme}>
    <Notifications />
    <HeaderPage />
  </MantineProvider>);
}
