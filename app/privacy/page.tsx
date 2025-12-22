import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for Decision Jar.',
    robots: {
        index: false
    }
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-300 py-24 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
                    <p>Welcome to Decision Jar. We respect your privacy and are committed to protecting your personal data.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">2. Data We Collect</h2>
                    <p>We collect minimal data to provide our services, including:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Account information (email, name)</li>
                        <li>Couple connection data</li>
                        <li>Date ideas and preferences</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">3. Contact Us</h2>
                    <p>If you have any questions about this Privacy Policy, You can contact us at privacy@datejar.app</p>
                </section>
            </div>
        </main>
    );
}
