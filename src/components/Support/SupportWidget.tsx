'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { connectRealtimeSocket } from '@/services/realtime.service'
import {
  getSupportConversation,
  sendSupportMessage,
  SupportConversation,
} from '@/services/support.service'

const conversationKey = 'innerbeast_support_conversation_id'
const guestKey = 'innerbeast_support_guest_id'

const makeGuestId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

const getGuestId = () => {
  if (typeof window === 'undefined') return ''
  const existing = window.localStorage.getItem(guestKey)
  if (existing) return existing
  const next = makeGuestId()
  window.localStorage.setItem(guestKey, next)
  return next
}

const SupportWidget = () => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [guestId, setGuestId] = useState('')
  const [conversationId, setConversationId] = useState('')
  const [conversation, setConversation] = useState<SupportConversation | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isAdminArea = pathname?.startsWith('/admin')
  const messages = conversation?.messages || []
  const hasConversation = Boolean(conversation?._id || conversationId)

  const loadConversation = useCallback(async (id = conversationId, gid = guestId) => {
    if (!id && !gid) return
    try {
      const response = await getSupportConversation(id || undefined, gid || undefined)
      if (response.data) {
        setConversation(response.data)
        setConversationId(response.data._id)
        window.localStorage.setItem(conversationKey, response.data._id)
      }
    } catch {
      // Keep the widget quiet if support is temporarily unavailable.
    }
  }, [conversationId, guestId])

  useEffect(() => {
    const gid = getGuestId()
    const savedConversationId = window.localStorage.getItem(conversationKey) || ''
    setGuestId(gid)
    setConversationId(savedConversationId)
    loadConversation(savedConversationId, gid)
  }, [loadConversation])

  useEffect(() => {
    if (!hasConversation) return
    const interval = window.setInterval(() => loadConversation(), 20000)
    return () => window.clearInterval(interval)
  }, [hasConversation, conversationId, guestId, loadConversation])

  useEffect(() => {
    const socket = connectRealtimeSocket()
    const refresh = (payload: { conversationId?: string }) => {
      if (!payload?.conversationId) return
      if (payload.conversationId === conversationId) loadConversation(payload.conversationId, guestId)
    }

    socket.on('chat:changed', refresh)
    return () => {
      socket.off('chat:changed', refresh)
    }
  }, [conversationId, guestId, loadConversation])

  const unread = useMemo(() => conversation?.unreadForCustomer || 0, [conversation])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const cleanMessage = message.trim()
    if (!cleanMessage) return

    setLoading(true)
    setError('')

    try {
      const response = await sendSupportMessage({
        conversationId: conversationId || undefined,
        guestId,
        name,
        email,
        message: cleanMessage,
      })

      if (response.data) {
        setConversation(response.data)
        setConversationId(response.data._id)
        window.localStorage.setItem(conversationKey, response.data._id)
      }
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message')
    } finally {
      setLoading(false)
    }
  }

  if (isAdminArea) return null

  return (
    <div className='fixed bottom-5 right-5 z-[80] font-sans'>
      {open && (
        <div className='mb-4 w-[340px] max-w-[calc(100vw-40px)] rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden'>
          <div className='bg-black text-white px-5 py-4 flex items-center justify-between'>
            <div>
              <div className='font-semibold'>Inner Beast Support</div>
              <div className='text-xs text-white/60'>Usually replies soon</div>
            </div>
            <button type='button' onClick={() => setOpen(false)} className='text-white/70 hover:text-white'>✕</button>
          </div>

          <div className='h-[320px] overflow-y-auto p-4 bg-[#f7f7f7] space-y-3'>
            {!messages.length && (
              <div className='rounded-2xl bg-white p-4 text-sm text-black/60'>
                Hi! Send us a message and our team will help you with your order, size, delivery, or product question.
              </div>
            )}
            {messages.map((item, index) => {
              const mine = item.senderType === 'customer'
              return (
                <div key={item._id || index} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-black text-white' : 'bg-white text-black border border-black/5'}`}>
                    {!mine && <div className='text-[11px] text-black/45 mb-1'>{item.name || 'Support'}</div>}
                    <div>{item.message}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSubmit} className='p-4 space-y-3'>
            {!conversation && (
              <div className='grid grid-cols-2 gap-2'>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder='Name' className='rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-black' />
                <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder='Email' className='rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-black' />
              </div>
            )}
            <div className='flex gap-2'>
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder='Type your message...'
                className='flex-1 rounded-xl border border-black/10 px-3 py-3 text-sm outline-none focus:border-black'
              />
              <button disabled={loading} className='rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50'>
                Send
              </button>
            </div>
            {error && <div className='text-xs text-red'>{error}</div>}
          </form>
        </div>
      )}

      <button
        type='button'
        onClick={() => setOpen((current) => !current)}
        className='relative h-14 rounded-full bg-black px-5 text-white shadow-[0_15px_40px_rgba(0,0,0,0.25)] font-semibold'
      >
        Chat with us
        {unread > 0 && (
          <span className='absolute -top-2 -right-2 h-6 min-w-6 rounded-full bg-red px-2 text-xs flex items-center justify-center'>
            {unread}
          </span>
        )}
      </button>
    </div>
  )
}

export default SupportWidget
