"use client"

import { create } from "zustand"

interface ProfileState {
  id: string | null
  firstName: string
  lastName: string
  title: string
  specialization: string
  license: string
  email: string
  setProfile: (profile: Partial<Omit<ProfileState, "setProfile" | "resetProfile">>) => void
  resetProfile: () => void
}

const defaultProfile: Omit<ProfileState, "setProfile" | "resetProfile"> = {
  id: null,
  firstName: "",
  lastName: "",
  title: "Dr.",
  specialization: "",
  license: "",
  email: "",
}

export const useProfileStore = create<ProfileState>((set) => ({
  ...defaultProfile,
  setProfile: (profile) =>
    set((state) => ({
      ...state,
      ...profile,
    })),
  resetProfile: () => set({ ...defaultProfile }),
}))

