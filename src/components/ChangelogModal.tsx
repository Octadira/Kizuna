import { changelog } from "@/lib/changelog";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { History } from "lucide-react";

export function ChangelogModal({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History size={20} />
                        Changelog
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                        {changelog.map((entry) => (
                            <div key={entry.version} className="relative pl-4 border-l border-border">
                                <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg">v{entry.version}</h3>
                                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                                </div>
                                <ul className="space-y-1">
                                    {entry.changes.map((change, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                                            {change}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
