/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    plugins: [require("tailgrids/plugin"), require("daisyui")],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#5E4AE3",
                    dark: "#503ac8",
                    ring: "#8384f6",
                },
                secondary: "#202125",
                background: "#E0E0E0",
                grayNav: "#39383d",
            },
        },
    },
};
