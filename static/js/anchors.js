// Add anchor links to headings and codeblocks
document.addEventListener("DOMContentLoaded", function () {
  // Add anchors to headings (h2-h6)
  const headings = document.querySelectorAll(
    ".article-post h2[id], .article-post h3[id], .article-post h4[id], .article-post h5[id], .article-post h6[id]"
  );

  headings.forEach(function (heading) {
    const id = heading.getAttribute("id");
    if (id) {
      const anchor = document.createElement("a");
      anchor.className = "anchor";
      anchor.href = `#${id}`;
      anchor.setAttribute("aria-label", `Link to ${heading.textContent}`);
      heading.appendChild(anchor);
    }
  });
});
