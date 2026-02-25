export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="flex justify-center mb-8">
          <svg
            width="110"
            height="32"
            viewBox="0 0 110 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-asana-coral"
          >
            <circle cx="16" cy="22" r="8" fill="currentColor" />
            <circle cx="34" cy="22" r="8" fill="currentColor" />
            <circle cx="25" cy="8" r="8" fill="currentColor" />
            <text
              x="50"
              y="26"
              fill="#1E1F21"
              fontSize="22"
              fontWeight="500"
              fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
            >
              asana
            </text>
          </svg>
        </div>
        {children}
      </div>
    </div>
  )
}
