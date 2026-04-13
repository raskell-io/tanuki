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
    document.documentElement.setAttribute('data-theme', effective);
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
// Navigation Dropdowns
// =============================================================================

class NavDropdowns {
  constructor() {
    this.dropdowns = document.querySelectorAll('.nav-dropdown');
    this.activeDropdown = null;

    if (this.dropdowns.length > 0) {
      this.init();
    }
  }

  init() {
    this.dropdowns.forEach(dropdown => {
      const trigger = dropdown.querySelector('.nav-dropdown__trigger');
      const menu = dropdown.querySelector('.nav-dropdown__menu');

      if (trigger && menu) {
        // Click to toggle
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggle(dropdown);
        });

        // Keyboard navigation
        trigger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggle(dropdown);
          } else if (e.key === 'Escape') {
            this.close(dropdown);
          }
        });

        // Close on menu link click
        menu.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
            this.close(dropdown);
          });
        });
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.activeDropdown && !this.activeDropdown.contains(e.target)) {
        this.close(this.activeDropdown);
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeDropdown) {
        this.close(this.activeDropdown);
      }
    });
  }

  toggle(dropdown) {
    const isOpen = dropdown.classList.contains('open');

    // Close any other open dropdown
    if (this.activeDropdown && this.activeDropdown !== dropdown) {
      this.close(this.activeDropdown);
    }

    if (isOpen) {
      this.close(dropdown);
    } else {
      this.open(dropdown);
    }
  }

  open(dropdown) {
    const trigger = dropdown.querySelector('.nav-dropdown__trigger');
    dropdown.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    this.activeDropdown = dropdown;
  }

  close(dropdown) {
    const trigger = dropdown.querySelector('.nav-dropdown__trigger');
    dropdown.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    if (this.activeDropdown === dropdown) {
      this.activeDropdown = null;
    }
  }
}

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
    new NavDropdowns();
    new MobileMenu();
    renderFootnotes();
  }, 0);
});
