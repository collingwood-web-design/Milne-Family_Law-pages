(() => {
  try {
    if (!/^https?:$/.test(location.protocol)) return;
    const path = location.pathname;
    if (!/\.html$/i.test(path)) return;
    const clean = path.replace(/\.html$/i, "").replace(/\/index$/i, "/") || "/";
    location.replace(clean + location.search + location.hash);
  } catch (_) {}
})();
