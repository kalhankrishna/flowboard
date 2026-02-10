'use client'

import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-sm border border-gray-200">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-xl font-semibold text-gray-900 mb-2">
            Failed to load boards
          </h2>

          {/* Error message */}
          <p className="text-center text-sm text-gray-600 mb-6">
            {error.message || 'Something went wrong while loading your boards.'}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Try again
            </button>

            <Link
              href="/"
              className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Go home
            </Link>
          </div>

          {/* Debug info (optional - remove in production) */}
          {process.env.NODE_ENV === 'development' && error.digest && (
            <p className="mt-4 text-xs text-gray-400 text-center">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}