# Personal Website — Taras Koval

A minimal personal website for my undergraduate Computer Science studies at Western University, graduating in 2029.

## Features

- Separate Home, Projects, and Contact views with instant navigation.
- Direct links and browser Back/Forward support using hash routes.
- An interactive Learning & Building grid covering Python, Java, C, HTML, CSS, JavaScript, TypeScript, Linux, Git, and Docker.
- Animation pause/play controls and support for reduced-motion preferences.
- A responsive layout, keyboard navigation, visible focus, and labelled form fields.
- Contact form submission through FormSubmit, with validation and loading, success, and error states.
- A place to add selected, completed projects.

## Built with

HTML, CSS, and vanilla JavaScript. No framework, package installation, or build step is required. TypeScript is a subject I’m learning; this website’s script is JavaScript.

## Files

| File | Format | Purpose |
| --- | --- | --- |
| `index.html` | HTML | Content, page views, navigation, links, and contact form. |
| `style.css` | CSS | Typography, layout, responsive rules, and motion. |
| `script.js` | JavaScript | View switching, skills interaction, project rendering, and contact submission. |
| `favicon.svg` | SVG/XML | The small tk. browser-tab icon. |
| `README.md` | Markdown | Project overview and instructions. |
| `.gitignore` | Plain text | Excludes local clutter, dependencies, and environment files. |
| `.nojekyll` | Empty configuration file | Preserves a plain static site if GitHub Pages is enabled later. |

## Run locally

Open `index.html` in a browser to view the site. For the contact form, use a local web server:

```sh
python3 -m http.server 4173
```

Then visit `http://localhost:4173/`. Python is only a convenient preview server; it is not a website dependency. To check JavaScript syntax if Node.js is installed:

```sh
node --check script.js
```

## Navigation

The site has three routes: `#home`, `#projects`, and `#contact`. Only the current view is visible. Navigation replaces the view rather than scrolling to a section. On small screens a view may scroll naturally to fit its own content.

## Add a project

Edit the `projects` array at the beginning of `script.js`. Each entry contains `title`, `description`, `technologies`, and an HTTPS repository or demo `url`. The empty state disappears when projects are added. Only add work that is ready to show.

## Contact form

The form sends the visitor’s name, email, and message through FormSubmit to `ktaras105@gmail.com`. FormSubmit is an external delivery service; no custom backend or email credentials are embedded here. The recipient completed email activation during setup, and the service accepted a setup submission. Test email delivery again after changing the site’s hosting origin. Submitted does not guarantee inbox delivery.

Contact form service: https://formsubmit.co/

## Deployment status

This source is ready for a static host. A public deployment has not yet been verified. The separate Sites checkout retains its own `.openai/hosting.json`; that host-specific file is not needed in this GitHub repository.
