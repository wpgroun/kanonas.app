'use client'

import { createContext, useContext, ReactNode } from 'react'
import { Dictionary } from './el'

const TranslationContext = createContext<Dictionary | null>(null)

export function TranslationProvider({ dict, children }: { dict: Dictionary, children: ReactNode }) {
 return (
 <TranslationContext.Provider value={dict}>
 {children}
 </TranslationContext.Provider>
)
}

/**
 * Hook to access the translation dictionary in any Client Component.
 */
export function useDict() {
 const context = useContext(TranslationContext)
 if (!context) {
 throw new Error('useDict must be used within a TranslationProvider')
 }
 return context
}
