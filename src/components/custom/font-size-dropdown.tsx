'use client';

import * as React from 'react';
import { useContext } from 'react';
import { EditorContext } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { TextFontSizeIcon } from '../tiptap-icons/font-size-icon';

const SIZES = Array.from({ length: 41 }, (_, i) => 8 + i).map((px) => ({
  label: `${px}px`,
  value: `${px}px`,
}));

interface FontSizeDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function FontSizeDropdown({
  isOpen,
  onToggle,
}: FontSizeDropdownProps) {
  const { editor } = useContext(EditorContext);
  if (!editor) return null;

  return (
    <div className="relative">
      <Tippy
        content="Tamaño de texto"
        delay={[500, 0]}
        placement="top"
        animation="shift-away"
        arrow
      >
        <Button
          onClick={onToggle}
          aria-label="Tamaño de texto"
          data-style="ghost"
        >
          <TextFontSizeIcon />
        </Button>
      </Tippy>

      {isOpen && (
        <div
          className="
            absolute right-0 mt-1 w-24 bg-white dark:bg-gray-800
            border rounded shadow-lg z-20
            max-h-60 overflow-y-auto overscroll-contain
          "
          onWheel={(e) => e.stopPropagation()}
        >
          {SIZES.map((size) => (
            <button
              key={size.value}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .setFontSize({ fontSize: size.value })
                  .run();
                onToggle();
              }}
            >
              {size.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
