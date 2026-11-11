'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    // Sincroniza la carta cada 10 segundos de forma transparente para evitar pedidos en falso
    const interval = setInterval(() => {
      router.refresh()
    }, 10000)

    return () => clearInterval(interval)
  }, [router])

  return null
}