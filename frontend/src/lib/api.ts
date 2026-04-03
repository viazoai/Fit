const BASE_URL = ""

// ─── Token helpers ──────────────────────────────────────────────────────────

const TOKEN_KEY = "fit_access_token"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ─── Generic fetch wrapper ──────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    if (res.status === 401) {
      clearToken()
    }
    const body = await res.text().catch(() => "")
    throw new Error(`API ${res.status}: ${body}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ─── Auth ────────────────────────────────────────────────────────────────────

interface LoginResponse {
  access_token: string
  token_type: string
  user: { id: number; name: string; created_at: string }
}

export async function login(name: string, pin: string): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ name, pin }),
  })
  setToken(data.access_token)
  return data
}

// ─── Users ───────────────────────────────────────────────────────────────────

import type { UserRead } from "@/types"

export async function getMe(): Promise<UserRead> {
  return request<UserRead>("/api/users/me")
}

// ─── Exercises ───────────────────────────────────────────────────────────────

import type { Exercise } from "@/types"

export async function getExercises(params?: {
  type?: string
  muscle_group?: string
  q?: string
}): Promise<Exercise[]> {
  const sp = new URLSearchParams()
  if (params?.type) sp.set("type", params.type)
  if (params?.muscle_group) sp.set("muscle_group", params.muscle_group)
  if (params?.q) sp.set("q", params.q)
  const qs = sp.toString()
  return request<Exercise[]>(`/api/exercises${qs ? `?${qs}` : ""}`)
}

export async function getExercise(id: number): Promise<Exercise> {
  return request<Exercise>(`/api/exercises/${id}`)
}

// ─── Workouts ────────────────────────────────────────────────────────────────

import type { WorkoutSessionSummary, WorkoutSessionRead } from "@/types"

export async function getWorkouts(params?: {
  start?: string
  end?: string
}): Promise<WorkoutSessionSummary[]> {
  const sp = new URLSearchParams()
  if (params?.start) sp.set("start", params.start)
  if (params?.end) sp.set("end", params.end)
  return request<WorkoutSessionSummary[]>(`/api/workouts${sp.toString() ? `?${sp}` : ""}`)
}

export async function getWorkout(id: number): Promise<WorkoutSessionRead> {
  return request<WorkoutSessionRead>(`/api/workouts/${id}`)
}

export async function createWorkout(body: {
  date: string
  memo?: string
  duration_min?: number
  exercise_logs: {
    exercise_id: number
    order_index?: number
    duration_min?: number
    sets: {
      set_index: number
      reps?: number
      weight_kg?: number
      is_assisted?: boolean
      assist_weight_kg?: number
      memo?: string
    }[]
  }[]
}): Promise<WorkoutSessionRead> {
  return request<WorkoutSessionRead>("/api/workouts", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function updateWorkout(
  id: number,
  body: Record<string, unknown>,
): Promise<WorkoutSessionRead> {
  return request<WorkoutSessionRead>(`/api/workouts/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
}

// ─── Calendar ────────────────────────────────────────────────────────────────

import type { CalendarResponse } from "@/types"

export async function getCalendar(year: number, month: number): Promise<CalendarResponse> {
  return request<CalendarResponse>(`/api/calendar?year=${year}&month=${month}`)
}
