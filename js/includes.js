// js/includes.js
// Carga de parciales (header/footer) compatible con GitHub Pages (repo pages)
// - Evita rutas absolutas tipo "/partials/..." (fallan en https://usuario.github.io/repo/)
// - Resuelve rutas SIEMPRE desde la raíz del sitio según dónde vive este script (js/includes.js)
// - Agrega null-checks para no romper si faltan contenedores

(() => {
  "use strict";

  /**
   * Obtiene la URL base (raíz del sitio) a partir del <script src=".../js/includes.js">.
   * Esto funciona en:
   * - Local: http://127.0.0.1:5500/tuCarpeta/js/includes.js  -> raíz: http://127.0.0.1:5500/tuCarpeta/
   * - GitHub Pages (repo): https://usuario.github.io/repo/js/includes.js -> raíz: https://usuario.github.io/repo/
   * - Cualquier subcarpeta de páginas, siempre que la ruta al script sea correcta (ej: ../js/includes.js).
   */
  const getSiteRootURL = () => {
    const current =
      document.currentScript ||
      Array.from(document.scripts).find((s) => s?.src && /\/includes\.js(\?|#|$)/.test(s.src));

    if (current && current.src) {
      // .../js/includes.js  -> .../js/  -> .../
      const jsDir = new URL("./", current.src);
      return new URL("../", jsDir);
    }

    // Fallback (no debería pasar, pero evita romper).
    // Usa el directorio de la página actual.
    return new URL("./", document.baseURI);
  };

  const SITE_ROOT = getSiteRootURL();

  // Convierte un path relativo del proyecto (ej: "partials/header.html") en una URL absoluta/real.
  const toURL = (path) => new URL(path.replace(/^\//, ""), SITE_ROOT);

  /**
   * Normaliza URLs dentro del HTML insertado (header/footer) para que funcionen desde cualquier nivel.
   * - Convierte href/src relativos a la RAÍZ del proyecto (no a la página actual).
   * - Corrige rutas tipo "/algo" (root absoluto) a "/<repo>/algo" automáticamente.
   *
   * Nota: Cambiamos a rutas "root-relativas" (pathname) para que sea portable.
   */
  const normalizeFragmentUrls = (rootEl) => {
    if (!rootEl) return;

    const attrs = [
      { selector: "[href]", attr: "href" },
      { selector: "[src]", attr: "src" },
      { selector: "source[srcset]", attr: "srcset" },
      { selector: "img[srcset]", attr: "srcset" },
    ];

    const isSkippable = (v) =>
      !v ||
      v.startsWith("#") ||
      v.startsWith("mailto:") ||
      v.startsWith("tel:") ||
      v.startsWith("data:") ||
      v.startsWith("javascript:") ||
      v.startsWith("http://") ||
      v.startsWith("https://") ||
      v.startsWith("//");

    const normalizeOne = (val) => {
      const raw = (val || "").trim();
      if (isSkippable(raw)) return raw;

      // srcset puede traer múltiples entradas "url 1x, url 2x"
      if (raw.includes(",") && /\s\d+(x|w)\s*(,|$)/.test(raw)) {
        return raw
          .split(",")
          .map((part) => part.trim())
          .map((part) => {
            const pieces = part.split(/\s+/);
            const urlPart = pieces[0];
            const rest = pieces.slice(1).join(" ");
            const normalizedUrl = normalizeOne(urlPart);
            return (normalizedUrl + (rest ? " " + rest : "")).trim();
          })
          .join(", ");
      }

      // Si viene como "/algo", NO es válido para repo pages (porque apunta al root del dominio).
      // Lo convertimos a "<SITE_ROOT>/algo".
      const path = raw.startsWith("/") ? raw.slice(1) : raw;

      const resolved = new URL(path, SITE_ROOT);
      return `${resolved.pathname}${resolved.search}${resolved.hash}`;
    };

    attrs.forEach(({ selector, attr }) => {
      rootEl.querySelectorAll(selector).forEach((el) => {
        const val = el.getAttribute(attr);
        if (!val) return;
        const next = normalizeOne(val);
        if (next && next !== val) el.setAttribute(attr, next);
      });
    });
  };

  const loadPartial = async (targetId, partialPath) => {
    const container = document.getElementById(targetId);
    if (!container) return { targetId, loaded: false, reason: "container_not_found" };

    const url = toURL(partialPath);

    try {
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
      const html = await response.text();

      container.innerHTML = html;
      normalizeFragmentUrls(container);

      return { targetId, loaded: true, url: `${url}` };
    } catch (error) {
      console.error(`[includes] No se pudo cargar ${url}:`, error);
      container.innerHTML = "";
      return { targetId, loaded: false, url: `${url}`, error: String(error?.message || error) };
    }
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const results = await Promise.all([
      loadPartial("site-header", "partials/header.html"),
      loadPartial("site-footer", "partials/footer.html"),
    ]);

    const detail = {
      siteRoot: `${SITE_ROOT}`,
      results,
      loaded: results.every((r) => r.loaded),
    };

    // Evento para que otros scripts (main.js) puedan re-inicializar cuando ya exista el header/footer.
    document.dispatchEvent(new CustomEvent("partials:loaded", { detail }));
  });
})();
