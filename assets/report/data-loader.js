/* Load only versioned public files. No database, upstream API or credentials. */
(() => {
  "use strict";
  const url = document.body.dataset.manifest;
  if (!url) return;
  const assign = (root, packet) => {
    const path = packet.path;
    if (!Array.isArray(path) || path.some(k => typeof k !== "string" || ["__proto__", "constructor", "prototype"].includes(k))) throw new Error("Invalid report data path");
    if (!path.length) return packet.value;
    let parent = root;
    for (const key of path.slice(0, -1)) parent = parent[key] ||= {};
    const key = path.at(-1);
    if (packet.start !== undefined) {
      const rows = parent[key] ||= [];
      if (!Array.isArray(packet.value) || rows.length !== packet.start) throw new Error("Incomplete report data");
      for (const row of packet.value) rows.push(row);
    } else parent[key] = packet.value;
    return root;
  };
  window.REPOORT_READY = (async () => {
    const base = new URL(url, location.href);
    const response = await fetch(base, {cache:"no-cache"});
    if (!response.ok) throw new Error("Report manifest unavailable");
    const manifest = await response.json();
    if (manifest.version !== 1 || !Array.isArray(manifest.files)) throw new Error("Unsupported report manifest");
    const parts = await Promise.all(manifest.files.map(async file => {
      const target = new URL(file.path, base);
      if (target.origin !== base.origin || !/^data\/[a-f0-9]{64}\.json$/.test(file.path)) throw new Error("Invalid report file URL");
      const result = await fetch(target);
      if (!result.ok) throw new Error("Report data unavailable");
      const raw = await result.arrayBuffer();
      if (raw.byteLength !== file.bytes) throw new Error("Report data size mismatch");
      const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", raw))].map(n=>n.toString(16).padStart(2,"0")).join("");
      if (digest !== file.sha256) throw new Error("Report data integrity mismatch");
      return JSON.parse(new TextDecoder().decode(raw));
    }));
    let data = {};
    for (const packet of parts) data = assign(data, packet);
    if (data.meta?.snapshot_id !== manifest.snapshot_id) throw new Error("Report snapshot mismatch");
    window.REPOORT_DATA = data;
    return data;
  })();
})();
