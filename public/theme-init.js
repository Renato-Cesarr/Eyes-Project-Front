(() => {
  const storageKey = 'eyes-theme-preference';
  const allowed = new Set([
    'system',
    'light',
    'dark',
    'high-contrast-light',
    'high-contrast-dark',
  ]);

  let preference = 'system';
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored && allowed.has(stored)) preference = stored;
  } catch {
    // Storage can be unavailable in privacy-restricted contexts.
  }

  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  document.documentElement.dataset['eyesTheme'] = resolved;
  document.documentElement.style.colorScheme = resolved.endsWith('dark') ? 'dark' : 'light';
})();
