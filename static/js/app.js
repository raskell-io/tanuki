// =============================================================================
// Theme Toggle - 3-way (light/dark/auto)
// =============================================================================

(function() {
  'use strict';

  const STORAGE_KEY = 'ThemeColorScheme';
  const THEMES = ['light', 'dark', 'auto'];

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'auto';
    } catch (e) {
      return 'auto';
    }
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getEffectiveTheme(stored) {
    if (stored === 'auto') {
      return getSystemTheme();
    }
    return stored;
  }

  function applyTheme(theme) {
    const effective = getEffectiveTheme(theme);
    document.documentElement.setAttribute('data-user-color-scheme', effective);
    document.documentElement.setAttribute('data-theme-setting', theme);

    // Dispatch event for other components
    const event = new CustomEvent('onColorSchemeChange', { detail: effective });
    window.dispatchEvent(event);
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // Storage not available
    }
  }

  function cycleTheme() {
    const current = getStoredTheme();
    const currentIndex = THEMES.indexOf(current);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    return THEMES[nextIndex];
  }

  function initThemeToggle() {
    // Apply initial theme immediately
    const stored = getStoredTheme();
    applyTheme(stored);

    // Set up toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();

        // Cycle to next theme
        const newTheme = cycleTheme();
        saveTheme(newTheme);
        applyTheme(newTheme);

        // Add animation class
        button.classList.add('animating');
        setTimeout(() => button.classList.remove('animating'), 500);
      });
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const stored = getStoredTheme();
      if (stored === 'auto') {
        applyTheme('auto');
      }
    });
  }

  // Apply theme immediately (before DOM ready) to prevent flash
  applyTheme(getStoredTheme());

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();

// =============================================================================
// Mobile Menu
// =============================================================================

class MobileMenu {
  constructor() {
    this.menuButton = document.getElementById("mobile-menu-button");
    this.menuOverlay = document.getElementById("mobile-menu-overlay");
    this.isOpen = false;

    if (this.menuButton && this.menuOverlay) {
      this.init();
    }
  }

  init() {
    this.menuButton.addEventListener("click", () => this.toggle());

    const menuLinks = this.menuOverlay.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => this.close());
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 800 && this.isOpen) {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.menuButton.setAttribute("aria-expanded", "true");
    this.menuButton.setAttribute("aria-label", "Close menu");
    this.menuOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.isOpen = false;
    this.menuButton.setAttribute("aria-expanded", "false");
    this.menuButton.setAttribute("aria-label", "Open menu");
    this.menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// =============================================================================
// Footnotes Enhancement
// =============================================================================

function renderFootnotes() {
  const footnoteRefs = document.querySelectorAll('sup[id^="fnref"]');

  footnoteRefs.forEach((ref) => {
    const link = ref.querySelector("a");
    if (link) {
      const footnoteId = link.getAttribute("href").substring(1);
      const footnote = document.getElementById(footnoteId);

      if (footnote) {
        ref.style.cursor = "pointer";
        ref.title = footnote.textContent;
      }
    }
  });
}

// Initialize on load
window.addEventListener("load", () => {
  setTimeout(() => {
    new MobileMenu();
    renderFootnotes();
  }, 0);
});
