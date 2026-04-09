"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react"
import { uploadCustomPrint } from "./actions"
import { useLocale } from "@/lib/i18n/locale"
import { t } from "@/lib/i18n/translations"

export function CustomPrintUpload() {
  const { locale } = useLocale()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB")
      return
    }

    setSelectedFile(file)
    
    // Generate preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error("Pilih file terlebih dahulu")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.set("file", selectedFile)
      formData.set("description", description)

      const result = await uploadCustomPrint(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(t("customprint.success", locale))
      
      // Reset form
      setSelectedFile(null)
      setPreview(null)
      setDescription("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      toast.error(t("customprint.error", locale))
    } finally {
      setIsUploading(false)
    }
  }

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
        <form onSubmit={handleSubmit} className="space-y-4">
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
            />

            {preview ? (
              <div className="space-y-3">
                <div className="aspect-square max-w-xs mx-auto rounded-lg overflow-hidden border bg-white">
                  <img
                    src={preview}
                    alt="Preview"
                    className="size-full object-contain"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedFile?.name} ({(selectedFile?.size! / 1024).toFixed(1)} KB)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                    setPreview(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                >
                  Hapus
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="size-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {t("customprint.btn", locale)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, WEBP (Maks. 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("customprint.desc.label", locale)}
            </Label>
            <Textarea
              id="description"
              placeholder={t("customprint.desc.placeholder", locale)}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="w-full gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t("customprint.uploading", locale)}
              </>
            ) : (
              <>
                <Upload data-icon="inline-start" className="size-4" />
                {t("customprint.btn", locale)}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
