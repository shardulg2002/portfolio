# Discography: Shardul Gupta's portfolio

My personal site. Every project is a vinyl record on the wall: hover a sleeve for a short description, open it to flip to the back cover with my role, the full story and links.

## Add a record

Open `projects.js` and add one object to `PROJECTS`. The cover art, genre filters, catalog numbers (SG-001, SG-002…) and shareable link (`/#project-id`) are all generated from it. The comment at the top of the file lists every field.

## Files

| File | What it holds |
|------|---------------|
| `index.html` | Page structure |
| `styles.css` | All styling |
| `projects.js` | The record library: site details and every project |
| `app.js` | Cover art, the wall and shelf views, filters and the back-cover player |

Plain HTML, CSS and JavaScript. No build step: Vercel serves the folder as it is.
