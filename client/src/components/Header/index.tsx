import {
    Container,
    Group,
    UnstyledButton,
    Text,
    Center,
    useMantineColorScheme,
    Burger,
    useMantineTheme,
    // Transition
} from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import PropTypes from 'prop-types';
import classes from './style.module.css';

export function HeaderMenu({
    opened: open,
    handler,
    visible,
}: {
    opened: boolean;
    handler: () => void;
    visible: boolean;
}) {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const Icon = colorScheme === 'dark' ? IconMoon : IconSun;

    const theme = useMantineTheme();

    const items = (
        <UnstyledButton
            aria-label="Toggle theme"
            className={classes.control}
            onClick={() => toggleColorScheme()}
        >
            <Text size="sm" className={classes.value}>
                {colorScheme === 'dark' ? 'Dark Theme' : 'Light Theme'}
            </Text>

            <Center className={classes.iconWrapper}>
                <Icon size={18} stroke={1.5} />
            </Center>
        </UnstyledButton>
    );

    return (
        <Container className={classes.header}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                }}
            >
                {location.pathname !== '/as' && location.pathname !== '/auth' && (
                    <Burger
                        opened={open}
                        onClick={() => handler()}
                        size="sm"
                        color={theme.colors.gray[6]}
                        hiddenFrom="sm"
                        ms="xl"
                    />
                )}
                <UnstyledButton className={classes.flexer} >
                    <img src="https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png" height={40} alt="logo" />
                </UnstyledButton>
            </div>
            {visible && (
                <Group gap={5} className={classes.links}>
                    {items}
                </Group>
            )}
        </Container>
    );
}

HeaderMenu.propTypes = {
    opened: PropTypes.bool.isRequired,
    handler: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
};