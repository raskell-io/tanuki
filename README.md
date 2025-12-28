# Tanuki (タヌキ)

An opinionated Zola theme for documentation, books, and blogs. Beautiful, accessible, and thoughtfully designed.

![Tanuki Theme](screenshot.png)

**[Live Demo](https://tanuki.raskell.io)** | **[Documentation](https://tanuki.raskell.io/docs/)**

## Features

- **Three Modes** — Documentation (with versioning), Book, and Blog layouts
- **Catppuccin Colors** — Soothing Mocha (dark) and Latte (light) palettes
- **Geist Typography** — Clean, readable variable fonts
- **Lucide Icons** — Crisp, consistent iconography
- **Resizable Sidebar** — Drag to resize, persists across sessions
- **Full-text Search** — Elasticlunr-powered instant search
- **Dark/Light Toggle** — Three-way toggle with system preference detection
- **Print Support** — Print all pages as a single document (docs/book modes)
- **Keyboard Navigation** — Arrow keys for prev/next, `/` for search
- **SEO & Accessibility** — JSON-LD structured data, ARIA landmarks, semantic HTML

## Installation

```bash
cd your-zola-site
git clone https://github.com/raskell-io/tanuki themes/tanuki
```

Or as a git submodule:

```bash
git submodule add https://github.com/raskell-io/tanuki themes/tanuki
```

## Quick Start

### Documentation Mode

```toml
base_url = "https://docs.example.com"
title = "My Project Docs"
theme = "tanuki"
build_search_index = true

[markdown]
highlight_code = true
highlight_theme = "css"

[extra]
mode = "docs"
github = "https://github.com/you/project"

# Optional: version picker
[extra.versions]
current = "2.0.0"
list = [
    { version = "2.0.0", url = "/", label = "latest" },
    { version = "1.0.0", url = "/v1/" },
]
```

### Book Mode

```toml
base_url = "https://book.example.com"
title = "The Complete Guide"
theme = "tanuki"
build_search_index = true

[markdown]
highlight_code = true
highlight_theme = "css"

[extra]
mode = "book"
github = "https://github.com/you/book"
```

### Blog Mode

```toml
base_url = "https://blog.example.com"
title = "My Blog"
theme = "tanuki"
generate_feeds = true

taxonomies = [
    { name = "tags", feed = true },
]

[markdown]
highlight_code = true
highlight_theme = "css"

[extra]
mode = "blog"

[extra.hero]
title = "Welcome to my blog"
subtitle = "Thoughts on code and craft"

[[extra.nav]]
name = "Blog"
url = "/blog/"

[[extra.nav]]
name = "About"
url = "/about/"
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / Next page |
| `/` | Open search |
| `Esc` | Close overlays |

## Browser Support

Modern browsers (Chrome 88+, Firefox 78+, Safari 14+, Edge 88+)

## Credits

- [Catppuccin](https://catppuccin.com) — Color palette
- [Geist](https://vercel.com/font) — Typography
- [Lucide](https://lucide.dev) — Icons
- [Zola](https://www.getzola.org) — Static site generator

## License

[MIT](LICENSE)

---

Made with care by [raskell.io](https://raskell.io)
