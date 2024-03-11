import {
    Center,
    Container,
    Fieldset,
    Button,
    TextInput,
    LoadingOverlay,
    Select,
    Timeline,
    Modal,
    Paper, Text, Anchor
} from '@mantine/core';
import { useState } from 'react';
import axios from 'axios';
import { IconGitFork } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/dates/styles.css';
import { DateTimePicker, DateValue } from '@mantine/dates';
import { notifications } from '@mantine/notifications';

const BACKEND_URL = './api';

interface Commit {
    sha: string;
    message: string;
    author: string;
    time: string;
}

export function MainComponent() {
    const [loading, setLoading] = useState(false);
    const [owner, setOwner] = useState('');
    const [repo, setRepo] = useState('');
    const [token, setToken] = useState('');
    const [branches, setBranches] = useState([] as string[]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [commits, setCommits] = useState([] as Commit[]);
    const [active, setActive] = useState(0);
    const [author, setAuthor] = useState('');
    const [authorEmail, setAuthorEmail] = useState('');
    const [date, setDate] = useState<DateValue>(new Date());
    const [opened, { open, close }] = useDisclosure(false);

    function formatDateToISOStringWithOffset(d: Date) {
        const offsetString = "+0530";
        // subract 5 hours 30 minutes from the date
        const finalDate = new Date(d.getTime() - (5 * 60 * 60 * 1000) - (30 * 60 * 1000));
        const year = finalDate.getFullYear();
        const month = String(finalDate.getMonth() + 1).padStart(2, '0');
        const day = String(finalDate.getDate()).padStart(2, '0');
        const hours = String(finalDate.getHours()).padStart(2, '0');
        const minutes = String(finalDate.getMinutes()).padStart(2, '0');
        const seconds = String(finalDate.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${offsetString}`;
    }

    const [minDate, setMinDate] = useState(new Date(2021, 0, 1));


    return (
        <Container>
            <LoadingOverlay visible={loading} loaderProps={{
                size: 50,
                type: 'bars'
            }} />
            <Fieldset m="md" p="md">
                <TextInput label="Repo owner" placeholder="indreshp135" value={owner} onChange={(e) => setOwner(e.currentTarget.value)} />
                <TextInput label="Repo name" placeholder="mantine" value={repo} onChange={(e) => setRepo(e.currentTarget.value)} />
                <TextInput label="Token" placeholder="ghp_123" value={token} onChange={(e) => setToken(e.currentTarget.value)} />
            </Fieldset>
            <Center>
                <Button onClick={async () => {
                    setLoading(true);
                    try {
                        const response = await axios.post(BACKEND_URL + '/repo', {
                            owner,
                            repo,
                            token
                        });
                        setBranches(response.data.branches);
                    } catch (e: any) {
                        notifications.show({
                            title: 'Error',
                            message: e.response.data.message,
                            color: 'red'
                        })
                    }
                    setLoading(false);
                }}>Fetch Branches</Button>
            </Center>

            {branches.length > 0 && (
                <>
                    <Fieldset m="md" p="md">
                        <Select data={branches} label="Branches" placeholder="Select branch" value={selectedBranch} onChange={(value) => { if (value) setSelectedBranch(value) }} />

                    </Fieldset>
                    <Center>
                        <Button onClick={async () => {
                            setLoading(true);
                            try {
                                const response = await axios.post(BACKEND_URL + '/branch', {
                                    owner,
                                    repo,
                                    branch: selectedBranch
                                });
                                setCommits(response.data);
                            } catch (e: any) {
                                notifications.show({
                                    title: 'Error',
                                    message: e.response.data.message,
                                    color: 'red'
                                })
                            }
                            setLoading(false);
                        }}>Fetch Commits</Button>
                    </Center>
                </>
            )}
            {commits.length > 0 && (
                <>
                    <Paper m="md" p="xl" shadow='md' withBorder>
                        <Center>
                            <Timeline active={active} bulletSize={24} lineWidth={2}>
                                {
                                    commits.map((commit: Commit, index) => (
                                        <Timeline.Item
                                            lineVariant={index > active ? 'dashed' : 'solid'}
                                            key={index}
                                            title={commit.sha}
                                            color="blue"
                                            style={index == active ? {
                                                cursor: 'pointer'
                                            } : {}}
                                            onClick={open}
                                            bullet={index === active ? <IconGitFork size={24} /> : index + 1}
                                        >
                                            <Text c="dimmed" size="sm">
                                                {commit.message}
                                            </Text>
                                            <Text size="xs" mt={4}>
                                                {commit.author} @ {commit.time}
                                            </Text>
                                        </Timeline.Item>
                                    ))
                                }
                            </Timeline>
                        </Center>
                    </Paper>
                    <>
                        {active === commits.length && (
                            <Center>
                                <Anchor href={BACKEND_URL + '/download-zip?owner=' + owner + '&repo=' + repo + '&branch=' + selectedBranch} target="_blank">
                                    Download Zip
                                </Anchor>
                            </Center>
                        )}
                    </>
                </>
            )}
            <Modal opened={opened} onClose={close} title="Commit Details">
                <Fieldset m="md" p="md">
                    <TextInput label="Author" placeholder="indreshp135" value={author} onChange={(e) => setAuthor(e.currentTarget.value)} />
                    <TextInput label="Author Email" placeholder="indreshp135@gmail.com" value={authorEmail} onChange={(e) => setAuthorEmail(e.currentTarget.value)} />
                    <DateTimePicker maxDate={new Date()} minDate={minDate} label="Date" value={date} onChange={(value) => setDate(value)} />
                </Fieldset>
                <Center>
                    <Button onClick={async () => {
                        setLoading(true);
                        if (!date) {
                            return;
                        }
                        try {
                            await axios.post(BACKEND_URL + '/change-commit', {
                                owner,
                                repo,
                                branch: selectedBranch,
                                commit_hash: commits[active].sha,
                                author_name: author,
                                author_email: authorEmail,
                                commit_datetime: formatDateToISOStringWithOffset(date)
                            });
                            setMinDate(date);
                            setActive((prev) => prev + 1);
                        } catch (e: any) {
                            notifications.show({
                                title: 'Error',
                                message: e.response.data.message,
                                color: 'red'
                            })
                        }
                        setLoading(false);
                        close();
                    }}>Create Commit in new repo</Button>
                </Center>
            </Modal>
        </Container>
    );
}
