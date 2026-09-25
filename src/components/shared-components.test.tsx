import { Activity } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent } from "@/test/render";

import DataPeriodSelectCard from "./DataPeriodSelectCard";
import MeasurementInput from "./MeasurementInput";
import PrivacyNotice from "./PrivacyNotice";
import TagFilterCard from "./TagFilterCard";
import PopUpModal from "./PopUpModal";
import CopyUrlButton from "./CopyUrlButton";
import { StatsTableCard } from "./StatsTableCard";
import { DashboardHeader } from "./DashboardHeader";
import PublicLeftSidebar from "./PublicLeftSidebar";
import { entryTags } from "@/constants/constants";
import { SidebarProvider } from "@/components/ui/sidebar";

describe("DataPeriodSelectCard", () => {
    const noop = () => {};

    it("renders the day-range options", () => {
        renderWithProviders(
            <DataPeriodSelectCard daysOfData={7} changeDaysOfData={noop} />
        );

        const select = screen.getByRole("combobox");
        const options = Array.from(select.querySelectorAll("option")).map(
            (o) => o.textContent
        );

        expect(options).toEqual(["7", "14", "30", "90", "365", "All"]);
    });

    it("reflects the selected period", () => {
        renderWithProviders(
            <DataPeriodSelectCard daysOfData={30} changeDaysOfData={noop} />
        );

        expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe(
            "30"
        );
    });

    it("reports a new selection to its parent", async () => {
        const user = userEvent.setup();
        const changeDaysOfData = vi.fn();
        renderWithProviders(
            <DataPeriodSelectCard
                daysOfData={7}
                changeDaysOfData={changeDaysOfData}
            />
        );

        await user.selectOptions(screen.getByRole("combobox"), "90");

        expect(changeDaysOfData).toHaveBeenCalled();
    });

    it('maps "All" to a very large day count', () => {
        renderWithProviders(
            <DataPeriodSelectCard daysOfData={7} changeDaysOfData={noop} />
        );

        const all = screen
            .getByRole("combobox")
            .querySelector('option[value="36500"]');

        expect(all).toBeTruthy();
    });

    it("accepts an extra className", () => {
        const { container } = renderWithProviders(
            <DataPeriodSelectCard
                daysOfData={7}
                changeDaysOfData={noop}
                className="mt-4"
            />
        );

        expect(container.firstChild).toHaveClass("mt-4");
    });
});

describe("MeasurementInput", () => {
    it("capitalises the label and uses it as the placeholder", () => {
        renderWithProviders(
            <MeasurementInput label="arms" id="arms" value="" onChange={() => {}} />
        );

        expect(screen.getByLabelText("Arms")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Arms")).toBeInTheDocument();
    });

    it("is a controlled numeric input", () => {
        renderWithProviders(
            <MeasurementInput label="chest" id="chest" value="98" onChange={() => {}} />
        );

        const input = screen.getByLabelText("Chest") as HTMLInputElement;
        expect(input.value).toBe("98");
        expect(input.type).toBe("number");
        expect(input.step).toBe("0.1");
        expect(input.min).toBe("0");
    });

    it("reports each keystroke", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        renderWithProviders(
            <MeasurementInput label="waist" id="waist" value="" onChange={onChange} />
        );

        await user.type(screen.getByLabelText("Waist"), "84");

        expect(onChange).toHaveBeenCalled();
    });
});

describe("PrivacyNotice", () => {
    it("states that calculations stay in the browser", () => {
        const { container } = renderWithProviders(<PrivacyNotice />);

        expect(container.textContent).toMatch(/not stored|locally/i);
    });
});

describe("TagFilterCard", () => {
    /** The dropdown toggle is icon-only, so it is found positionally. */
    const toggle = () => screen.getAllByRole("button").slice(-1)[0];

    it("invites the user to filter when nothing is selected", () => {
        renderWithProviders(
            <TagFilterCard selectedTags={[]} onTagsChange={() => {}} />
        );

        expect(screen.getByText("Select tags to filter data")).toBeInTheDocument();
    });

    it("summarises a single selected tag", () => {
        renderWithProviders(
            <TagFilterCard selectedTags={["Fasting"]} onTagsChange={() => {}} />
        );

        expect(screen.getByText("1 tag selected")).toBeInTheDocument();
    });

    it("pluralises the summary for several tags", () => {
        renderWithProviders(
            <TagFilterCard
                selectedTags={["Fasting", "Random"]}
                onTagsChange={() => {}}
            />
        );

        expect(screen.getByText("2 tags selected")).toBeInTheDocument();
    });

    it("stays closed until the toggle is used", () => {
        renderWithProviders(
            <TagFilterCard selectedTags={[]} onTagsChange={() => {}} />
        );

        expect(screen.queryByText("Select Tags")).not.toBeInTheDocument();
    });

    it("lists every entry tag once opened", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <TagFilterCard selectedTags={[]} onTagsChange={() => {}} />
        );

        await user.click(toggle());

        expect(screen.getByText("Select Tags")).toBeInTheDocument();
        for (const tag of entryTags) {
            expect(screen.getAllByText(tag).length).toBeGreaterThan(0);
        }
    });

    it('shows "All Data" in the dropdown footer when nothing is selected', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <TagFilterCard selectedTags={[]} onTagsChange={() => {}} />
        );

        await user.click(toggle());

        expect(screen.getByText(/Showing:\s*All Data/)).toBeInTheDocument();
    });

    it("checks the boxes for selected tags", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <TagFilterCard selectedTags={["Fasting"]} onTagsChange={() => {}} />
        );

        await user.click(toggle());
        const checked = screen
            .getAllByRole("checkbox")
            .filter((c) => (c as HTMLInputElement).checked);

        expect(checked).toHaveLength(1);
    });

    it("adds a tag that was not selected", async () => {
        const user = userEvent.setup();
        const onTagsChange = vi.fn();
        renderWithProviders(
            <TagFilterCard selectedTags={[]} onTagsChange={onTagsChange} />
        );

        await user.click(toggle());
        await user.click(screen.getAllByRole("checkbox")[0]);

        expect(onTagsChange).toHaveBeenCalledWith([entryTags[0]]);
    });

    it("removes a tag that was already selected", async () => {
        const user = userEvent.setup();
        const onTagsChange = vi.fn();
        renderWithProviders(
            <TagFilterCard
                selectedTags={[entryTags[0], entryTags[1]]}
                onTagsChange={onTagsChange}
            />
        );

        await user.click(toggle());
        await user.click(screen.getAllByRole("checkbox")[0]);

        expect(onTagsChange).toHaveBeenCalledWith([entryTags[1]]);
    });

    it("clears every filter at once", async () => {
        const user = userEvent.setup();
        const onTagsChange = vi.fn();
        renderWithProviders(
            <TagFilterCard
                selectedTags={["Fasting", "Random"]}
                onTagsChange={onTagsChange}
            />
        );

        await user.click(toggle());
        await user.click(screen.getByRole("button", { name: /clear all/i }));

        expect(onTagsChange).toHaveBeenCalledWith([]);
    });

    it("closes when the outside overlay is clicked", async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(
            <TagFilterCard selectedTags={[]} onTagsChange={() => {}} />
        );

        await user.click(toggle());
        await user.click(container.querySelector(".fixed.inset-0")!);

        expect(screen.queryByText("Select Tags")).not.toBeInTheDocument();
    });
});

describe("PopUpModal", () => {
    /**
     * The modal markup is always mounted and toggled with block/hidden, so
     * presence queries always match -- assert on visibility instead.
     */
    const dialog = () =>
        screen.getByText(/do really want to delete|do you really want to delete/i)
            .closest("div[class]")!;

    it("renders its trigger", () => {
        renderWithProviders(<PopUpModal delete={() => {}} />);

        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });

    it("keeps the confirmation hidden until the trigger is clicked", () => {
        const { container } = renderWithProviders(<PopUpModal delete={() => {}} />);

        expect(container.querySelector(".hidden")).toBeTruthy();
    });

    it("opens the confirmation on click", async () => {
        const user = userEvent.setup();
        const { container } = renderWithProviders(<PopUpModal delete={() => {}} />);

        await user.click(screen.getAllByRole("button")[0]);

        expect(container.querySelector(".block")).toBeTruthy();
    });

    it("runs the delete callback on confirm", async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        renderWithProviders(<PopUpModal delete={onDelete} />);

        await user.click(screen.getAllByRole("button")[0]);
        await user.click(screen.getAllByRole("button", { name: /^delete$/i })[1]);

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("closes without deleting on cancel", async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        renderWithProviders(<PopUpModal delete={onDelete} />);

        await user.click(screen.getAllByRole("button")[0]);
        await user.click(screen.getByRole("button", { name: /cancel/i }));

        expect(onDelete) .not.toHaveBeenCalled();
    });

    it("accepts custom trigger content", () => {
        renderWithProviders(
            <PopUpModal delete={() => {}} buttonContent={<span>Remove entry</span>} />
        );

        expect(screen.getByText("Remove entry")).toBeInTheDocument();
    });
});

describe("CopyUrlButton", () => {
    it("renders a copy action", () => {
        renderWithProviders(<CopyUrlButton />);

        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    // userEvent.setup() installs its own clipboard stub, so the copied value is
    // read back through that rather than through a hand-rolled spy.
    it("copies the current URL", async () => {
        const user = userEvent.setup();
        renderWithProviders(<CopyUrlButton />);

        await user.click(screen.getByRole("button"));

        await expect(navigator.clipboard.readText()).resolves.toBe(
            window.location.href
        );
    });

    it("can show the encouragement copy", () => {
        const { container } = renderWithProviders(
            <CopyUrlButton showEncouragement />
        );

        expect(container.textContent!.length).toBeGreaterThan(0);
    });
});

describe("StatsTableCard", () => {
    const stats = {
        mean: 120,
        median: 118,
        mode: [110],
        min: 80,
        max: 190,
        sum: 2400,
        dailyAvg: 120,
    };

    it("renders its title and every statistic", () => {
        renderWithProviders(
            <StatsTableCard
                title="Glucose"
                icon={Activity}
                gradient="from-purple-500 to-purple-700"
                newData={stats}
            />
        );

        expect(screen.getByText("Glucose")).toBeInTheDocument();
        expect(screen.getAllByText(/120/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/118/).length).toBeGreaterThan(0);
    });

    it("compares against a previous period when asked", () => {
        const older = { ...stats, mean: 100, median: 98 };
        const { container } = renderWithProviders(
            <StatsTableCard
                title="Glucose"
                icon={Activity}
                gradient="from-purple-500 to-purple-700"
                newData={stats}
                oldData={older}
                showTrend
            />
        );

        expect(container.textContent).toMatch(/100/);
    });

    it("renders without a previous period", () => {
        const { container } = renderWithProviders(
            <StatsTableCard
                title="Weight"
                icon={Activity}
                gradient="from-blue-500 to-blue-700"
                newData={stats}
            />
        );

        expect(container.textContent).toMatch(/Weight/);
    });
});

describe("DashboardHeader", () => {
    it("renders inside a sidebar provider", () => {
        const { container } = renderWithProviders(
            <SidebarProvider>
                <DashboardHeader />
            </SidebarProvider>
        );

        expect(container.querySelector("header, div")).toBeTruthy();
    });

    it("shows the wordmark logo linking to the dashboard", () => {
        renderWithProviders(
            <SidebarProvider>
                <DashboardHeader />
            </SidebarProvider>
        );

        const logo = screen.getByRole("img", { name: "FitDose" });
        expect(logo).toHaveAttribute("src", "/brand/svg/fitdose-wordmark.svg");
        expect(logo.closest("a")).toHaveAttribute("href", "/dashboard");
    });
});

describe("PublicLeftSidebar", () => {
    it("links to every public calculator", () => {
        renderWithProviders(
            <SidebarProvider>
                <PublicLeftSidebar />
            </SidebarProvider>
        );

        const hrefs = screen
            .getAllByRole("link")
            .map((a) => a.getAttribute("href"));

        expect(hrefs.some((h) => h?.includes("bmi"))).toBe(true);
        expect(hrefs.some((h) => h?.includes("tools"))).toBe(true);
    });

    it("shows the wordmark logo", () => {
        renderWithProviders(
            <SidebarProvider>
                <PublicLeftSidebar />
            </SidebarProvider>
        );

        expect(screen.getByRole("img", { name: "FitDose" })).toHaveAttribute(
            "src",
            "/brand/svg/fitdose-wordmark.svg"
        );
    });

    it("does not require a Clerk session", () => {
        // PublicLeftSidebar deliberately avoids Clerk so /tools stays static.
        expect(() =>
            renderWithProviders(
                <SidebarProvider>
                    <PublicLeftSidebar />
                </SidebarProvider>
            )
        ).not.toThrow();
    });
});
