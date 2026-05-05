export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: replace with real Sidebar + nav shell
  return (
    <div className="flex min-h-screen flex-col">
      {children}
    </div>
  )
}

