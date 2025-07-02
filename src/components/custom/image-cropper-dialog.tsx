'use client'

import React, { useState, useRef } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ImageCropperDialogProps {
  src: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (blob: Blob) => void
}

export default function ImageCropperDialog({ src, open, onOpenChange, onConfirm }: ImageCropperDialogProps) {
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 80, aspect: 16 / 9 })
  const imgRef = useRef<HTMLImageElement>(null)

  const getCroppedBlob = async (): Promise<Blob | null> => {
    const image = imgRef.current
    if (!image || !crop.width || !crop.height) return null

    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/jpeg')
    })
  }

  const handleConfirm = async () => {
    const blob = await getCroppedBlob()
    if (blob) onConfirm(blob)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Recortar imagen</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <ReactCrop crop={crop} onChange={(c) => setCrop(c)} keepSelection>
            <img ref={imgRef} src={src} alt="crop" />
          </ReactCrop>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
