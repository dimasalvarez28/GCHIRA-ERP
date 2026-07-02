# NovaERP · Guía completa de instalación (para personas sin experiencia en programación)

Esta guía te lleva de la mano, paso por paso, desde tu Google Sheet real ("VENTAS - GASTOS WAPIN") hasta tener el dashboard funcionando en internet. No necesitas saber programar: solo necesitas copiar y pegar en los lugares indicados.

**Tiempo estimado:** 20–30 minutos la primera vez.

---

## Índice

1. [¿Qué es cada cosa? (glosario rápido)](#1-qué-es-cada-cosa-glosario-rápido)
2. [Cómo está organizado tu proyecto](#2-cómo-está-organizado-tu-proyecto)
3. [Cómo quedaron mapeadas tus hojas reales](#3-cómo-quedaron-mapeadas-tus-hojas-reales)
4. [Paso 1 — Verifica tu Google Sheet](#paso-1--verifica-tu-google-sheet)
5. [Paso 2 — Crea el backend (Google Apps Script)](#paso-2--crea-el-backend-google-apps-script)
6. [Paso 3 — Conecta el dashboard a tu backend](#paso-3--conecta-el-dashboard-a-tu-backend)
7. [Paso 4 — Publica el dashboard en internet (GitHub Pages)](#paso-4--publica-el-dashboard-en-internet-github-pages)
8. [Paso 5 — Verifica que todo funcione](#paso-5--verifica-que-todo-funcione)
9. [Cómo actualizar los datos día a día](#cómo-actualizar-los-datos-día-a-día)
10. [Cómo actualizar el dashboard si necesitas cambiar algo](#cómo-actualizar-el-dashboard-si-necesitas-cambiar-algo)
11. [Solución de problemas comunes](#solución-de-problemas-comunes)
12. [Preguntas frecuentes](#preguntas-frecuentes)

---

## 1. ¿Qué es cada cosa? (glosario rápido)

| Palabra | Qué significa en palabras simples |
|---|---|
| **Google Sheet** | Tu archivo de Excel dentro de Google Drive. Ya lo tienes ("VENTAS - GASTOS WAPIN"). |
| **Google Apps Script (o "Apps Script")** | Un programa pequeño y gratuito que Google te deja "pegar" dentro de tu Google Sheet. Su único trabajo aquí es: leer tus pestañas y entregarlas en un formato que el dashboard pueda leer. |
| **Backend** | Así le decimos al Apps Script una vez publicado: es la pieza que conecta tu Sheet con el dashboard. |
| **Frontend / Dashboard** | Es la página web bonita con gráficos, tarjetas y tablas que tú vas a ver en el navegador. |
| **Repositorio (repo)** | Una carpeta especial en GitHub donde vive el código del dashboard. |
| **GitHub** | Una plataforma gratuita donde se "hospeda" (publica) el código del dashboard para que quede disponible como una página web real. |
| **GitHub Pages** | El servicio gratuito de GitHub que convierte los archivos de tu repositorio en una página web con una dirección tipo `https://tu-usuario.github.io/erp-dashboard/`. |
| **Implementación / "Deploy"** | La acción de publicar el Apps Script (o el dashboard) para que quede accesible por internet. |
| **URL** | Una dirección web, por ejemplo `https://script.google.com/...`. Cada vez que veas "URL" piensa en "el link". |

No necesitas memorizar esto, solo úsalo como referencia si te pierdes más adelante.

---

## 2. Cómo está organizado tu proyecto

No necesitas tocar la mayoría de estas carpetas — solo dos archivos van a requerir que copies y pegues algo (te lo indico en los pasos 2 y 3):

```
erp-dashboard/
├── index.html          # La página principal. No la edites.
├── css/                 # Los estilos visuales (colores, tamaños). No los edites.
├── js/
│   └── config.js        # ⚠️ AQUÍ vas a pegar el link de tu Apps Script (Paso 3)
├── components/          # Piezas reutilizables de la interfaz. No las edites.
├── pages/                # Los 7 dashboards (Ventas, Financiero, Gastos, etc). No los edites.
└── gas/
    └── Code.gs           # ⚠️ AQUÍ vas a copiar y pegar el backend (Paso 2)
```

En resumen: **solo trabajarás con 2 archivos** (`gas/Code.gs` y `js/config.js`) y con la interfaz de GitHub para publicar. Todo lo demás ya está listo.

---

## 3. Cómo quedaron mapeadas tus hojas reales

Revisé el archivo que subiste (`VENTAS_-_GASTOS_WAPIN_2025.xlsx`) y ajusté el dashboard para que funcione exactamente con tus columnas reales, tal como están hoy. Esto es lo importante que debes saber:

### "VENTAS 2026"
- El encabezado real de las columnas está en la **fila 2** (la fila 1 solo tiene un título). El sistema ya sabe esto, no debes moverlo.
- Esta hoja **no tiene una columna de "Producto"**. Por eso, el **Dashboard de productos** obtiene su información de la pestaña **"CONTROL DE PEDIDO"** en lugar de "VENTAS 2026" (más detalles abajo).
- Columnas que el dashboard usa de aquí: Fecha, Cliente, N° Factura, Dirección, Cantidad, Total, Pagado, Fecha de pago, Método de pago.

### "BANCA EN LINEA"
- Es tu estado de cuenta bancario: cada movimiento tiene **Débito** (dinero que sale) o **Crédito** (dinero que entra), y una columna **Saldo** que el banco ya calculó. El dashboard usa ese saldo tal cual, no lo recalcula.

### "GASTOS 2026"
- El encabezado también está en la **fila 2**.
- No tiene una columna de "Categoría" con ese nombre exacto — el dashboard usa la columna **"Referencia"** (donde escribes cosas como "combustible", "botellas", "tapas") como el concepto/categoría del gasto.
- La columna **"RAZON SOCIAL"** se usa como el proveedor.

### "CONTROL DE PEDIDO"
- Esta pestaña, al día de hoy, está **vacía** (solo tiene los títulos de columna, sin filas de datos todavía). El dashboard de Pedidos y el de Productos funcionan perfectamente así — simplemente mostrarán "sin datos" hasta que tu equipo empiece a registrar pedidos ahí.
- Si tu operación no usa esta pestaña activamente, no pasa nada: el resto del dashboard (Ventas, Financiero, Gastos, Clientes) funciona igual de bien sin ella.

> 💡 **No necesitas cambiar ni una sola columna en tu Google Sheet.** El sistema ya está adaptado a como están hoy tus pestañas. Si en el futuro agregas o renombras una columna, avísame y ajusto el sistema — no tienes que hacerlo tú mismo.

---

## Paso 1 — Verifica tu Google Sheet

1. Abre tu Google Sheet ("VENTAS - GASTOS WAPIN") en [sheets.google.com](https://sheets.google.com).
2. Revisa que existan estas 4 pestañas (los nombres deben verse igual, aunque un espacio de más al final no es problema, el sistema lo tolera):
   - `VENTAS 2026`
   - `BANCA EN LINEA`
   - `GASTOS 2026`
   - `CONTROL DE PEDIDO`
3. Anota el nombre exacto de tu archivo (lo verás en la pestaña del navegador o arriba a la izquierda). No necesitas hacer nada más aquí — continúa al paso 2.

---

## Paso 2 — Crea el backend (Google Apps Script)

Esta es la parte más importante. La harás **una sola vez**.

1. Con tu Google Sheet abierto, ve al menú superior: **Extensiones → Apps Script**.

   *(Se abrirá una pestaña nueva del navegador con un editor de código en blanco, llamado algo como "Proyecto sin título").*

2. Verás un archivo llamado `Código.gs` con un poco de texto de ejemplo (algo como `function myFunction() {}`). **Selecciona todo ese texto y bórralo** (clic dentro del área de código, `Ctrl+A` para seleccionar todo, y `Supr`/`Delete` para borrar).

3. Abre el archivo `gas/Code.gs` que te entregué (está en la carpeta del proyecto que descargaste). Selecciona **todo** su contenido y cópialo (`Ctrl+A`, `Ctrl+C`).

4. Vuelve a la pestaña del navegador donde está Apps Script y pega el contenido (`Ctrl+V`) en el área en blanco.

5. Arriba a la izquierda, haz clic en el ícono de disquete 💾 ("Guardar proyecto"). Puedes ponerle un nombre al proyecto, por ejemplo: `NovaERP Backend`.

6. Ahora vas a **publicarlo**. Haz clic en el botón azul **Implementar** (arriba a la derecha) → **Nueva implementación**.

7. Se abrirá una ventana. Junto a "Seleccionar tipo", haz clic en el ícono de engranaje ⚙️ y elige **Aplicación web**.

8. Completa las opciones así (son muy importantes):
   - **Descripción:** (opcional) "Backend NovaERP"
   - **Ejecutar como:** `Yo (tu-correo@gmail.com)`
   - **Quién tiene acceso:** `Cualquier usuario`

9. Haz clic en **Implementar**.

10. Google te va a pedir **autorizar permisos** (porque el script necesita leer tu Sheet):
    - Haz clic en **Autorizar acceso**.
    - Elige tu cuenta de Google.
    - Es normal que aparezca una pantalla que dice **"Google no verificó esta aplicación"** — esto pasa porque es un script personal tuyo, no un producto público. Haz clic en **Avanzado** (o "Advanced") y luego en **Ir a "NovaERP Backend" (no seguro)**.
    - Haz clic en **Permitir**.

11. Aparecerá una ventana con el título **"Implementación actualizada"** y una casilla llamada **URL de la aplicación web**. Es un link que empieza con `https://script.google.com/macros/s/...` y termina en `/exec`.

12. **Copia ese link completo** (hay un botón de copiar al lado). Pégalo en algún lugar temporal (una nota, un correo borrador) — lo vas a necesitar en el próximo paso.

13. Haz clic en **Listo** para cerrar la ventana.

> ⚠️ **Muy importante:** si en el futuro editas el archivo `Code.gs` dentro de Apps Script (por ejemplo, para agregar algo nuevo), los cambios **no se publican solos**. Debes volver a **Implementar → Gestionar implementaciones**, hacer clic en el lápiz ✏️ de tu implementación existente, y en "Versión" elegir **Nueva versión** → **Implementar**. Si solo guardas (💾) sin hacer esto, el dashboard seguirá viendo la versión vieja.

---

## Paso 3 — Conecta el dashboard a tu backend

1. En la carpeta del proyecto que descargaste, abre la carpeta `js` y luego el archivo `config.js` con el Bloc de notas (Windows) o TextEdit (Mac) — clic derecho sobre el archivo → **Abrir con** → tu editor de texto preferido. (Si tienes Notepad++, VS Code o similar, mejor aún, pero el Bloc de notas también sirve).

2. Busca esta línea, cerca del comienzo del archivo:

   ```js
   API_URL: 'https://script.google.com/macros/s/TU_ID_DE_IMPLEMENTACION/exec',
   ```

3. Reemplaza **todo el link entre comillas** por el que copiaste en el Paso 2, punto 12. Debe quedar algo así (el tuyo será distinto):

   ```js
   API_URL: 'https://script.google.com/macros/s/AKfycbxAbCdEfGhIjKlMnOpQrStUvWxYz/exec',
   ```

   > Ten cuidado de **no borrar las comillas ni la coma** al final de la línea.

4. Guarda el archivo (`Ctrl+S`) sin cambiar su nombre ni su ubicación.

---

## Paso 4 — Publica el dashboard en internet (GitHub Pages)

Vamos a subir la carpeta completa a GitHub para que tenga una dirección web propia. Es gratis y no necesitas tarjeta de crédito.

### 4.1 Crea tu cuenta de GitHub (si no tienes una)

1. Ve a [github.com](https://github.com) y haz clic en **Sign up**.
2. Sigue los pasos (correo, contraseña, nombre de usuario). Confirma tu correo cuando te lo pidan.

### 4.2 Crea un repositorio nuevo

1. Ya con sesión iniciada, haz clic en el botón verde **New** (o el símbolo **+** arriba a la derecha → **New repository**).
2. En **Repository name**, escribe: `erp-dashboard` (o el nombre que prefieras, sin espacios).
3. Marca la opción **Public** (debe ser público para que GitHub Pages funcione gratis).
4. **No marques** la casilla "Add a README file" (ya tienes uno).
5. Haz clic en **Create repository**.

### 4.3 Sube los archivos del proyecto

1. En la página de tu repositorio recién creado, verás un enlace que dice **uploading an existing file**. Haz clic ahí.
   *(Si no lo ves, usa el botón **Add file → Upload files**.)*
2. Abre en tu computadora la carpeta del proyecto (`erp-dashboard`).
3. **Selecciona todo el contenido de adentro de la carpeta** (los archivos y subcarpetas `index.html`, `css`, `js`, `components`, `pages`, `assets`, `gas`, `README.md`, `.nojekyll`) — **no arrastres la carpeta `erp-dashboard` completa, sino lo que está adentro de ella.**
4. Arrastra todo eso hacia el recuadro de GitHub que dice "Drag files here to add them to your repository", o haz clic en **choose your files** y selecciónalos.
5. Espera a que termine de subir (verás una barra de progreso por cada archivo).
6. Abajo, en **Commit changes**, deja el mensaje por defecto o escribe algo como "Primera versión del dashboard".
7. Haz clic en el botón verde **Commit changes**.

### 4.4 Activa GitHub Pages

1. Dentro de tu repositorio, ve a la pestaña **Settings** (arriba, junto a "Code", "Issues", etc.).
2. En el menú de la izquierda, haz clic en **Pages**.
3. Donde dice **Source**, selecciona la rama **main** y la carpeta **/ (root)**.
4. Haz clic en **Save**.
5. Espera 1–2 minutos. Actualiza la página (F5) hasta que veas un mensaje verde parecido a:
   *"Your site is live at https://tu-usuario.github.io/erp-dashboard/"*
6. Haz clic en ese link — ¡ahí está tu dashboard!

> 💡 Guarda ese link, es la dirección permanente de tu dashboard. Puedes compartirla con tu equipo.

---

## Paso 5 — Verifica que todo funcione

1. Abre el link de tu dashboard (el de GitHub Pages).
2. Deberías ver primero un mensaje "Conectando con Google Sheets…" y luego, en unos segundos, tus tarjetas, gráficos y tablas con datos reales.
3. Prueba lo siguiente para confirmar que todo está bien conectado:
   - Cambia entre los dashboards del menú lateral (Ventas, Financiero, Gastos, Pedidos, Clientes, Productos).
   - Prueba el botón de tema claro/oscuro (arriba a la derecha).
   - Prueba un filtro de fecha en la parte superior de cualquier dashboard.
   - Exporta una tabla a Excel o PDF con los botones de la esquina superior de cada tabla.
   - Presiona `Ctrl + K` (o `Cmd + K` en Mac) para abrir el buscador y escribe el nombre de un cliente.

Si ves un mensaje de error en rojo en vez de datos, ve directo a la sección de [solución de problemas](#solución-de-problemas-comunes) — el mensaje de error casi siempre te dice exactamente qué pasó.

---

## Cómo actualizar los datos día a día

**No necesitas hacer nada especial.** Simplemente sigue registrando tus ventas, gastos y movimientos bancarios en el mismo Google Sheet de siempre. El dashboard:

- Se actualiza **automáticamente cada 5 minutos** mientras esté abierto.
- Tiene un botón de **refrescar** (ícono de flechas circulares, arriba a la derecha) para forzar una actualización inmediata.

No necesitas volver a tocar Apps Script ni GitHub para que los nuevos datos aparezcan — solo si cambias la **estructura** de las columnas (ver siguiente sección).

---

## Cómo actualizar el dashboard si necesitas cambiar algo

| Quiero... | Qué hacer |
|---|---|
| Agregar una fila de venta, gasto, pedido, etc. | Solo escríbela en tu Google Sheet como siempre. Aparece sola en el dashboard. |
| Agregar una **columna nueva** a una hoja | Avísame para que actualice `gas/Code.gs` — es un cambio de 2 minutos. |
| Cambiar el **nombre de una pestaña** en Google Sheets | Avísame o edita tú mismo la línea `sheetName:` correspondiente dentro de `gas/Code.gs` (Apps Script) siguiendo el mismo formato, y vuelve a implementar (ver nota del Paso 2, punto 13). |
| Cambiar colores o el logo | Se edita en `css/variables.css`. Pídeme ayuda si no te sientes cómodo tocándolo tú mismo. |
| Subir una corrección de archivos a GitHub | En tu repositorio, entra a la carpeta/archivo a reemplazar → ícono de lápiz ✏️ (editar) o **Add file → Upload files** para reemplazar por una versión nueva → **Commit changes**. GitHub Pages se actualiza solo en 1–2 minutos. |

---

## Solución de problemas comunes

### "No se pudieron cargar los datos" con un mensaje sobre `TU_ID_DE_IMPLEMENTACION`
No completaste el Paso 3. Abre `js/config.js` y confirma que el `API_URL` sea el link real que copiaste de Apps Script, no el texto de ejemplo.

### "No se encontró la pestaña 'X'. Pestañas disponibles en este archivo: ..."
El backend no encontró alguna de las 4 pestañas necesarias. El mensaje de error te dice exactamente qué pestañas sí existen en tu archivo — compara los nombres y corrige el que esté mal escrito (puede ser en tu Google Sheet o en `gas/Code.gs`, línea `sheetName:`).

### La página carga pero se queda en "Conectando con Google Sheets…" para siempre
Casi siempre es un problema de permisos del Apps Script. Repite el Paso 2 desde el punto 6 (**Implementar → Nueva implementación**) y asegúrate de elegir **"Cualquier usuario"** en "Quién tiene acceso".

### Edité `Code.gs` pero no veo el cambio reflejado
Recuerda: guardar (💾) no es suficiente. Debes ir a **Implementar → Gestionar implementaciones → lápiz ✏️ → Nueva versión → Implementar** (ver nota al final del Paso 2).

### El link de GitHub Pages me da error 404 ("Page not found")
- Revisa que `index.html` haya quedado en la **raíz** del repositorio (no dentro de una subcarpeta `erp-dashboard/erp-dashboard/`). Si subiste la carpeta completa por error, bórrala y vuelve a subir solo su contenido (ver Paso 4.3).
- Espera 2–3 minutos después de activar Pages; a veces tarda un poco la primera vez.

### Algunos gráficos aparecen vacíos
Es normal si esa pestaña (por ejemplo "Control de Pedido") todavía no tiene filas de datos. En cuanto agregues registros ahí, los gráficos de Pedidos y Productos se llenarán solos.

### Quiero probarlo en mi computadora antes de publicarlo (opcional, para gente más técnica)
No es necesario, pero si quieres, puedes usar un servidor local simple. Esto requiere tener Python o Node.js instalados:

```bash
# Dentro de la carpeta del proyecto:
python3 -m http.server 8080
# luego abre http://localhost:8080 en tu navegador
```

---

## Preguntas frecuentes

**¿Esto tiene algún costo?**
No. Google Sheets, Google Apps Script y GitHub Pages son gratuitos para este tipo de uso.

**¿Mis datos son públicos si uso un repositorio "Public" en GitHub?**
El **código** del dashboard es público (cualquiera puede ver cómo está hecho), pero tus **datos reales no viven en GitHub** — siguen guardados únicamente en tu Google Sheet, y solo se cargan en el navegador de quien abra el dashboard en el momento en que lo abre. Si tus datos son sensibles, puedes crear el repositorio como **Private**; GitHub Pages gratuito para repos privados requiere una cuenta de GitHub Pro/Team — coméntamelo si es tu caso y te explico alternativas.

**¿Qué pasa si alguien más de mi equipo quiere ver el dashboard?**
Solo comparte con ellos el link de GitHub Pages (`https://tu-usuario.github.io/erp-dashboard/`). No necesitan cuenta de Google ni permisos sobre tu Sheet para **ver** el dashboard (aunque el backend sí necesita acceso de lectura a tu Sheet, que ya configuraste en el Paso 2).

**¿Puedo restringir quién ve el dashboard?**
La versión actual es de acceso libre a quien tenga el link. Si necesitas una contraseña o inicio de sesión, es una funcionalidad adicional que se puede construir — avísame si te interesa.

**¿Qué pasa si borro una fila de mi Google Sheet por error?**
El dashboard simplemente dejará de mostrarla la próxima vez que se actualice (cada 5 minutos, o al presionar refrescar). Como el dashboard no modifica tu Sheet, no hay riesgo de pérdida de información adicional.

**¿Necesito dejar la pestaña de Apps Script abierta para que funcione?**
No. Una vez que hiciste "Implementar" (Paso 2), el backend queda funcionando en los servidores de Google de forma permanente, sin que tengas que dejar nada abierto.
