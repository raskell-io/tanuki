// =============================================================================
// Navigation - Tanuki Theme (タヌキ)
// Sidebar, keyboard navigation, ToC overlay, and mobile menu
// =============================================================================

(function() {
  'use strict';

  const STORAGE_KEY_SIDEBAR = 'tanuki-sidebar-collapsed';
  const STORAGE_KEY_SIDEBAR_WIDTH = 'tanuki-sidebar-width';

  // =============================================================================
  // Sidebar (Docs Mode - Collapsible)
  // =============================================================================

  function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const headerToggleBtn = document.querySelector('.header .sidebar-toggle');
    const tocToggleBtn = document.querySelector('.toc-toggle--docs'); // Mobile ToC button for docs
    const closeBtn = document.querySelector('.sidebar__close');

    if (!sidebar) return;

    // Check if we're on desktop
    const isDesktop = () => window.innerWidth >= 1024;

    // Restore collapsed state from localStorage (desktop only)
    function restoreCollapsedState() {
      if (isDesktop()) {
        const isCollapsed = localStorage.getItem(STORAGE_KEY_SIDEBAR) === 'true';
        if (isCollapsed) {
          sidebar.classList.add('collapsed');
          headerToggleBtn?.setAttribute('aria-expanded', 'false');
        }
      }
    }

    // Toggle collapsed state (desktop)
    function toggleCollapsed() {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      headerToggleBtn?.setAttribute('aria-expanded', !isCollapsed);
      try {
        localStorage.setItem(STORAGE_KEY_SIDEBAR, isCollapsed);
      } catch (e) {}
      // Notify other components of sidebar state change
      window.dispatchEvent(new CustomEvent('sidebar-toggle'));
    }

    // Open mobile sidebar
    function openSidebar() {
      sidebar.classList.add('open');
      sidebar.classList.remove('collapsed');
      overlay?.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }

    // Close mobile sidebar
    function closeSidebar() {
      sidebar.classList.remove('open');
      overlay?.classList.remove('visible');
      document.body.style.overflow = '';
    }

    // Header toggle button behavior
    headerToggleBtn?.addEventListener('click', () => {
      if (isDesktop()) {
        // Desktop: toggle collapsed state
        toggleCollapsed();
      } else {
        // Mobile: open/close sidebar
        if (sidebar.classList.contains('open')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      }
    });

    // Mobile ToC toggle button (docs mode) - always opens sidebar
    tocToggleBtn?.addEventListener('click', () => {
      if (sidebar.classList.contains('open')) {
        closeSidebar();
        tocToggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        openSidebar();
        tocToggleBtn.setAttribute('aria-expanded', 'true');
      }
    });

    closeBtn?.addEventListener('click', () => {
      closeSidebar();
      tocToggleBtn?.setAttribute('aria-expanded', 'false');
    });

    overlay?.addEventListener('click', () => {
      closeSidebar();
      tocToggleBtn?.setAttribute('aria-expanded', 'false');
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebar();
        tocToggleBtn?.setAttribute('aria-expanded', 'false');
      }
    });

    // Restore state on load
    restoreCollapsedState();

    // Handle resize
    window.addEventListener('resize', () => {
      if (!isDesktop()) {
        // On mobile, ensure sidebar is not collapsed
        sidebar.classList.remove('collapsed');
      } else {
        // On desktop, restore collapsed state
        restoreCollapsedState();
      }
    });
  }

  // =============================================================================
  // Sidebar Resize (Desktop only)
  // =============================================================================

  function initSidebarResize() {
    const sidebar = document.querySelector('.sidebar');
    const resizeHandle = document.querySelector('.sidebar__resize-handle');

    if (!sidebar || !resizeHandle) return;

    const isDesktop = () => window.innerWidth >= 1024;

    // Get min/max from CSS custom properties
    const getConstraints = () => {
      const styles = getComputedStyle(sidebar);
      return {
        min: parseInt(styles.getPropertyValue('--sidebar-min-width')) || 200,
        max: parseInt(styles.getPropertyValue('--sidebar-max-width')) || 500
      };
    };

    // Set width on both sidebar and root (for toggle positioning)
    function setWidth(width) {
      sidebar.style.setProperty('--sidebar-width', `${width}px`);
      document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
    }

    // Restore saved width
    function restoreWidth() {
      if (!isDesktop()) return;

      const savedWidth = localStorage.getItem(STORAGE_KEY_SIDEBAR_WIDTH);
      if (savedWidth) {
        const width = parseInt(savedWidth);
        const { min, max } = getConstraints();
        if (width >= min && width <= max) {
          setWidth(width);
        }
      }
    }

    // Handle resize
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    function onMouseDown(e) {
      if (!isDesktop()) return;

      isResizing = true;
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;

      sidebar.classList.add('resizing');
      document.body.classList.add('sidebar-resizing');

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      e.preventDefault();
    }

    function onMouseMove(e) {
      if (!isResizing) return;

      const { min, max } = getConstraints();
      const delta = e.clientX - startX;
      const newWidth = Math.min(max, Math.max(min, startWidth + delta));

      setWidth(newWidth);
    }

    function onMouseUp() {
      if (!isResizing) return;

      isResizing = false;
      sidebar.classList.remove('resizing');
      document.body.classList.remove('sidebar-resizing');

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      // Save width
      const width = sidebar.offsetWidth;
      try {
        localStorage.setItem(STORAGE_KEY_SIDEBAR_WIDTH, width);
      } catch (e) {}
    }

    resizeHandle.addEventListener('mousedown', onMouseDown);

    // Touch support
    resizeHandle.addEventListener('touchstart', (e) => {
      if (!isDesktop()) return;

      const touch = e.touches[0];
      isResizing = true;
      startX = touch.clientX;
      startWidth = sidebar.offsetWidth;

      sidebar.classList.add('resizing');
      document.body.classList.add('sidebar-resizing');

      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (!isResizing) return;

      const touch = e.touches[0];
      const { min, max } = getConstraints();
      const delta = touch.clientX - startX;
      const newWidth = Math.min(max, Math.max(min, startWidth + delta));

      setWidth(newWidth);
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (!isResizing) return;

      isResizing = false;
      sidebar.classList.remove('resizing');
      document.body.classList.remove('sidebar-resizing');

      // Save width
      const width = sidebar.offsetWidth;
      try {
        localStorage.setItem(STORAGE_KEY_SIDEBAR_WIDTH, width);
      } catch (e) {}
    });

    // Double-click to reset to default
    resizeHandle.addEventListener('dblclick', () => {
      sidebar.style.removeProperty('--sidebar-width');
      document.documentElement.style.removeProperty('--sidebar-width');
      try {
        localStorage.removeItem(STORAGE_KEY_SIDEBAR_WIDTH);
      } catch (e) {}
    });

    // Set default width on root, then restore saved width if any
    if (isDesktop()) {
      document.documentElement.style.setProperty('--sidebar-width', '280px');
    }
    restoreWidth();
  }

  // =============================================================================
  // ToC Overlay (Book Mode)
  // =============================================================================

  function initTocOverlay() {
    const overlay = document.getElementById('toc-overlay');
    // Only target book mode toc-toggle (not docs mode which opens sidebar)
    const openBtn = document.querySelector('.toc-toggle:not(.toc-toggle--docs)');
    const closeBtn = document.querySelector('.toc-overlay__close');
    const backdrop = document.querySelector('.toc-overlay__backdrop');

    if (!overlay) return;

    function openOverlay() {
      overlay.setAttribute('aria-hidden', 'false');
      openBtn?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      // Focus first link
      setTimeout(() => {
        overlay.querySelector('.toc-overlay__link')?.focus();
      }, 100);
    }

    function closeOverlay() {
      overlay.setAttribute('aria-hidden', 'true');
      openBtn?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      openBtn?.focus();
    }

    openBtn?.addEventListener('click', openOverlay);
    closeBtn?.addEventListener('click', closeOverlay);
    backdrop?.addEventListener('click', closeOverlay);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') {
        closeOverlay();
      }
    });

    // Close when clicking a link
    overlay.querySelectorAll('.toc-overlay__link').forEach(link => {
      link.addEventListener('click', () => {
        closeOverlay();
      });
    });
  }

  // =============================================================================
  // TOC Collapsible Sections
  // =============================================================================

  function initTocCollapse() {
    document.querySelectorAll('.toc__toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !expanded);

        const content = toggle.closest('.toc__item').querySelector('.toc__collapsible');
        if (content) {
          content.classList.toggle('open', !expanded);
        }
      });
    });
  }

  // =============================================================================
  // Keyboard Navigation (Arrow keys for prev/next)
  // =============================================================================

  function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing
      if (e.target.matches('input, textarea, select, [contenteditable]')) {
        return;
      }

      // Left arrow = previous
      if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const prevLink = document.querySelector('.nav-button--prev:not(.disabled)');
        if (prevLink) {
          prevLink.click();
        }
      }

      // Right arrow = next
      if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const nextLink = document.querySelector('.nav-button--next:not(.disabled)');
        if (nextLink) {
          nextLink.click();
        }
      }
    });
  }

  // =============================================================================
  // Version Picker
  // =============================================================================

  function initVersionPicker() {
    const picker = document.querySelector('.version-picker');
    if (!picker) return;

    const button = picker.querySelector('.version-picker__button');
    const dropdown = picker.querySelector('.version-picker__dropdown');

    function toggleDropdown(open) {
      const isOpen = open ?? !dropdown.classList.contains('open');
      dropdown.classList.toggle('open', isOpen);
      button.setAttribute('aria-expanded', isOpen);
    }

    button?.addEventListener('click', () => toggleDropdown());

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!picker.contains(e.target)) {
        toggleDropdown(false);
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleDropdown(false);
      }
    });
  }

  // =============================================================================
  // Mobile Menu / Nav Overlay
  // =============================================================================

  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navOverlay = document.getElementById('nav-overlay');
    const closeBtn = document.querySelector('.nav-overlay__close');
    const backdrop = document.querySelector('.nav-overlay__backdrop');

    if (!menuToggle || !navOverlay) return;

    function openNavOverlay() {
      navOverlay.setAttribute('aria-hidden', 'false');
      menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      // Focus first link
      setTimeout(() => {
        navOverlay.querySelector('.nav-overlay__link')?.focus();
      }, 100);
    }

    function closeNavOverlay() {
      navOverlay.setAttribute('aria-hidden', 'true');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      menuToggle.focus();
    }

    menuToggle.addEventListener('click', openNavOverlay);
    closeBtn?.addEventListener('click', closeNavOverlay);
    backdrop?.addEventListener('click', closeNavOverlay);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navOverlay.getAttribute('aria-hidden') === 'false') {
        closeNavOverlay();
      }
    });

    // Close when clicking a link
    navOverlay.querySelectorAll('.nav-overlay__link').forEach(link => {
      link.addEventListener('click', closeNavOverlay);
    });
  }

  // =============================================================================
  // Scroll to Top
  // =============================================================================

  function initScrollToTop() {
    const btn = document.querySelector('.scroll-to-top');
    if (!btn) return;

    function updateVisibility() {
      btn.classList.toggle('visible', window.scrollY > 300);
    }

    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =============================================================================
  // Active TOC Highlight
  // =============================================================================

  function initActiveTocHighlight() {
    const tocLinks = document.querySelectorAll('.toc__link[href^="#"]');

    if (!tocLinks.length) return;

    // Build array of headings that have corresponding TOC links
    const trackedHeadings = [];
    tocLinks.forEach(link => {
      const id = link.getAttribute('href').slice(1);
      const heading = document.getElementById(id);
      if (heading) {
        trackedHeadings.push({ id, element: heading });
      }
    });

    if (!trackedHeadings.length) return;

    let currentActiveId = trackedHeadings[0].id;

    function updateActiveLink() {
      const scrollTop = window.scrollY + 120;

      // Find the last tracked heading that's above the scroll position
      let newActiveId = trackedHeadings[0].id; // Default to first

      for (let i = trackedHeadings.length - 1; i >= 0; i--) {
        if (trackedHeadings[i].element.offsetTop <= scrollTop) {
          newActiveId = trackedHeadings[i].id;
          break;
        }
      }

      // Only update DOM if changed
      if (newActiveId !== currentActiveId) {
        currentActiveId = newActiveId;
        tocLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === `#${currentActiveId}`);
        });
      }
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  // =============================================================================
  // Anchor Copy to Clipboard
  // =============================================================================

  function initAnchorCopy() {
    // Find all headings with anchors
    const headings = document.querySelectorAll('h1:has(.zola-anchor), h2:has(.zola-anchor), h3:has(.zola-anchor), h4:has(.zola-anchor), h5:has(.zola-anchor), h6:has(.zola-anchor)');

    headings.forEach(heading => {
      const anchor = heading.querySelector('.zola-anchor');
      if (!anchor) return;

      let hideTimeout;

      const copyUrl = async (e) => {
        e.preventDefault();

        const url = anchor.href;

        try {
          await navigator.clipboard.writeText(url);

          // Get or create indicator
          let indicator = heading.querySelector('.anchor-copied');
          if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'anchor-copied';
            indicator.textContent = 'Copied!';
            heading.appendChild(indicator);
          }

          // Clear any pending hide
          clearTimeout(hideTimeout);

          // Show indicator
          requestAnimationFrame(() => {
            indicator.classList.add('show');
          });

          // Hide after delay
          hideTimeout = setTimeout(() => {
            indicator.classList.remove('show');
          }, 1500);

        } catch (err) {
          // Fallback: navigate to the anchor
          window.location.href = url;
        }
      };

      // Click on heading or anchor copies URL
      heading.addEventListener('click', copyUrl);
    });
  }

  // =============================================================================
  // Page ToC Panel (Docs Mode - Right Sidebar)
  // =============================================================================

  function initPageTocPanel() {
    const panel = document.getElementById('page-toc-panel');
    const toggleBtn = document.querySelector('.page-toc-toggle');
    const closeBtn = document.querySelector('.page-toc-panel__close');

    if (!panel || !toggleBtn) return;

    const STORAGE_KEY = 'page-toc-open';

    function openPanel() {
      panel.setAttribute('aria-hidden', 'false');
      toggleBtn.setAttribute('aria-expanded', 'true');
      localStorage.setItem(STORAGE_KEY, 'true');
    }

    function closePanel() {
      panel.setAttribute('aria-hidden', 'true');
      toggleBtn.setAttribute('aria-expanded', 'false');
      localStorage.setItem(STORAGE_KEY, 'false');
    }

    function togglePanel() {
      const isHidden = panel.getAttribute('aria-hidden') === 'true';
      if (isHidden) {
        openPanel();
      } else {
        closePanel();
      }
    }

    // Restore state from localStorage (default to open on desktop)
    const savedState = localStorage.getItem(STORAGE_KEY);
    const isDesktop = window.innerWidth >= 1024;

    if (savedState === 'true' || (savedState === null && isDesktop)) {
      openPanel();
    }

    toggleBtn.addEventListener('click', togglePanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    // Sync active state with scroll
    initPanelActiveTocHighlight();
  }

  function initPanelActiveTocHighlight() {
    const panelLinks = document.querySelectorAll('.page-toc-panel__link');

    if (!panelLinks.length) return;

    // Build array of headings that have corresponding panel links
    const trackedHeadings = [];
    panelLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const id = href.slice(1);
        const heading = document.getElementById(id);
        if (heading) {
          trackedHeadings.push({ id, element: heading, link });
        }
      }
    });

    if (!trackedHeadings.length) return;

    let currentActiveId = trackedHeadings[0].id;

    function updateActiveLink() {
      const scrollTop = window.scrollY + 120;
      let newActiveId = trackedHeadings[0].id;

      for (let i = trackedHeadings.length - 1; i >= 0; i--) {
        if (trackedHeadings[i].element.offsetTop <= scrollTop) {
          newActiveId = trackedHeadings[i].id;
          break;
        }
      }

      if (newActiveId !== currentActiveId) {
        currentActiveId = newActiveId;
        trackedHeadings.forEach(({ id, link }) => {
          link.classList.toggle('active', id === currentActiveId);
        });
      }
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  // =============================================================================
  // Scroll Progress Indicator
  // =============================================================================

  function initScrollProgress() {
    const progressContainer = document.querySelector('.scroll-progress');
    const progressBar = document.querySelector('.scroll-progress__bar');
    const progressPercent = document.querySelector('.scroll-progress__percent');
    const header = document.querySelector('.header');
    const sidebar = document.querySelector('.sidebar');

    if (!progressContainer || !progressBar) return;

    // Update progress bar position based on header height and sidebar width
    function updatePosition() {
      if (header) {
        const headerHeight = header.offsetHeight;
        progressContainer.style.top = `${headerHeight}px`;
      }

      // Account for sidebar width on desktop when visible
      if (sidebar && window.innerWidth >= 1024 && !sidebar.classList.contains('collapsed')) {
        const sidebarWidth = sidebar.offsetWidth;
        progressContainer.style.left = `${sidebarWidth}px`;
        progressContainer.style.width = `calc(100vw - ${sidebarWidth}px)`;
      } else {
        progressContainer.style.left = '0';
        progressContainer.style.width = '100vw';
      }
    }

    function updateProgress() {
      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Avoid division by zero for short pages
      if (docHeight <= 0) {
        progressBar.style.width = '100%';
        if (progressPercent) {
          progressPercent.textContent = '100%';
          progressPercent.style.left = '100%';
        }
        return;
      }

      const scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));

      // Update bar width
      progressBar.style.width = `${scrollPercent}%`;

      // Update percentage text and position it at the end of the bar
      if (progressPercent) {
        progressPercent.textContent = `${scrollPercent}%`;
        progressPercent.style.left = `${scrollPercent}%`;
      }

      // Toggle active class for showing percentage (only after some scroll)
      progressContainer.classList.toggle('scroll-progress--active', scrollTop > 50);
    }

    // Throttled scroll handler for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Update position on resize (header height may change)
    window.addEventListener('resize', () => {
      updatePosition();
    }, { passive: true });

    // Update position when sidebar is toggled
    window.addEventListener('sidebar-toggle', () => {
      updatePosition();
    });

    // Initial updates
    updatePosition();
    updateProgress();
  }

  // =============================================================================
  // Initialize
  // =============================================================================

  function init() {
    initSidebar();
    initSidebarResize();
    initTocOverlay();
    initTocCollapse();
    initKeyboardNav();
    initVersionPicker();
    initMobileMenu();
    initScrollToTop();
    initActiveTocHighlight();
    initAnchorCopy();
    initPageTocPanel();
    initScrollProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
