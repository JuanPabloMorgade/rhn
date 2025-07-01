'use client';

import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { Card } from '@/components/ui/card';
import React from 'react';
// Ajustá la ruta si tu carpeta se llama “tiptap-templates” o “tiptap-template”

export default function EditorPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Editor de prueba</h1>
      <Card>
        <div className="max-h-[500px] overflow-y-auto focus:outline-none">
          <SimpleEditor templateId=''/>
        </div>
      </Card>
    </div>
  );
}
