/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    // Loaded from globals.css via `@config` (Tailwind 4 compatibility mode).
    // Animations come from tw-animate-css, imported in globals.css.
    theme: {
    	// Inlined from the deprecated tailgrids plugin, which the layout was
    	// built on: its breakpoints replace Tailwind's defaults app-wide. The
    	// matching `container` utility is defined in globals.css.
    	screens: {
    		xs: '400px',
    		sm: '540px',
    		md: '720px',
    		lg: '960px',
    		xl: '1140px',
    		'2xl': '1320px'
    	},
    	extend: {
    		fontFamily: {
    			sans: [
    				'"Inter", sans-serif',
    				'ui-sans-serif',
    				'system-ui',
    				'sans-serif',
    				'"Apple Color Emoji"',
    				'"Segoe UI Emoji"',
    				'"Segoe UI Symbol"',
    				'"Noto Color Emoji"'
    			]
    		},
    		// Tailwind 3's type scale. v4 expresses these line-heights as
    		// ratios, so children with an arbitrary size (e.g. text-[13px])
    		// would inherit a scaled line-height instead of the fixed rem one.
    		fontSize: {
    			xs: ['0.75rem', { lineHeight: '1rem' }],
    			sm: ['0.875rem', { lineHeight: '1.25rem' }],
    			base: ['1rem', { lineHeight: '1.5rem' }],
    			lg: ['1.125rem', { lineHeight: '1.75rem' }],
    			xl: ['1.25rem', { lineHeight: '1.75rem' }],
    			'2xl': ['1.5rem', { lineHeight: '2rem' }],
    			'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    			'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    			'5xl': ['3rem', { lineHeight: '1' }],
    			'6xl': ['3.75rem', { lineHeight: '1' }],
    			'7xl': ['4.5rem', { lineHeight: '1' }],
    			'8xl': ['6rem', { lineHeight: '1' }],
    			'9xl': ['8rem', { lineHeight: '1' }]
    		},
    		// tailgrids' shadow scale (the only keys in use).
    		boxShadow: {
    			xs: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
    			sm: '0px 1px 3px 0px rgba(16, 24, 40, 0.10), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
    			md: '0px 4px 8px -2px rgba(16, 24, 40, 0.10), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
    			xl: '0px 8px 8px -4px rgba(16, 24, 40, 0.03), 0px 20px 24px -4px rgba(16, 24, 40, 0.08)'
    		},
    		colors: {
    			// tailgrids colors still in use (border-stroke, text-body-color,
    			// text-dark, bg-dark/90, bg-black/80).
    			stroke: '#DFE4EA',
    			'body-color': '#637381',
    			dark: {
    				DEFAULT: '#111928',
    				'2': '#1F2A37',
    				'3': '#374151',
    				'4': '#4B5563',
    				'5': '#6B7280',
    				'6': '#9CA3AF',
    				'7': '#D1D5DB',
    				'8': '#E5E7EB'
    			},
    			black: {
    				DEFAULT: '#212B36'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				dark: '#241A33',
    				ring: 'hsl(var(--ring))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			// Aubergine & Oat brand palette (docs/designs/brand-guidelines.md §2).
    			// Named here because `secondary` above is a legacy gray, not Oat.
    			brand: {
    				ink: '#241A33',
    				aubergine: '#4A3470',
    				'aubergine-hover': '#3D2A5E',
    				lavender: '#8E78C4',
    				'lavender-light': '#B9A9DC',
    				oat: '#E8DFD0',
    				cream: '#FAF7F2',
    				tint: '#F3EEE6',
    				line: '#E8DFD0',
    				'line-strong': '#DDD3C2',
    				muted: '#6E5A99',
    				body: '#4F4363',
    				'on-dark': '#D9CFEA',
    				'night-line': '#3A2E4D'
    			},
    			secondary: {
    				DEFAULT: '#111827',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			background: 'hsl(var(--background))',
    			backgroundold: '#E0E0E0',
    			grayNav: '#39383d',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		}
    	}
    },
};
