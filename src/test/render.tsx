import type { ReactElement, ReactNode } from "react";
import { render, renderHook, type RenderOptions } from "@testing-library/react";
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from "nuqs/adapters/testing";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * A fresh client per render, never a module-scope one.
 *
 * `clearMocks`/`restoreMocks` reset the axios spies between tests but would not
 * reset a shared cache, so rows fetched by one test would satisfy the next
 * test's query with no axios call at all and the `toHaveBeenCalledWith`
 * assertions would flake depending on file order.
 */
export function makeTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Several suites assert on failed loads. With retries on, those
                // pass but leave a live timer running past teardown.
                retry: false,
                // Suites render the same page across multiple `it`s and expect a
                // fetch each time.
                staleTime: 0,
                gcTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
            },
            mutations: { retry: false },
        },
    });
}

type ProviderOptions = {
    searchParams?: string | Record<string, string>;
    onUrlUpdate?: OnUrlUpdateFunction;
    queryClient?: QueryClient;
};

function makeWrapper({ searchParams = "", onUrlUpdate, queryClient }: ProviderOptions) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
                    {children}
                </NuqsTestingAdapter>
            </QueryClientProvider>
        );
    };
}

/**
 * The five public calculators and `use-quick-log` read URL state through nuqs,
 * which throws without an adapter. Assert URL writes via `onUrlUpdate` rather
 * than by reading window.location.
 *
 * Dashboard pages read their data through TanStack Query, so a QueryClient is
 * provided too. The client is returned so a test can pre-seed the cache or
 * assert on it after a mutation.
 */
export function renderWithProviders(
    ui: ReactElement,
    options: RenderOptions & ProviderOptions = {}
) {
    const {
        searchParams = "",
        onUrlUpdate,
        queryClient = makeTestQueryClient(),
        ...rest
    } = options;

    const Wrapper = makeWrapper({ searchParams, onUrlUpdate, queryClient });

    return { queryClient, ...render(ui, { wrapper: Wrapper, ...rest }) };
}

/** The same providers, for hook-level tests of `src/hooks/queries/**`. */
export function renderHookWithProviders<TResult>(
    hook: () => TResult,
    options: ProviderOptions = {}
) {
    const { searchParams = "", onUrlUpdate, queryClient = makeTestQueryClient() } = options;

    const Wrapper = makeWrapper({ searchParams, onUrlUpdate, queryClient });

    return { queryClient, ...renderHook(hook, { wrapper: Wrapper }) };
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
