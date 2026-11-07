# Portfolio content guide

This project keeps editable content separate from layout code so any LLM—or a person—can update it safely.

## Most common edits

- **Profile links, homepage overview, bio, interests, and grouped skills:** `data/site.ts`
- **Featured projects, case-study content, and additional projects:** `data/projects.ts`
- **Resume list:** `data/resumes.ts`
- **Resume PDF files:** `public/resumes/`
- **Experience timeline:** `data/experience.ts`
- **Blog posts:** `data/blog.json` (PDF files go in `public/blog/`)

## Updating a featured project

In `data/projects.ts`, find the project by its `slug`. The short `problemSummary`, `buildSummary`, and `takeaway` fields power the scannable project card. The longer `overview`, `problem`, `approach`, `implementation`, `results`, and `status` fields power the case study. Add a `github` or `demo` URL only when it has been verified.

The same record automatically powers:

- the homepage project card;
- the Projects page;
- the project detail page;
- page title and description metadata.

For smaller work that should not have a detail page, add entries to `otherProjects` in the same file. Those records appear as compact cards on the Projects page and support a description, status, technologies, and optional external link.

If a project stack is architectural rather than implemented, set `technologyLabel` to a clear label such as `Planned stack`.

## Updating experience or profile links

- Add accomplishment bullets and supporting tools to `data/experience.ts`; use `featured: true` only for roles that belong on the homepage.
- Update résumé, GitHub, LinkedIn, and email destinations once in `profileLinks` inside `data/site.ts`.
- Keep skill groups in `data/site.ts` limited to technologies supported by the résumé, project records, or source repositories.

## Adding resumes

1. Copy a PDF into `public/resumes/`.
2. Add an entry with the exact filename to `data/resumes.ts`.
3. The Resume tab automatically adds a selectable preview and download link for each PDF.

## Adding blog posts

Every post is one entry in `data/blog.json`. Posts appear newest first on `/blog`; clicking a title opens `/blog/<slug>`.

```json
{
  "slug": "my-post-title",
  "title": "My post title",
  "date": "2026-11-06",
  "authors": ["Evan Cillie"],
  "description": "One or two sentences shown on the Blog page before someone clicks in.",
  "topics": ["Aviation", "Research"],
  "skills": ["Python", "pandas"],
  "pdf": "my-post.pdf"
}
```

- **PDF post:** copy the file into `public/blog/` and set `"pdf"` to its exact filename.
- **Text post:** replace `"pdf"` with `"body"`, a list of blocks: a plain string is a paragraph, `{ "heading": "..." }` starts a section, and `{ "list": ["...", "..."] }` is a bulleted list.
- `topics` power the filter buttons on the Blog page; `skills` show as technical-skill tags.
- Add `"draft": true` to preview a post with `npm run dev` without publishing it.
- `npm test` checks every entry (unique slugs, required fields, PDF file exists).

## Prompt for another LLM

> Update only the content files described in CONTENT_GUIDE.md. Preserve their TypeScript shape, avoid changing layout code, and run `npm run build` after editing.
