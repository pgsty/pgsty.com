/**
 * Bridge OINK's chrome controls to the bespoke PGSTY portal theme.
 *
 * The navbar renders OINK 0.6's theme control — a click target that flips
 * light/dark plus a hover popover offering light / dark / system — but the
 * portal owns the colour state, in `pgsty-landing-theme`. Everything below
 * routes through `PGSTYPortalTheme` so there is never a second store: the
 * theme's own dark-mode.js is deliberately not loaded.
 */
(function (global) {
  'use strict';

  var THEME_KEY = 'pgsty-landing-theme';

  function portalTheme() {
    return global.PGSTYPortalTheme || null;
  }

  function storedPreference() {
    try {
      var value = global.localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' || value === 'auto' ? value : 'auto';
    } catch (error) {
      return 'auto';
    }
  }

  /** Mark which of the three options the reader has chosen. */
  function syncOptions() {
    var preference = storedPreference();
    document.querySelectorAll('[data-bs-theme-value]').forEach(function (option) {
      var active = option.getAttribute('data-bs-theme-value') === preference;
      option.setAttribute('aria-pressed', active ? 'true' : 'false');
      option.classList.toggle('td-is-active', active);
    });
  }

  function applyPreference(preference) {
    var theme = portalTheme();
    if (!theme) return;
    theme.applyPreference(preference);
    syncOptions();
  }

  function initThemeControls() {
    var theme = portalTheme();
    if (!theme) return;

    // The trigger itself is a direct light/dark flip, matching the portal's
    // long-standing one-click behaviour; the popover carries the third mode.
    document.querySelectorAll('[data-td-theme-toggle]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        applyPreference(theme.current() === 'light' ? 'dark' : 'light');
      });
    });

    document.querySelectorAll('[data-bs-theme-value]').forEach(function (option) {
      option.addEventListener('click', function () {
        applyPreference(option.getAttribute('data-bs-theme-value'));
      });
    });

    syncOptions();
    global.addEventListener('pgsty-theme-change', syncOptions);
  }

  function registerThemeAction() {
    if (!global.OinkActions || !global.PGSTYPortalTheme) return;
    var action = global.OinkActions.get('switch_theme');
    if (!action || !action.available) return;

    global.OinkActions.registerExecutor('switch_theme', function (context) {
      var value = context && context.value;
      var preference = typeof value === 'string' ? value : value && value.value;
      var resolved = global.PGSTYPortalTheme.applyPreference(preference);
      syncOptions();
      return { theme: resolved };
    });
  }

  function boot() {
    registerThemeAction();
    initThemeControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
