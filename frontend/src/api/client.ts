import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
})

client.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
