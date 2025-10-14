# Repository Guidelines

## Project Structure & Module Organization
Keep the landing page assets at the repository root to simplify static hosting. Use `index.html` as the entry point, load shared styles from `assets/css/` (e.g., `assets/css/theme.css`), and isolate interactive scripts in `assets/js/` (e.g., `assets/js/search.js`). Place reusable fragments such as feedback quotes or topic cards in `partials/` to keep the markup DRY. When adding documentation, store it in `docs/`, and reserve `tests/` for UI regression or accessibility checks.

## Build, Test, and Development Commands
The project serves static HTML, so no build step is required.

## Coding Style & Naming Conventions
Follow Bootstrap 5.3 idioms and stick to semantic HTML elements (`<section>`, `<nav>`, `<main>`). Use four-space indentation in HTML, SCSS, and JavaScript.

## Requirement Summary
Build a landing page for my website, this website acts as a wiki page, providing detailed instructions for each topic, the landing page will provide a search interface for the topics available on the web

## UI Style
Using pure html, css, js, theme is bootstrap 5.3, minimal style, bright colors, content focused in the middle, leaving white space on both sides to attach ads later
Prioritize mobile responsive

## Landing0page Sections
The layout of the landing page will be:
The header has links to "about us", "contact", "disclaimer", and also includes the logo and name of the website
When scrolling down the content, the header will follow
The main content includes:
- Section 1: includes a large heading showing the function of the website, below is a search box for the topic according to the entered keyword
Next is a grid containing card-like cards, each card is a topic found
For example with 20 sample topics, including pagination
- Section 2: quotes some user feedback on the quality of the guides, accompanied by rating icons
- Section 3: about us, contact information
In addition, at the top of the landing page is the top bar, with links to "about us", "contact", "disclaimer", and also includes the logo and name of the website
The footer mentions copyright information