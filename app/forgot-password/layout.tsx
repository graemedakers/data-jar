
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Forgot Password",
    description: "Recover access to your Date Jar account.",
};

export default function ForgotPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
