import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center font-sans">
      <h1 className="text-6xl font-black text-slate-900">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

