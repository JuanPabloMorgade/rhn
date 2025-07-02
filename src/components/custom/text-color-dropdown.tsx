// components/custom/TextColorDropdown.tsx
'use client';

import * as React from 'react';
import { useContext } from 'react';
import { EditorContext } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { TextColorIcon } from '../tiptap-icons/font-color';

const COLORS = [
  { label: 'Negro', value: '#000000' },
  { label: 'Gris', value: '#6B7280' },
  { label: 'Blanco', value: '#FFFFFF' },
  { label: 'Rojo', value: '#EF4444' },
  { label: 'Naranja', value: '#F97316' },
  { label: 'Amarillo', value: '#EAB308' },
  { label: 'Verde', value: '#10B981' },
  { label: 'Azul', value: '#3B82F6' },
  { label: 'Violeta', value: '#8B5CF6' },
  { label: 'Borrar', value: null },
];

interface TextColorDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function TextColorDropdown({
  isOpen,
  onToggle,
}: TextColorDropdownProps) {
  const { editor } = useContext(EditorContext);
  if (!editor) return null;

  return (
    <div className="relative">
      <Tippy
        content={
          <div className="flex flex-col items-center">
            <span>Color de texto</span>
          </div>
        }
        delay={[500, 0]}
        placement="top"
        animation="shift-away"
        arrow
      >
        <Button
          type="button"
          onClick={onToggle}
          aria-label="Color de texto"
          data-style="ghost"
        >
          <TextColorIcon className="tiptap-button-icon" />
        </Button>
      </Tippy>

      {isOpen && (
        <div
          className="
            absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800
            border rounded shadow-lg z-20
            max-h-60 overflow-y-auto overscroll-contain
          "
          onWheel={(e) => e.stopPropagation()}
        >
          {COLORS.map((col) => (
            <button
              type="button"
              key={col.label}
              className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                if (col.value) {
                  editor.chain().focus().setColor(col.value).run();
                } else {
                  editor.chain().focus().unsetColor().run();
                }
                onToggle();
              }}
            >
              <span
                className="inline-block w-4 h-4 rounded border"
                style={{ backgroundColor: col.value ?? '#fff' }}
              />
              {col.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
