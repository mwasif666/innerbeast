const BASE_URL = process.env.NEXT_PUBLIC_API_URL

const api = async (endpoint: string) => {
  if (!BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is missing')
  }

  const response = await fetch(BASE_URL + endpoint)
  return response.json()
}

export default api
