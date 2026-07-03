# Deja de adivinar con tu tarjeta

Calculadora de pago de tarjeta de crédito — una herramienta de una sola página (HTML + CSS + JS, sin build ni dependencias de servidor) para entender cómo funciona tu tarjeta, registrar gastos y planear cómo bajar el saldo.

## Qué hace

La app está organizada en 3 pestañas:

1. **Entendiendo mi tarjeta** — glosario explicando corte, fecha límite de pago, pago mínimo, APR, y los campos típicos de un estado de cuenta (límite, utilizado, disponible, deuda al corte), más estrategias generales de pago.
2. **Lo que gasto y cuándo pagar** — configuras el día de corte y el día límite de pago de tu tarjeta (se repiten automáticamente cada mes) y registras gastos del día a día; cada uno se asigna al ciclo de facturación que le corresponde, con una etiqueta de cuántos días faltan para pagarlo.
3. **Quiero pagar mi tarjeta** — simulador de amortización que compara "solo pago mínimo" vs. tu plan de pago fijo (meses, interés total, gráfica de saldo mes a mes), calculadora de "quiero liquidarla en X meses" y una tabla comparando distintos plazos (3 a 48 meses).

## Stack

- HTML, CSS y JavaScript vanilla — un solo archivo, sin frameworks ni paso de build.
- [Chart.js](https://www.chartjs.org/) vía CDN (`cdnjs.cloudflare.com`) para la gráfica de saldo.
- Fuentes de Google Fonts (Fraunces, IBM Plex Sans, IBM Plex Mono) vía `@import`.

No hay backend ni base de datos: todo el cálculo corre en el navegador y los datos (gastos registrados) viven solo en memoria mientras la pestaña está abierta — se pierden al recargar la página.

## Cómo correrlo

No necesita instalación. Dos opciones:

**Abrir directo el archivo**
```bash
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

**Servirlo con GitHub Pages**
1. Sube el archivo a un repo de GitHub (puedes renombrarlo a `index.html`).
2. Ve a *Settings → Pages*, elige la rama y carpeta donde está el archivo.
3. GitHub te da una URL pública para compartir la calculadora.

También funciona con cualquier hosting estático (Netlify, Vercel, Cloudflare Pages) arrastrando el archivo.

## Estructura del archivo

Todo vive en un único `.html`:
- `<style>` — variables de color, tipografía y layout (grid responsivo de 3 columnas en desktop, apilado en mobile).
- HTML del body — las 3 pestañas (`role="tablist"` / `role="tab"` / `role="tabpanel"`).
- `<script>` — lógica de amortización, cálculo de ciclos de facturación, render de la gráfica y control de pestañas.

## Accesibilidad

- Labels asociados a sus campos (`for`/`id`).
- Pestañas con roles ARIA (`aria-selected`, `aria-controls`).
- Resultados dinámicos con `aria-live="polite"`.
- Resumen de texto oculto (`sr-only`) para la gráfica, pensado para lectores de pantalla.
- Contraste de color verificado contra el estándar WCAG AA.
- Objetivos de toque (`min-height`) pensados para mobile.

## Personalización rápida

- **Colores**: están en el bloque `<style>` al inicio del archivo (paleta clara, tonos cálidos con acentos verde/rojo/dorado).
- **Valores por defecto** de los campos (saldo, APR, día de corte, etc.) están como `value="..."` en cada `<input>`.
- **Textos del glosario y tips**: son HTML plano dentro de la pestaña 1, fáciles de editar sin tocar el JS.

## Aviso

Esta calculadora es una herramienta de referencia con fines informativos y no constituye asesoría financiera personalizada. Los cálculos son estimaciones basadas en los datos que el usuario ingresa.

## Licencia

Sin licencia definida — agrega la que prefieras (MIT es una opción común para proyectos de este tipo) antes de hacerlo público.
