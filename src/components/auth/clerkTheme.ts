import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/nextjs";

type ProviderProps = ComponentProps<typeof ClerkProvider>;

/*
 * Brand colours for Clerk. Clerk derives its hover/focus scales from these,
 * so they are plain hex rather than the hsl() CSS variables in globals.css.
 * Keep in step with the light-theme tokens there.
 */
const CREAM = "#FAF7F2";
const INK = "#241A33";
const AUBERGINE = "#4A3470";
const MUTED = "#6E5A99";
const BORDER = "#DDD3C2";
const LAVENDER = "#8E78C4";

/**
 * Sign-in / sign-up design "M1 · Plain" (docs/designs/auth/variations/m1-plain.svg):
 * Clerk's form sits straight on the Cream page, with no card, shadow or logo of
 * its own. AuthShell renders the wordmark above it.
 */
export const authAppearance: ProviderProps["appearance"] = {
    options: {
        logoPlacement: "none",
        socialButtonsVariant: "blockButton",
        socialButtonsPlacement: "top",
    },
    variables: {
        colorPrimary: AUBERGINE,
        colorPrimaryForeground: CREAM,
        colorForeground: INK,
        colorMutedForeground: MUTED,
        colorBackground: CREAM,
        colorInput: "#FFFFFF",
        colorInputForeground: INK,
        colorBorder: BORDER,
        colorRing: LAVENDER,
        colorNeutral: INK,
        // Reading-status colours, reused for Clerk's error/success messages
        colorDanger: "#C0392B",
        colorSuccess: "#2E7D5B",
        colorWarning: "#9A6412",
        fontFamily: "inherit",
        fontSize: "1rem",
        borderRadius: "0.5rem",
    },
    elements: {
        rootBox: { width: "100%" },
        cardBox: { width: "100%", boxShadow: "none", border: "none", background: "transparent" },
        card: { padding: 0, boxShadow: "none", border: "none", background: "transparent" },
        headerTitle: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.01em" },
        headerSubtitle: { fontSize: "0.9375rem", color: MUTED },
        socialButtonsBlockButton: { height: "2.875rem", backgroundColor: "#FFFFFF", borderColor: BORDER, boxShadow: "none" },
        socialButtonsBlockButtonText: { fontSize: "0.9375rem", fontWeight: 600 },
        formFieldLabel: { fontSize: "0.875rem", fontWeight: 500 },
        formFieldInput: { height: "2.75rem", fontSize: "1rem", boxShadow: "none", borderColor: BORDER },
        formButtonPrimary: { height: "2.875rem", fontSize: "0.9375rem", fontWeight: 600, textTransform: "none", boxShadow: "none" },
        footer: { background: "transparent", paddingTop: "0.5rem" },
        footerAction: { justifyContent: "center" },
        footerActionLink: { fontWeight: 600, color: AUBERGINE },
    },
};

/** M1 copy: short titles, one line of sub-copy at most. */
export const authLocalization: ProviderProps["localization"] = {
    signIn: {
        start: {
            title: "Sign in",
            titleCombined: "Sign in",
            subtitle: "Welcome back.",
            subtitleCombined: "Welcome back.",
            actionText: "New to FitDose?",
            actionLink: "Create an account",
        },
    },
    signUp: {
        start: {
            title: "Create account",
            titleCombined: "Create account",
            subtitle: "Free for 30 days. No card needed.",
            subtitleCombined: "Free for 30 days. No card needed.",
            actionText: "Already have an account?",
            actionLink: "Sign in",
        },
    },
};
