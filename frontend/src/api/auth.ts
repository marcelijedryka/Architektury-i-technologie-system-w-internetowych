import client from './client'

export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    client.post('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }) =>
    client.post('/auth/login', data).then(r => r.data),
  me: () => client.get('/auth/me').then(r => r.data),
  logout: () => client.post('/auth/logout').then(r => r.data),
}
