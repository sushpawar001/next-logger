"use client";

import React, { useState, useEffect } from "react";
import { CopyButton } from "@/components/animate-ui/buttons/copy";
import { Badge } from "@/components/ui/badge";
import { Share2 } from "lucide-react";

interface CopyUrlButtonProps {
    className?: string;
    variant?:
        | "default"
        | "muted"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost";
    size?: "default" | "sm" | "md" | "lg";
    showEncouragement?: boolean;
}

const CopyUrlButton: React.FC<CopyUrlButtonProps> = ({
    className,
    variant = "outline",
    size = "md",
    showEncouragement = false,
}) => {
    const [currentUrl, setCurrentUrl] = useState("");
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Set initial URL only on client side
        setCurrentUrl(window.location.href);
    }, []);

    const handleCopy = (content: string) => {
        // Get the current URL at the moment of copying to ensure it's up to date
        if (typeof window !== "undefined") {
            const urlToCopy = window.location.href;
            return urlToCopy;
        }
        return content;
    };

    // Don't render anything during SSR
    if (!isClient) {
        return null;
    }

    if (showEncouragement) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share this tool</span>
                </div>
                <CopyButton
                    content={currentUrl}
                    variant="outline"
                    size="md"
                    className="border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 dark:border-purple-700 dark:bg-purple-950/30 dark:hover:bg-purple-950/50 dark:text-purple-300 dark:hover:text-purple-200"
                    aria-label="Copy page URL"
                    onCopy={handleCopy}
                />
                <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-700"
                >
                    Free
                </Badge>
            </div>
        );
    }

    return (
        <CopyButton
            content={currentUrl}
            variant={variant}
            size={size}
            className={className}
            aria-label="Copy page URL"
            onCopy={handleCopy}
        />
    );
};

export default CopyUrlButton;
