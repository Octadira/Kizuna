"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
    className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    className
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showPages = 5;
        
        if (totalPages <= showPages + 2) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            if (currentPage > 3) {
                pages.push("...");
            }
            
            // Show pages around current
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            if (currentPage < totalPages - 2) {
                pages.push("...");
            }
            
            // Always show last page
            pages.push(totalPages);
        }
        
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 pt-6", className)}>
            {/* Items info */}
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
                Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
                <span className="font-medium text-foreground">{endItem}</span> of{" "}
                <span className="font-medium text-foreground">{totalItems}</span> results
            </p>

            {/* Pagination controls */}
            <div className="flex items-center gap-1 order-1 sm:order-2">
                {/* First page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={cn(
                        "h-9 w-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                        "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
                        "disabled:pointer-events-none disabled:opacity-50"
                    )}
                    aria-label="First page"
                >
                    <ChevronsLeft size={16} />
                </button>

                {/* Previous page */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn(
                        "h-9 w-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                        "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
                        "disabled:pointer-events-none disabled:opacity-50"
                    )}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                    {pageNumbers.map((page, index) => (
                        typeof page === "string" ? (
                            <span
                                key={`ellipsis-${index}`}
                                className="h-9 w-9 flex items-center justify-center text-muted-foreground"
                            >
                                {page}
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={cn(
                                    "h-9 w-9 flex items-center justify-center rounded-md text-sm font-medium transition-all",
                                    page === currentPage
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "border border-border bg-background hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                {page}
                            </button>
                        )
                    ))}
                </div>

                {/* Mobile page indicator */}
                <span className="sm:hidden text-sm text-muted-foreground px-2">
                    {currentPage} / {totalPages}
                </span>

                {/* Next page */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={cn(
                        "h-9 w-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                        "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
                        "disabled:pointer-events-none disabled:opacity-50"
                    )}
                    aria-label="Next page"
                >
                    <ChevronRight size={16} />
                </button>

                {/* Last page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={cn(
                        "h-9 w-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors",
                        "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
                        "disabled:pointer-events-none disabled:opacity-50"
                    )}
                    aria-label="Last page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}
