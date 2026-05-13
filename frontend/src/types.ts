// ─── Shared types for AEGIS frontend ───

export interface Employee {
  employee_id: string
  name: string
  department: string
  grade_level: string
  salary_account: string
  bvn: string
  employment_date: string
  has_service_record: boolean
  absences_ytd: number
  score: number
  verdict: 'CLEAR' | 'REVIEW' | 'HOLD'
}

export interface Vendor {
  vendor_id: string
  name: string
  registration_address: string
  director_name: string
  settlement_account: string
  bvn: string
  registration_date: string
  score: number
  verdict: 'CLEAR' | 'REVIEW' | 'HOLD'
}

export interface FraudAlert {
  cycle_id: string
  entity_type: 'EMPLOYEE' | 'VENDOR' | 'TRANSACTION'
  entity_id: string
  signal_name: string
  description: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface GraphElement {
  data: {
    id?: string
    label?: string
    type?: string
    score?: number
    source?: string
    target?: string
  }
  classes?: string
}

export interface CycleResults {
  status: 'RUNNING' | 'COMPLETED' | 'ERROR'
  employees?: Employee[]
  vendors?: Vendor[]
  graph?: GraphElement[]
  summary?: {
    total_alerts: number
    intercepted_amount: number
  }
}

export interface PipelineUpdate {
  cycle_id: string
  stage: string
  progress: number
  message?: string
}
