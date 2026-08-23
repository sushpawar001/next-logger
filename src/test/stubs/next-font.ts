/**
 * `next/font/google` is a Next compiler macro that esbuild cannot transform,
 * so any test that transitively imports a layout would fail to parse.
 * vitest.config.ts aliases the font modules here.
 */
const font = () => ({
    className: "font-mock",
    style: { fontFamily: "mock" },
    variable: "--font-mock",
});

export const Inter = font;
export const Roboto = font;
export default font;
