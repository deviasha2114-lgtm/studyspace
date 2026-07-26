/** @type {import('tailwindcss').Config} */

// ─────────────────────────────────────────────
// StudySpace Design System v1.0
// Dark-mode first · Student-friendly · Modern
// ─────────────────────────────────────────────

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {

      // ── UI-01: COLOR SYSTEM ──────────────────

      colors: {

        // Primary Brand — Indigo-Violet
        // Chosen for focus, trust, and study-mode calm.
        // Avoids generic blue; has warmth without being distracting.
        primary: {
          50:  '#EEF0FF',
          100: '#DDE2FF',
          200: '#C0C8FF',
          300: '#9AA3FF',
          400: '#7B7EFF',
          500: '#6366F1', // Brand core
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },

        // Backgrounds — Dark mode first
        bg: {
          base:     '#0F0F14', // Page root — near-black with violet undertone
          surface:  '#18181F', // Cards, panels
          elevated: '#222230', // Modals, dropdowns, tooltips
          overlay:  '#2C2C3E', // Hover states, active items
        },

        // Text
        text: {
          primary:   '#F0F0FF', // Headings, labels
          secondary: '#A8A8C0', // Body, descriptions
          muted:     '#6464808', // Placeholders, disabled
          inverse:   '#0F0F14', // On light backgrounds
        },

        // Borders
        border: {
          subtle:  '#1E1E2E', // Dividers, section breaks
          default: '#2E2E44', // Input outlines, card edges
          strong:  '#4A4A6A', // Active focus rings, selected
        },

        // Status Colors
        status: {
          // Success — Emerald (study streak, correct answer)
          success: {
            bg:   '#052E16',
            text: '#86EFAC',
            border:'#166534',
            icon: '#4ADE80',
          },
          // Warning — Amber (deadline near, low storage)
          warning: {
            bg:   '#2D1B00',
            text: '#FDE68A',
            border:'#92400E',
            icon: '#FBBF24',
          },
          // Error — Rose (submission failed, banned)
          error: {
            bg:   '#2D0A0A',
            text: '#FCA5A5',
            border:'#991B1B',
            icon: '#F87171',
          },
          // Info — Sky (tips, announcements)
          info: {
            bg:   '#082040',
            text: '#BAE6FD',
            border:'#075985',
            icon: '#38BDF8',
          },
        },

        // Light mode overrides (apply with [data-theme="light"] or .light class)
        // Use CSS variables in globals.css for seamless switching
        light: {
          'bg-base':     '#F8F8FF',
          'bg-surface':  '#FFFFFF',
          'bg-elevated': '#F0F0FA',
          'bg-overlay':  '#E8E8F5',
          'text-primary':   '#0F0F1A',
          'text-secondary': '#44445C',
          'text-muted':     '#8888A8',
          'border-subtle':  '#E4E4F0',
          'border-default': '#C8C8E0',
          'border-strong':  '#8888C0',
        },
      },


      // ── UI-02: TYPOGRAPHY SYSTEM ─────────────

      fontFamily: {
        // Display — Plus Jakarta Sans
        // Modern, geometric, confident. Not the default Inter.
        // Used for headings, hero text, brand moments.
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],

        // Body — Inter
        // Reliable, highly legible for long reading sessions.
        sans: ['Inter', 'system-ui', 'sans-serif'],

        // Mono — JetBrains Mono
        // Code blocks, file names, timestamps, data.
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },

      // Google Fonts import (add to globals.css):
      // @import url('https://fonts.googleapis.com/css2?
      //   family=Plus+Jakarta+Sans:wght@400;500;600;700;800&
      //   family=Inter:wght@300;400;500;600&
      //   family=JetBrains+Mono:wght@400;500&display=swap');

      fontSize: {
        xs:   ['0.75rem',  { lineHeight: '1rem',    letterSpacing: '0.025em'  }], // 12px — captions
        sm:   ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em'   }], // 14px — labels
        base: ['1rem',     { lineHeight: '1.625rem', letterSpacing: '0'       }], // 16px — body
        lg:   ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.005em' }], // 18px — lead text
        xl:   ['1.25rem',  { lineHeight: '1.875rem', letterSpacing: '-0.01em' }], // 20px — subheadings
        '2xl':['1.5rem',   { lineHeight: '2rem',    letterSpacing: '-0.015em' }], // 24px — card titles
        '3xl':['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em'  }], // 30px — section heads
        '4xl':['2.25rem',  { lineHeight: '2.5rem',  letterSpacing: '-0.025em' }], // 36px — page titles
        '5xl':['3rem',     { lineHeight: '1',        letterSpacing: '-0.03em' }], // 48px — hero
      },

      fontWeight: {
        light:    '300',
        regular:  '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
        extrabold:'800',
      },

      lineHeight: {
        none:    '1',
        tight:   '1.25',
        snug:    '1.375',
        normal:  '1.5',
        relaxed: '1.625',
        loose:   '2',
      },

      letterSpacing: {
        tighter: '-0.03em',
        tight:   '-0.015em',
        normal:  '0',
        wide:    '0.01em',
        wider:   '0.025em',
        widest:  '0.08em',  // All-caps labels, badges
      },


      // ── UI-03: SPACING + SHAPE SYSTEM ────────

      spacing: {
        // Base unit: 4px
        // Scale follows 4pt grid — consistent with most student-facing apps
        px:   '1px',
        0:    '0',
        0.5:  '2px',
        1:    '4px',
        1.5:  '6px',
        2:    '8px',
        2.5:  '10px',
        3:    '12px',
        3.5:  '14px',
        4:    '16px',
        5:    '20px',
        6:    '24px',
        7:    '28px',
        8:    '32px',
        9:    '36px',
        10:   '40px',
        11:   '44px',
        12:   '48px',
        14:   '56px',
        16:   '64px',
        20:   '80px',
        24:   '96px',
        28:   '112px',
        32:   '128px',
        36:   '144px',
        40:   '160px',
        44:   '176px',
        48:   '192px',
        52:   '208px',
        56:   '224px',
        60:   '240px',
        64:   '256px',
        72:   '288px',
        80:   '320px',
        96:   '384px',
      },

      borderRadius: {
        none: '0',
        xs:   '2px',
        sm:   '6px',
        md:   '10px',
        lg:   '14px',
        xl:   '20px',
        '2xl':'28px',
        '3xl':'36px',
        full: '9999px',
      },

      boxShadow: {
        // All shadows use violet undertone for dark-mode cohesion
        sm:   '0 1px 3px 0 rgba(99, 102, 241, 0.08), 0 1px 2px -1px rgba(0,0,0,0.3)',
        md:   '0 4px 12px -2px rgba(99, 102, 241, 0.12), 0 2px 6px -2px rgba(0,0,0,0.4)',
        lg:   '0 10px 30px -4px rgba(99, 102, 241, 0.15), 0 4px 12px -4px rgba(0,0,0,0.5)',
        xl:   '0 20px 50px -8px rgba(99, 102, 241, 0.20), 0 8px 20px -6px rgba(0,0,0,0.6)',
        // Glow — for CTAs, active states, focus moments
        glow:       '0 0 20px 2px rgba(99, 102, 241, 0.35)',
        'glow-sm':  '0 0 10px 1px rgba(99, 102, 241, 0.25)',
        'glow-lg':  '0 0 40px 6px rgba(99, 102, 241, 0.40)',
        // Inner shadow for inputs, pressed states
        inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.3)',
        none:  'none',
      },

      zIndex: {
        0:          '0',
        base:       '1',
        raised:     '10',   // Cards, inline elements
        dropdown:   '100',  // Menus, selects
        sticky:     '200',  // Sticky headers
        overlay:    '300',  // Backdrop/dimmer
        modal:      '400',  // Dialogs, sheets
        toast:      '500',  // Notifications
        tooltip:    '600',  // Tooltips (above modals)
        max:        '9999', // Debug, emergency
      },


      // ── TRANSITIONS ──────────────────────────
      transitionDuration: {
        fast:   '100ms',
        normal: '200ms',
        slow:   '350ms',
      },

      transitionTimingFunction: {
        'ease-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out-back': 'cubic-bezier(0.34, 1.3, 0.64, 1)',
      },

    },
  },

  plugins: [],
}
