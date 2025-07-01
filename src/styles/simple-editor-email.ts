export const SIMPLE_EDITOR_EMAIL_CSS = `/* 1) Imports de TipTap */
/* @import "@tiptap/core/style.css";
@import "@tiptap/starter-kit/style.css";
@import "@tiptap/extension-link/style.css";
@import "@tiptap/extension-underline/style.css";
@import "@tiptap/extension-text-align/style.css";
@import "@tiptap/extension-task-list/style.css";
@import "@tiptap/extension-task-item/style.css"; */

/* 2) Reglas globales para email */
/* Contenedor principal del contenido */
.simple-editor-content {
  font-family: Arial, sans-serif;
  font-size: 16px;
  color: #333333;
  line-height: 1.5;
  margin: 0;
  padding: 0;
}

/* Párrafos */
.simple-editor-content p {
  margin: 0 0 1em 0;
}

/* Encabezados */
.simple-editor-content h1,
.simple-editor-content h2,
.simple-editor-content h3 {
  margin: 0 0 0.5em 0;
  font-weight: bold;
}
.simple-editor-content h1 { font-size: 24px; }
.simple-editor-content h2 { font-size: 20px; }
.simple-editor-content h3 { font-size: 18px; }

/* Enlaces */
.simple-editor-content a {
  color: #1a0dab;
  text-decoration: underline;
}

/* Listas */
.simple-editor-content ul,
.simple-editor-content ol {
  margin: 0 0 1em 1.5em;
}
.simple-editor-content li {
  margin: 0.25em 0;
}

/* Citas */
.simple-editor-content blockquote {
  margin: 0 0 1em 0;
  padding-left: 1em;
  border-left: 3px solid #cccccc;
  color: #666666;
}

/* Código en línea y bloques */
.simple-editor-content code {
  font-family: monospace;
  background-color: #f4f4f4;
  padding: 2px 4px;
  border-radius: 3px;
}
.simple-editor-content pre {
  background-color: #f4f4f4;
  padding: 8px;
  overflow-x: auto;
  border-radius: 3px;
  margin: 0 0 1em 0;
}

/* Tareas */
.simple-editor-content .task-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1em 0;
}
.simple-editor-content .task-list-item {
  display: flex;
  align-items: center;
  margin: 0.25em 0;
}
.simple-editor-content .task-list-item input[type="checkbox"] {
  margin-right: 0.5em;
}

/* Alineaciones */
.simple-editor-content [data-align="center"] {
  text-align: center;
}
.simple-editor-content [data-align="right"] {
  text-align: right;
}

/* Imágenes */
.simple-editor-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0.5em 0;
}
` as const;

