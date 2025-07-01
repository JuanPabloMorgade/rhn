'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension'
import { handleImageUpload } from '@/lib/tiptap-utils'

// Props: 
// - initialContent: HTML/CSS que ya viene del template
// - templateId: el id para usar en el path de Storage
// - onInit: callback cuando se inicializa el editor
// - onContentChange: callback con el HTML resultante cada vez que cambia
interface TiptapEditorProps {
  initialContent?: string
  templateId: string
  onInit?: (editor: any) => void
  onContentChange: (html: string) => void
}

export function TiptapEditor({
  initialContent = '<p></p>',
  templateId,
  onInit,
  onContentChange,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      // configurá tu nodo de imágenes para que use el templateId
      ImageUploadNode.configure({
        accept: 'image/*',
        upload: (file: File) =>
          // asumimos que handleImageUpload ahora acepta (file, templateId)
          handleImageUpload(file, templateId),
      }),
      // …añadí aquí el resto de tus extensiones (TaskList, TextAlign, etc)
    ],
    content: initialContent,
  })

  // avísale al padre que el editor está listo
  React.useEffect(() => {
    if (editor && onInit) {
      onInit(editor)
    }
  }, [editor, onInit])

  // cada vez que cambie el contenido, avisame
  React.useEffect(() => {
    if (!editor) return
    const updateHandler = () => {
      const html = editor.getHTML()
      onContentChange(html)
    }
    editor.on('update', updateHandler)
    return () => {
      editor.off('update', updateHandler)
    }
  }, [editor, onContentChange])

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* aquí podrías reutilizar tu Toolbar si querés */}
      <EditorContent editor={editor} className="min-h-[300px] p-4" />
    </div>
  )
}
