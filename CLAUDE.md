# CLAUDE.md — unbj-page

Landing page para **https://unbj.cnbm.mx/** (organización sin fines de lucro, hosting en Hostinger).

## Stack
- **Astro** (SSG) + **React** — genera archivos estáticos para subir a Hostinger shared hosting
- TypeScript strict
- Pencil MCP para diseño (app de escritorio debe estar abierta)

## Comandos
```bash
npm run dev      # dev server local
npm run build    # genera dist/ para subir a Hostinger
```

## Deploy
Subir contenido de `dist/` al `public_html` de `unbj.cnbm.mx` en el panel de Hostinger.
Cada subdominio tiene directorio aislado — no afecta los demás sitios del hosting.

## Estado
- [x] Proyecto scaffoldeado con Astro minimal + TypeScript
- [x] Integración @astrojs/react configurada
- [ ] Diseño de la landing page (pendiente — usar Pencil MCP)
- [ ] Contenido/branding de UNBJ por definir
