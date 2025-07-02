'use client';

import * as React from 'react';
import { useContext } from 'react';
import { EditorContext } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button';
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon';
import Tippy from '@tippyjs/react';

interface HighlightDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
}

const COLORS = [
  { label: 'Rojo', value: '#ff4c4cb7' },
  { label: 'Naranja', value: '#ff862f9b' },
  { label: 'Amarillo', value: '#fccb3aa6' },
  { label: 'Verde', value: '#10b9819b' },
  { label: 'Azul', value: '#3b83f69e' },
  { label: 'Violeta', value: '#9f79f7bc' },
  { label: 'Negro', value: '#000000ae' },
  { label: 'Gris', value: '#6b7280b5' },
  { label: 'Blanco', value: '#ffffffb0' },
];

export default function HighlightDropdown({
  isOpen,
  onToggle,
}: HighlightDropdownProps) {
  const { editor } = useContext(EditorContext);
  if (!editor) return null;

  return (
    <div className="relative">
      <Tippy
        content={
          <div className="flex flex-col items-center">
            <span>Subrayar</span>
          </div>
        }
        delay={[500, 0]}
        placement="top"
        animation="shift-away"
        arrow={true}
      >
        <Button
          type="button"
          onClick={onToggle}
          aria-label="Color de resaltado"
          data-style="ghost"
        >
          <span className="sr-only">Color de resaltado</span>
          <HighlighterIcon className="tiptap-button-icon" />
        </Button>
      </Tippy>

      {isOpen && (
        <div
          className="
            absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 
            border rounded shadow-lg z-20
            max-h-60 overflow-y-auto overscroll-contain
          "
          onWheel={(e) => e.stopPropagation()}
        >
          {COLORS.map((col) => (
            <button
              type="button"
              key={col.value}
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: col.value })
                  .run();
                onToggle();
              }}
            >
              <span
                className="inline-block w-4 h-4 rounded border"
                style={{ backgroundColor: col.value }}
              />
              {col.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
