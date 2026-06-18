import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import demonData from '../data/demons.json'

function sortById(demons) {
  return [...demons].sort((a, b) => a.id - b.id)
}

function assignPositions(demons) {
  return sortById(demons).map((d, i) => ({
    ...d,
    position: [i * 25, 0, (Math.random() - 0.5) * 4],
  }))
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const useTimelineStore = create(
  persist(
    (set, get) => ({
      demons: [],
      initialised: false,
      selectedDemon: null,
      selectDemon: (demon) => set({ selectedDemon: demon }),
      clearSelection: () => set({ selectedDemon: null }),
      goToPosition: null,
      setGoToPosition: (pos) => set({ goToPosition: pos }),
      clearGoToPosition: () => set({ goToPosition: null }),
      viewAllTrigger: 0,
      triggerViewAll: () => set((s) => ({ viewAllTrigger: s.viewAllTrigger + 1 })),
      youtubeVideoId: null,
      youtubeSoundOnly: false,
      setYoutubeVideo: (id, soundOnly = false) => set({ youtubeVideoId: id, youtubeSoundOnly: soundOnly }),
      clearYoutubeVideo: () => set({ youtubeVideoId: null, youtubeSoundOnly: false }),
      bloomEnabled: false,
      setBloomEnabled: (v) => set({ bloomEnabled: v }),

      user: null,
      cloudStatus: 'idle',

      setUser: (user) => set({ user }),

      initDemons: (data) => {
        const state = get()
        if (state.demons.length > 0) return
        const demons = assignPositions(data)
        set({ demons, initialised: true })
      },

      addDemon: ({ insertId, beaten, dateBeaten, ...rest }) => {
        const state = get()
        let updated = [...state.demons]

        const id = insertId != null ? insertId : (updated.length > 0 ? Math.max(...updated.map((d) => d.id)) + 1 : 1)

        if (insertId != null) {
          updated = updated.map((d) => (d.id >= insertId ? { ...d, id: d.id + 1 } : d))
        }

        const newDemon = {
          id,
          ...rest,
          progress: beaten ? 100 : 0,
          dateBeaten: dateBeaten || (beaten ? todayStr() : 'N/A'),
        }

        updated.push(newDemon)
        set({ demons: assignPositions(updated) })
        return id
      },

      removeDemon: (id) => {
        const state = get()
        const filtered = state.demons.filter((d) => d.id !== id)
        set({ demons: assignPositions(filtered) })
        if (state.selectedDemon?.id === id) {
          set({ selectedDemon: null })
        }
      },

      editDemon: (id, updates) => {
        const state = get()
        const updated = state.demons.map((d) =>
          d.id === id ? { ...d, ...updates, position: d.position } : d
        )
        set({ demons: assignPositions(updated) })
      },

      replaceAllDemons: (data) => {
        set({ demons: assignPositions(data), initialised: true })
      },

      cloudSave: async () => {
        const state = get()
        if (!state.user || !supabase) return
        set({ cloudStatus: 'saving' })
        try {
          const { error } = await supabase.from('timelines').upsert(
            { user_id: state.user.id, demons: JSON.parse(JSON.stringify(state.demons)), updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
          if (error) {
            console.error('cloudSave error:', error)
            set({ cloudStatus: 'error' })
            return
          }
          set({ cloudStatus: 'saved' })
          setTimeout(() => { if (get().cloudStatus === 'saved') set({ cloudStatus: 'idle' }) }, 2500)
        } catch (e) {
          console.error('cloudSave exception:', e)
          set({ cloudStatus: 'error' })
        }
      },

      cloudLoad: async () => {
        const state = get()
        if (!state.user || !supabase) return
        set({ cloudStatus: 'saving' })
        try {
          const { data, error } = await supabase
            .from('timelines')
            .select('demons')
            .eq('user_id', state.user.id)
            .single()
          if (error && error.code !== 'PGRST116') {
            console.error('cloudLoad error:', error)
            set({ cloudStatus: 'error' })
            return
          }
          if (data?.demons) {
            set({ demons: assignPositions(data.demons), cloudStatus: 'saved' })
            setTimeout(() => { if (get().cloudStatus === 'saved') set({ cloudStatus: 'idle' }) }, 2500)
          } else {
            set({ cloudStatus: 'idle' })
          }
        } catch (e) {
          console.error('cloudLoad exception:', e)
          set({ cloudStatus: 'error' })
        }
      },

      signOut: async () => {
        if (supabase) await supabase.auth.signOut()
        const seed = assignPositions(JSON.parse(JSON.stringify(demonData.demons)))
        set({ user: null, cloudStatus: 'idle', demons: seed, initialised: true })
      },
    }),
    {
      name: 'gd-timeline-storage',
      partialize: (state) => ({
        demons: state.demons,
      }),
    }
  )
)
