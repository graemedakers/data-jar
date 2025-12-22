
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Your Jar",
    description: "View and manage all your date ideas in one place.",
};

export default function JarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
