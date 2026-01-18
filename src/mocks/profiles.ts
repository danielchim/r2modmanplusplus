export type Profile = {
  id: string
  gameId: string
  name: string
  modCount: number
}

export const PROFILES: Profile[] = [
  // Risk of Rain 2 profiles
  { id: "ror2-default", gameId: "ror2", name: "Default", modCount: 0 },
  { id: "ror2-coop", gameId: "ror2", name: "Co-op with Steve", modCount: 12 },
  { id: "ror2-hardcore", gameId: "ror2", name: "Hardcore Solo", modCount: 8 },
  { id: "ror2-testing", gameId: "ror2", name: "Testing", modCount: 45 },

  // Valheim profiles
  { id: "valheim-default", gameId: "valheim", name: "Default", modCount: 0 },
  { id: "valheim-building", gameId: "valheim", name: "Building Focus", modCount: 15 },
  
  // Lethal Company profiles
  { id: "lc-default", gameId: "lethal-company", name: "Default", modCount: 0 },
  { id: "lc-chaos", gameId: "lethal-company", name: "Chaos Mode", modCount: 23 },
  
  // Dyson Sphere profiles
  { id: "dsp-default", gameId: "dyson-sphere", name: "Default", modCount: 0 },
]
