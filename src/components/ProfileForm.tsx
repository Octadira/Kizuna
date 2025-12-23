"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card } from "@/components/ui/Card";
import { User, Lock, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProfileForm() {
    const supabase = createClient();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // User data
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");

    // Password change
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;

                if (user) {
                    setEmail(user.email || "");
                    setFullName(user.user_metadata?.full_name || "");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (error) throw error;

            setMessage({ type: 'success', text: "Profile updated successfully." });
            router.refresh();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Failed to update profile." });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords do not match." });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters." });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setMessage({ type: 'success', text: "Password updated successfully." });
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Failed to update password." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success'
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <Card className="p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <User size={20} className="text-primary" />
                        Personal Information
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Update your personal details.
                    </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            value={email}
                            disabled
                            className="bg-muted cursor-not-allowed"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Email cannot be changed directly.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button type="submit" disabled={saving} className="gap-2">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>

            <Card className="p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Lock size={20} className="text-primary" />
                        Security
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your password and security settings.
                    </p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button type="submit" variant="outline" disabled={saving || !newPassword} className="gap-2">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Update Password
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
