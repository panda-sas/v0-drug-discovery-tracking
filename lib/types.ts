export interface Project {
  id: string
  name: string
  description: string | null
  status: "active" | "completed" | "archived"
  created_at: string
  updated_at: string
}

export interface Experiment {
  id: string
  project_id: string
  name: string
  description: string | null
  status: "planning" | "in_progress" | "completed" | "archived"
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
  project?: Project
}

export interface Scientist {
  id: string
  name: string
  email: string
  role: "scientist" | "admin" | "lab_manager"
  active: boolean
  created_at: string
  updated_at: string
}

export interface Plate {
  id: string
  experiment_id: string
  plate_id: string
  plate_type: "96-well" | "384-well" | "1536-well"
  status: "available" | "checked_out" | "in_use" | "completed" | "archived"
  location: string | null
  notes: string | null
  created_at: string
  updated_at: string
  experiment?: Experiment
}

export interface PlateTransaction {
  id: string
  plate_id: string
  scientist_id: string
  action: "check_out" | "check_in"
  previous_status: string
  new_status: string
  notes: string | null
  transaction_date: string
  scientist?: Scientist
  plate?: Plate
}
