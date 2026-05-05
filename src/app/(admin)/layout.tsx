export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: replace with admin nav shell
  return (
    <div className="flex min-h-screen flex-col">
      {children}
    </div>
  )
}

