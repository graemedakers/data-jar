import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Premium Plans',
    description: 'Upgrade to Date Jar Pro for unlimited jars, AI planning, dining concierge, and more.',
};

export default function PremiumLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
