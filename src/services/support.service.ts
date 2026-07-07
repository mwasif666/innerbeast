import api from './api'

export type SupportMessage = {
  _id?: string
  senderType: 'customer' | 'admin' | 'system'
  name?: string
  message: string
  createdAt?: string
}

export type SupportConversation = {
  _id: string
  id: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  status: 'open' | 'pending' | 'closed'
  lastMessage?: string
  lastMessageAt?: string
  unreadForAdmin?: number
  unreadForCustomer?: number
  messages: SupportMessage[]
}

type OneResponse = { success: boolean; message?: string; data: SupportConversation | null }
type ListResponse = { success: boolean; count?: number; data: SupportConversation[] }

export const getSupportConversation = async (conversationId?: string, guestId?: string) => {
  const query = guestId ? `?guestId=${encodeURIComponent(guestId)}` : ''
  return (await api(conversationId ? `/settings/chat/${conversationId}${query}` : `/settings/chat${query}`)) as OneResponse
}

export const sendSupportMessage = async (payload: {
  conversationId?: string
  guestId?: string
  name?: string
  email?: string
  phone?: string
  message: string
}) => {
  return (await api(payload.conversationId ? `/settings/chat/${payload.conversationId}/messages` : '/settings/chat', {
    method: 'POST',
    body: payload,
  })) as OneResponse
}

export const getSupportInbox = async (status = 'all') => {
  return (await api(`/admin/chat/conversations?status=${encodeURIComponent(status)}`)) as ListResponse
}

export const getSupportThread = async (id: string) => {
  return (await api(`/admin/chat/conversations/${id}`)) as OneResponse
}

export const sendSupportReply = async (id: string, message: string) => {
  return (await api(`/admin/chat/conversations/${id}/messages`, {
    method: 'POST',
    body: { message },
  })) as OneResponse
}

export const setSupportStatus = async (id: string, status: SupportConversation['status']) => {
  return (await api(`/admin/chat/conversations/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })) as OneResponse
}
