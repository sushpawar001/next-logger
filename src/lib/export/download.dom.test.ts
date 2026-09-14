import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadBlob } from "./download";

describe("downloadBlob", () => {
    let createUrl: ReturnType<typeof vi.fn>;
    let revokeUrl: ReturnType<typeof vi.fn>;
    let clickedAnchor: HTMLAnchorElement | null;

    beforeEach(() => {
        createUrl = vi.fn(() => "blob:mock-url");
        revokeUrl = vi.fn();
        (URL as any).createObjectURL = createUrl;
        (URL as any).revokeObjectURL = revokeUrl;
        clickedAnchor = null;
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
            function (this: HTMLAnchorElement) {
                clickedAnchor = this;
            }
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("builds a Blob, clicks a download anchor, and cleans up", () => {
        downloadBlob("glucose.csv", "Date,Glucose\n1,2", "text/csv;charset=utf-8");

        expect(createUrl).toHaveBeenCalledTimes(1);
        const blob = createUrl.mock.calls[0][0] as Blob;
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe("text/csv;charset=utf-8");

        expect(clickedAnchor).not.toBeNull();
        expect(clickedAnchor!.download).toBe("glucose.csv");
        expect(clickedAnchor!.getAttribute("href")).toBe("blob:mock-url");

        expect(revokeUrl).toHaveBeenCalledWith("blob:mock-url");
        // anchor is detached again
        expect(document.querySelector("a[download]")).toBeNull();
    });

    it("passes an existing Blob straight through", () => {
        const blob = new Blob(["%PDF"], { type: "application/pdf" });
        downloadBlob("export.pdf", blob);
        expect(createUrl).toHaveBeenCalledWith(blob);
    });
});
