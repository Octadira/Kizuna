
import { SidebarProvider } from "@/components/SidebarProvider";
import { DashboardShell } from "@/components/DashboardShell";
import NextTopLoader from 'nextjs-toploader';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <NextTopLoader
                color="#22c55e"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px #22c55e,0 0 5px #22c55e"
            />
            <DashboardShell>
                {children}
            </DashboardShell>
        </SidebarProvider>
    );
}
