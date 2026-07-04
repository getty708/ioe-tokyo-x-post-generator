# Google I/O Extended Tokyo 2026 Design Guide

This document is the repository-level design reference for the Google I/O Extended Tokyo 2026 website. It is based on `references/stitch_i_o_extended_tokyo_2026_site/neo_i_o_tokyo/DESIGN.md` and reflects the current implementation direction.

## Brand Direction

The site should feel like a community-friendly Google I/O Extended event: polished and official enough to connect to Google I/O, but warm, approachable, and practical for GDG Tokyo participants.

- Keep the default visual tone light and readable.
- Use Neo-Brutalist cards for structure: 2px black borders, white surfaces, hard shadows, and tactile hover motion.
- Express Google I/O influence through Google Sans-first typography, colorful I/O assets, generous spacing, and clean topic visuals.
- Avoid turning the whole site into a dark theme. Dark surfaces are reserved mainly for the footer and contained brand moments.

## Design Tokens

Use the tokens defined in `tailwind.config.mjs` as the implementation source of truth.

- Ink: `#1E1E1E`
- Primary Google Blue: `#0058bd`
- Secondary Google Red: `#b51b15`
- Tertiary Google Green: `#006b2b`
- Google Yellow: `#FBBC04`
- Global page backgrounds: `surface`, `off-white`, and white cards
- GDG pastel fills: `pastel-blue`, `pastel-green`, `pastel-red`, `pastel-yellow`

## Typography

- Display and headline stack: `"Google Sans", "Plus Jakarta Sans", system-ui, sans-serif`
- Body stack: `"Google Sans", "Inter", system-ui, sans-serif`
- Metadata and labels: `"JetBrains Mono", ui-monospace, monospace`
- Do not bundle Google Sans font files unless they are explicitly provided.
- Hero and major section headings should use large, confident type with normal letter spacing.
- Body copy should remain comfortable for Japanese reading, with generous line height.

## Core Visual System

- Primary containers use `border-thick`, white background, rounded corners, and `shadow-neo`.
- Interactive cards and buttons use `neo-shadow-hover`, moving by `translate(-4px, -4px)` with a stronger hard shadow.
- Chips and badges use pill shapes, compact mono labels, and data-driven colors.
- Page sections should avoid nested cards. Use cards for repeated items, focused panels, or detail content.
- Keep mobile layouts single-column and avoid horizontal scrolling.

## Assets

- Use `public/io/` assets for Google I/O-inspired visual accents, especially in hero or topic compositions.
- Use `public/gdg-tokyo/` assets for local event branding.
- Header uses text branding for readability.
- Footer can use the white event logo on the dark footer background.

## Page Design Standards

### Landing Page

The landing page is a one-page overview that should quickly communicate the event, schedule, speakers, venue, and code of conduct.

- Hero: light background, large `Google I/O Extended Tokyo 2026` headline, compact date/location labels, CTA buttons, and an I/O asset collage.
- Timetable: desktop uses a 3-track grid; mobile uses a chronological timeline grouped by time.
- Speakers: use compact circular speaker avatars inspired by Google I/O speaker listings.
- Access and CoC: use readable Neo-Brutalist cards with concise Japanese content.
- Registration colors: onsite participation uses Google Red / `pastel-red`; online participation uses Google Blue / `pastel-blue`. Keep chips and primary registration buttons aligned to this mapping.
- Workshop registration notices use Google Yellow while registration is upcoming or active. On session and talk detail pages, switch closed registration notices to a Google Blue / `pastel-blue` base so they read as completed status rather than active warning. Landing-page workshop notices should remain hidden outside their registration period.
- Global registration CTAs should route to the page registration section before sending users off-site.
- Registration choice layouts should prioritize the most broadly available participation path first, then capacity-constrained options.
- External action links open in a new tab, use `rel="noopener noreferrer"`, and include an external-open icon near the action label.
- External action buttons may include small secondary URL context, but show only the domain to keep the button compact.
- Footer: dark background, event logo, Quick Links, divider, copyright, and GDG color marks.

### Timetable

The timetable is a primary design surface for the landing page. Preserve its ability to show tracks, time, and long-running sessions clearly.

- Desktop keeps a three-track grid with a separate time column. Track headers stay visible at the top of the grid.
- Desktop sessions that span multiple slots should occupy the full vertical span with a single stretched card. Do not split long sessions into duplicate cards or show placeholder cells where a spanning card continues.
- Community-wide sessions, such as networking, may appear as full-width rows across all tracks and should not collide with track-specific sessions even when times overlap.
- Mobile uses a chronological timeline, not a horizontal grid. Group sessions under standalone time headings and keep all sessions starting at that time together in track order.
- Mobile time headings use the content detail heading language: display font, strong weight, and a small Google Yellow vertical accent.
- Mobile session rows use a narrow rounded color rail to identify the track. The rail should be borderless and color-only; rely on the track legend near the `Timetable` heading for labels.
- Avoid nested timetable cards on mobile. The time group should not be wrapped in a heavy gray card; keep hierarchy light with heading spacing, color rails, and session cards.
- Keep mobile timetable content within the viewport with no horizontal scrolling.

### Session Pages

Session pages explain a scheduled block and the talks inside it.

- Hero panel shows session title, labels, date/time, and room.
- Session abstract lives inside the hero panel below a divider.
- Talk cards appear below the session overview and should stay compact.
- Speaker information is summarized without duplicating all talk details.
- OGP metadata should be session-specific.

### Talk Pages

Talk pages describe one concrete presentation inside a session.

- Hero panel focuses on the talk title and concise metadata.
- Do not repeat session title in hero metadata; use time, room, and speaker names.
- Use `SectionTitle.astro` for `Abstract`, `Speaker`, and `Session`.
- Speaker cards under the abstract should include photo, name, role, and bio.
- The right/session panel should use the same section title protocol.
- OGP metadata should be talk-specific.

### Speaker Pages

Speaker pages should make the speaker profile clear while surfacing their talks early.

- Add a page-level `Speaker` heading at the top.
- Main order: `Biography` -> `Talks` -> `Sessions`.
- Use `SectionTitle.astro` for each content section.
- Profile card includes image, name, role, organization, and compact social links. X links show the handle text, such as `@example`, alongside the X icon.
- Expertise chips are separate from social links and should remain compact.
- OGP metadata should be speaker-specific.

## Content Detail Section Titles

Detail pages such as Talk and Speaker pages use a standalone section heading above the content card.

- Use `src/components/SectionTitle.astro`.
- The heading uses the display font, `headline-md`, bold weight, and a left vertical accent bar around `8px x 32px`.
- Do not place detail section headings inside the card.
- Use Google Yellow for biography/abstract-style sections, Google Blue for speaker/session-list content, and Google Red for related talk/session context.

## Quality Checks

- Run `npm run build` after implementation changes.
- Verify content references through Astro Content Collections.
- Check landing, session, talk, and speaker pages after layout changes.
- Confirm mobile pages have no horizontal scrolling.
- Confirm OGP metadata remains page-specific when editing page templates.
