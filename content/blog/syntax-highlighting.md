+++
title = "Syntax Highlighting"
description = "Class-based highlighting with Zola's Giallo highlighter."
date = 2026-11-18
[taxonomies]
tags = ["zola"]
+++

With `style = "class"`, Zola writes `giallo.css` next to your pages and the
theme links it automatically:

```toml
[markdown.highlighting]
theme = "catppuccin-mocha"
style = "class"
data_attr_position = "both"
```

```javascript
const greet = (name) => `Hello, ${name}!`;
console.log(greet("tanuki"));
```
