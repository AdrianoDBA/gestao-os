"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Upload, 
  FileText, 
  Video, 
  Trash2, 
  Eye, 
  X, 
  Image as ImageIcon,
  Loader2
} from "lucide-react"

interface Attachment {
  id: string
  name: string
  mimeType: string
  size: number
  isPhoto: boolean
  url?: string
}

interface AttachmentGalleryProps {
  attachments: Attachment[]
  onUpload: (fileData: { name: string; size: number; mimeType: string; url: string }) => void
  onDelete: (id: string) => void
}

export function AttachmentGallery({ attachments, onUpload, onDelete }: AttachmentGalleryProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewMedia, setPreviewMedia] = useState<Attachment | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFiles(e.dataTransfer.files)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFiles(e.target.files)
    }
  }

  const base64ToBlob = (base64Data: string, contentType: string) => {
    const sliceSize = 512
    const parts = base64Data.split(',')
    const base64 = parts.length > 1 ? parts[1] : parts[0]
    const byteCharacters = atob(base64)
    const byteArrays = []

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize)
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }

    return new Blob(byteArrays, { type: contentType })
  }

  const handleOpenPDF = (att: Attachment) => {
    if (!att.url) return
    try {
      if (att.url.startsWith("data:")) {
        const mime = att.mimeType || "application/pdf"
        const blob = base64ToBlob(att.url, mime)
        const blobUrl = URL.createObjectURL(blob)
        window.open(blobUrl, "_blank")
      } else {
        window.open(att.url, "_blank")
      }
    } catch (err) {
      alert("Erro ao abrir o PDF. O arquivo pode estar corrompido.")
    }
  }

  // Compressão de Imagem no Canvas do Cliente
  const compressImage = (file: File): Promise<{ blob: Blob; base64: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 1200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)

          // Comprime com 80% de qualidade JPG
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedReader = new FileReader()
              compressedReader.readAsDataURL(blob)
              compressedReader.onloadend = () => {
                resolve({
                  blob,
                  base64: compressedReader.result as string
                })
              }
            }
          }, "image/jpeg", 0.8)
        }
      }
    })
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const processFiles = async (files: FileList) => {
    setIsUploading(true)
    const file = files[0]

    try {
      let name = file.name
      let size = file.size
      let mimeType = file.type
      let url = ""

      if (file.type.startsWith("image/")) {
        // Se for foto, comprime e gera URL base64/blob local
        const compressed = await compressImage(file)
        url = compressed.base64
        size = compressed.blob.size
        name = name.replace(/\.[^/.]+$/, "") + "_compressed.jpg"
        mimeType = "image/jpeg"
      } else {
        // Se for PDF ou Vídeo, converte para base64 para persistência segura
        url = await fileToBase64(file)
      }

      // Simula delay de upload de rede (MinIO S3)
      setTimeout(() => {
        onUpload({ name, size, mimeType, url })
        setIsUploading(false)
      }, 1200)

    } catch (err) {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4 text-xs">
      
      {/* Dropzone de Bancada */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-zinc-500/50 hover:bg-muted/10"
        }`}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*,application/pdf"
        />

        {isUploading ? (
          <div className="space-y-2 flex flex-col items-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            <p className="text-foreground font-semibold">Comprimindo e enviando arquivo...</p>
            <p className="text-[10px] text-muted-foreground">Otimizando tamanho da imagem para o MinIO.</p>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col items-center">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <p className="text-foreground font-semibold">Arraste fotos do aparelho ou clique para buscar</p>
            <p className="text-[10px] text-muted-foreground">Suporta Fotos (comprimidas autom.), Vídeos de testes e Laudos em PDF.</p>
          </div>
        )}
      </div>

      {/* Grid de Miniaturas de Bancada */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {attachments.map(att => (
            <div 
              key={att.id} 
              className="group relative rounded-md bg-zinc-900 border border-border/40 overflow-hidden flex flex-col justify-between h-28"
            >
              
              {/* Corpo da miniatura (Foto vs Arquivo) */}
              <div className="flex-1 flex items-center justify-center p-2 bg-zinc-950/40 relative">
                {att.isPhoto && att.url ? (
                  <img src={att.url} alt={att.name} className="w-full h-full object-cover rounded" />
                ) : att.mimeType.startsWith("video/") ? (
                  <Video className="w-8 h-8 text-blue-400" />
                ) : (
                  <FileText className="w-8 h-8 text-amber-400" />
                )}

                {/* Overlay de ações (Exibe ao hover) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  <button 
                    onClick={() => setPreviewMedia(att)} 
                    className="w-7 h-7 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-foreground transition-colors"
                    title="Visualizar Anexo"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => onDelete(att.id)} 
                    className="w-7 h-7 rounded bg-destructive/80 hover:bg-destructive flex items-center justify-center text-white transition-colors"
                    title="Excluir do MinIO"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Informações inferiores da miniatura */}
              <div className="bg-zinc-900 px-2 py-1.5 border-t border-border/20">
                <p className="text-[10px] font-semibold text-foreground truncate" title={att.name}>{att.name}</p>
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{formatSize(att.size)}</p>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal de Preview Lightbox */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <button 
            onClick={() => setPreviewMedia(null)} 
            className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-55 bg-zinc-900/60 p-2 rounded-full border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
            {previewMedia.isPhoto && previewMedia.url ? (
              <img src={previewMedia.url} alt={previewMedia.name} className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl" />
            ) : previewMedia.mimeType.startsWith("video/") && previewMedia.url ? (
              <video src={previewMedia.url} controls className="max-w-full max-h-[80vh] rounded shadow-2xl" />
            ) : (
              <div className="bg-zinc-900 border border-border p-8 rounded-lg text-center space-y-4 text-xs max-w-sm">
                <FileText className="w-12 h-12 text-amber-400 mx-auto" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{previewMedia.name}</h4>
                  <p className="text-muted-foreground font-mono mt-0.5">{formatSize(previewMedia.size)}</p>
                </div>
                <button 
                  onClick={() => handleOpenPDF(previewMedia)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 text-zinc-900 font-semibold rounded hover:bg-zinc-200 transition-colors"
                >
                  Abrir PDF em Nova Aba
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
