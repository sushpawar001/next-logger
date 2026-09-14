/**
 * Trigger a browser download of generated content. The app never wrote files
 * before, so this is the single place that touches Blob / object URLs. Health
 * data is only ever handed to the user's own explicit download here -- it is
 * never persisted to the query cache or device storage.
 */
export function downloadBlob(
    filename: string,
    content: string | Blob,
    mimeType = "text/plain;charset=utf-8"
): void {
    const blob =
        content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}
