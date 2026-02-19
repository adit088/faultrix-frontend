"use client"
import { create } from "zustand"
import type { KillSwitchStatus } from "@/types"

interface AppStore {
  darkMode: boolean
  toggleDark: () => void
  killSwitch: KillSwitchStatus
  setKillSwitch: (s: KillSwitchStatus) => void
}

export const useAppStore = create<AppStore>((set) => ({
  darkMode: true,
  toggleDark: () => set((s) => ({ darkMode: !s.darkMode })),
  killSwitch: { enabled: false },
  setKillSwitch: (killSwitch) => set({ killSwitch }),
}))
