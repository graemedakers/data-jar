import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Log in to your Date Jar account to access your shared jars and date ideas.',
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
