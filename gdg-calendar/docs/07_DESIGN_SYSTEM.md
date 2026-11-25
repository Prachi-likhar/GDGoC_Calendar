# 07: Design System — GDG on Campus Event Management

## Brand Identity
- **Mark:** Custom `BracketMark` SVG (`< >`) using the four Google brand colours. Never use official Google or GDG logo files.
- **Palette:**
  - Blue: `#4285F4`
  - Red: `#EA4335`
  - Yellow: `#FBBC05`
  - Green: `#34A853`
- **Balance:** 75–80% neutral surfaces (`--bg-canvas`, `--bg-surface`, `--bg-subtle`) with strategic brand colour accents.

## Typography
- **Headings:** `Outfit` (`font-display`)
- **Body:** `Inter` (`font-sans`)
- **Code / Tokens / IDs:** `JetBrains Mono` (`font-mono`)
- **Casing:** Sentence case throughout UI labels, headings, and buttons.

## Surfaces & Dark Mode Tokens
| Token | Light | Dark |
|---|---|---|
| `--bg-canvas` | `#f8fafc` | `#0b0f17` |
| `--bg-surface` | `#ffffff` | `#121826` |
| `--bg-subtle` | `#f1f5f9` | `#192234` |
| `--border-subtle` | `#e2e8f0` | `#263147` |
| `--text-primary` | `#0f172a` | `#f1f5f9` |
| `--text-secondary` | `#475569` | `#94a3b8` |
| `--text-muted` | `#64748b` | `#64748b` |

## Shape & Elevation
- **Cards:** `rounded-2xl` (`16px`), `1px solid var(--border-subtle)`, subtle shadow.
- **Buttons & Inputs:** `rounded-xl` (`12px`), minimum `44px` touch target on mobile interactive controls.
- **Motion:** Subtle entrance transitions (`fade-up`), `active:scale-[0.98]` press feedback, all disabled when `prefers-reduced-motion: reduce`.

## Patterns added
- `BracketMark` (`client/src/components/common/BracketMark.jsx`): Custom 4-colour `< >` brand mark.
- `ThemeContext` / `useTheme` (`client/src/context/ThemeContext.jsx`): Persisted `light` / `dark` / `system` theme manager using `.dark` root class.
- `ToastProvider` / `useToast` (`client/src/context/ToastContext.jsx`): Accessible toast stack for success, warning, and error feedback.
- `FourColorLoader` & `Skeleton` (`client/src/components/common/Loader.jsx`): 4-colour bouncing dots full-page loader and surface skeleton placeholders.
- `MobileBottomNav` (`client/src/components/layout/MobileBottomNav.jsx`): Floating rounded 5-item mobile bottom navigation with safe-area support.
- `EventCard` (`client/src/components/events/EventCard.jsx`): Discovery card with generated gradient/poster, status badge, IST date, venue, and capacity bar.

