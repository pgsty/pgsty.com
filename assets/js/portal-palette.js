/** Bridge OINK's shared theme action to the bespoke PGSTY portal theme. */
(function (global) {
  'use strict';

  function registerThemeAction() {
    if (!global.OinkActions || !global.PGSTYPortalTheme) return;
    var action = global.OinkActions.get('switch_theme');
    if (!action || !action.available) return;

    global.OinkActions.registerExecutor('switch_theme', function (context) {
      var value = context && context.value;
      var preference = typeof value === 'string' ? value : value && value.value;
      return { theme: global.PGSTYPortalTheme.applyPreference(preference) };
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerThemeAction);
  } else {
    registerThemeAction();
  }
})(window);
