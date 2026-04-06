import client from './client'

export const hierarchyApi = {
  continents: () => client.get('/hierarchy/continents').then(r => r.data),
  regions: (continentId: string) => client.get(`/hierarchy/continents/${continentId}/regions`).then(r => r.data),
  cities: (regionId: string) => client.get(`/hierarchy/regions/${regionId}/cities`).then(r => r.data),
  streets: (cityId: string) => client.get(`/hierarchy/cities/${cityId}/streets`).then(r => r.data),
}
