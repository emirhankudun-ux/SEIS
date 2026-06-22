# SEIS Portfolio Decision Ledger

The first 100 questions are treated as the creative foundation. The site now assumes:

- Turkish opens first.
- Emirhan Kudun and SEIS both stay visible.
- The mood is cinematic, premium, calm and 3D-led.
- Runtime and MCP are public but secret-free.
- Behance is a required external portfolio layer.
- The single branch remains `codex/seis-ux-cinematic-premium-foundation`.

## Next Questions To Answer Together

1. Which exact Behance project URLs should replace the current profile-based embed slots?
2. Which server should be the first remote persistence target: GitHub, Vercel, Hostinger, custom VPS, or another platform?
3. Should `/ops` remain public after launch, or should it become unindexed with `robots` protection?
4. Should the Behance section show visible embed code blocks, live embedded project cards, or both?
5. Which projects are allowed to show GitHub links publicly?
6. Should pricing stay hidden, appear as budget ranges, or only appear inside the brief form?
7. Do you want a CV/experience page as a compact editorial timeline?
8. Should SEIS become its own product route later, such as `/seis`, separate from the personal portfolio?
9. Which 3D mood should lead the next iteration: gallery museum, orbital command center, architectural studio, or data constellation?
10. Should brief submissions keep writing local JSONL, or move first to email, database, Airtable, Notion, or Supabase?
11. Which languages are truly launch-critical beyond Turkish and English?
12. What is the publish success metric: first impression, portfolio depth, 3D effect, runtime credibility, or deploy stability?

## Behance Replacement Format

Use this small format when final URLs are ready:

```json
{
  "title": "Project title",
  "url": "https://www.behance.net/gallery/...",
  "category": "Brand identity | Drawing archive | UI/UX | SEIS system",
  "featured": true
}
```

The site will generate the safe iframe code from the URL and keep the external link visible for accessibility and fallback.
