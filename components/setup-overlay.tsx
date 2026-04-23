"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { LayoutGrid, Layers, Grid3X3, Zap, X } from "lucide-react"

export type LayoutType = 'Parallel' | 'Cross Aisles' | 'Segmented' | 'Fishbone'

export interface WarehouseConfig {
  layout: LayoutType
  density: number
  shortcuts: number
  rowLength: number
}

interface SetupOverlayProps {
  onComplete: (config: WarehouseConfig) => void
  isOpen: boolean
  onClose?: () => void
}

export function SetupOverlay({ onComplete, isOpen, onClose }: SetupOverlayProps) {
  const [layout, setLayout] = useState<LayoutType>('Parallel')
  const [density, setDensity] = useState(50)
  const [shortcuts, setShortcuts] = useState(50)
  const [rowLength, setRowLength] = useState(50)

  const grid = useMemo(() => {
    const size = 20
    const newGrid = Array(size).fill(0).map(() => Array(size).fill(0))

    if (layout === 'Parallel') {
      const spacing = Math.max(2, Math.floor((100 - density) / 20) + 2)
      for (let x = 0; x < size; x += spacing) {
        for (let y = 0; y < size; y++) {
          newGrid[y][x] = 1
        }
      }
    } else if (layout === 'Cross Aisles') {
      const spacing = Math.max(2, Math.floor((100 - density) / 20) + 2)
      const shortcutFreq = Math.max(3, Math.floor((100 - shortcuts) / 10) + 2)
      for (let x = 0; x < size; x += spacing) {
        for (let y = 0; y < size; y++) {
          if (y % shortcutFreq !== 0) {
            newGrid[y][x] = 1
          }
        }
      }
    } else if (layout === 'Segmented') {
      const spacing = Math.max(2, Math.floor((100 - density) / 20) + 2)
      const segmentLen = Math.max(2, Math.floor(rowLength / 10))
      for (let x = 0; x < size; x += spacing) {
        for (let y = 0; y < size; y++) {
          if (Math.floor(y / (segmentLen + 1)) % 2 === 0 && y % (segmentLen + 1) !== segmentLen) {
            newGrid[y][x] = 1
          }
        }
      }
    } else if (layout === 'Fishbone') {
       for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const side = x < size / 2 ? 0 : 1
            const isAisle = side === 0 ? x === 0 : x === size - 1
            if (!isAisle) {
                const angle = side === 0 ? 1 : -1
                const xPos = side === 0 ? x : size - 1 - x
                if ((y + angle * xPos) % 5 === 0) {
                    newGrid[y][x] = 1
                }
            }
        }
       }
    }

    return newGrid
  }, [layout, density, shortcuts, rowLength])

  if (!isOpen) return null

  const handleContinue = () => {
    const config = { layout, density, shortcuts, rowLength }
    localStorage.setItem('warehouse-config', JSON.stringify(config))
    onComplete(config)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <Card className="relative w-full max-w-4xl shadow-2xl border-primary/20 overflow-hidden animate-in fade-in zoom-in duration-300">
        {onClose && (
            <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 rounded-full"
                onClick={onClose}
            >
                <X className="h-4 w-4" />
            </Button>
        )}
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Warehouse Layout Setup</CardTitle>
          <CardDescription>Configure your shelf arrangement and optimization parameters.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 pt-0">
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Layout Strategy</Label>
              <RadioGroup 
                value={layout} 
                onValueChange={(v) => setLayout(v as LayoutType)} 
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { id: 'Parallel', icon: LayoutGrid, label: 'Parallel' },
                  { id: 'Cross Aisles', icon: Layers, label: 'Cross Aisles' },
                  { id: 'Segmented', icon: Grid3X3, label: 'Segmented' },
                  { id: 'Fishbone', icon: Zap, label: 'Fishbone' },
                ].map((item) => (
                  <div key={item.id}>
                    <RadioGroupItem value={item.id} id={item.id} className="peer sr-only" />
                    <Label
                      htmlFor={item.id}
                      className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-card p-4 hover:bg-accent/50 transition-all cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary"
                    >
                      <item.icon className={cn("mb-2 h-6 w-6", layout === item.id ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-6">
              <Label className="text-base font-semibold">Parameters</Label>
              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="density" className="text-sm text-muted-foreground font-medium">Storage Density</Label>
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{density}%</span>
                  </div>
                  <Slider 
                    id="density"
                    value={[density]} 
                    onValueChange={([v]) => setDensity(v)} 
                    max={100} 
                    step={1} 
                    className="cursor-pointer"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="shortcuts" className="text-sm text-muted-foreground font-medium">Shortcut Frequency</Label>
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{shortcuts}%</span>
                  </div>
                  <Slider 
                    id="shortcuts"
                    value={[shortcuts]} 
                    onValueChange={([v]) => setShortcuts(v)} 
                    max={100} 
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="rowLength" className="text-sm text-muted-foreground font-medium">Max Row Length</Label>
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{rowLength}%</span>
                  </div>
                  <Slider 
                    id="rowLength"
                    value={[rowLength]} 
                    onValueChange={([v]) => setRowLength(v)} 
                    max={100} 
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-muted/30 rounded-2xl p-8 border border-border/50 shadow-inner">
             <div className="text-xs font-medium uppercase tracking-wider mb-6 text-muted-foreground">Live Grid Preview</div>
             <div 
                className="grid gap-px bg-border/40 p-1.5 rounded-md shadow-2xl bg-white dark:bg-black/20"
                style={{ 
                    gridTemplateColumns: 'repeat(20, minmax(0, 1fr))',
                    width: 'min(100%, 300px)',
                    aspectRatio: '1/1'
                }}
             >
                {grid.map((row, y) => 
                  row.map((cell, x) => (
                    <div 
                      key={`${x}-${y}`} 
                      className={cn(
                        "rounded-[1px] transition-all duration-300",
                        cell === 1 
                            ? "bg-primary" 
                            : "bg-transparent"
                      )} 
                    />
                  ))
                )}
             </div>
             <div className="mt-8 flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-sm shadow-sm" />
                  <span className="text-[11px] font-medium text-muted-foreground">Shelf Unit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-border/50 rounded-sm" />
                  <span className="text-[11px] font-medium text-muted-foreground">Travel Aisle</span>
                </div>
             </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 p-6">
          <Button variant="ghost" onClick={() => onComplete({ layout: 'Parallel', density: 50, shortcuts: 50, rowLength: 50 })}>
            Use Defaults
          </Button>
          <Button onClick={handleContinue} className="px-10 h-11 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            Continue to Simulation
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
