// components/custom/PlaceholderDropdown.tsx
'use client';

import * as React from 'react';
import { useContext } from 'react';
import { EditorContext } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button';
import { Tag } from 'lucide-react';
import { placeholdersCanvas, placeholdersFeriados } from '@/helpers/helpers';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface Ph {
  value: string;
  label: string;
}

interface PlaceholderDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  items: Ph[];
  label: string;
}

export default function PlaceholderDropdown({
  isOpen,
  onToggle,
  items,
  label,
}: PlaceholderDropdownProps) {
  const { editor } = useContext(EditorContext);
  if (!editor) return null;

  return (
    <div className="relative">
      <Tippy
        content={
          <div className="flex flex-col items-center">
            <span>{label}</span>
          </div>
        }
        delay={[500, 0]}
        placement="top"
        animation="shift-away"
        arrow={true}
      >
        <Button
          onClick={onToggle}
          aria-label={label}
          data-style="ghost"
          title={label}
        >
          <Tag className="tiptap-button-icon" />
        </Button>
      </Tippy>

      {isOpen && (
        <div
          className="
            absolute right-0 mt-1 w-44
            bg-white dark:bg-gray-800 
            border rounded shadow-lg z-20
            max-h-60 overflow-y-auto overscroll-contain
          "
          onWheel={(e) => e.stopPropagation()}
        >
          {items.map((ph) => (
            <button
              key={ph.value}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                editor.chain().focus().insertContent(ph.value).run();
                onToggle();
              }}
            >
              {ph.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
