"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Upload, Download, Trash2, ShoppingCart, ArrowRight } from "lucide-react"
import { useCart } from "@/lib/store/cart"
import type { DesignConfig } from "@/lib/validations"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getUnitPrice, formatRupiah } from "@/lib/pricing"

// Fabric.js dynamic import (only on client)
import { Canvas, Image as FabricImage, Path } from "fabric"

const TSHIRT_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Navy", value: "#1e3a5f" },
  { name: "Red", value: "#dc2626" },
  { name: "Royal Blue", value: "#2563eb" },
  { name: "Forest Green", value: "#16a34a" },
  { name: "Gray", value: "#6b7280" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#ea580c" },
]

const TSHIRT_SIZES = ["S", "M", "L", "XL", "XXL"] as const

type DesignSide = "front" | "back"

interface DesignElement {
  src: string
  position: {
    x: number
    y: number
    scaleX: number
    scaleY: number
    rotation: number
    width?: number
    height?: number
  }
  name: string
}

const PRINT_AREA = {
  left: 130,
  top: 80,
  width: 140,
  height: 200,
}

// Front side: main outline path (no class in SVG)
const TSHIRT_FRONT_OUTLINE = "M164.9,228.07C162,229.28,160,230.16,158,231q-43.74,18-87.49,36.07c-5.3,2.18-8.32,1.07-10.48-3.84C42.8,224.29,22.6,186.88,2.2,149.58c-.43-.78-.88-1.55-1.26-2.36-1.75-3.71-1.07-6.53,2.15-9,.47-.36,1-.67,1.48-1,43.23-27,86.57-53.87,129.65-81.12,20.56-13,43-21.1,66.23-27.45q29.76-8.14,59.72-15.63C267,11.35,273,8.36,277.81,3.35,281.29-.24,284.88-.83,289.45,1c13.67,5.6,28,8.44,42.69,9.9a220.4,220.4,0,0,0,45.72-.16c13.73-1.48,27.25-4.17,40.07-9.48,5-2.07,8.9-1.67,12.79,2.41,4.57,4.8,10.36,7.65,16.91,9.24,28.64,6.91,57.19,14.17,85.16,23.56a157.25,157.25,0,0,1,33.08,15.06Q624.64,88,683.39,124.41c6.42,4,12.66,8.27,19.16,12.13,6.77,4,6.44,7.47,3.43,13.1Q685.42,188,665.36,226.7c-6,11.58-11.2,23.53-16.68,35.36-2.91,6.29-5.33,7.38-11.88,4.68q-44.76-18.47-89.51-37c-1.07-.44-2.18-.8-3.76-1.38a26.83,26.83,0,0,0-.66,4c-.14,14.37-.53,28.75-.23,43.11.4,19.12,1.28,38.23,2.09,57.33.95,22.52,2.14,45,3,67.54.46,11.7.55,23.41.74,35.12.59,36.32,1,72.64,1.76,109a640.36,640.36,0,0,0,5.19,66.9c.24,1.91.66,3.8,1.06,5.68.72,3.44,0,5-3.48,5.78a77.92,77.92,0,0,1-11.82,2c-22.46,1.66-44.92,3.56-67.41,4.61-28.28,1.33-56.59,2.41-84.89,2.72q-50.46.55-100.93-.48c-26.23-.53-52.44-2-78.63-3.47-16.26-.94-32.48-2.72-48.7-4.22a28.47,28.47,0,0,1-6.49-1.45c-2.65-.91-3.2-2-2.73-4.75,4.8-28.59,6.18-57.43,6.64-86.35.32-20.31.55-40.62.91-60.93.45-25.79.68-51.59,1.58-77.37,1-27.85,2.88-55.66,3.85-83.51.82-23.71.92-47.43,1.24-71.15C165.71,235.19,165.2,232,164.9,228.07Z"

// Front side: fill paths
const TSHIRT_FRONT_FILLS = [
  "M445.84,19c9.94-.14,90.46,23.29,102.25,29.8-.85,1.37-1.67,2.76-2.54,4.11a172.29,172.29,0,0,0-26.44,69.66c-4.82,33.52,1.23,65.2,17.2,95a15.75,15.75,0,0,1,1.75,10.73,150,150,0,0,0-1.4,25.26q.58,34.23,1.92,68.46c.87,22.51,2.34,45,3.15,67.52.73,20.74,1,41.5,1.35,62.25.64,34.83.89,69.67,2,104.49.49,16.12,2.53,32.2,3.87,48.29.07.88.13,1.76.2,2.85-2.18,1.74-4.92,1.92-7.46,2.21-11.63,1.31-23.26,3-34.93,3.48-30.79,1.37-61.61,2.69-92.43,3.15q-57.59.86-115.18.22c-28-.27-56-1.28-84-2.58-16.11-.75-32.17-2.69-48.24-4.21A66,66,0,0,1,159,608c.51-5.66.9-10.81,1.46-15.94,2.87-26.28,3.22-52.65,3.58-79,.49-36.76.87-73.53,1.91-110.28.79-28.15,2.7-56.27,3.77-84.41q1.33-35.55,1.79-71.13c.1-7.5.11-15.15-2.21-22.48-.64-2,.52-3.41,1.36-4.93a162.05,162.05,0,0,0,15.38-38.7c8.26-33.22,5-65.56-7.49-97.18A171.41,171.41,0,0,0,162,52.06c-.64-1-1.23-2-2.11-3.41,2-.85,3.65-1.65,5.39-2.33,18.36-7.21,37.34-12.47,56.35-17.61,12.15-3.28,24.38-6.24,36.58-9.33,1.26-.32,2.55-.5,4.05-.79.52,1.64,1,3,1.4,4.41,6.11,20,14.69,38.78,28,55.11,10.44,12.77,22.92,22.94,38.91,27.7C360,114.55,386,108.11,408.16,87,423,73,432.57,55.49,439.78,36.61,442,30.82,443.84,24.89,445.84,19Z",
  "M552.74,50.58c46.63,26.85,91.48,55.9,137.06,84.65-20.5,40.66-40.86,81.05-61.32,121.65-1.24-.4-2.22-.63-3.14-1-25.44-10.52-50.85-21.11-76.33-31.52a16,16,0,0,1-8.46-7.86c-12.23-22.91-19-47.23-18.65-73.25.48-33.21,10.85-63.37,29.31-90.85C551.53,51.91,552,51.5,552.74,50.58Z",
  "M155.48,50.51c1.16,1.62,2.15,2.88,3,4.22,14.88,23,24.23,48,27,75.4,3.19,31.89-4,61.46-19.54,89.26a9.25,9.25,0,0,1-5,4.07Q130.8,236,100.66,248.6c-6.55,2.72-13.14,5.37-20.29,8.29-20.51-40.66-40.94-81.19-61.51-122C64.25,106.25,109,77.3,155.48,50.51Z",
  "M292,26.24c41.54,13.18,82.45,13.19,123.53.48.09.57.32,1,.2,1.37-5.09,15.34-12,29.67-23.39,41.45-10.72,11.1-23.75,17-39.31,16.75-14-.26-25.87-5.71-35.87-15.4a74.47,74.47,0,0,1-15-20.31c-3.48-7-6.33-14.34-9.42-21.54A21.86,21.86,0,0,1,292,26.24Z",
  "M268.09,17.27l14.14-9.34c.32,1.2.68,2.41,1,3.64,3.88,16.68,9.33,32.79,18.76,47.21a98.77,98.77,0,0,0,11.57,14.59c22.57,23.32,59.34,23.19,82.08-.89,10.47-11.09,17.55-24.18,22.61-38.38,3-8.49,5.3-17.23,7.95-25.95l13.54,8.9a5,5,0,0,1,0,1.68c-6.54,22.93-16.27,44.2-32.91,61.69-11,11.57-24.14,19.55-40.1,22.21-23.12,3.85-43.42-2.2-60.81-17.86-12-10.8-20.49-24.08-27.28-38.56A157.74,157.74,0,0,1,268.09,17.27Z",
  "M549.79,612.46c.29,1.74.53,3.16.86,5.18-4.19.61-8.22,1.38-12.29,1.75-10.62,1-21.25,2.07-31.9,2.58-34.36,1.63-68.71,3.6-103.08,4.34-33.79.73-67.62.44-101.42,0-23.41-.31-46.83-1.37-70.22-2.59-20.57-1.07-41.1-2.77-61.65-4.3-4.09-.31-8.15-1.1-12.64-1.73.35-1.95.61-3.46.8-4.53,12.5,1.34,24.52,2.83,36.58,3.86s23.95,1.91,35.95,2.26c31,.9,61.94,1.81,92.93,2.08q48.48.43,97-.39c24.6-.4,49.2-1.33,73.77-2.62,15.23-.8,30.4-2.67,45.59-4.16C543.11,613.88,546.15,613.11,549.79,612.46Z",
  "M421.7,6.17c-1.24,5-2.05,9-3.33,12.89-.36,1.11-1.95,2.19-3.19,2.57-7.79,2.35-15.52,5.09-23.48,6.6C362,33.83,332.46,33.06,303.24,25c-3.7-1-7.29-2.44-10.93-3.7-1.45-.5-2.63-1.22-3-2.95-.39-2-1-4-1.5-6-.4-1.72-.68-3.45-1.17-6,22,8.31,44.38,11.46,67.24,11.46S399.09,14.75,421.7,6.17Z",
  "M76.27,258.52l-10.13,4.13C48,222.06,27.09,183,5.69,144c2.68-2.88,6-4.36,9.52-6.52C35.53,177.73,55.75,217.84,76.27,258.52Z",
  "M642.05,262.66l-9.58-4,61-121,9.11,5.9C681.24,182.83,660.12,221.81,642.05,262.66Z",
]

// Back side: main outline path
const TSHIRT_BACK_OUTLINE = "M543.19,228.39c-.34,4.76-.91,8.84-.86,12.92q.33,28.92,1,57.82c.22,9.19.83,18.36,1.25,27.55,1.13,25.18,2.5,50.35,3.33,75.54.73,22.67.85,45.36,1.27,68,.58,30.83.77,61.68,2,92.5.71,18.48,2,37,5.67,55.22.53,2.64-.48,4.24-3.66,5a69.06,69.06,0,0,1-10.93,1.9c-21.88,1.65-43.74,3.56-65.65,4.58-29.46,1.37-59,2-88.45,2.95-34.1,1.05-68.2.13-102.29-.57-13.19-.28-26.39-.77-39.55-1.57-26.78-1.63-53.54-3.5-80.3-5.39A66.67,66.67,0,0,1,155,623c-3.37-.82-3.94-2.23-3.53-5.5,1.51-12.2,3.2-24.39,4.31-36.62,3-32.68,2.44-65.48,3-98.23.5-29.65.82-59.31,1.79-88.95.91-27.71,2.87-55.38,3.82-83.09.82-24.15.93-48.32,1.26-72.49,0-3.07-.48-6.14-.77-9.61-1.71.61-2.94,1-4.13,1.49q-45,18.57-89.93,37.16c-5.64,2.32-8.61,1.28-10.85-3.81-17.07-38.68-37.17-75.82-57.37-112.9-.36-.65-.74-1.29-1.09-1.94-2.64-5-2-7.79,2.79-10.85,13.36-8.55,26.7-17.14,40.15-25.53C73,94.3,101.78,76.81,130.19,58.79a231.87,231.87,0,0,1,64.47-28.2c21.87-5.89,43.75-11.77,65.7-17.38C267.2,11.46,273.17,8.47,278,3.4c3.46-3.67,6.82-4.2,11.49-2.24,13.49,5.66,27.74,8.43,42.24,9.92a219.6,219.6,0,0,0,44.84,0c14.65-1.5,29-4.39,42.66-10.06,4.35-1.81,7.5-1.27,10.72,2.12,5.47,5.76,12.38,8.79,20.11,10.63,27.81,6.59,55.46,13.8,82.61,22.85a163.06,163.06,0,0,1,34.26,15.69q48.84,30.09,97.6,60.28c12.73,7.89,25.28,16,37.91,24.08,1,.64,2,1.24,3,2,2.89,2.25,3.59,4.94,2.12,8.25-.59,1.35-1.37,2.62-2.08,3.92-18.75,34.17-37.13,68.53-53.39,104-1.17,2.56-2.28,5.15-3.42,7.72-2.6,5.88-5.3,7.05-11.19,4.67-10.44-4.22-20.88-8.43-31.28-12.74Q576.57,242.19,547,229.85C546.1,229.45,545.13,229.12,543.19,228.39Z"

// Back side: fill paths
const TSHIRT_BACK_FILLS = [
  "M548.5,48.51c-1.3,2.07-2.14,3.45-3,4.8-15.17,23.59-24.61,49.26-27.25,77.22-3,31.45,3.71,61,18.86,88.65a10.08,10.08,0,0,1,1.16,8.28,50.67,50.67,0,0,0-1.4,11.88c-.64,24,.23,48,1.34,72,.73,15.7,1.26,31.41,2.12,47.11,2,36.13,2.66,72.3,3.08,108.48.23,19.87.49,39.74.9,59.6.27,13.34.55,26.69,1.33,40,.74,12.57,2.15,25.1,3.26,37.65.1,1.16.16,2.33.27,4a67.29,67.29,0,0,1-7.78,1.72c-12.82,1.31-25.63,2.84-38.49,3.62C446,617,389.08,617.38,332.15,617c-33.06-.24-66.12-1-99.17-2-17.91-.56-35.8-2.08-53.69-3.41-5.59-.42-11.13-1.58-16.69-2.48a24,24,0,0,1-3.54-1.18c.38-3.57.75-6.94,1.08-10.3,2.45-25,3.58-50,3.86-75,.44-39.44,1-78.88,2-118.31.53-21.78,2-43.54,3-65.31.85-20.15,1.71-40.3,2.16-60.46.33-14.51.06-29-.08-43.56a28.89,28.89,0,0,0-1.18-8.34,7.68,7.68,0,0,1,.9-6.65,156.07,156.07,0,0,0,17.89-50.43c4.26-25.67,1.79-50.82-6.36-75.45A176.59,176.59,0,0,0,162,52.15c-.64-1-1.2-2-2-3.35,2.67-1.12,5.06-2.21,7.51-3.14,19.84-7.51,40.27-13.07,60.74-18.52q19.1-5.07,38.33-9.64a10.21,10.21,0,0,1,5.51.74A344.84,344.84,0,0,0,318,32c16,3.52,32.18,5.28,48.56,3.81a232.45,232.45,0,0,0,45.67-9.2c8.36-2.5,16.62-5.37,24.88-8.2a11.45,11.45,0,0,1,6.84-.36c27.47,6.74,54.9,13.64,81.82,22.39C533.19,42.83,540.51,45.65,548.5,48.51Z",
  "M689.84,135.42,628.49,257.11a25.55,25.55,0,0,1-2.48-.73q-39-16.17-77.93-32.32a13.22,13.22,0,0,1-6.93-6.38c-12.58-23.08-19.46-47.68-19.26-74a158,158,0,0,1,17.05-69.74c3.48-7,7.74-13.64,11.68-20.42a28.6,28.6,0,0,1,2.16-2.73C599.36,77.56,644.29,106.7,689.84,135.42Z",
  "M80.23,256.75C59.79,216.21,39.47,175.89,18.9,135.1c45.2-28.56,89.94-57.49,136.46-84.3.94,1.17,1.81,2.1,2.51,3.16,15.18,23,24.68,48.11,27.56,75.63,3.34,31.88-3.7,61.5-19.1,89.37a9.91,9.91,0,0,1-5.1,4.62Q121.62,240,82,256.42A11.64,11.64,0,0,1,80.23,256.75Z",
  "M274.38,14.17c3-2.62,5.7-4.89,8.27-7.31,1.29-1.22,2.42-1.22,4-.58A141,141,0,0,0,317.8,15a218.12,218.12,0,0,0,48.7,2.65c16.2-1,32.09-3.38,47.52-8.48,2.67-.88,5.23-2.09,7.92-2.88a4,4,0,0,1,3.15.4c3.12,2.42,6.06,5.09,9.33,7.9-1.37.57-2.54,1.15-3.76,1.58-17.93,6.23-36.15,11.34-55,14.22a148.81,148.81,0,0,1-52.14-1.65,318.46,318.46,0,0,1-47.32-13.6C275.69,14.88,275.18,14.57,274.38,14.17Z",
  "M549.89,613.09l.83,4.74c-4.47.63-8.78,1.41-13.13,1.82-30.84,2.85-61.76,4.35-92.71,5.65-47.55,2-95.12,2.21-142.69,1.2-28.88-.62-57.75-2-86.6-3.51-17.15-.89-34.25-2.69-51.38-4.12-2-.17-4.06-.64-6.58-1,.22-1.69.43-3.21.68-5.08,3.44.59,6.57,1.34,9.75,1.64,15.47,1.5,30.93,3.35,46.44,4.23,50,2.8,100.12,3.35,150.22,3.07,29.49-.17,59-.49,88.46-1.36,22.05-.64,44.1-2,66.12-3.53C529.32,616.11,539.27,614.41,549.89,613.09Z",
  "M75.89,258.89l-9.74,3.94C48.06,222.18,27,183.16,5.56,143.81l8.92-5.91C16.86,140.31,73.12,251.17,75.89,258.89Z",
  "M693.54,137.83l9.12,5.88c-21.28,39.19-42.44,78.13-60.55,119.12L632.48,259Z",
]

const MOCKUP_SCALE = 0.55
const MOCKUP_OFFSET_X = 200
const MOCKUP_OFFSET_Y = 200

export default function CustomizePage() {
  const router = useRouter()
  const addItem = useCart((state) => state.addItem)

  const frontCanvasRef = useRef<HTMLCanvasElement>(null)
  const backCanvasRef = useRef<HTMLCanvasElement>(null)
  const frontFabricRef = useRef<Canvas | null>(null)
  const backFabricRef = useRef<Canvas | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isInitializing = useRef(false)

  const [activeSide, setActiveSide] = useState<DesignSide>("front")
  const [tshirtColor, setTshirtColor] = useState("#ffffff")
  const [selectedSize, setSelectedSize] = useState<string>("M")
  const [quantity, setQuantity] = useState(1)
  const [showCartDialog, setShowCartDialog] = useState(false)

  const createTshirtBg = useCallback((canvas: Canvas, color: string, side: DesignSide) => {
    const outlinePath = side === "front" ? TSHIRT_FRONT_OUTLINE : TSHIRT_BACK_OUTLINE
    const fillPaths = side === "front" ? TSHIRT_FRONT_FILLS : TSHIRT_BACK_FILLS

    const tshirtShape = new Path(outlinePath, {
      fill: color,
      fillRule: "nonzero",
      stroke: "#444",
      strokeWidth: 3,
      strokeLineJoin: "round",
      strokeLineCap: "round",
      selectable: false,
      evented: false,
      id: `tshirt-shape-${side}`,
      scaleX: MOCKUP_SCALE,
      scaleY: MOCKUP_SCALE,
      left: MOCKUP_OFFSET_X,
      top: MOCKUP_OFFSET_Y,
    })
    
    // Add inside fabric and push to back index 0 so it's always below images
    canvas.add(tshirtShape)
    canvas.sendObjectToBack?.(tshirtShape) || (() => {
       const idx = canvas.getObjects().indexOf(tshirtShape);
       if (idx > 0) { canvas._objects.splice(idx, 1); canvas._objects.unshift(tshirtShape); }
    })();
  }, [])

  // Initialize both Fabric canvases side-by-side
  useEffect(() => {
    if (!frontCanvasRef.current || !backCanvasRef.current || isInitializing.current) return
    isInitializing.current = true

    const initCanvas = (el: HTMLCanvasElement, side: DesignSide) => {
      const canvas = new Canvas(el, {
        width: 400,
        height: 500,
        backgroundColor: "transparent",
        selection: true,
      })
      createTshirtBg(canvas, tshirtColor, side)
      
      const clipRect = new Path(
        `M ${PRINT_AREA.left} ${PRINT_AREA.top} L ${PRINT_AREA.left + PRINT_AREA.width} ${PRINT_AREA.top} L ${PRINT_AREA.left + PRINT_AREA.width} ${PRINT_AREA.top + PRINT_AREA.height} L ${PRINT_AREA.left} ${PRINT_AREA.top + PRINT_AREA.height} Z`,
        {
          selectable: false,
          evented: false,
          id: "clip-rect",
          visible: false,
        }
      )
      canvas.add(clipRect)
      
      // Auto-activate the side when clicking its objects
      canvas.on("mouse:down", () => {
        setActiveSide(side)
      })
      
      return canvas
    }

    frontFabricRef.current = initCanvas(frontCanvasRef.current, "front")
    backFabricRef.current = initCanvas(backCanvasRef.current, "back")

    return () => {
      frontFabricRef.current?.dispose()
      backFabricRef.current?.dispose()
      frontFabricRef.current = null
      backFabricRef.current = null
      isInitializing.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency to only run on mount

  // Sync mockup color when changed
  useEffect(() => {
    if (!frontFabricRef.current || !backFabricRef.current) return

    const updateBg = (canvas: Canvas, side: DesignSide) => {
      canvas.getObjects()
        .filter((obj) => (obj.get("id") || "").startsWith("tshirt-"))
        .forEach((obj) => canvas.remove(obj))

      createTshirtBg(canvas, tshirtColor, side)
      canvas.renderAll()
    }

    updateBg(frontFabricRef.current, "front")
    updateBg(backFabricRef.current, "back")
  }, [tshirtColor, createTshirtBg])

  const getActiveCanvas = useCallback(() => {
    return activeSide === "front" ? frontFabricRef.current : backFabricRef.current
  }, [activeSide])

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      const canvas = getActiveCanvas()
      
      if (!file || !canvas) return

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const imgData = event.target?.result as string

        const imgElement = new window.Image()
        imgElement.onload = () => {
          const fabricImg = new FabricImage(imgElement, {
            left: canvas.width! / 2 - imgElement.width / 4,
            top: canvas.height! / 2 - imgElement.height / 4,
            scaleX: 0.5,
            scaleY: 0.5,
            name: file.name,
          })

          const maxSize = 120
          const scale = Math.min(maxSize / fabricImg.width!, maxSize / fabricImg.height!, 1)
          fabricImg.scale(scale)

          fabricImg.set({
            left: canvas.width! / 2 - (fabricImg.width! * fabricImg.scaleX!) / 2,
            top: canvas.height! / 2 - (fabricImg.height! * fabricImg.scaleY!) / 2,
          })

          canvas.add(fabricImg)
          canvas.setActiveObject(fabricImg)
          canvas.renderAll()

          toast.success(`Image added to ${activeSide === 'front' ? 'Front' : 'Back'} side! Drag out to resize.`)
        }
        imgElement.onerror = () => {
          toast.error("Failed to load image.")
        }
        imgElement.src = imgData
      }
      reader.readAsDataURL(file)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [getActiveCanvas, activeSide]
  )

  const handleDeleteSelected = useCallback(() => {
    const canvas = getActiveCanvas()
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.discardActiveObject()
      canvas.renderAll()
      toast.info("Element deleted")
    }
  }, [getActiveCanvas])

  const handleClearAll = useCallback(() => {
    const canvas = getActiveCanvas()
    if (!canvas) return

    const objects = canvas
      .getObjects()
      .filter((obj) => {
        const id = obj.get("id") || ""
        return !id.startsWith("tshirt-") && id !== "clip-rect"
      })
    objects.forEach((obj) => canvas.remove(obj))
    canvas.renderAll()

    toast.info(`${activeSide === 'front' ? 'Front' : 'Back'} canvas cleared`)
  }, [getActiveCanvas, activeSide])

  const readCanvasDesign = useCallback((canvas: Canvas | null): DesignElement[] => {
    if (!canvas) return []
    return canvas.getObjects()
      .filter((obj) => {
        const id = obj.get("id") || ""
        return !id.startsWith("tshirt-") && id !== "clip-rect"
      })
      .map((obj) => {
        const fabricImg = obj as FabricImage
        return {
          src: fabricImg.getSrc?.() || "",
          position: {
            x: obj.left || 0,
            y: obj.top || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
            rotation: obj.angle || 0,
          },
          name: obj.get("name") || "uploaded-image",
        }
      })
      .filter((el) => el.src)
  }, [])

  const generateCombinedMockup = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = 800
      tempCanvas.height = 500
      const ctx = tempCanvas.getContext("2d")
      
      if (!ctx || !frontFabricRef.current || !backFabricRef.current) {
        resolve("")
        return
      }

      ctx.fillStyle = "#ffffff" // Background behind combined mockup
      ctx.fillRect(0, 0, 800, 500)

      const frontImg = new window.Image()
      const backImg = new window.Image()

      let loadedCount = 0
      const onImageLoad = () => {
        loadedCount++
        if (loadedCount === 2) {
          ctx.drawImage(frontImg, 0, 0, 400, 500)
          ctx.drawImage(backImg, 400, 0, 400, 500)
          resolve(tempCanvas.toDataURL("image/png"))
        }
      }

      frontImg.onload = onImageLoad
      backImg.onload = onImageLoad
      frontImg.onerror = onImageLoad 
      backImg.onerror = onImageLoad 

      frontImg.src = frontFabricRef.current.toDataURL({ format: "png", quality: 1, multiplier: 2 })
      backImg.src = backFabricRef.current.toDataURL({ format: "png", quality: 1, multiplier: 2 })
    })
  }, [])

  const handleExportPreview = useCallback(async () => {
    const toastId = toast.loading("Generating combined preview...")
    try {
      const combinedMockupUrl = await generateCombinedMockup()
      if (!combinedMockupUrl) throw new Error("Generation failed")
      
      const link = document.createElement("a")
      link.download = `tshirt-combined-preview.png`
      link.href = combinedMockupUrl
      link.click()
      
      toast.dismiss(toastId)
      toast.success("Preview exported!")
    } catch {
      toast.dismiss(toastId)
      toast.error("Failed to export preview.")
    }
  }, [generateCombinedMockup])

  const handleAddToCart = useCallback(async () => {
    if (!frontFabricRef.current || !backFabricRef.current) {
      toast.error("Canvases not ready. Please try again.")
      return
    }

    const toastId = toast.loading("Saving mockup & adding to cart...")
    
    try {
      const combinedMockupUrl = await generateCombinedMockup()
      const frontDesign = readCanvasDesign(frontFabricRef.current)
      const backDesign = readCanvasDesign(backFabricRef.current)

      const design: DesignConfig = {
        tshirt_color: tshirtColor,
        front_design: frontDesign.length > 0 ? (frontDesign as any) : undefined,
        back_design: backDesign.length > 0 ? (backDesign as any) : undefined,
      }

      addItem({
        design,
        quantity,
        size: selectedSize as (typeof TSHIRT_SIZES)[number],
        unit_price: pricing.price,
        mockupDataUrl: combinedMockupUrl,
        originalFrontImageDataUrl: undefined,
        originalBackImageDataUrl: undefined,
      })

      toast.dismiss(toastId)
      setShowCartDialog(true)
    } catch {
      toast.dismiss(toastId)
      toast.error("Failed to generate mockup.")
    }
  }, [tshirtColor, quantity, selectedSize, addItem, generateCombinedMockup, readCanvasDesign])

  const formatPrice = (price: number) => formatRupiah(price)

  // Count printed sides from actual canvas content
  const countDesignElements = (canvas: Canvas | null) => {
    if (!canvas) return 0
    return canvas.getObjects().filter(
      (obj) => !(obj.get("id") || "").startsWith("tshirt-") && (obj.get("id") || "") !== "clip-rect" && (obj as FabricImage).getSrc?.()
    ).length
  }
  const frontCount = countDesignElements(frontFabricRef.current)
  const backCount = countDesignElements(backFabricRef.current)
  const printedSides: 1 | 2 = (frontCount > 0 && backCount > 0) || backCount > 0 ? 2 : 1

  // Dynamic pricing based on quantity and printed sides
  const pricing = getUnitPrice(quantity, printedSides)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Design Your T-Shirt</h1>
        <p className="text-muted-foreground">
          Upload images, position them on front and back, then add to cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Canvas Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>T-Shirt Designer</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPreview} className="gap-2">
                  <Download data-icon="inline-start" className="size-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteSelected} className="gap-2">
                  <Trash2 data-icon="inline-start" className="size-4" />
                  Delete
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearAll} className="gap-2">
                  <Trash2 data-icon="inline-start" className="size-4" />
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPreview} className="gap-2">
                  Preview Mockup
                </Button>
              </div>
            </div>
            <CardDescription>
              Click &quot;Upload Image&quot; to add your artwork. Drag to move, corners to resize.
            </CardDescription>
          </CardHeader>
          <CardContent>
            
            {/* Step Indicator */}
            <div className="flex justify-start items-center gap-8 px-4 pb-6 mb-6 border-b">
              <div 
                className={`flex items-center gap-3 cursor-pointer transition-all ${activeSide === 'front' ? '' : 'opacity-40 grayscale'}`} 
                onClick={() => setActiveSide('front')}
              >
                <div className={`flex h-8 w-8 rounded-full items-center justify-center font-bold text-sm ${activeSide === 'front' ? 'bg-black text-white' : 'bg-muted text-muted-foreground'}`}>1</div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Front Side</span>
                  <span className="text-xs text-muted-foreground">Upload your design</span>
                </div>
              </div>
              
              <ArrowRight className="text-muted-foreground w-4 h-4" />
              
              <div 
                className={`flex items-center gap-3 cursor-pointer transition-all ${activeSide === 'back' ? '' : 'opacity-40 grayscale'}`} 
                onClick={() => setActiveSide('back')}
              >
                <div className={`flex h-8 w-8 rounded-full items-center justify-center font-bold text-sm ${activeSide === 'back' ? 'bg-black text-white' : 'bg-muted text-muted-foreground'}`}>2</div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Back Side</span>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
              </div>
            </div>

            {/* Canvas Unified Container */}
            <div className="relative border border-dashed border-gray-300 rounded-lg p-6 pb-12 flex flex-col items-center bg-gray-50/30 overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-8 justify-center items-start w-full min-h-[500px]">
                
                {/* Front Canvas Container */}
                <div 
                  className="relative flex flex-col items-center group transition-all shrink-0 cursor-pointer"
                  onClick={() => setActiveSide('front')}
                >
                  <h3 className={`font-semibold text-lg mb-2 z-10 transition-colors ${activeSide === 'front' ? 'text-black' : 'text-gray-400 group-hover:text-gray-600'}`}>Front Side</h3>
                  <div className="relative">
                    {/* Visual Print Area Hint */}
                    <div className={`absolute border border-dashed border-gray-400 w-[140px] h-[200px] left-[130px] top-[80px] pointer-events-none z-10 flex items-center justify-center transition-all ${activeSide === 'front' ? 'opacity-100' : 'opacity-40'}`}>
                      <span className="text-xs text-gray-500 font-medium tracking-wide">Upload your design</span>
                    </div>
                    {/* Canvas Wrapper */}
                    <div className={`transition-all ${activeSide === 'front' ? 'opacity-100 relative z-20' : 'opacity-60 group-hover:opacity-80 relative z-0'}`}>
                      <canvas ref={frontCanvasRef} />
                    </div>
                  </div>
                </div>

                {/* Back Canvas Container */}
                <div 
                  className="relative flex flex-col items-center group transition-all shrink-0 cursor-pointer"
                  onClick={() => setActiveSide('back')}
                >
                  <h3 className={`font-semibold text-lg mb-2 z-10 transition-colors ${activeSide === 'back' ? 'text-black' : 'text-gray-400 group-hover:text-gray-600'}`}>Back Side</h3>
                  <div className="relative">
                    {/* Visual Print Area Hint */}
                    <div className={`absolute border border-dashed border-gray-400 w-[140px] h-[200px] left-[130px] top-[80px] pointer-events-none z-10 flex items-center justify-center transition-all ${activeSide === 'back' ? 'opacity-100' : 'opacity-40'}`}>
                      <span className="text-xs text-gray-500 font-medium tracking-wide">Upload your design</span>
                    </div>
                    {/* Canvas Wrapper */}
                    <div className={`transition-all ${activeSide === 'back' ? 'opacity-100 relative z-20' : 'opacity-60 group-hover:opacity-80 relative z-0'}`}>
                      <canvas ref={backCanvasRef} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Centered Upload Button Overlay on Bottom Border */}
              <div className="absolute -bottom-0 w-full flex justify-center pointer-events-none">
                <div className="pointer-events-auto bg-white rounded-full p-1 border">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} className="gap-2 bg-black text-white hover:bg-black/90 px-8 rounded-full shadow-md">
                    <Upload data-icon="inline-start" className="size-4" />
                    Upload Image
                  </Button>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">T-Shirt Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {TSHIRT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setTshirtColor(color.value)}
                    className={`size-12 rounded-lg border-2 transition-all ${
                      tshirtColor === color.value
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-muted"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {TSHIRT_COLORS.find((c) => c.value === tshirtColor)?.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Size & Quantity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="size">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger id="size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TSHIRT_SIZES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity: {quantity}</Label>
                <Slider
                  value={[quantity]}
                  onValueChange={(v) => setQuantity(v[0])}
                  min={1}
                  max={25}
                  step={1}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Unit Price</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {pricing.tier.name}
                  </Badge>
                  <span className="font-semibold">{formatPrice(pricing.price)}</span>
                </div>
              </div>
              {printedSides === 2 && (
                <p className="text-xs text-muted-foreground">
                  2 sisi sablon (depan + belakang)
                </p>
              )}
              {quantity >= 5 && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ Hemat {formatPrice(89000 - pricing.price)} per kaos!
                </p>
              )}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(pricing.price * quantity)}</span>
              </div>

              <Button onClick={handleAddToCart} className="w-full gap-2" size="lg">
                <ShoppingCart data-icon="inline-start" className="size-4" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showCartDialog} onOpenChange={setShowCartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Added to Cart!</DialogTitle>
            <DialogDescription>
              Your custom t-shirt has been added to the cart.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="text-sm text-muted-foreground">
              <p>Size: {selectedSize}</p>
              <p>Quantity: {quantity}</p>
              <p>Color: {TSHIRT_COLORS.find((c) => c.value === tshirtColor)?.name}</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowCartDialog(false)
                router.push("/customize")
              }}
            >
              Continue Designing
            </Button>
            <Button onClick={() => router.push("/cart")}>Go to Cart</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
