'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function setLocaleAction(locale: 'el' | 'en') {
  const cookieStore = await cookies()
  cookieStore.set('Kanonas_locale', locale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60 // 1 year cache
  })
  
  // Re-render everything immediately
  revalidatePath('/', 'layout')
}
