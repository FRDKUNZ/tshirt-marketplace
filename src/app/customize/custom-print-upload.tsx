"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Upload, Image as ImageIcon, X, CheckCircle2 } from "lucide-react"
import { useLocale } from "@/lib/i18n/locale"
import { t } from "@/lib/i18n/translations"
import type { CustomPrintAttachment } from "@/lib/store/cart"

interface SelectedFile {
  file: File
  preview: string
  description: string
}

// Shared state: custom prints attach to the NEXT "Add to Cart" on the customize page
let pendingAttachments: CustomPrintAttachment[] = []

export function getPendingCustomPrintAttachments(): CustomPrintAttachment[] {
  const attachments = [...pendingAttachments]
  pendingAttachments = [] // clear after reading (one-time use)
  return attachments
}

export function CustomPrintUpload() {
  const { locale } = useLocale()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [globalDescription, setGlobalDescription] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} bukan berupa gambar`)
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} melebihi ukuran maksimal 10MB`)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedFiles((prev) => [
          ...prev,
          {
            file,
            preview: event.target?.result as string,
            description: globalDescription,
          },
        ])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ""
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFileDescription = (index: number, description: string) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, description } : item))
    )
  }

  const handleConfirm = () => {
    if (selectedFiles.length === 0) {
      toast.error("Pilih gambar terlebih dahulu")
      return
    }

    // Store as pending attachments (will be bundled with next "Add to Cart")
    pendingAttachments = selectedFiles.map((item) => ({
      fileName: item.file.name,
      fileSize: item.file.size,
      fileType: item.file.type,
      preview: item.preview,
      description: item.description || globalDescription,
    }))

    toast.success(
      `${selectedFiles.length} gambar siap ditambahkan ke pesanan. Sekarang desain kaos Anda dan klik "Add to Cart".`
    )

    // Reset form
    setSelectedFiles([])
    setGlobalDescription("")
  }

  const hasAttachments = selectedFiles.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="size-5" />
          {t("customprint.title", locale)}
        </CardTitle>
        <CardDescription>
          {t("customprint.desc", locale)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors bg-muted/50"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                fileInputRef.current?.click()
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="custom-print-file"
              multiple
            />

            {hasAttachments ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                  {selectedFiles.map((selectedFile, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border bg-white">
                        <img
                          src={selectedFile.preview}
                          alt={`Preview ${index + 1}`}
                          className="size-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        className="absolute -top-2 -right-2 size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="size-4" />
                      </button>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {selectedFile.file.name}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length} gambar dipilih (
                  {(selectedFiles.reduce((sum, f) => sum + f.file.size, 0) / 1024).toFixed(1)} KB)
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Upload className="size-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {t("customprint.btn", locale)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WEBP (Maks. 10MB per file)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bisa pilih banyak file sekaligus
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Global Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="global-description">
              {t("customprint.desc.label", locale)} (untuk semua gambar)
            </Label>
            <Textarea
              id="global-description"
              placeholder={t("customprint.desc.placeholder", locale)}
              value={globalDescription}
              onChange={(e) => setGlobalDescription(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Individual File Descriptions */}
          {selectedFiles.length > 1 && (
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-medium">Deskripsi per gambar (opsional)</Label>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="size-10 rounded object-cover"
                    />
                    <span className="text-sm font-medium truncate flex-1">
                      {file.file.name}
                    </span>
                  </div>
                  <Textarea
                    placeholder="Deskripsi khusus untuk gambar ini..."
                    value={file.description}
                    onChange={(e) => updateFileDescription(index, e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            disabled={!hasAttachments}
            className="gap-2"
          >
            <CheckCircle2 data-icon="inline-start" />
            Konfirmasi Gambar ({selectedFiles.length} gambar)
          </Button>

          {/* Info Banner */}
          {hasAttachments && (
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <CheckCircle2 className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                Gambar akan ditambahkan ke pesanan kaos Anda. Setelah konfirmasi, lanjutkan desain kaos dan klik{" "}
                <Badge variant="secondary">"Add to Cart"</Badge> untuk menyatukan gambar dengan pesanan.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
