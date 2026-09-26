import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    renderWithProviders,
    screen,
    userEvent,
    waitFor,
} from "@/test/render";

vi.mock("@/helpers/notify", () => ({ default: vi.fn() }));
vi.mock("@/lib/export/exportData", () => ({ runExport: vi.fn() }));

import notify from "@/helpers/notify";
import { runExport } from "@/lib/export/exportData";
import ExportDataCard from "./ExportDataCard";

const runExportMock = vi.mocked(runExport);
const notifyMock = vi.mocked(notify);

beforeEach(() => {
    runExportMock.mockReset();
    notifyMock.mockClear();
});

describe("ExportDataCard", () => {
    it("starts with every dataset unchecked and Export disabled", () => {
        renderWithProviders(<ExportDataCard />);
        const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
        expect(boxes).toHaveLength(4);
        expect(boxes.some((b) => b.checked)).toBe(false);
        expect(screen.getByRole("button", { name: /export/i })).toBeDisabled();
    });

    it("exports the checked datasets and reports the count", async () => {
        runExportMock.mockResolvedValue(12);
        const user = userEvent.setup();
        renderWithProviders(<ExportDataCard />);

        await user.click(screen.getByLabelText("Glucose"));
        await user.click(screen.getByLabelText("Insulin"));
        await user.click(screen.getByLabelText("Weight"));
        await user.click(screen.getByRole("button", { name: /export/i }));

        await waitFor(() => expect(runExportMock).toHaveBeenCalledTimes(1));
        expect(runExportMock).toHaveBeenCalledWith({
            metrics: ["glucose", "insulin", "weight"],
            days: 30,
            format: "csv",
            pdfMode: "combined",
        });
        expect(notifyMock).toHaveBeenCalledWith(
            expect.stringContaining("12"),
            "success"
        );
    });

    it("surfaces an error when the export fails", async () => {
        runExportMock.mockRejectedValue(new Error("network down"));
        const user = userEvent.setup();
        renderWithProviders(<ExportDataCard />);

        await user.click(screen.getByLabelText("Glucose"));
        await user.click(screen.getByRole("button", { name: /export/i }));

        await waitFor(() =>
            expect(notifyMock).toHaveBeenCalledWith("network down", "error")
        );
    });

    it("reveals the PDF layout picker only when PDF is chosen", async () => {
        const user = userEvent.setup();
        renderWithProviders(<ExportDataCard />);

        expect(screen.queryByRole("group", { name: "PDF layout" })).toBeNull();

        await user.click(screen.getByRole("radio", { name: "PDF" }));

        expect(screen.getByRole("group", { name: "PDF layout" })).toBeInTheDocument();
    });

    it("exports with the chosen period, format and PDF layout", async () => {
        runExportMock.mockResolvedValue(3);
        const user = userEvent.setup();
        renderWithProviders(<ExportDataCard />);

        await user.click(screen.getByLabelText("Weight"));
        await user.selectOptions(screen.getByLabelText("Period"), "Last 90 days");
        await user.click(screen.getByRole("radio", { name: "PDF" }));
        await user.click(screen.getByRole("radio", { name: /separate PDF/i }));
        await user.click(screen.getByRole("button", { name: /export/i }));

        await waitFor(() =>
            expect(runExportMock).toHaveBeenCalledWith({
                metrics: ["weight"],
                days: 90,
                format: "pdf",
                pdfMode: "separate",
            })
        );
    });
});
