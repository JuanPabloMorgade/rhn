'use client';

import * as React from 'react';
import { useContext } from 'react';
import { EditorContext } from '@tiptap/react';
import { Button } from '@/components/tiptap-ui-primitive/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/tiptap-ui-primitive/dropdown-menu';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import { AlignLeftIcon } from '@/components/tiptap-icons/align-left-icon';
import { AlignCenterIcon } from '@/components/tiptap-icons/align-center-icon';
import { AlignRightIcon } from '@/components/tiptap-icons/align-right-icon';
import { AlignJustifyIcon } from '@/components/tiptap-icons/align-justify-icon';

import type { ElementType } from 'react';

type AlignValue = 'left' | 'center' | 'right' | 'justify';
type IconType = ElementType;

const OPTIONS: {
  label: string;
  value: AlignValue;
  Icon: IconType;
}[] = [
  { label: 'Izquierda', value: 'left', Icon: AlignLeftIcon },
  { label: 'Centrar', value: 'center', Icon: AlignCenterIcon },
  { label: 'Derecha', value: 'right', Icon: AlignRightIcon },
  { label: 'Justificar', value: 'justify', Icon: AlignJustifyIcon },
];

export default function TextAlignDropdown() {
  const { editor } = useContext(EditorContext);
  const [open, setOpen] = React.useState(false);
  if (!editor) return null;

  const active =
    (editor.getAttributes('paragraph').textAlign as AlignValue) || 'left';
  const activeOption = OPTIONS.find((opt) => opt.value === active)!;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tippy
        content="Alineación"
        delay={[500, 0]}
        placement="top"
        animation="shift-away"
        arrow
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            aria-label="Alineación"
            role="button"
            data-state={open ? 'open' : 'closed'}
          >
            <activeOption.Icon className="tiptap-button-icon" />
          </Button>
        </DropdownMenuTrigger>
      </Tippy>

      <DropdownMenuContent className="bg-white dark:bg-gray-800 border rounded shadow-lg p-1 text-left">
        <DropdownMenuGroup>
          {OPTIONS.map(({ label, value, Icon }) => (
            <DropdownMenuItem key={value} asChild>
              <Button
                type="button"
                onClick={() => {
                  editor.chain().focus().setTextAlign(value).run();
                  setOpen(false);
                }}
                className="flex items-center justify-start w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                data-active-state={active === value ? 'on' : 'off'}
              >
                <Icon className="tiptap-button-icon mr-2" />
                {label}
              </Button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
