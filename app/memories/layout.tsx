
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Memories",
    description: "Look back on your completed dates and cherished moments.",
};

export default function MemoriesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
