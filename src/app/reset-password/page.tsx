"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { BRANDING, BrandLogo } from "@/config/branding";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { CURRENT_VERSION } from "@/lib/changelog";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check if user has a valid recovery session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsValidSession(!!session);
        };
        checkSession();

        // Listen for auth state changes (when user clicks the reset link)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                setIsValidSession(true);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });
            if (error) throw error;
            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Loading state while checking session
    if (isValidSession === null) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 border-border bg-card/85 backdrop-blur-xl shadow-2xl">
                    <div className="flex flex-col items-center">
                        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-muted-foreground">Verifying reset link...</p>
                    </div>
                </Card>
            </div>
        );
    }

    // Invalid or expired session
    if (!isValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8 border-border bg-card/85 backdrop-blur-xl shadow-2xl">
                    <div className="flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <h1 className="text-xl font-bold text-foreground mb-2">Invalid or Expired Link</h1>
                        <p className="text-muted-foreground mb-6">
                            This password reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link href="/forgot-password" className="w-full">
                            <Button className="w-full">Request New Link</Button>
                        </Link>
                        <Link href="/login" className="mt-3">
                            <Button variant="ghost" className="text-muted-foreground">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <Card className="w-full max-w-md p-8 relative z-10 border-border bg-card/85 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="logo-container flex items-center justify-center mb-4 text-white">
                        <BrandLogo className="h-11 w-11" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
                    <p className="text-muted-foreground mt-2 text-center">
                        Enter your new password below.
                    </p>
                </div>

                {success ? (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center p-6 rounded-lg bg-green-500/10 border border-green-500/20">
                            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                            <h2 className="text-lg font-semibold text-foreground mb-2">Password Updated!</h2>
                            <p className="text-sm text-muted-foreground">
                                Your password has been successfully reset. Redirecting to login...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">New Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="pl-10 pr-10"
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Confirm Password</label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="pl-10 pr-10"
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Password requirements */}
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p className={password.length >= 6 ? "text-green-500" : ""}>
                                • Minimum 6 characters {password.length >= 6 && "✓"}
                            </p>
                            <p className={password === confirmPassword && confirmPassword.length > 0 ? "text-green-500" : ""}>
                                • Passwords match {password === confirmPassword && confirmPassword.length > 0 && "✓"}
                            </p>
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
                            disabled={password.length < 6 || password !== confirmPassword}
                        >
                            Update Password
                        </Button>
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
