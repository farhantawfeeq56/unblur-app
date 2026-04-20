"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { UnblurData } from "@/lib/types"

interface DataContextType {
  data: UnblurData
  onFieldChange: (field: keyof UnblurData, value: string) => void
  setData: React.Dispatch<React.SetStateAction<UnblurData>>
}

const initialData: UnblurData = {
  user: "",
  problem: "",
  action: "",
  constraints: "",
  outcome: "",
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UnblurData>(initialData)

  const onFieldChange = useCallback((field: keyof UnblurData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }, [])

  return (
    <DataContext.Provider value={{ data, onFieldChange, setData }}>
      {children}
    </DataContext.Provider>
  )
}

export function useUnblurData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useUnblurData must be used within a DataProvider")
  }
  return context
}
