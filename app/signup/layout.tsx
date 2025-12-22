import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up',
    description: 'Create a free Date Jar account to start planning better dates and syncing with your partner.',
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
