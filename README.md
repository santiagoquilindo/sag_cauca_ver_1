# SAG Cauca – Sitio estático (HTML/CSS/JS)

Preview en **GitHub Pages (repo pages)** y ejecución local con servidor estático.

## Estructura

- HTML en la raíz: `index.html`, `quienes-somos.html`, `servicios.html`, etc.
- Estilos: `css/`
- Scripts: `js/`
- Recursos: `public/`
- Parciales: `partials/header.html` y `partials/footer.html`
- Inclusión de parciales: `js/includes.js` (carga con `fetch`)

## Ejecutar en local

> Importante: **`fetch` NO funciona** abriendo el HTML con `file://`.
> Debes usar un servidor (Live Server o similar).

### Opción A: VS Code (Live Server)
1. Instala la extensión **Live Server** (Ritwick Dey).
2. Abre la carpeta del proyecto.
3. Clic derecho en `index.html` → **Open with Live Server**.

### Opción B: servidor simple (Python)
En la carpeta del proyecto:

```bash
python -m http.server 5500
```

Luego abre:
- `http://localhost:5500/`

> Si tu servidor expone la carpeta dentro de una subruta (ej: `/sag_cauca_enero/`), igual funciona.

## Publicar en GitHub Pages (Preview)

### Recomendación de ramas
- `main`: código “estable” (producción / trabajo principal)
- `preview`: rama para GitHub Pages (preview continuo)

### Flujo sugerido
1. Crea la rama `preview` desde `main`:
   ```bash
   git checkout -b preview
   git push -u origin preview
   ```

2. En GitHub:
   - **Settings** → **Pages**
   - **Source:** `Deploy from a branch`
   - **Branch:** `preview`
   - **Folder:** `/(root)`
   - **Save**

3. Abre la URL que te muestra GitHub Pages:
   - `https://<usuario>.github.io/<repo>/`

> Si prefieres usar `main` para Pages, también funciona; `preview` solo te da un “ambiente” de vista previa sin tocar tu rama principal.

## Notas técnicas (para evitar errores en Pages)

- `js/includes.js` carga `partials/header.html` y `partials/footer.html` usando rutas **compatibles con repo pages**.
- El script también **normaliza** links e imágenes dentro del header/footer para que funcionen incluso si en el futuro agregas páginas dentro de subcarpetas.
- Asegúrate de que cada página tenga estos contenedores:
  ```html
  <div id="site-header"></div>
  ...
  <div id="site-footer"></div>
  ```

## Troubleshooting rápido

- **Veo el header/footer vacío**
  - Revisa consola → error de `fetch`.
  - Confirma que existen: `partials/header.html` y `partials/footer.html`.
  - Confirma que NO estás abriendo con `file://` (debe ser http/https).

- **Assets (CSS/imagenes) no cargan en Pages**
  - Confirma que no existan rutas absolutas tipo `/css/...` (deben ser relativas o corregidas).
  - Confirma que en Pages seleccionaste **Folder: /(root)** y la rama correcta.

