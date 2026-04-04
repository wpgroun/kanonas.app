import { cookies } from 'next/headers'
import { el } from './el'
import { en } from './en'

export type Locale = 'el' | 'en'

const dictionaries = {
  el,
  en,
}

// Function to get the dictionary (Server or Async Client context)
export async function getDictionary() {
  const cookieStore = await cookies()
  // Default to Greek if no cookie
  const locale = (cookieStore.get('Kanonas_locale')?.value as Locale) || 'el'
  
  // Return requested dictionary or fallback to el
  return dictionaries[locale] || dictionaries.el
}
