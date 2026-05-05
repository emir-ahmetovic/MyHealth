"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  disabled?: (date: Date) => boolean
}

const DAYS = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"]
const MONTHS = [
  "Januar",
  "Februar",
  "Mart",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "Avgust",
  "Septembar",
  "Oktobar",
  "Novembar",
  "Decembar",
]

export function Calendar({ mode = "single", selected, onSelect, className, disabled }: CalendarProps) {
  // Always use a valid date for currentMonth
  const [currentMonth, setCurrentMonth] = React.useState(() => selected ? new Date(selected) : new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  // Build calendar grid
  const calendarDays: (Date | null)[] = []

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push(new Date(year, month - 1, daysInPrevMonth - i))
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i))
  }

  // Next month days to fill grid (ensure at least 35 cells for 5 weeks)
  const minCells = 35
  const remainingDays = minCells - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push(new Date(year, month + 1, i))
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev)
      prevMonth.setMonth(prevMonth.getMonth() - 1)
      return prevMonth
    })
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const nextMonth = new Date(prev)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      return nextMonth
    })
  }

  const isSelected = (date: Date) => {
    if (!selected) return false
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month
  }

  return (
    <div className={cn("p-4 bg-card rounded-lg border", className)}>
      {/* Header with month/year navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="h-8 w-8 bg-transparent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>
        <div className="text-sm font-semibold">
          {MONTHS[month]} {year}
        </div>
        <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-8 w-8 bg-transparent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) return <div key={index} />

          const selected = isSelected(date)
          const today = isToday(date)
          const currentMonth = isCurrentMonth(date)
          const isDisabled = disabled ? disabled(date) : false

          return (
            <button
              key={index}
              onClick={() => !isDisabled && onSelect?.(date)}
              disabled={isDisabled}
              className={cn(
                "h-9 w-full text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !currentMonth && "text-muted-foreground opacity-50",
                today && "bg-accent font-semibold",
                selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isDisabled && "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800",
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}