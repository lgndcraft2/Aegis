import axios from 'axios'
import type { CycleResults, FraudAlert, Employee, Vendor } from './types'

const api = axios.create({
  baseURL: 'https://aegis-be.vercel.app/',
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

export async function releaseTransaction(transactionId: string) {
  const { data } = await api.post(`/squad/release/${transactionId}`)
  return data
}

export async function loadScenario(n: number) {
  const { data } = await api.post(`/demo/load-scenario/${n}`)
  return data
}

export async function getCycles() {
  const { data } = await api.get<{ cycles: any[] }>('/cycles')
  return data.cycles
}

export async function getLatestCycle() {
  const cycles = await getCycles()
  return cycles[0] || null
}

export async function getAuditTrail(cycleId: string) {
  const { data } = await api.get<{ events: any[] }>(`/audit/${cycleId}`)
  return data.events
}

export async function getAlerts(cycleId: string) {
  const { data } = await api.get<{ alerts: FraudAlert[] }>(`/alerts/${cycleId}`)
  return data.alerts || []
}

export async function getEmployees() {
  const { data } = await api.get<{ employees: Employee[] }>('/employees')
  return data.employees
}

export async function getVendors() {
  const { data } = await api.get<{ vendors: Vendor[] }>('/vendors')
  return data.vendors
}

export function subscribeToStream(cycleId: string, onMessage: (data: any) => void, onError?: (err: Error) => void) {
  const ws = new WebSocket(`wss://aegis-be.vercel.app/stream/${cycleId}`)
  
  ws.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data))
    } catch {
      onMessage(event.data)
    }
  }
  
  ws.onerror = (error) => {
    if (onError) onError(new Error('WebSocket error'))
  }
  
  return () => ws.close()
}

export default api
