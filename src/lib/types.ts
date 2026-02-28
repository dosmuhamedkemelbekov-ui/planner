export type EnergyLevel = "high" | "medium" | "low";

export interface Horizon {
  id: string;
  user_id: string;
  title: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  horizon_id: string;
  title: string;
  description: string | null;
  progress: number;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  horizon_id: string | null;
  title: string;
  energy_level: EnergyLevel | null;
  due_date: string | null;
  completed_at: string | null;
  scheduled_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  streak: number;
  last_done_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  done_date: string;
  created_at: string;
}

export interface MorningRitual {
  id: string;
  user_id: string;
  ritual_date: string;
  q1: string | null;
  q2: string | null;
  q3: string | null;
  created_at: string;
  updated_at: string;
}
