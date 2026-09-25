"use client";
import GlucoseChartRecharts from "@/components/Charts/RechartComponents/GlucoseChartRecharts";
import GlucoseAdd from "@/components/DashboardInputs/GlucoseAdd";
import { useQuickLog } from "@/hooks/use-quick-log";
import DataPeriodSelectCard from "@/components/DataPeriodSelectCard";
import TagFilterCard from "@/components/TagFilterCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import PopUpModal from "@/components/PopUpModal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import formatDate from "@/helpers/formatDate";
import notify from "@/helpers/notify";
import { filterByTags } from "@/helpers/tagFilterHelpers";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { History, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useEntries } from "@/hooks/queries/useEntries";
import { EMPTY_ROWS } from "@/lib/query/keys";
import { useDeleteEntry } from "@/hooks/queries/useEntryMutations";
const TdStyle = {
    ThStyle: `lg:min-w-[180px] border-l border-transparent py-3 px-3 text-base font-medium text-white lg:px-4`,
    TdStyle: `text-dark border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-2 px-3 text-center font-normal text-base`,
    TdStyle2: `text-dark border-b border-[#E8E8E8] bg-white py-2 px-3 text-center font-normal text-base`,
    TdButton: `inline-block px-3 py-1.5 border rounded-md border-primary text-primary hover:bg-primary hover:text-white font-normal text-base transition-colors duration-300`,
    TdButton2: `inline-block px-3 py-1.5 border rounded-md border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-normal text-base`,
};

export default function GlucosePage() {
    const quickLog = useQuickLog();
    const [daysOfData, setDaysOfData] = useState(7);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [parent] = useAutoAnimate({ duration: 400 });

    const {
        data: glucoseData = EMPTY_ROWS,
        isPending,
        isError,
    } = useEntries("glucose", daysOfData);
    const deleteEntry = useDeleteEntry("glucose");

    const changeDaysOfData = (event: { target: { value: string } }) => {
        const daysInput = event.target.value;
        setDaysOfData(parseInt(daysInput));
    };

    const deleteData = async (id) => {
        try {
            await deleteEntry.mutateAsync(id);
            notify("Glucose data deleted!", "success");
        } catch (error) {
            notify("Could not delete that entry.", "error");
        }
    };

    // Filter data based on selected tags
    const filteredGlucoseData = filterByTags(glucoseData, selectedTags);

    // isPending, not isFetching: with keepPreviousData a period change keeps the
    // previous window on screen instead of blanking the page behind a skeleton.
    if (isPending) {
        return <LoadingSkeleton />;
    }

    if (isError) {
        return (
            <div className="text-red-500 text-center p-4">
                Failed to load glucose data. Please try again later.
            </div>
        );
    }

    return (
        <section className="h-full flex justify-center items-center bg-background p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
                <div className="md:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <DataPeriodSelectCard
                        daysOfData={daysOfData}
                        changeDaysOfData={changeDaysOfData}
                        className=""
                    />
                    <TagFilterCard
                        selectedTags={selectedTags}
                        onTagsChange={setSelectedTags}
                        className=""
                    />
                </div>
                <div className="mb-4 md:mb-6 mx-auto p-3 md:px-6 rounded-lg bg-white border border-border transition-all duration-300 shadow-md h-full w-full md:col-span-2">
                    <h3 className="block p-0 text-lg font-semibold text-gray-900 mb-3">
                        Glucose Trends
                    </h3>
                    <div className="h-72">
                        <GlucoseChartRecharts
                            data={filteredGlucoseData}
                            fetch={false}
                        />
                    </div>
                </div>
                <div className="w-full">
                    <GlucoseAdd autoFocus={quickLog} />
                </div>
                <div className="border border-border transition-all duration-300 shadow-md p-4 md:px-6 rounded-lg md:col-span-3 bg-white">
                    <div className="max-w-full overflow-x-auto rounded-lg">
                        <div className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-3">
                            <div
                                className={`p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600`}
                            >
                                <History className="h-4 w-4 text-white" />
                            </div>
                            Glucose History
                        </div>
                        <div className="rounded-lg border border-border overflow-hidden w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                        <TableHead className="text-white font-medium">
                                            Blood Glucose
                                        </TableHead>
                                        <TableHead className="text-white font-medium">
                                            DateTime
                                        </TableHead>
                                        <TableHead className="text-white font-medium">
                                            Tag
                                        </TableHead>
                                        <TableHead className="text-white font-medium text-center">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody ref={parent}>
                                    {filteredGlucoseData.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="text-center py-8 text-gray-500"
                                            >
                                                {glucoseData.length === 0
                                                    ? "No glucose entries found for the selected period."
                                                    : "No glucose entries match the selected tags."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredGlucoseData.map(
                                            (entry, index) => (
                                                <TableRow
                                                    key={entry.id}
                                                    className={`hover:bg-accent/50 transition-colors ${
                                                        index % 2 === 0
                                                            ? "bg-white"
                                                            : "bg-gray-50/50"
                                                    }`}
                                                >
                                                    <TableCell className="font-medium text-gray-900">
                                                        {entry.value} mg/dl
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {formatDate(
                                                            entry.createdAt
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 min-w-12 md:min-w-20 justify-center">
                                                            {entry.tag ?? "--"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Link
                                                                href={`/glucose/${entry._id}`}
                                                                className={
                                                                    TdStyle.TdButton
                                                                }
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </Link>
                                                            <PopUpModal
                                                                delete={() => {
                                                                    deleteData(
                                                                        entry._id
                                                                    );
                                                                }}
                                                                buttonContent={
                                                                    <Trash2 className="h-5 w-5" />
                                                                }
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
