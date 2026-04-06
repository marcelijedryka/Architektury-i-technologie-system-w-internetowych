import { useState, useEffect } from 'react'
import { hierarchyApi } from '../api/hierarchy'

export function useHierarchySelects() {
  const [continents, setContinents] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [streets, setStreets] = useState<any[]>([])
  const [continentId, setContinentId] = useState('')
  const [regionId, setRegionId] = useState('')
  const [cityId, setCityId] = useState('')
  const [streetId, setStreetId] = useState('')

  useEffect(() => { hierarchyApi.continents().then(setContinents) }, [])

  const onContinentChange = async (id: string) => {
    setContinentId(id); setRegionId(''); setCityId(''); setStreetId('')
    setRegions(id ? await hierarchyApi.regions(id) : [])
    setCities([]); setStreets([])
  }

  const onRegionChange = async (id: string) => {
    setRegionId(id); setCityId(''); setStreetId('')
    setCities(id ? await hierarchyApi.cities(id) : [])
    setStreets([])
  }

  const onCityChange = async (id: string) => {
    setCityId(id); setStreetId('')
    setStreets(id ? await hierarchyApi.streets(id) : [])
  }

  return {
    continents, regions, cities, streets,
    continentId, regionId, cityId, streetId,
    onContinentChange, onRegionChange, onCityChange, setStreetId,
  }
}
