(() => {
  // Configuracion base del sitio
  const CONTACT_EMAIL = "sagcauca@gmail.com";
  const WHATSAPP_NUMBER = "573155692130";
  const HERO_FALLBACK_IMAGE = "public/img/cultivo.jpg";
  const HERO_CAROUSEL_IMAGES = [
    "public/img/cana.jpg",
    "public/img/panela2.jpg",
    "public/img/cafetero.jpg",
    "public/img/forestal.jpg",
    "public/img/pina.jpg",
    "public/img/fresa.jpg",
    "public/img/holstein.jpg",
    "public/img/normando1.jpg",
    "public/img/brahman.jpg",
    "public/img/brahman2.jpg",
    "public/img/mango2.jpg",
    "public/img/fresa1.jpg",
    "public/img/cultivo.jpg",
    "public/img/limon2.jpg",
    "public/img/mango.jpg",
  ];
  const HERO_CAROUSEL_INTERVAL_MS = 4000;
  const MINI_CAROUSEL_FADE_MS = 200;

  let initialized = false;

  const setFooterYear = () => {
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
  };

  const setupNavToggle = () => {
    const navToggle = document.getElementById("navToggle");
    const mainNav = document.getElementById("mainNav");
    if (!navToggle || !mainNav) return false;
    if (navToggle.dataset.bound === "true") return true;

    navToggle.dataset.bound = "true";

    navToggle.setAttribute("aria-expanded", "false");

    // Cerrar el menú con Escape (accesibilidad)
    const onKeyDownNav = (event) => {
      if (event.key === "Escape" && mainNav.classList.contains("open")) {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    };

    document.addEventListener("keydown", onKeyDownNav);

    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (mainNav.classList.contains("open")) {
          mainNav.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
    return true;
  };

  const highlightActiveNav = () => {
    const path = window.location.pathname.replace(/\\/g, "/");
    const current = (path.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("#mainNav a").forEach((link) => {
      const href = link.getAttribute("href")?.toLowerCase();
      const isActive = href === current || (href === "index.html" && (!current || current === ""));
      link.classList.toggle("active", Boolean(isActive));
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const isValidEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
  const sanitizeInput = (value) => value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  const setInvalid = (field, invalid) => {
    if (!field) return;
    field.setAttribute("aria-invalid", invalid ? "true" : "false");
  };

  const getStatusElement = (form) =>
    form.querySelector(".form-status") || document.getElementById("contactStatus");

  const updateStatus = (statusEl, message, isError = false) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.style.color = isError ? "#b23b3b" : "var(--color-accent)";
  };

  const buildBody = ({ nombre, correo, mensaje }) =>
    [
      "Datos de contacto desde el formulario:",
      `Nombre: ${nombre}`,
      `Correo: ${correo}`,
      "",
      "Mensaje:",
      mensaje,
    ].join("\n");

  // Maneja el formulario aplicando sanitización y ARIA para accesibilidad
  const handleFormSubmit = (form) => (event) => {
    event.preventDefault();

    const nombreField = form.querySelector("#nombre");
    const correoField = form.querySelector("#correo");
    const canalField = form.querySelector("#canal");
    const mensajeField = form.querySelector("#mensaje");
    const nombre = sanitizeInput(nombreField?.value || "");
    const correo = sanitizeInput(correoField?.value || "");
    const canal = canalField?.value || "correo";
    const mensaje = sanitizeInput(mensajeField?.value || "");
    const statusEl = getStatusElement(form);

    setInvalid(nombreField, false);
    setInvalid(correoField, false);
    setInvalid(mensajeField, false);

    if (!nombre || nombre.length < 3) {
      setInvalid(nombreField, true);
      updateStatus(statusEl, "Por favor escribe tu nombre (min. 3 caracteres).", true);
      return;
    }

    if (!isValidEmail(correo)) {
      setInvalid(correoField, true);
      updateStatus(statusEl, "Ingresa un correo electrónico válido.", true);
      return;
    }

    if (!mensaje || mensaje.length < 10) {
      setInvalid(mensajeField, true);
      updateStatus(statusEl, "Tu mensaje es muy corto. Amplíalo para entenderte mejor.", true);
      return;
    }

    const cuerpo = buildBody({ nombre, correo, mensaje });

    if (canal === "whatsapp") {
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(cuerpo)}`;
      updateStatus(
        statusEl,
        "Abriendo WhatsApp con tu mensaje. Si no se abre, copia y pégalo manualmente."
      );
      window.open(waUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const asunto = encodeURIComponent(`Contacto web - ${nombre}`);
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${asunto}&body=${encodeURIComponent(cuerpo)}`;
    updateStatus(
      statusEl,
      "Abriendo tu cliente de correo. Si no se abre, copia el mensaje y envíalo manualmente."
    );
    window.location.href = mailtoUrl;
  };

  const setupContactForms = () => {
    const forms = document.querySelectorAll(".contact-form");
    if (!forms.length) return;
    forms.forEach((form) => form.addEventListener("submit", handleFormSubmit(form)));
  };

  const setupGalleryLightbox = () => {
    const gallery = document.querySelector(".team-gallery-grid");
    if (!gallery) return;

    const openLightbox = (src, alt) => {
      const existing = document.querySelector(".image-lightbox");
      if (existing) existing.remove();

      const overlay = document.createElement("div");
      overlay.className = "image-lightbox";
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");

      const img = document.createElement("img");
      img.src = src;
      img.alt = alt || "Imagen ampliada";

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "lightbox-close";
      closeBtn.textContent = "Cerrar";

      const close = () => {
        overlay.remove();
        document.body.style.overflow = "";
        document.removeEventListener("keydown", onKey);
      };

      const onKey = (event) => {
        if (event.key === "Escape") close();
      };

      closeBtn.addEventListener("click", close);
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close();
      });
      document.addEventListener("keydown", onKey);

      overlay.appendChild(closeBtn);
      overlay.appendChild(img);
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
    };

    gallery.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      openLightbox(target.src, target.alt);
    });
  };

  const normalizeSrc = (src) => {
    if (!src) return "";
    if (/^https?:\/\//i.test(src)) return src;
    // Mantener rutas relativas para soportar despliegues en subcarpetas (GitHub Pages, etc.)
    return src.startsWith("/") ? src.slice(1) : src;
  };

  const resolveSrcVariant = (src) =>
    new Promise((resolve) => {
      const normalized = normalizeSrc(src);
      const tryLoad = (candidate, cb) => {
        const img = new Image();
        img.onload = () => cb(true, candidate);
        img.onerror = () => cb(false, candidate);
        img.src = candidate;
      };

      // Probar primero la ruta original y luego la misma con extension alterna (.jpg <-> .svg)
      tryLoad(normalized, (ok) => {
        if (ok) return resolve(normalized);
        const alt = normalized.replace(/\.jpg$/i, ".svg").replace(/\.svg$/i, ".jpg");
        tryLoad(alt, (ok2) => {
          if (ok2) return resolve(alt);
          // Si ambas rutas fallan se retorna null para indicar que falta el archivo
          resolve(null);
        });
      });
    });

  const preloadImages = async (srcList) => Promise.all(srcList.map((s) => resolveSrcVariant(s)));

  const setHeroBgImage = (element, src) => {
    if (!src) return;
    const normalized = normalizeSrc(src);
    element.style.setProperty("--hero-bg-image", `url('${normalized}')`);
  };

  // Carga perezosa de imagenes declaradas en data-src con fallback seguro
  const loadImagesFromDataSrc = async () => {
    const imgs = Array.from(document.querySelectorAll('img[data-src]'));
    if (!imgs.length) return;
    await Promise.all(
      imgs.map(async (img) => {
        const data = img.getAttribute('data-src') || '';
        if (!data) return;

        // Oculta mientras carga para evitar mostrar el icono de imagen rota
        img.style.visibility = 'hidden';
        img.classList.remove('is-loaded');

        const onLoad = () => {
          img.classList.add('is-loaded');
          img.style.visibility = '';
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onError);
        };

        const onError = () => {
          // Si falla, se oculta la imagen y se coloca un fondo de respaldo en el carrusel
          img.style.display = 'none';
          const parent = img.closest('.hero-mini-carousel');
          if (parent) parent.style.setProperty('--mini-src', `url('public/img/cultivo.jpg')`);
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onError);
        };

        img.addEventListener('load', onLoad);
        img.addEventListener('error', onError);

        try {
          const resolved = await resolveSrcVariant(data);
          img.src = resolved || HERO_FALLBACK_IMAGE;
        } catch (e) {
          // Ultimo recurso: usar la ruta cruda (activara el manejador de error)
          img.src = data ? normalizeSrc(data) : HERO_FALLBACK_IMAGE;
        }
      })
    );
  };

  // No aplicar bg carousel al hero del index (usa hero 50/50)
  const setupHeroCarousel = () => {
    const heroes = document.querySelectorAll(".page-hero");
    if (!heroes.length || HERO_CAROUSEL_IMAGES.length < 2) return;

    // Resuelve variantes disponibles primero (jpg preferido, svg de respaldo)
    let resolved = HERO_CAROUSEL_IMAGES.slice();
    preloadImages(HERO_CAROUSEL_IMAGES).then((r) => {
      // Filtra archivos inexistentes y garantiza una imagen de respaldo
      resolved = r.filter(Boolean);
      if (!resolved.length) resolved = [HERO_FALLBACK_IMAGE];
    });

    heroes.forEach((hero, heroIndex) => {
      const bgPrimary = document.createElement("div");
      const bgSecondary = document.createElement("div");
      bgPrimary.className = "hero-bg is-visible";
      bgSecondary.className = "hero-bg";

      hero.prepend(bgSecondary);
      hero.prepend(bgPrimary);

      let current = heroIndex % resolved.length;
      let next = (current + 1) % resolved.length;
      let active = bgPrimary;
      let idle = bgSecondary;

      setHeroBgImage(active, resolved[current]);
      setHeroBgImage(idle, resolved[next]);

      setInterval(() => {
        active.classList.remove("is-visible");
        idle.classList.add("is-visible");

        current = next;
        next = (next + 1) % resolved.length;

        const oldActive = active;
        active = idle;
        idle = oldActive;

        setHeroBgImage(idle, resolved[next]);
      }, HERO_CAROUSEL_INTERVAL_MS);
    });
  };

  const setupMiniCarousels = async () => {
    const carousels = document.querySelectorAll(".hero-mini-carousel");
    if (!carousels.length || !HERO_CAROUSEL_IMAGES.length) return;

    let resolved = (await preloadImages(HERO_CAROUSEL_IMAGES)).filter(Boolean);
    if (!resolved.length) resolved = [HERO_FALLBACK_IMAGE];

    carousels.forEach((carousel, index) => {
      let bg = carousel.querySelector(".hero-mini-bg");
      if (!bg) {
        bg = document.createElement("div");
        bg.className = "hero-mini-bg";
        bg.setAttribute("aria-hidden", "true");
        carousel.prepend(bg);
      }

      let img = carousel.querySelector("img");
      if (!img) {
        img = document.createElement("img");
        img.className = "hero-mini-img";
        img.alt = "Galeria SAG Cauca";
        carousel.appendChild(img);
      } else {
        img.classList.add("hero-mini-img");
      }

      let current = index % resolved.length;

      const applyImage = (src) => {
        const normalized = normalizeSrc(src || HERO_FALLBACK_IMAGE);
        img.src = normalized;
        carousel.style.setProperty("--mini-src", `url('${normalized}')`);
      };

      applyImage(resolved[current] || "public/img/cultivo.jpg");

      setInterval(() => {
        img.classList.add("is-fading");
        bg.classList.add("is-fading");

        current = (current + 1) % resolved.length;

        setTimeout(() => {
          applyImage(resolved[current]);
          img.classList.remove("is-fading");
          bg.classList.remove("is-fading");
        }, MINI_CAROUSEL_FADE_MS);
      }, HERO_CAROUSEL_INTERVAL_MS);
    });
  };

  const extractImageUrl = (html) => {
    if (!html) return "";
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : "";
  };

  const htmlToText = (html) => {
    if (!html) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return (doc.body.textContent || "").trim();
  };

  const loadBloggerNews = (force = false) => {
    const container = document.getElementById("blogger-news");
    if (!container) return;

    const feedBase = container.dataset.bloggerFeed || "";
    const maxResults = Number.parseInt(container.dataset.maxResults || "9", 10) || 9;
    if (!feedBase) return;
    const currentState = container.dataset.bloggerState || "";
    if (!force && (currentState === "loading" || currentState === "done")) return;
    container.dataset.bloggerState = "loading";

    const blogUrl = "https://sag-cauca.blogspot.com/";
    const callbackName = `bloggerFeedCallback_${Date.now()}`;
    let script;
    const cleanup = () => {
      if (script && script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
    };
    const showFallback = (message) => {
      container.innerHTML = "";
      const item = document.createElement("article");
      item.className = "news-item";
      const title = document.createElement("h3");
      title.textContent = "Publicaciones recientes";
      const text = document.createElement("p");
      text.textContent = message;
      const link = document.createElement("a");
      link.className = "news-link";
      link.href = blogUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Ver todas las noticias";
      item.appendChild(title);
      item.appendChild(text);
      item.appendChild(link);
      container.appendChild(item);
    };

    window[callbackName] = (data) => {
      const entries = data?.feed?.entry || [];
      container.innerHTML = "";

      if (!entries.length) {
        showFallback("Aún no hay publicaciones en el blog.");
        container.dataset.bloggerState = "done";
        return;
      }

      const fragment = document.createDocumentFragment();
      entries.slice(0, maxResults).forEach((entry) => {
        const title = entry?.title?.$t || "Publicación";
        const link = entry?.link?.find((item) => item.rel === "alternate")?.href || "#";
        const published = entry?.published?.$t || entry?.updated?.$t || "";
        const date = published
          ? new Date(published).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "";
        const rawHtml = entry?.content?.$t || entry?.summary?.$t || "";
        const imageUrl = extractImageUrl(rawHtml);
        const text = htmlToText(rawHtml);
        const excerpt = text.length > 180 ? `${text.slice(0, 177)}...` : text;

        const article = document.createElement("article");
        article.className = "news-item";

        if (imageUrl) {
          const img = document.createElement("img");
          img.className = "news-thumb";
          img.src = imageUrl;
          img.alt = title;
          img.loading = "lazy";
          img.decoding = "async";
          article.appendChild(img);
        }

        if (date) {
          const dateEl = document.createElement("span");
          dateEl.className = "news-date";
          dateEl.textContent = date;
          article.appendChild(dateEl);
        }

        const titleEl = document.createElement("h3");
        const linkEl = document.createElement("a");
        linkEl.href = link;
        linkEl.target = "_blank";
        linkEl.rel = "noopener noreferrer";
        linkEl.textContent = title;
        titleEl.appendChild(linkEl);
        article.appendChild(titleEl);

        if (excerpt) {
          const body = document.createElement("p");
          body.textContent = excerpt;
          article.appendChild(body);
        }

        fragment.appendChild(article);
      });

      container.appendChild(fragment);
      container.dataset.bloggerState = "done";
      cleanup();
    };

    script = document.createElement("script");
    const separator = feedBase.includes("?") ? "&" : "?";
    script.src = `${feedBase}${separator}alt=json-in-script&max-results=${maxResults}&callback=${callbackName}`;
    script.onerror = () => {
      showFallback("No se pudo cargar el blog. Intenta de nuevo m\u00e1s tarde.");
      container.dataset.bloggerState = "error";
      cleanup();
    };
    document.body.appendChild(script);
    setTimeout(() => {
      if (container.dataset.bloggerState === "loading") {
        showFallback("No se pudo cargar el blog. Intenta de nuevo m\u00e1s tarde.");
        container.dataset.bloggerState = "error";
        cleanup();
      }
    }, 6000);
  };

  const init = async () => {
    if (initialized) return;
    setFooterYear();
    setupNavToggle();
    setupContactForms();
    setupGalleryLightbox();
    loadBloggerNews();
    setTimeout(() => loadBloggerNews(true), 2500);
    // Asegura que las imagenes con data-src se resuelvan antes de mostrarlas
    await loadImagesFromDataSrc();
    setupHeroCarousel();
    setupMiniCarousels();
    highlightActiveNav();
    attachImgFallbacks();
    initialized = true;
  };

  const attachImgFallbacks = () => {
    document.querySelectorAll('img').forEach((img) => {
      if (!img.src || !img.src.includes('public/img/') || !/\.jpg$/i.test(img.src)) return;
      img.addEventListener(
        'error',
        () => {
          const alt = img.src.replace(/\.jpg$/i, '.svg');
          if (img.src !== alt) img.src = alt;
        },
        { once: true }
      );
    });
  };

  document.addEventListener("partials:loaded", init);
  document.addEventListener("partials:loaded", () => {
    // Reintenta cuando el header se inserta por AJAX
    setupNavToggle();
    setFooterYear();
    highlightActiveNav();
  });
  document.addEventListener("DOMContentLoaded", init);
  window.loadBloggerNews = loadBloggerNews;
})();
