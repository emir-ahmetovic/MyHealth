'use client'

import { useEffect } from 'react'

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
      <button
        onClick={reset}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        Pokušaj ponovo
      </button>
    </div>
  )
}
