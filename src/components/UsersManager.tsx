"use client";

import { useState } from "react";
import { AdminUser, deleteUser, inviteUser } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/Dialog";
import {
    Trash2,
    UserPlus,
    Shield,
    User as UserIcon,
    MoreHorizontal,
    Loader2,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UsersManagerProps {
    initialUsers: AdminUser[];
}

export function UsersManager({ initialUsers }: UsersManagerProps) {
    const [users] = useState<AdminUser[]>(initialUsers);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isInviting, setIsInviting] = useState(false);
    const router = useRouter();

    // Form states
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");
    const [inviteRole, setInviteRole] = useState("user");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        setMessage(null);

        try {
            const result = await inviteUser(inviteEmail, inviteName, inviteRole);

            if (result.error) {
                throw new Error(result.error);
            }

            setMessage({ type: 'success', text: `Invitation sent to ${inviteEmail}` });
            setInviteEmail("");
            setInviteName("");
            setIsInviteOpen(false);
            router.refresh(); // Refresh server data
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsInviting(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        setIsDeleting(userId);

        try {
            const result = await deleteUser(userId);
            if (result.error) {
                alert(`Error: ${result.error}`);
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to delete user", error);
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus size={16} /> Invite User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite New User</DialogTitle>
                            <DialogDescription>
                                Send an invitation to a new team member. They will receive an email to set up their account.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleInvite} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                >
                                    <option value="user">User (Standard Access)</option>
                                    <option value="admin">Admin (Full Access)</option>
                                </select>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isInviting}>
                                    {isInviting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                    Send Invitation
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success'
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <div className="grid gap-4">
                {initialUsers.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground border-dashed">
                        No users found.
                    </Card>
                ) : (
                    initialUsers.map((user) => (
                        <Card key={user.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg
                                    ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'}
                                `}>
                                    {user.fullName ? user.fullName[0].toUpperCase() : user.email?.[0].toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{user.fullName || "Unknown Name"}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold
                                            ${user.role === 'admin'
                                                ? 'bg-primary/5 text-primary border-primary/20'
                                                : 'bg-muted text-muted-foreground border-border'}
                                        `}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <p className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(user.id)}
                                    disabled={user.role === 'admin' || isDeleting === user.id}
                                    title={user.role === 'admin' ? "Cannot delete admin" : "Delete user"}
                                >
                                    {isDeleting === user.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
