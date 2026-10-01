'use client';

export default function StoreError({ reset }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-950">This page is temporarily unavailable</h1>
      <p className="mt-2 text-sm text-neutral-500">The shop could not load this page. Nothing is missing from the catalogue.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-black px-6 py-2 text-white"
      >
        Try again
      </button>
    </div>
  );
}
