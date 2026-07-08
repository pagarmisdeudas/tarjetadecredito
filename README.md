# Pagar tu tarjeta de crédito sí es posible

Herramienta web de una sola página que ayuda a entender una tarjeta de crédito y planear cómo pagarla: cuánto pagar, en cuánto tiempo se termina, y qué pasa si solo se paga el mínimo. Sin registro, sin backend, y los datos nunca salen del navegador del usuario.

## Qué hace

La app está organizada en 3 pestañas:

1. **Entendiendo mi tarjeta** — glosario claro de corte, fecha límite de pago, pago mínimo, APR y los campos de un estado de cuenta (límite, utilizado, disponible, deuda al corte), más estrategias generales de pago.
2. **Lo que gasto y cuándo pagar** — el usuario define su día de corte y su día de pago (se repiten solos cada mes) y registra gastos en varias filas a la vez; cada gasto se asigna al ciclo de facturación que le corresponde con una etiqueta de cuántos días faltan para pagarlo.
3. **Quiero pagar mi tarjeta** — dos preguntas espejo: "¿en cuánto tiempo termino si pago X al mes?" y "¿cuánto pago si quiero terminar en Y meses?", más una tabla comparando plazos (3 a 48 meses) y el impacto de seguir gastando mientras se paga.

### Detalles de cálculo

- La simulación del pago mínimo usa la **fórmula bancaria real** (% de capital × saldo + intereses del mes + cargos fijos), derivando el % de capital del mínimo que el usuario copia de su estado de cuenta. Si el mínimo no cubre ni el interés, detecta el esquema de monto fijo y lo refleja.
- Toda la matemática de amortización corre mes a mes en el navegador; el mismo motor alimenta el resultado principal, la tabla de plazos y el cruce con los gastos, para que los números siempre coincidan.

## Privacidad y datos

- Los datos (situación, gastos, plan) se guardan **solo en el navegador del usuario** vía `localStorage` — nunca se envían a ningún servidor.
- Hay un botón "Borrar mis datos" en la barra superior que limpia todo y reinicia la página.
- La app funciona aunque el navegador bloquee el almacenamiento (modo incógnito): simplemente no guarda entre sesiones.

## Stack

- HTML, CSS y JavaScript vanilla — todo en un solo archivo (`index.html`), sin frameworks ni paso de build.
- [Chart.js](https://www.chartjs.org/) vía CDN para la gráfica de saldo.
- Fuentes de Google Fonts (Fraunces, IBM Plex Sans, IBM Plex Mono) vía `@import`.

## Cómo correrlo

No necesita instalación. Abre `index.html` en cualquier navegador (doble clic), o publícalo en cualquier hosting estático:

1. Sube los archivos a un repo de GitHub.
2. En Vercel / Netlify / GitHub Pages, apunta el deploy a la carpeta con los archivos.
3. Listo — el archivo se llama `index.html`, así que la raíz del dominio lo sirve directo.

## Archivos del repo

Para que todo funcione, estos archivos deben estar juntos en la raíz:

- `index.html` — la app completa (markup, estilos y lógica).
- `favicon.ico` — icono de la pestaña del navegador.
- `apple-touch-icon.png` — icono al guardar en la pantalla de inicio (iOS).
- `og-image.png` — imagen de previsualización al compartir el link en redes/WhatsApp.

## Integraciones opcionales

La app funciona completa sin configurar nada. Estas dos integraciones están listas en el código pero desactivadas hasta pegar sus claves — mientras estén vacías, no cargan nada ni muestran botones rotos.

### Envío del plan por correo (EmailJS)

El botón de descarga en PDF funciona siempre, sin configuración. Para habilitar además el envío por correo:

1. Crea una cuenta gratis en [emailjs.com](https://www.emailjs.com) y conecta tu correo.
2. Crea una plantilla con las variables `{{to_email}}` y `{{plan_texto}}`.
3. Pega tus tres identificadores en las constantes `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID` y `EMAILJS_TEMPLATE_ID` al inicio del `<script>`.

Al pegarlas, el campo de correo aparece automáticamente.

### Métricas de uso (Google Analytics 4)

Para medir cuántos usuarios completan una simulación, registran gastos o exportan su plan:

1. Crea una propiedad en [analytics.google.com](https://analytics.google.com) y copia tu ID de medición (formato `G-XXXXXXXXXX`).
2. Pégalo en la constante `GA4_MEASUREMENT_ID` al inicio del `<script>`.

Solo se envían nombres de eventos (`simulacion_completada`, `gastos_registrados`, `plan_exportado`), una vez por sesión — nunca montos ni datos financieros del usuario.

## Personalización rápida

- **Colores y tipografía**: en el bloque `<style>` al inicio del archivo (paleta clara, tonos cálidos con acentos verde/rojo/dorado).
- **Textos del glosario y tips**: HTML plano dentro de la pestaña 1, fáciles de editar sin tocar el JavaScript.
- **URL de compartir**: si publicas en un dominio propio, actualiza las etiquetas `og:url` y `og:image` en el `<head>` con tu dirección real.

## Accesibilidad

- Labels asociados a sus campos, pestañas con roles ARIA, resultados dinámicos con `aria-live`, resumen de texto oculto para la gráfica.
- Contraste de color verificado contra el estándar WCAG AA.
- Diseño responsivo probado en móvil, tablet y escritorio, con objetivos de toque adecuados.

## Aviso

Esta calculadora es una herramienta de referencia con fines informativos y no constituye asesoría financiera personalizada. Los cálculos son estimaciones basadas en los datos que ingresa el usuario.

## Licencia

Sin licencia definida — agrega la que prefieras (MIT es común para proyectos así) antes de hacerlo público.
