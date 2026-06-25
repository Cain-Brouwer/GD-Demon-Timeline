import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import demonData from '../data/demons.json'
import { LEVELS } from '../lib/qualityConfig'


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

let lastPersisted = null
const dedupedStorage = createJSONStorage(() => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  }
  return {
    getItem: (name) => {
      const value = localStorage.getItem(name)
      lastPersisted = value
      return value
    },
    setItem: (name, value) => {
      if (value === lastPersisted) return
      lastPersisted = value
      localStorage.setItem(name, value)
    },
    removeItem: (name) => {
      lastPersisted = null
      localStorage.removeItem(name)
    },
  }
})

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
      setBloomEnabled: (v) => set((s) => ({ bloomEnabled: v, sceneTransitioning: true, sceneKey: s.sceneKey + 1 })),
      cameraPos: { x: 0, y: 0, z: 0 },
      setCameraPos: (pos) => {
        const prev = get().cameraPos
        if (prev.x === pos.x && prev.y === pos.y && prev.z === pos.z) return
        set({ cameraPos: pos })
      },

      sceneTransitioning: false,
      setSceneTransitioning: (v) => set({ sceneTransitioning: v }),
      sceneKey: 0,
      qualityLevelIndex: 3,
      setQualityLevelIndex: (idx) => set((s) => ({ qualityLevelIndex: idx, sceneTransitioning: true, sceneKey: s.sceneKey + 1 })),
      qualityMode: 'auto',
      setQualityMode: (mode) => set({ qualityMode: mode }),
      performanceTested: false,
      setPerformanceTested: (v) => set({ performanceTested: v }),
      runPerformanceTest: () => {
        const samples = []
        return new Promise((resolve) => {
          let running = true
          let last = performance.now()
          const measure = () => {
            if (!running) return
            const now = performance.now()
            const delta = now - last
            last = now
            if (delta > 0) samples.push(1000 / delta)
            if (samples.length >= 90) {
              running = false
              samples.sort((a, b) => a - b)
              const avg = samples.reduce((a, b) => a + b, 0) / samples.length
              const p10 = samples[Math.floor(samples.length * 0.1)]
              let idx = 0
              if (avg >= 55 && p10 >= 45) idx = 3
              else if (avg >= 40 && p10 >= 30) idx = 2
              else if (avg >= 25) idx = 1
              set((s) => ({ qualityLevelIndex: idx, qualityMode: 'auto', performanceTested: true, sceneTransitioning: true, sceneKey: s.sceneKey + 1 }))
              resolve(LEVELS[idx])
              return
            }
            requestAnimationFrame(measure)
          }
          requestAnimationFrame(measure)
        })
      },



      renderSettings: {
        starfield: true,
        nebula: true,
        nebulaIntensity: 1.0,
        floatingParticles: true,
        shootingStars: true,
        blackHole: true,
        demonLabels: true,
        demonRings: true,
        demonGlow: true,
      },
      setRenderSetting: (key, value) => set((s) => ({
        renderSettings: { ...s.renderSettings, [key]: value }
      })),
      showSettings: false,
      setShowSettings: (v) => set({ showSettings: v }),

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
      storage: dedupedStorage,
      partialize: (state) => ({
        demons: state.demons,
        renderSettings: state.renderSettings,
        qualityLevelIndex: state.qualityLevelIndex,
        qualityMode: state.qualityMode,
        performanceTested: state.performanceTested,
      }),
    }
  )
)
