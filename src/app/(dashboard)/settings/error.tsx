'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4">
      <p className="text-slate-600 dark:text-slate-400">
        Nešto je pošlo naopako.
      </p>
      <Button variant="outline" onClick={reset}>
        Pokušaj ponovo
      </Button>
    </div>
  )
}
