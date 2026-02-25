export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex justify-center mb-8">
          <img src="/kneuss-logo.svg" alt="Kneuss" className="h-8" />
        </div>
        {children}
      </div>
    </div>
  )
}
