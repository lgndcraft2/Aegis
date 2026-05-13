import axios from 'axios'
import type { CycleResults } from './types'

const api = axios.create({
  baseURL: '/api',
})

export async function uploadPayroll(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ job_id: string }>('/upload/payroll', form)
  return data
}

export async function uploadVendors(file: File) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ job_id: string }>('/upload/vendors', form)
  return data
}

export async function runSurveillance() {
  const { data } = await api.post<{ cycle_id: string }>('/run-surveillance')
  return data
}

export async function getResults(cycleId: string) {
  const { data } = await api.get<CycleResults>(`/results/${cycleId}`)
  return data
}

export async function getSquadAccounts(cycleId: string) {
  const { data } = await api.get(`/squad/accounts/${cycleId}`)
  return data
}

export async function loadScenario(n: number) {
  const { data } = await api.post(`/demo/load-scenario/${n}`)
  return data
}

export default api
