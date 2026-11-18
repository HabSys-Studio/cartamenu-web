'use client'

import +AHs- useState +AH0- from 'react'
import Link from 'next/link'

export default function ResetPasswordPage() +AHs-
  const +AFs-email, setEmail+AF0- +AD0- useState('')
  const +AFs-newPassword, setNewPassword+AF0- +AD0- useState('')
  const +AFs-message, setMessage+AF0- +AD0- useState('')
  const +AFs-type, setType+AF0- +AD0- useState('')

  const handleSubmit +AD0- async (event) +AD0APg- +AHs-
    event.preventDefault()
    setMessage('')

    try +AHs-
      const res +AD0- await fetch('/api/admin/reset-password', +AHs-
        method: 'POST',
        headers: +AHs- 'Content-Type': 'application/json' +AH0-,
        body: JSON.stringify(+AHs- email, newPassword +AH0-),
      +AH0-)

      const data +AD0- await res.json()

      if (res.ok) +AHs-
        setType('success')
        setMessage('Contrase+AMMAsQ-a actualizada correctamente.')
        setEmail('')
        setNewPassword('')
      +AH0- else +AHs-
        setType('error')
        setMessage(data.error +AHwAfA- 'No se pudo actualizar la contrase+AMMAsQ-a.')
      +AH0-
    +AH0- catch (error) +AHs-
      setType('error')
      setMessage('Error de conexi+AMMAsw-n. Intenta de nuevo.')
    +AH0-
  +AH0-

  return (
    +ADw-div className+AD0AIg-min-h-screen bg-neutral-950 flex items-center justify-center p-4+ACIAPg-
      +ADw-div className+AD0AIg-w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl+ACIAPg-
        +ADw-Link href+AD0AIg-/admin+ACI- className+AD0AIg-text-amber-500 hover:text-amber-400 font-bold text-sm mb-4 block+ACIAPg-
          +AOIgIACQ- Volver al panel
        +ADw-/Link+AD4-
        +ADw-h1 className+AD0AIg-text-2xl font-black text-amber-500 tracking-tight mb-2+ACIAPg-
          Resetear contrase+AMMAsQ-a
        +ADw-/h1+AD4-
        +ADw-p className+AD0AIg-text-xs text-neutral-400 mb-6+ACIAPg-
          Ingres+AMMAoQ- el email de la cuenta y la nueva contrase+AMMAsQ-a.
        +ADw-/p+AD4-

        +AHs-message +ACYAJg- (
          +ADw-div
            className+AD0AewBg-mb-4 p-3 rounded-xl text-xs font-medium +ACQAew-
              type +AD0APQA9- 'success'
                ? 'bg-emerald-950/50 border border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/50 border border-rose-800/80 text-rose-300'
            +AH0AYAB9-
          +AD4-
            +AHs-message+AH0-
          +ADw-/div+AD4-
        )+AH0-

        +ADw-form onSubmit+AD0Aew-handleSubmit+AH0- className+AD0AIg-space-y-4+ACIAPg-
          +ADw-div+AD4-
            +ADw-label className+AD0AIg-block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider+ACIAPg-
              Email de la cuenta
            +ADw-/label+AD4-
            +ADw-input
              name+AD0AIg-email+ACI-
              type+AD0AIg-email+ACI-
              required
              value+AD0Aew-email+AH0-
              onChange+AD0Aew-(e) +AD0APg- setEmail(e.target.value)+AH0-
              placeholder+AD0AIg-admin+AEA-tu-restaurante.com+ACI-
              className+AD0AIg-w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition+ACI-
            /+AD4-
          +ADw-/div+AD4-

          +ADw-div+AD4-
            +ADw-label className+AD0AIg-block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider+ACIAPg-
              Nueva contrase+AMMAsQ-a
            +ADw-/label+AD4-
            +ADw-input
              name+AD0AIg-newPassword+ACI-
              type+AD0AIg-password+ACI-
              required
              value+AD0Aew-newPassword+AH0-
              onChange+AD0Aew-(e) +AD0APg- setNewPassword(e.target.value)+AH0-
              placeholder+AD0AIgDiIKwAogDiIKwAogDiIKwAogDiIKwAogDiIKwAogDiIKwAogDiIKwAogDiIKwAogAi-
              className+AD0AIg-w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 focus:border-amber-500 outline-none transition+ACI-
            /+AD4-
          +ADw-/div+AD4-

          +ADw-button
            type+AD0AIg-submit+ACI-
            className+AD0AIg-w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold py-3.5 rounded-xl text-sm transition+ACI-
          +AD4-
            Actualizar contrase+AMMAsQ-a
          +ADw-/button+AD4-
        +ADw-/form+AD4-
      +ADw-/div+AD4-
    +ADw-/div+AD4-
  )
+AH0-

