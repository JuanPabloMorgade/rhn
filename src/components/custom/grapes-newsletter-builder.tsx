'use client';

import { useEffect, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import presetNewsletter from 'grapesjs-preset-newsletter';
import { placeholdersCanvas } from '@/helpers/helpers';
import { toast } from 'react-toastify';

interface Props {
  onInit?: (editor: Editor) => void;
  initialContent?: string;
}

const defaultContent = `
  <table class="email-table" width="100%" cellpadding="0" cellspacing="0" style="width: 100%;">
    <tr>
      <td align="center" valign="top">
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="width: 600px;">
          <tr>
            <td style="padding: 20px;">
              <div data-gjs-type="text">Edita este email</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export default function GrapesNewsletterBuilder({
  onInit,
  initialContent,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const MAX_SIZE = 250 * 1024; // 250 KB

    const editor = grapesjs.init({
      container: containerRef.current,
      plugins: [presetNewsletter],
      pluginsOpts: { [presetNewsletter as any]: {} },
      storageManager: false,
      fromElement: false,
      height: '600px',
      width: '100%',
      deviceManager: {},
      selectorManager: { componentFirst: true },
      styleManager: {
        sectors: [
          {
            name: 'General',
            open: true,
            buildProps: ['display', 'position', 'float', 'overflow'],
          },
          {
            name: 'Dimensión',
            open: false,
            buildProps: [
              'width',
              'height',
              'max-width',
              'min-height',
              'margin',
              'padding',
            ],
          },
          {
            name: 'Tipografía',
            open: false,
            buildProps: [
              'font-family',
              'font-size',
              'color',
              'line-height',
              'text-align',
              'text-decoration',
            ],
          },
          {
            name: 'Decoraciones',
            open: false,
            buildProps: ['background', 'border', 'box-shadow', 'opacity'],
          },
        ],
      },
      assetManager: {
        upload: false,
        uploadFile: function (e: any) {
          const files: FileList = e.dataTransfer?.files || e.target.files;
          Array.from(files).forEach((file) => {
            if (file.size > MAX_SIZE) {
              toast.error(
                `La imagen "${file.name}" es demasiado grande (${Math.round(
                  file.size / 1024
                )} KB). El límite es de ${MAX_SIZE / 1024} KB.`
              );
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              editor.AssetManager.add({
                src: reader.result as string,
                name: file.name,
              });
            };
            reader.readAsDataURL(file);
          });
        },
      },
    });

    // Bloques de placeholder
    placeholdersCanvas.forEach(({ label, value }) => {
      const key = value.replace(/[{}]/g, '');
      editor.BlockManager.add(`ph-${key}`, {
        id: `ph-${key}`,
        label,
        media: `
          <svg xmlns="http://www.w3.org/2000/svg" style="display:block; margin: 0 auto; width:32px; height:32px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-type-icon lucide-type"><path d="M12 4v16"/><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6"/></svg>
        `,
        content: `<span data-ph="${value}">${value}</span>`,
        category: 'Placeholders',
        attributes: { title: `Insertar ${label}` },
      });
    });

    // CSS para placeholders
    editor.on('load', () => {
      editor.CssComposer.add(`
        .placeholder {
          display: inline-block;
          padding: 2px 4px;
          margin: 0 2px;
          background: #eef;
          border: 1px dashed #99c;
          border-radius: 3px;
        }
      `);
    });

    editorRef.current = editor;
    onInit?.(editor);

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, [onInit]);

  // Actualiza el contenido cuando cambie initialContent
  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.setComponents(initialContent || defaultContent);
    }
  }, [initialContent]);

  return (
    <div className="email-builder-container">
      <div
        ref={containerRef}
        style={{
          border: '1px solid #ddd',
          minHeight: '500px',
          backgroundColor: '#f5f5f5',
        }}
      />
    </div>
  );
}
