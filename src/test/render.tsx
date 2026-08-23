import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from "nuqs/adapters/testing";

/**
 * The five public calculators and `use-quick-log` read URL state through nuqs,
 * which throws without an adapter. Assert URL writes via `onUrlUpdate` rather
 * than by reading window.location.
 */
export function renderWithProviders(
    ui: ReactElement,
    options: RenderOptions & {
        searchParams?: string | Record<string, string>;
        onUrlUpdate?: OnUrlUpdateFunction;
    } = {}
) {
    const { searchParams = "", onUrlUpdate, ...rest } = options;

    const Wrapper = ({ children }: { children: ReactNode }) => (
        <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
            {children}
        </NuqsTestingAdapter>
    );

    return render(ui, { wrapper: Wrapper, ...rest });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
