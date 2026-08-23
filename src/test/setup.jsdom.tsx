import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// `globals: false` means RTL's automatic cleanup is not installed.
afterEach(() => cleanup());

// Recharts' ResponsiveContainer needs ResizeObserver, absent in jsdom.
class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as any;

globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
} as any;

// jsdom reports 0x0 for every element; give Recharts a viewport to draw into.
if (!(HTMLElement.prototype as any).__bcrPatched) {
    (HTMLElement.prototype as any).__bcrPatched = true;
    HTMLElement.prototype.getBoundingClientRect = function () {
        return {
            width: 800,
            height: 400,
            top: 0,
            left: 0,
            bottom: 400,
            right: 800,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        } as DOMRect;
    };
}

/**
 * Both next/dynamic call sites load framer-motion's motion.div. The real
 * loadable does not forward its ref to a DOM node here, so PopUpModal's
 * outside-click handler ends up calling `.contains` on a non-element and
 * throws from a document listener. A forwarding div keeps refs real.
 */
vi.mock("next/dynamic", async () => {
    const React = await import("react");
    const MOTION_PROPS = new Set([
        "initial", "animate", "exit", "variants", "transition",
        "whileHover", "whileTap", "whileInView", "layout", "layoutId",
    ]);
    return {
        default: () =>
            React.forwardRef(function DynamicStub(props: any, ref: any) {
                const domProps: Record<string, any> = {};
                for (const [key, value] of Object.entries(props)) {
                    if (!MOTION_PROPS.has(key)) domProps[key] = value;
                }
                return React.createElement("div", { ...domProps, ref });
            }),
    };
});

// jsdom implements no Web Animations API, which @formkit/auto-animate calls
// from a MutationObserver -- so the failure surfaces as an uncatchable
// uncaught exception rather than a test failure.
if (!Element.prototype.animate) {
    Element.prototype.animate = function () {
        return {
            cancel() {},
            finish() {},
            play() {},
            pause() {},
            reverse() {},
            addEventListener() {},
            removeEventListener() {},
            finished: Promise.resolve(),
            onfinish: null,
            currentTime: 0,
            playState: "finished",
        } as unknown as Animation;
    };
}

// Radix primitives (Select, Dropdown) call the Pointer Capture APIs,
// which jsdom does not implement.
if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
    Element.prototype.setPointerCapture = () => {};
    Element.prototype.releasePointerCapture = () => {};
}

// jsdom does not implement scrollIntoView, which the add-forms call when
// focusing their value field from a PWA shortcut.
if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function () {};
}

// Required by the shadcn sidebar and src/hooks/use-mobile.tsx.
// Installed per-test: `restoreMocks: true` resets a plain vi.fn()'s
// implementation after each test, so a one-time assignment would start
// returning undefined from the second test onwards.
function installMatchMedia() {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
    window.scrollTo = vi.fn();
}
installMatchMedia();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => "/dashboard",
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    redirect: vi.fn(),
    notFound: vi.fn(),
}));

// The superseded Chart.js components (still reached via FitnessDashboard) pull
// in chartjs-adapter-dayjs-4, which is ESM-only and breaks under the CJS
// interop here. They are excluded from coverage, so stub them out.
vi.mock("chartjs-adapter-dayjs-4", () => ({ default: {} }));
vi.mock("react-chartjs-2", () => ({
    Line: () => null,
    Bar: () => null,
    Doughnut: () => null,
    Pie: () => null,
    Scatter: () => null,
}));

// next/image enforces width/height at runtime and does its own optimisation;
// a plain img keeps page render tests focused on the page.
vi.mock("next/image", () => ({
    default: ({ src, alt, ...rest }: any) => {
        const resolved = typeof src === "object" ? (src?.src ?? "") : src;
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={resolved} alt={alt ?? ""} {...rest} />;
    },
}));

vi.mock("@clerk/nextjs", () => ({
    ClerkProvider: ({ children }: any) => children,
    useUser: () => ({
        isLoaded: true,
        isSignedIn: true,
        user: { id: "user_2clerkA" },
    }),
    useAuth: () => ({
        isLoaded: true,
        isSignedIn: true,
        userId: "user_2clerkA",
        getToken: vi.fn(),
    }),
    UserButton: () => null,
    SignIn: () => null,
    SignUp: () => null,
    SignInButton: ({ children }: any) => children ?? null,
    SignedIn: ({ children }: any) => children,
    SignedOut: () => null,
}));

beforeEach(() => {
    installMatchMedia();
    vi.spyOn(console, "error").mockImplementation(() => {});
});
