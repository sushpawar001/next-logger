"use client";
import { ListFilter } from "lucide-react";
import { Chip } from "@/components/app-ui/controls";
import { entryTags } from "@/constants/constants";
import { cn } from "@/lib/utils";

interface TagFilterCardProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    className?: string;
    /** Defaults to the entry tags; the insulin page passes insulin names. */
    tags?: readonly string[];
    /** Accessible name for the chip group. */
    label?: string;
    /** Visible label before the chips (hidden on phones). */
    title?: string;
}

/**
 * Filter chips. Nothing selected means everything is shown; each pressed chip
 * narrows the list to entries with that tag (see `filterByTags`).
 */
export default function TagFilterCard({
    selectedTags,
    onTagsChange,
    className = "",
    tags = entryTags,
    label = "Filter by tag",
    title = "Tags",
}: TagFilterCardProps) {
    const toggle = (tag: string) =>
        onTagsChange(
            selectedTags.includes(tag)
                ? selectedTags.filter((t) => t !== tag)
                : [...selectedTags, tag]
        );

    return (
        <div className={cn("flex min-w-0 items-center gap-3", className)}>
            <span className="hidden flex-none items-center gap-1.5 text-[13px] font-semibold text-brand-muted lg:inline-flex">
                <ListFilter className="h-4 w-4" aria-hidden="true" />
                {title}
            </span>
            <div
                role="group"
                aria-label={label}
                className="-mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
            >
                {tags.map((tag) => (
                    <Chip
                        key={tag}
                        pressed={selectedTags.includes(tag)}
                        onClick={() => toggle(tag)}
                    >
                        {tag}
                    </Chip>
                ))}
                {selectedTags.length > 0 && (
                    <button
                        type="button"
                        onClick={() => onTagsChange([])}
                        className="h-8 flex-none px-2 text-[13px] font-semibold text-brand-aubergine hover:underline"
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
