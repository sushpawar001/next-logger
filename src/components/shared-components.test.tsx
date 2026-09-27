import { describe, expect, it, vi } from "vitest";
import { renderWithProviders, screen, userEvent, within } from "@/test/render";

import DataPeriodSelectCard from "./DataPeriodSelectCard";
import MeasurementInput from "./MeasurementInput";
import PrivacyNotice from "./PrivacyNotice";
import TagFilterCard from "./TagFilterCard";
import PopUpModal from "./PopUpModal";
import CopyUrlButton from "./CopyUrlButton";
import { StatsTableCard } from "./StatsTableCard";
import { DashboardHeader } from "./DashboardHeader";
import PublicLeftSidebar from "./PublicLeftSidebar";
import { HUBS, TOOLS } from "@/lib/tools/registry";
import { entryTags } from "@/constants/constants";
import { SidebarProvider } from "@/components/ui/sidebar";

describe("DataPeriodSelectCard", () => {
    const noop = () => {};
    const group = () => screen.getByRole("group", { name: "Period" });

    it("renders the six periods as toggle buttons", () => {
        renderWithProviders(
            <DataPeriodSelectCard daysOfData={7} changeDaysOfData={noop} />
        );

        const labels = Array.from(group().querySelectorAll("button")).map(
            (b) => b.textContent
        );

        expect(labels).toEqual(["7 days", "14 days", "30 days", "90 days", "1 year", "All"]);
    });

    it("marks the selected period as pressed", () => {
        renderWithProviders(
            <DataPeriodSelectCard daysOfData={30} changeDaysOfData={noop} />
        );

        expect(screen.getByRole("button", { name: "30 days" })).toHaveAttribute(
            "aria-pressed",
            "true"
        );
        expect(screen.getByRole("button", { name: "7 days" })).toHaveAttribute(
            "aria-pressed",
            "false"
        );
    });

    it("reports a new selection as an event-shaped value", async () => {
        const user = userEvent.setup();
        const changeDaysOfData = vi.fn();
        renderWithProviders(
            <DataPeriodSelectCard
                daysOfData={7}
                changeDaysOfData={changeDaysOfData}
            />
        );

        await user.click(screen.getByRole("button", { name: "90 days" }));

        expect(changeDaysOfData).toHaveBeenCalledWith({ target: { value: "90" } });
    });

    it('maps "All" to a very large day count', async () => {
        const user = userEvent.setup();
        const changeDaysOfData = vi.fn();
        renderWithProviders(
            <DataPeriodSelectCard daysOfData={7} changeDaysOfData={changeDaysOfData} />
        );

        await user.click(screen.getByRole("button", { name: "All" }));

        expect(changeDaysOfData).toHaveBeenCalledWith({ target: { value: "36500" } });
    });

    it("can limit the periods and use short labels", () => {
        renderWithProviders(
            <DataPeriodSelectCard
                daysOfData={7}
                changeDaysOfData={noop}
                periods={[7, 14]}
                short
            />
        );

        expect(
            Array.from(group().querySelectorAll("button")).map((b) => b.textContent)
        ).toEqual(["7d", "14d"]);
    });

    it("accepts an extra className", () => {
        renderWithProviders(
            <DataPeriodSelectCard
                daysOfData={7}
                changeDaysOfData={noop}
                className="mt-4"
            />
        );

        expect(group()).toHaveClass("mt-4");
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
    const chip = (name: string) => screen.getByRole("button", { name });

    it("renders a chip for every entry tag", () => {
        renderWithProviders(
            <TagFilterCard selectedTags={[]} onTagsChange={() => {}} />
        );

        const group = screen.getByRole("group", { name: "Filter by tag" });
        for (const tag of entryTags) {
            expect(group).toContainElement(chip(tag));
        }
    });

    it("marks selected tags as pressed", () => {
        renderWithProviders(
            <TagFilterCard selectedTags={["Fasting"]} onTagsChange={() => {}} />
        );

        expect(chip("Fasting")).toHaveAttribute("aria-pressed", "true");
        expect(chip("Random")).toHaveAttribute("aria-pressed", "false");
    });

    it("adds a tag that was not selected", async () => {
        const user = userEvent.setup();
        const onTagsChange = vi.fn();
        renderWithProviders(
            <TagFilterCard selectedTags={[]} onTagsChange={onTagsChange} />
        );

        await user.click(chip(entryTags[0]));

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

        await user.click(chip(entryTags[0]));

        expect(onTagsChange).toHaveBeenCalledWith([entryTags[1]]);
    });

    it("only offers Clear once something is selected", () => {
        const { rerender } = renderWithProviders(
            <TagFilterCard selectedTags={[]} onTagsChange={() => {}} />
        );
        expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();

        rerender(<TagFilterCard selectedTags={["Fasting"]} onTagsChange={() => {}} />);
        expect(chip("Clear")).toBeInTheDocument();
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

        await user.click(chip("Clear"));

        expect(onTagsChange).toHaveBeenCalledWith([]);
    });

    it("accepts a custom tag list and label", () => {
        renderWithProviders(
            <TagFilterCard
                selectedTags={[]}
                onTagsChange={() => {}}
                tags={["Lantus", "NovoRapid"]}
                label="Filter by insulin"
            />
        );

        const group = screen.getByRole("group", { name: "Filter by insulin" });
        expect(group.querySelectorAll("button")).toHaveLength(2);
    });
});

describe("PopUpModal", () => {
    const trigger = () => screen.getByRole("button", { name: "Delete" });

    it("renders an icon trigger labelled Delete", () => {
        renderWithProviders(<PopUpModal delete={() => {}} />);

        expect(trigger()).toBeInTheDocument();
    });

    it("keeps the confirmation closed until the trigger is clicked", () => {
        renderWithProviders(<PopUpModal delete={() => {}} />);

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens the confirmation on click", async () => {
        const user = userEvent.setup();
        renderWithProviders(<PopUpModal delete={() => {}} />);

        await user.click(trigger());

        expect(screen.getByRole("dialog")).toHaveTextContent("Delete this entry?");
    });

    it("runs the delete callback on confirm", async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        renderWithProviders(<PopUpModal delete={onDelete} />);

        await user.click(trigger());
        await user.click(
            within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" })
        );

        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes without deleting on cancel", async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();
        renderWithProviders(<PopUpModal delete={onDelete} />);

        await user.click(trigger());
        await user.click(screen.getByRole("button", { name: /cancel/i }));

        expect(onDelete).not.toHaveBeenCalled();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("says what will be removed", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <PopUpModal
                delete={() => {}}
                title="Delete this reading?"
                description="126 mg/dL · After meal"
            />
        );

        await user.click(trigger());

        expect(screen.getByRole("dialog")).toHaveTextContent("Delete this reading?");
        expect(screen.getByRole("dialog")).toHaveTextContent("126 mg/dL · After meal");
    });

    it("accepts custom trigger content", () => {
        renderWithProviders(
            <PopUpModal delete={() => {}} buttonContent={<span>Remove entry</span>} />
        );

        expect(screen.getByText("Remove entry")).toBeInTheDocument();
    });

    it("accepts a replacement trigger", async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <PopUpModal delete={() => {}} trigger={<button>Delete entry</button>} />
        );

        await user.click(screen.getByRole("button", { name: "Delete entry" }));

        expect(screen.getByRole("dialog")).toBeInTheDocument();
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
    const rows = [
        { label: "Average", previous: 138, current: 132 },
        { label: "Readings", previous: 26, current: 28 },
        { label: "In range", previous: 72, current: 79, suffix: "%", changeSuffix: " pts" },
    ];

    it("renders its title and a Metric · Previous · Current · Change table", () => {
        renderWithProviders(<StatsTableCard title="Glucose" rows={rows} />);

        expect(screen.getByRole("heading", { name: "Glucose" })).toBeInTheDocument();
        expect(
            screen.getAllByRole("columnheader").map((th) => th.textContent)
        ).toEqual(["Metric", "Previous", "Current", "Change"]);
    });

    it("shows previous, current and a signed change per row", () => {
        renderWithProviders(<StatsTableCard title="Glucose" rows={rows} />);

        const avg = screen.getByRole("row", { name: /average/i });
        expect(avg).toHaveTextContent("138");
        expect(avg).toHaveTextContent("132");
        expect(avg).toHaveTextContent("−6");

        expect(screen.getByRole("row", { name: /readings/i })).toHaveTextContent("+2");
        expect(screen.getByRole("row", { name: /in range/i })).toHaveTextContent(
            "+7 pts"
        );
    });

    it("keeps changes neutral: no status or red/green colour", () => {
        const { container } = renderWithProviders(
            <StatsTableCard title="Glucose" rows={rows} />
        );

        expect(container.innerHTML).not.toMatch(/text-(red|green)-|status-/);
    });

    it("drops the comparison columns when no row has a previous value", () => {
        renderWithProviders(
            <StatsTableCard
                title="Insulin"
                rows={[{ label: "Lantus", current: 12.5, decimals: 1 }]}
                currentLabel="Now"
            />
        );

        expect(
            screen.getAllByRole("columnheader").map((th) => th.textContent)
        ).toEqual(["Metric", "Now"]);
        expect(screen.getByRole("row", { name: /lantus/i })).toHaveTextContent("12.5");
    });

    it("shows a dash for a missing value and no change", () => {
        renderWithProviders(
            <StatsTableCard
                title="Weight"
                rows={[{ label: "Average", previous: null, current: 72.4, decimals: 1 }]}
                note="All values in kg."
            />
        );

        const row = screen.getByRole("row", { name: /average/i });
        expect(row).toHaveTextContent("—");
        expect(row).toHaveTextContent("72.4");
        expect(screen.getByText("All values in kg.")).toBeInTheDocument();
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

        for (const tool of TOOLS) {
            expect(hrefs).toContain(tool.href);
        }
        for (const hub of HUBS) {
            expect(hrefs).toContain(hub.href);
        }
        expect(hrefs).toContain("/tools");
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

describe("DashboardHeader account slot", () => {
    it("can drop the Clerk account button for the public /tools layout", async () => {
        const clerk = await import("@clerk/nextjs");
        const spy = vi.spyOn(clerk, "UserButton");
        renderWithProviders(
            <SidebarProvider>
                <DashboardHeader showAccount={false} />
            </SidebarProvider>
        );

        expect(spy).not.toHaveBeenCalled();
    });

    it("shows it by default", async () => {
        const clerk = await import("@clerk/nextjs");
        const spy = vi.spyOn(clerk, "UserButton");
        renderWithProviders(
            <SidebarProvider>
                <DashboardHeader />
            </SidebarProvider>
        );

        expect(spy).toHaveBeenCalled();
    });
});
