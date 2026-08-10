# Carpeta de galerías — oyesonrie.com/galeria/...

Esta carpeta está lista para recibir el proyecto de galerías profesionales
(el que se conecta a Google Drive) que quedó pendiente de una conversación
anterior.

## Cómo va a funcionar

Cada galería de cliente es una sub-carpeta aquí adentro, con el resultado
ya compilado (build) de ese proyecto. Por ejemplo:

    galeria/
    ├── galeria15pablo/       → oyesonrie.com/galeria/galeria15pablo
    │   └── index.html (y sus archivos generados)
    ├── bodamariayluis/       → oyesonrie.com/galeria/bodamariayluis
    │   └── index.html (y sus archivos generados)
    └── ...

## Pasos para agregar una galería nueva (cuando ese proyecto esté listo)

1. Generas el build de la galería de ese cliente (en Astro esto es
   `npm run build`, que genera una carpeta `dist/`).
2. Renombras esa carpeta con el slug que quieras usar en la URL —
   minúsculas, sin espacios ni acentos (ej. `galeria15pablo`).
3. La copias completa aquí adentro, dentro de `galeria/`.
4. Listo — con solo subir la carpeta ya funciona en
   `oyesonrie.com/galeria/ese-slug`, sin tocar nada del sitio principal.

No hace falta modificar el sitio principal (`index.html`, `styles.css`,
etc.) para agregar una galería nueva — son proyectos completamente
independientes que solo comparten el mismo dominio.
