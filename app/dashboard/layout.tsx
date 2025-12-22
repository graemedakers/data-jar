
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Manage your date jar, spin for ideas, and plan your next romantic adventure.",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
