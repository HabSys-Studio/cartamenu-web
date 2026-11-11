'use client'

export default function Toast({ message, isVisible, onClose }) {
  if (!isVisible) return null

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-neutral-900 border border-amber-500/40 text-neutral-100 px-4 py-3 rounded-xl shadow-2xl animate-bounce">
      <span className="flex h-3 w-3 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
      </span>
      <p className="text-xs font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="text-neutral-400 hover:text-neutral-100 font-bold ml-2 text-sm"
      >
        ✕
      </button>
    </div>
  )
}