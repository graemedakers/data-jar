import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
    description: "Sign in to your Date Jar account to access your shared date ideas.",
};

export default function LoginPage() {
    return <LoginForm />;
}
