# AGENTS.md

## Ubicación y ejecución
- El repo vive en el Escritorio de Windows: `/mnt/c/Users/jonat/Desktop/mi-proyecto` en WSL (`C:\Users\jonat\Desktop\mi-proyecto` en Windows). `/home/jonat/mi-proyecto` es otro directorio vacío, no es este proyecto.
- Es una web estática sin build, dependencias ni servidor: se abre `index.html` directamente en el navegador. No hay `package.json`, tests, lint ni CI.
- Sin frameworks ni librerías; no añadir dependencias sin necesidad.
- Verificación: abrir `index.html`, guardar una sesión, recargar y comprobar que persiste y que la racha se recalcula.

## Estructura
- `index.html` es el único entrypoint; carga `styles.css` y `app.js` por rutas relativas. Toda la lógica está en `app.js`.
- Los textos de la interfaz están en español; mantenerlos así.

## Datos y fechas (trampas)
- Las sesiones solo existen en `localStorage`, clave `diarioDeEStudio.sesiones`. No hay archivo de datos en el repo: para probar desde cero hay que borrar esa clave en el navegador.
- Las fechas se guardan como texto local `AAAA-MM-DD` mediante `fechaComoTexto`. No usar `toISOString()`/UTC: desplazaría los días. `diaSiguiente` fija la hora a mediodía para evitar problemas con el horario de verano.
- La racha cuenta días consecutivos terminando en hoy; si hoy no hay sesión, empieza por ayer (no se rompe hasta que acabe el día). Se calcula con un `Set` de fechas que tienen sesión.
