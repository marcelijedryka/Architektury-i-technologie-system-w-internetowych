import client from './client'

export interface Material {
  materialId: string; title: string; description: string;
  imageUrl: string; altText: string; photoDate: string;
  continent?: string; country?: string; city?: string;
  regionId?: string; cityId?: string; streetId?: string;
  uploadedBy: string; uploadedAt: string; tags?: string[];
  status: string; likeCount?: number;
}

export interface SearchFilters {
  continent?: string; country?: string; city?: string;
  phrase?: string; dateFrom?: string; dateTo?: string;
}

export const materialsApi = {
  search: (filters: SearchFilters) =>
    client.get('/materials', { params: filters }).then(r => r.data as Material[]),
  getById: (id: string) => client.get(`/materials/${id}`).then(r => r.data as Material),
  myMaterials: () => client.get('/materials/my').then(r => r.data as Material[]),
  myLikedIds: () => client.get('/materials/my-liked-ids').then(r => r.data as string[]),
  toggleLike: (id: string) => client.post(`/materials/${id}/like`).then(r => r.data as { liked: boolean; likeCount: number }),
  create: (formData: FormData) =>
    client.post('/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data as Material),
  update: (id: string, data: Partial<Material>) =>
    client.patch(`/materials/${id}`, data).then(r => r.data as Material),
  delete: (id: string) => client.delete(`/materials/${id}`).then(r => r.data),
  all: () => client.get('/materials').then(r => r.data as Material[]),
}
