/**
 * Announce that the user successfully saved a log entry.
 *
 * Currently consumed by the PWA install card (src/components/pwa/InstallAppCard.tsx),
 * which uses it as the moment to offer Add to Home Screen — the user has just
 * created something worth coming back for.
 *
 * Kept as a DOM event rather than a context so the *Add form components stay
 * decoupled from anything that wants to react to a log.
 */
export default function entryLogged(): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("fitdose:entry-logged"));
}
