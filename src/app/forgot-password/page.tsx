"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { CURRENT_VERSION } from "@/lib/changelog";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <Card className="w-full max-w-md p-8 relative z-10 border-border bg-card/85 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="logo-container flex items-center justify-center mb-4">
                        <img
                            src="/kizuna-logo-sm.webp"
                            alt="Kizuna Logo"
                            className="h-11 w-auto"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
                    <p className="text-muted-foreground mt-2 text-center">
                        Enter your email and we&apos;ll send you a reset link.
                    </p>
                </div>

                {success ? (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center p-6 rounded-lg bg-green-500/10 border border-green-500/20">
                            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                            <h2 className="text-lg font-semibold text-foreground mb-2">Check your email</h2>
                            <p className="text-sm text-muted-foreground">
                                We&apos;ve sent a password reset link to <strong className="text-foreground">{email}</strong>
                            </p>
                        </div>
                        <Link href="/login" className="block">
                            <Button variant="outline" className="w-full gap-2">
                                <ArrowLeft size={16} />
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <div className="relative">
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10"
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={loading}
                        >
                            Send Reset Link
                        </Button>

                        <Link href="/login" className="block">
                            <Button variant="ghost" className="w-full gap-2 text-muted-foreground hover:text-foreground">
                                <ArrowLeft size={16} />
                                Back to Login
                            </Button>
                        </Link>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <p className="text-xs text-muted-foreground/60 font-mono">
                        v{CURRENT_VERSION}
                    </p>
                </div>
            </Card>
        </div>
    );
}
