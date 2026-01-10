// =============================================================================
// Search - Tanuki Theme
// Elasticlunr-powered search with keyboard navigation
// =============================================================================

(function() {
  'use strict';

  let searchIndex = null;
  let searchOverlay = null;
  let searchInput = null;
  let searchResults = null;
  let selectedIndex = -1;

  // Initialize search
  function initSearch() {
    searchOverlay = document.querySelector('.search-overlay');
    searchInput = document.querySelector('.search__input');
    searchResults = document.querySelector('.search__results');

    if (!searchOverlay || !searchInput) return;

    // Set up event listeners first (so UI always works)
    setupListeners();

    // Load search index from window.searchIndex (set by search_index.en.js)
    if (typeof window.searchIndex !== 'undefined' && typeof elasticlunr !== 'undefined') {
      searchIndex = elasticlunr.Index.load(window.searchIndex);
    } else {
      console.warn('Search index or elasticlunr not available');
    }
  }

  function setupListeners() {
    // Search toggle buttons
    document.querySelectorAll('.search-toggle').forEach(btn => {
      btn.addEventListener('click', openSearch);
    });

    // Close button
    document.querySelector('.search__close')?.addEventListener('click', closeSearch);

    // Overlay click to close
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearch();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Open search with /
      if (e.key === '/' && !isInputFocused()) {
        e.preventDefault();
        openSearch();
      }

      // Close with Escape
      if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
        closeSearch();
      }
    });

    // Search input
    searchInput.addEventListener('input', debounce(performSearch, 200));
    searchInput.addEventListener('keydown', handleSearchKeydown);
  }

  function isInputFocused() {
    const active = document.activeElement;
    return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
  }

  function openSearch() {
    searchOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus after transition completes
    const onTransitionEnd = () => {
      searchInput.focus();
      searchOverlay.removeEventListener('transitionend', onTransitionEnd);
    };
    searchOverlay.addEventListener('transitionend', onTransitionEnd);
    // Fallback in case transitionend doesn't fire
    setTimeout(() => {
      searchInput.focus();
    }, 350);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    searchInput.value = '';
    searchResults.innerHTML = '';
    selectedIndex = -1;
    document.body.style.overflow = '';
  }

  function performSearch() {
    const query = searchInput.value.trim();

    if (!query || !searchIndex) {
      searchResults.innerHTML = '';
      return;
    }

    const results = searchIndex.search(query, {
      fields: {
        title: { boost: 2 },
        body: { boost: 1 }
      },
      expand: true
    });

    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="search__no-results">
          No results found for "<strong>${escapeHtml(query)}</strong>"
        </div>
      `;
      return;
    }

    searchResults.innerHTML = results.slice(0, 10).map((result, index) => {
      const doc = searchIndex.documentStore.getDoc(result.ref);
      const preview = getPreview(doc.body, query);

      return `
        <a href="${doc.id}" class="search__result" data-index="${index}" role="option">
          <div class="search__result-title">${highlightMatch(doc.title, query)}</div>
          <div class="search__result-path">${doc.id}</div>
          ${preview ? `<div class="search__result-preview">${preview}</div>` : ''}
        </a>
      `;
    }).join('');

    selectedIndex = -1;
  }

  function handleSearchKeydown(e) {
    const results = searchResults.querySelectorAll('.search__result');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
      updateSelection(results);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateSelection(results);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        results[selectedIndex].click();
      }
    }
  }

  function updateSelection(results) {
    results.forEach((result, index) => {
      result.classList.toggle('selected', index === selectedIndex);
      if (index === selectedIndex) {
        result.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  function getPreview(body, query) {
    if (!body) return '';

    const lowerBody = body.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerBody.indexOf(lowerQuery);

    if (index === -1) return '';

    const start = Math.max(0, index - 50);
    const end = Math.min(body.length, index + query.length + 100);
    let preview = body.slice(start, end);

    if (start > 0) preview = '...' + preview;
    if (end < body.length) preview = preview + '...';

    return highlightMatch(preview, query);
  }

  function highlightMatch(text, query) {
    if (!query) return escapeHtml(text);

    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
