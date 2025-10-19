"use client";
import React, { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { entryTags } from "@/constants/constants";

interface TagFilterCardProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    className?: string;
}

export default function TagFilterCard({
    selectedTags,
    onTagsChange,
    className = "",
}: TagFilterCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleTagToggle = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter((t) => t !== tag));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    const clearAllFilters = () => {
        onTagsChange([]);
    };

    const getDisplayText = () => {
        if (selectedTags.length === 0) {
            return "All Data";
        }
        if (selectedTags.length === 1) {
            return selectedTags[0];
        }
        return `${selectedTags.length} tags selected`;
    };

    return (
        <div
            className={`bg-white p-4 rounded-lg border border-purple-100 transition-all duration-300 shadow-md flex items-center justify-between relative ${className}`}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#5E4AE3] to-[#7C3AED]">
                    <Filter className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">
                        Filter by Tags
                    </h3>
                    <p className="text-sm text-gray-500">
                        {selectedTags.length > 0
                            ? `${selectedTags.length} tag${
                                  selectedTags.length > 1 ? "s" : ""
                              } selected`
                            : "Select tags to filter data"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Dropdown button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="border-purple-200 hover:border-[#5E4AE3] hover:bg-purple-50"
                >
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </div>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-purple-100 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">
                                Select Tags
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="text-xs text-gray-500 hover:text-gray-700"
                            >
                                Clear All
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {entryTags.map((tag) => (
                                <label
                                    key={tag}
                                    className="flex items-center space-x-3 p-2 hover:bg-purple-50 rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTags.includes(tag)}
                                        onChange={() => handleTagToggle(tag)}
                                        className="w-4 h-4 text-[#5E4AE3] bg-gray-100 border-gray-300 rounded focus:ring-[#5E4AE3] focus:ring-2"
                                    />
                                    <span className="text-sm text-gray-700">
                                        {tag}
                                    </span>
                                    {selectedTags.includes(tag) && (
                                        <Badge
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 ml-auto"
                                        >
                                            Selected
                                        </Badge>
                                    )}
                                </label>
                            ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                                Showing: {getDisplayText()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay to close dropdown when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
