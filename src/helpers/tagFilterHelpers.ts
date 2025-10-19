/**
 * Utility function to filter data by selected tags
 * @param data - Array of data entries with tag property
 * @param selectedTags - Array of selected tag strings
 * @returns Filtered data array
 */
export const filterByTags = <T extends { tag?: string | null }>(
    data: T[],
    selectedTags: string[]
): T[] => {
    if (selectedTags.length === 0) {
        // Show all data including untagged when no filters selected
        return data;
    }

    // Show entries matching ANY selected tag (OR logic)
    // Exclude entries with null/undefined tags when filters are active
    return data.filter((entry) => selectedTags.includes(entry.tag));
};

/**
 * Get unique tags from a dataset
 * @param data - Array of data entries with tag property
 * @returns Array of unique tag strings (excluding null/undefined)
 */
export const getUniqueTags = <T extends { tag?: string | null }>(
    data: T[]
): string[] => {
    const tags = data
        .map((entry) => entry.tag)
        .filter((tag): tag is string => tag !== null && tag !== undefined);

    return Array.from(new Set(tags));
};
