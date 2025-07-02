'use client'

import * as React from 'react'
import { useContext } from 'react'
import { EditorContext } from '@tiptap/react'
import { Button } from '@/components/tiptap-ui-primitive/button'
import Tippy from '@tippyjs/react'

import { ImagePlusIcon } from '@/components/tiptap-icons/image-plus-icon'
import { AlignLeftIcon } from '@/components/tiptap-icons/align-left-icon'
import { AlignCenterIcon } from '@/components/tiptap-icons/align-center-icon'
import { AlignRightIcon } from '@/components/tiptap-icons/align-right-icon'

interface ImageStyleDropdownProps {
  isOpen: boolean
  onToggle: () => void
}

const SIZES = [
  { label: '25%', value: '25%' },
  { label: '50%', value: '50%' },
  { label: '75%', value: '75%' },
  { label: '100%', value: '100%' },
]

const ALIGN = [
  { label: 'Izquierda', value: 'left', Icon: AlignLeftIcon },
  { label: 'Centrar', value: 'center', Icon: AlignCenterIcon },
  { label: 'Derecha', value: 'right', Icon: AlignRightIcon },
]

export default function ImageStyleDropdown({ isOpen, onToggle }: ImageStyleDropdownProps) {
  const { editor } = useContext(EditorContext)
  if (!editor) return null

  return (
    <div className="relative">
      <Tippy
        content={<div className="flex flex-col items-center"><span>Opciones de imagen</span></div>}
        delay={[500, 0]}
        placement="top"
        animation="shift-away"
        arrow
      >
        <Button onClick={onToggle} aria-label="Opciones de imagen" data-style="ghost">
          <ImagePlusIcon className="tiptap-button-icon" />
        </Button>
      </Tippy>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border rounded shadow-lg z-20 p-2 space-y-2"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="text-xs font-medium px-2">Tamaño</div>
          {SIZES.map((size) => (
            <button
              key={size.value}
              className="w-full text-left px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                editor.chain().focus().setImageWidth(size.value).run()
                onToggle()
              }}
              type="button"
            >
              {size.label}
            </button>
          ))}
          <div className="text-xs font-medium px-2 pt-1">Alineación</div>
          {ALIGN.map(({ label, value, Icon }) => (
            <button
              key={value}
              className="w-full flex items-center gap-2 px-3 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                editor.chain().focus().setImageAlign(value as any).run()
                onToggle()
              }}
              type="button"
            >
              <Icon className="tiptap-button-icon" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
