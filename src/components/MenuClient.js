'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/store/useCartStore'

const PIN_MOZO = '123456'

export default function MenuClient({
  platos = [],
  categorias = [],
  restaurantId = null,
}) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState([])
  const [esModoMozo, setEsModoMozo] = useState(false)
  const [numeroMesa, setNumeroMesa] = useState('')
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState('carrito') // 'carrito' | 'datos' | 'exito'
  const [clienteNombre, setClienteNombre] = useState('')
  const [numeroMesaPedido, setNumeroMesaPedido] = useState('')
  const [restaurantIdProp] = useState(restaurantId || null)

  const [mostrarModalPin, setMostrarModalPin] = useState(false)
  const [pinIngresado, setPinIngresado] = useState('')
  const [errorPin, setErrorPin] = useState(false)

  const clearZustandCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carta_carrito')
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado))
      } catch (e) {
        console.error('Error al cargar el carrito:', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('carta_carrito', JSON.stringify(carrito))
  }, [carrito])

  const alternarModoMozo = () => {
    if (esModoMozo) {
      setEsModoMozo(false)
    } else {
      setMostrarModalPin(true)
      setErrorPin(false)
      setPinIngresado('')
    }
  }

  const validarPin = (e) => {
    e.preventDefault()
    if (pinIngresado === PIN_MOZO) {
      setEsModoMozo(true)
      setMostrarModalPin(false)
      setErrorPin(false)
    } else {
      setErrorPin(true)
    }
  }

  const platosFiltrados = platos.filter((plato) => {
    const catId = plato.categoryId || plato.categoria?.id || plato.categoria?._id
    const coincideCategoria =
      categoriaSeleccionada === 'todas' || catId === categoriaSeleccionada

    const nombrePlato = (plato.name || plato.title || '').toLowerCase()
    const descPlato = (plato.description || '').toLowerCase()
    const query = busqueda.toLowerCase()

    const coincideBusqueda =
      nombrePlato.includes(query) || descPlato.includes(query)

    return coincideCategoria && coincideBusqueda
  })

  const agregarAlCarrito = (plato) => {
    const itemId = plato.id || plato._id
    setCarrito((prev) => {
      const existe = prev.find((item) => (item.id || item._id) === itemId)
      if (existe) {
        return prev.map((item) =>
          (item.id || item._id) === itemId
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      }
      return [...prev, { ...plato, id: itemId, cantidad: 1, notas: '' }]
    })
  }

  const modificarCantidad = (id, cambio) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          const itemId = item.id || item._id
          if (itemId === id) {
            const nuevaCantidad = item.cantidad + cambio
            return nuevaCantidad > 0
              ? { ...item, cantidad: nuevaCantidad }
              : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const actualizarNotasItem = (id, notas) => {
    setCarrito((prev) =>
      prev.map((item) =>
        (item.id || item._id) === id ? { ...item, notas } : item
      )
    )
  }

  const handleCheckout = () => {
    if (!restaurantIdProp && !restaurantId) {
      alert('Error: no se identificó el restaurante.')
      return
    }
    setCheckoutStep('datos')
  }

  const totalPedido = carrito.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * item.cantidad,
    0
  )
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0)

  const confirmarPedido = async () => {
    if (!clienteNombre.trim()) {
      alert('Por favor ingresá tu nombre.')
      return
    }

    const payload = {
      restaurantId: restaurantIdProp || restaurantId,
      customerName: clienteNombre.trim(),
      customerPhone: numeroMesaPedido.trim() || numeroMesa.trim() || null,
      customerEmail: null,
      total: totalPedido,
      items: carrito.map((item) => ({
        id: item.id || item._id,
        quantity: item.cantidad,
        price: Number(item.price) || 0,
        notas: item.notas || '',
      })),
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setCheckoutStep('exito')
        setCarrito([])
        localStorage.removeItem('carta_carrito')
        clearZustandCart()
      } else {
        alert(data.error || 'Error al crear el pedido.')
      }
    } catch (error) {
      console.error(error)
      alert('Error de conexión al crear el pedido.')
    }
  }

  return (
    <div className="relative pb-24">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Buscar plato o ingrediente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-full px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <button
          type="button"
          onClick={alternarModoMozo}
          className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all ${
            esModoMozo
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          {esModoMozo ? 'Modo Mozo Activo' : 'Modo Cliente'}
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => setCategoriaSeleccionada('todas')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            categoriaSeleccionada === 'todas'
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          Todas
        </button>

        {categorias.map((cat) => {
          const catId = cat.id || cat._id
          const catTitle = cat.name || cat.titulo
          return (
            <button
              type="button"
              key={catId}
              onClick={() => setCategoriaSeleccionada(catId)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoriaSeleccionada === catId
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {catTitle}
            </button>
          )
        })}
      </div>

      {platosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
          <p className="text-slate-400">
            No se encontraron platos con los criterios seleccionados.
          </p>
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {platosFiltrados.map((plato) => {
            const platoId = plato.id || plato._id
            const platoNombre = plato.name || plato.title
            const imgSrc = plato.imageUrl || plato.image
            const estaDisponible =
              typeof plato.available === 'boolean'
                ? plato.available
                : Boolean(plato.isAvailable)

            return (
              <article
                key={platoId}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div>
                  {imgSrc && (
                    <div className="relative h-48 w-full bg-slate-800">
                      <Image
                        src={imgSrc}
                        alt={platoNombre || 'Imagen del plato'}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold text-slate-100">
                        {platoNombre}
                      </h2>
                      <span className="text-lg font-bold text-amber-400 ml-2">
                        ${plato.price}
                      </span>
                    </div>
                    {plato.categoria && (
                      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-amber-500/80 mb-2">
                        {plato.categoria.name || plato.categoria.titulo}
                      </span>
                    )}
                    <p className="text-slate-400 text-sm mb-4">
                      {plato.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex justify-between items-center">
                  <span
                    className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                      estaDisponible
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {estaDisponible ? 'Disponible' : 'Agotado'}
                  </span>

                  {estaDisponible && (
                    <button
                      type="button"
                      onClick={() => agregarAlCarrito(plato)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm transition-colors flex items-center gap-1.5"
                    >
                      + Agregar
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </section>
      )}

      {mostrarModalPin && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-2 text-center">
              Acceso Restringido a Mozos
            </h3>
            <p className="text-xs text-slate-400 mb-4 text-center">
              Ingresá el PIN de 6 dígitos del personal.
            </p>

            <form onSubmit={validarPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="------"
                  value={pinIngresado}
                  onChange={(e) => setPinIngresado(e.target.value)}
                  className="w-full text-center tracking-widest text-2xl bg-slate-950 border border-slate-800 rounded-xl py-3 text-amber-400 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
                {errorPin && (
                  <p className="text-rose-400 text-xs text-center mt-2 font-medium">
                    PIN incorrecto. Intentá nuevamente.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalPin(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-xl transition-colors"
                >
                  Ingresar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {totalItems > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-amber-500 text-slate-950 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between z-40">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </p>
            <p className="text-lg font-extrabold">${totalPedido}</p>
          </div>
          <button
            type="button"
            onClick={() => setCarritoAbierto(true)}
            className="bg-slate-950 text-amber-400 font-bold px-4 py-2 rounded-xl text-sm hover:bg-slate-900 transition-colors"
          >
            Ver Pedido
          </button>
        </div>
      )}

      {carritoAbierto && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full p-6 overflow-y-auto flex flex-col justify-between border-l border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                <h3 className="text-xl font-bold text-amber-500">
                  {esModoMozo ? 'Comanda Mozo' : 'Tu Pedido'}
                </h3>
                <button
                  type="button"
                  onClick={() => setCarritoAbierto(false)}
                  className="text-slate-400 hover:text-slate-100 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {esModoMozo && (
                <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-amber-500/30">
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                    Número de Mesa:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Mesa 4"
                    value={numeroMesa}
                    onChange={(e) => setNumeroMesa(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="space-y-4">
                {carrito.map((item) => {
                  const itemId = item.id || item._id
                  const itemTitle = item.name || item.title
                  return (
                    <div
                      key={itemId}
                      className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-100">
                            {itemTitle}
                          </h4>
                          <p className="text-xs text-amber-400">
                            ${item.price} c/u
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-900 rounded-lg border border-slate-800 px-2 py-1">
                          <button
                            type="button"
                            onClick={() => modificarCantidad(itemId, -1)}
                            className="text-amber-500 font-bold px-1"
                          >
                            -
                          </button>
                          <span className="text-sm font-semibold px-1">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => modificarCantidad(itemId, 1)}
                            className="text-amber-500 font-bold px-1"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {esModoMozo && (
                        <input
                          type="text"
                          placeholder="Notas (ej: sin cebolla, cocción a punto...)"
                          value={item.notas || ''}
                          onChange={(e) =>
                            actualizarNotasItem(itemId, e.target.value)
                          }
                          className="w-full bg-slate-900/60 border border-slate-800/80 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 font-medium">Total:</span>
                <span className="text-2xl font-extrabold text-amber-400">
                  ${totalPedido}
                </span>
              </div>

              {checkoutStep === 'carrito' ? (
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors"
                >
                  {esModoMozo ? 'Confirmar Comanda' : 'Revisar Resumen'}
                </button>
              ) : checkoutStep === 'datos' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                      Tu nombre
                    </label>
                    <input
                      type="text"
                      value={clienteNombre}
                      onChange={(e) => setClienteNombre(e.target.value)}
                      placeholder="Juan Pérez"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                      Mesa (opcional)
                    </label>
                    <input
                      type="text"
                      value={numeroMesaPedido}
                      onChange={(e) => setNumeroMesaPedido(e.target.value)}
                      placeholder="Mesa 4"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-neutral-100 focus:border-amber-500 outline-none transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={confirmarPedido}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors"
                  >
                    Confirmar Pedido
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('carrito')}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm rounded-xl transition-colors"
                  >
                    Volver al carrito
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-950/20 border border-green-800/50 rounded-xl p-4 text-center">
                    <h3 className="text-green-400 font-bold text-sm">
                      ¡Pedido confirmado!
                    </h3>
                    <p className="text-neutral-400 text-xs mt-1">
                      Tu pedido se ha enviado. Total: $
                      {totalPedido.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('carrito')}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-colors"
                  >
                    Nuevo pedido
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}