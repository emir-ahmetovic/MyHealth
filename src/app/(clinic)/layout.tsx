export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: replace with clinic-specific nav shell
  return (
    <div className="flex min-h-screen flex-col">
      {children}
    </div>
  )
}

