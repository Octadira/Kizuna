import { Navbar } from "@/components/Navbar";
import NextTopLoader from 'nextjs-toploader';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
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
            <Navbar />
            <main className="flex-1 w-full md:pl-64 transition-all duration-300">
                <div className="p-4 pt-20 md:p-12 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
