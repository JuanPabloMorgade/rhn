// helpers/formatEmailHtmlServer.ts

import { JSDOM } from 'jsdom';
import juice from 'juice';

export async function formatEmailHtmlServer(htmlRaw: string): Promise<string> {
  // 1) DOM virtual
  const dom = new JSDOM(`<body>${htmlRaw}</body>`);
  const document = dom.window.document;

  // 2) <mark> → <span> igual que antes
  document.querySelectorAll('mark').forEach((mark) => {
    const bg = mark.getAttribute('data-color') || '';
    const text = mark.textContent || '';
    const span = document.createElement('span');
    span.textContent = text;
    if (bg) span.style.backgroundColor = bg;
    const color = mark.getAttribute('data-color-text');
    if (color) span.style.color = color;
    const align = mark.getAttribute('data-align');
    if (align) (span.style as any).textAlign = align;
    const width = mark.getAttribute('data-width');
    if (width) span.style.width = width;
    mark.replaceWith(span);
  });

  // 3) Imagenes → envueltas en tabla para forzar align en mailers
  document.querySelectorAll('img').forEach((img) => {
    const align = img.getAttribute('data-align'); // "left"|"center"|"right"
    const width = img.getAttribute('data-width'); // ej. "25%"

    // paso 0: limpiamos estilos previos
    img.removeAttribute('style');
    img.style.display = 'block';
    img.style.height = 'auto';
    if (width) img.style.width = width;

    if (align) {
      // 1) creo la tabla wrapper
      const table = document.createElement('table');
      table.setAttribute('width', '100%');
      table.setAttribute('cellpadding', '0');
      table.setAttribute('cellspacing', '0');

      const tbody = document.createElement('tbody');
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.setAttribute('align', align);
      td.style.verticalAlign = 'top';

      // 2) image como inline-block dentro del td
      img.style.display = 'inline-block';

      // 3) armo la estructura y sustituyo
      tr.appendChild(td);
      td.appendChild(img);
      tbody.appendChild(tr);
      table.appendChild(tbody);

      img.parentNode?.replaceChild(table, img);
    }
  });

  // 4) Inlining de CSS
  const htmlTransformado = document.body.innerHTML;
  return juice(htmlTransformado, { preserveMediaQueries: true });
}
