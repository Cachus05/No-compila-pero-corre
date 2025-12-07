"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navigation } from "@/components/navigation_cliente"
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CreditCard, Lock, CheckCircle2, ShieldCheck, Clock, AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Servicio {
  id: number
  title: string
  description: string
  category: string
  base_price: number | string
  delivery_time: number
  gallery_images: string[]
  freelancer_id: number
  first_name: string
  last_name: string
  avatar: string | null
  email: string
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params || {}

  const [usuario, setUsuario] = useState<any>(null)
  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [error, setError] = useState('')

  // Estados del formulario
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [requirements, setRequirements] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')

  useEffect(() => {
    // Verificar sesión
    const usuarioGuardado = localStorage.getItem('usuario')
    if (!usuarioGuardado) {
      router.push('/login')
      return
    }
    setUsuario(JSON.parse(usuarioGuardado))
  }, [router])

  useEffect(() => {
    if (!id) return

    const fetchServicio = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/services/${id}`)
        
        if (res.ok) {
          const data = await res.json()
          setServicio(data.servicio)
        } else {
          setError('Servicio no encontrado')
          setTimeout(() => router.push('/dashboard_cliente/contratar'), 2000)
        }
      } catch (err) {
        console.error('Error al cargar servicio:', err)
        setError('Error al cargar el servicio')
      } finally {
        setLoading(false)
      }
    }

    fetchServicio()
  }, [id, router])

  const formatearPrecio = (precio: number | string): string => {
    const precioNumero = typeof precio === 'string' ? parseFloat(precio) : precio
    return isNaN(precioNumero) ? '0.00' : precioNumero.toFixed(2)
  }

  const calcularTotal = () => {
    if (!servicio) return '0.00'
    const precio = parseFloat(formatearPrecio(servicio.base_price))
    const comision = precio * 0.10 // 10% comisión
    const total = precio + comision
    return total.toFixed(2)
  }

  const handleProcessPayment = async () => {
    if (!usuario || !servicio) return

    // Validaciones
    if (!requirements.trim()) {
      alert('Por favor describe los requerimientos del proyecto')
      return
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        alert('Por favor completa todos los datos de la tarjeta')
        return
      }
    }

    setProcessingPayment(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/contratos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: servicio.id,
          freelancerId: servicio.freelancer_id,
          requirements: requirements,
          paymentMethod: paymentMethod,
          amount: calcularTotal()
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Redirigir al dashboard con mensaje de éxito
        router.push(`/dashboard_cliente?contratoExitoso=${data.contrato.id}`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al procesar el pago')
      }
    } catch (error) {
      console.error('Error al procesar pago:', error)
      alert('Error al procesar el pago. Por favor intenta nuevamente.')
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500 mb-4" />
          <p className="text-gray-400">Cargando información del servicio...</p>
        </div>
      </div>
    )
  }

  if (error || !servicio || !usuario) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <div className="text-red-400 text-lg mb-4">{error || 'Error al cargar'}</div>
          <Button onClick={() => router.push('/dashboard_cliente/contratar')} variant="outline">
            Volver a servicios
          </Button>
        </div>
      </div>
    )
  }

  const nombreFreelancer = `${servicio.first_name} ${servicio.last_name}`
  const inicialesFreelancer = `${servicio.first_name.charAt(0)}${servicio.last_name.charAt(0)}`

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="text-gray-400 hover:text-teal-400 transition-colors mb-4 flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Checkout</h1>
          <p className="text-gray-400">Completa la información para contratar el servicio</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del proyecto */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-400" />
                Detalles del proyecto
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="requirements" className="text-gray-300">
                    Describe tus requerimientos *
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="Explica en detalle qué necesitas para este proyecto..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="mt-2 min-h-[150px] bg-neutral-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Incluye todos los detalles necesarios para que el freelancer pueda comenzar
                  </p>
                </div>

                <div className="bg-neutral-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">Tiempo de entrega</p>
                      <p className="text-sm text-gray-400">
                        El freelancer entregará el proyecto en <span className="text-teal-400 font-semibold">{servicio.delivery_time} días</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Método de pago */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-teal-400" />
                Método de pago
              </h2>

              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                <div className="flex items-center space-x-3 bg-neutral-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-teal-600 transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer text-white">
                    Tarjeta de crédito/débito
                  </Label>
                  <div className="flex gap-2">
                    <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded">VISA</div>
                    <div className="text-xs bg-orange-600 text-white px-2 py-1 rounded">MC</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-neutral-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-teal-600 transition-colors">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal" className="flex-1 cursor-pointer text-white">
                    PayPal
                  </Label>
                  <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded">PayPal</div>
                </div>
              </RadioGroup>

              {/* Formulario de tarjeta */}
              {paymentMethod === 'card' && (
                <div className="mt-6 space-y-4 pt-6 border-t border-gray-800">
                  <div>
                    <Label htmlFor="cardNumber" className="text-gray-300">
                      Número de tarjeta *
                    </Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      className="mt-2 bg-neutral-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardName" className="text-gray-300">
                      Nombre en la tarjeta *
                    </Label>
                    <Input
                      id="cardName"
                      type="text"
                      placeholder="Juan Pérez"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-2 bg-neutral-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate" className="text-gray-300">
                        Fecha de expiración *
                      </Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        placeholder="MM/AA"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        maxLength={5}
                        className="mt-2 bg-neutral-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-gray-300">
                        CVV *
                      </Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={4}
                        className="mt-2 bg-neutral-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-gray-500 bg-neutral-800 p-3 rounded-lg">
                    <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>Tu información de pago está protegida con encriptación SSL</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Términos y condiciones */}
            <Card className="p-6 bg-neutral-900 border-gray-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-400">
                  <p className="mb-2">Al confirmar la contratación, aceptas nuestros términos y condiciones:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>El pago se retendrá hasta que confirmes la entrega del trabajo</li>
                    <li>Tienes derecho a solicitar revisiones según lo acordado</li>
                    <li>El freelancer tiene {servicio.delivery_time} días para completar el proyecto</li>
                    <li>Protección al comprador en todas las transacciones</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Card del servicio */}
              <Card className="p-6 bg-neutral-900 border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Resumen del pedido</h3>
                
                <div className="space-y-4">
                  {/* Servicio */}
                  <div className="flex gap-4">
                    <img
                      src={servicio.gallery_images?.[0] || '/placeholder.svg'}
                      alt={servicio.title}
                      className="w-20 h-20 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg'
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm line-clamp-2">
                        {servicio.title}
                      </h4>
                      <Badge className="mt-1 bg-teal-600/20 text-teal-400 border-teal-600/30 text-xs">
                        {servicio.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Freelancer */}
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 mb-2">Freelancer</p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={servicio.avatar || undefined} />
                        <AvatarFallback className="bg-teal-600 text-white text-xs">
                          {inicialesFreelancer}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">{nombreFreelancer}</p>
                        <p className="text-xs text-gray-500">{servicio.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Desglose de precios */}
                  <div className="pt-4 border-t border-gray-800 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Precio del servicio</span>
                      <span className="text-white">${formatearPrecio(servicio.base_price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Comisión de servicio (10%)</span>
                      <span className="text-white">
                        ${(parseFloat(formatearPrecio(servicio.base_price)) * 0.10).toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-800 flex justify-between">
                      <span className="font-semibold text-white">Total</span>
                      <span className="text-2xl font-bold text-teal-400">
                        ${calcularTotal()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Botón de pago */}
              <Button
                onClick={handleProcessPayment}
                disabled={processingPayment || !requirements.trim()}
                className="w-full py-6 text-lg font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg hover:shadow-teal-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Procesando pago...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Confirmar y pagar ${calcularTotal()}
                  </>
                )}
              </Button>

              {/* Garantías */}
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-400" />
                  <span>Protección al comprador 100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-teal-400" />
                  <span>Pago seguro y encriptado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-400" />
                  <span>Satisfacción garantizada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}