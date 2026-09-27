import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * A server-rendered reference table for a tool page. The rows are computed
 * from the same functions the calculator uses, so they are never typed by
 * hand, and being in the static HTML lets them rank for "... chart" searches.
 */
export default function ReferenceTable({
    title,
    description,
    columns,
    rows,
}: {
    title: string;
    description?: ReactNode;
    columns: string[];
    rows: ReactNode[][];
}) {
    return (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    <h2>{title}</h2>
                </CardTitle>
                {description && (
                    <p className="text-sm text-gray-600">{description}</p>
                )}
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                {columns.map((column) => (
                                    <th
                                        key={column}
                                        scope="col"
                                        className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-900"
                                    >
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i}>
                                    {row.map((cell, j) => (
                                        <td
                                            key={j}
                                            className="border border-gray-200 px-3 py-2 text-sm text-gray-700"
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
