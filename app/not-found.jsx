import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-gray-500 mt-2">Page not found</p>
      <Link href="/" className="mt-6 bg-black text-white px-6 py-2 rounded-lg">Go Home</Link>
    </div>
  );
}