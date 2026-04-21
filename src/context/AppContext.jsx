import { createContext, useContext, useState, useEffect } from 'react'
import { NIVELES } from '../data/actividades'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

const defaultEstado = {
  usuario: null,
  xp: 0,
  badges: [],
  completadas: [],
  checkinHoy: null,
  racha: 0,
  ultimaActividad: null,
}

const HOY_ISO = new Date().toISOString().split('T')[0]
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// ─── Caché de sesión ──────────────────────────────────────────────────────────
function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(key); return null }
    return data
  } catch { return null }
}
function cacheSet(key, data) {
  try { sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}
function cacheDel(key) {
  try { sessionStorage.removeItem(key) } catch {}
}

// ─── Estado del alumno (con caché de sesión) ─────────────────────────────────
async function cargarEstadoSupabase(no_control) {
  const key = `mochila_estado_${no_control}`
  const cached = cacheGet(key)
  if (cached) return cached

  const [estadoRes, checkinRes] = await Promise.all([
    supabase.from('estado_alumno')
      .select('xp, badges, completadas, racha, ultima_actividad')
      .eq('no_control', no_control).maybeSingle(),
    supabase.from('checkins')
      .select('emocion')
      .eq('no_control', no_control).eq('fecha', HOY_ISO).maybeSingle(),
  ])

  const result = {
    xp: estadoRes.data?.xp || 0,
    badges: estadoRes.data?.badges || [],
    completadas: estadoRes.data?.completadas || [],
    racha: estadoRes.data?.racha || 0,
    ultimaActividad: estadoRes.data?.ultima_actividad || null,
    checkinHoy: checkinRes.data
      ? { emocion: checkinRes.data.emocion, fecha: new Date().toDateString() }
      : null,
  }
  cacheSet(key, result)
  return result
}

// ─── Queries públicas ─────────────────────────────────────────────────────────

// Lista ligera del docente — sin JSONB pesado, paginada
export async function getSubmissions({ limit = 50, offset = 0 } = {}) {
  const { data } = await supabase
    .from('evidencias')
    .select(`
      id,
      no_control,
      nombre,
      ambito_id,
      created_at,
      titulo:evidencia->>titulo,
      tipo:evidencia->>tipo,
      icono:evidencia->>icono,
      ambitoEmoji:evidencia->>ambitoEmoji,
      subtipo:evidencia->>subtipo
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  return (data || []).map(row => ({
    id: row.id,
    alumno: { nombre: row.nombre, matricula: row.no_control },
    ambitoId: row.ambito_id,
    fecha: new Date(row.created_at).toLocaleString('es-MX'),
    titulo: row.titulo,
    tipo: row.tipo,
    icono: row.icono,
    ambitoEmoji: row.ambitoEmoji,
    subtipo: row.subtipo,
  }))
}

// Detalle completo de una evidencia (fotos/texto) — solo al abrir
export async function getSubmissionDetail(id) {
  const { data } = await supabase
    .from('evidencias')
    .select('evidencia')
    .eq('id', id)
    .maybeSingle()
  return data?.evidencia || {}
}

// Checkins de los últimos 14 días únicamente
export async function getCheckins() {
  const hace14 = new Date()
  hace14.setDate(hace14.getDate() - 14)
  const { data } = await supabase
    .from('checkins')
    .select('no_control, nombre, emocion, fecha, fecha_hora')
    .gte('fecha', hace14.toISOString().split('T')[0])
    .order('fecha_hora', { ascending: false })
  return (data || []).map(row => ({
    matricula: row.no_control,
    nombre: row.nombre,
    emocion: row.emocion,
    fecha: new Date(row.fecha + 'T12:00:00').toDateString(),
    fechaHora: new Date(row.fecha_hora).toLocaleString('es-MX'),
  }))
}

// Solo los campos necesarios para la lista de alumnos
export async function getAllAlumnos() {
  const { data } = await supabase
    .from('alumnos')
    .select('no_control, nombre, grupo')
    .order('nombre')
  return data || []
}

// Solo los campos que usa el panel — excluye updated_at innecesario
export async function getEstadoAlumnos() {
  const { data } = await supabase
    .from('estado_alumno')
    .select('no_control, xp, racha, badges, completadas')
  return data || []
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [estado, setEstado] = useState({ ...defaultEstado })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const sesion = localStorage.getItem('mochila_sesion_activa')
        if (sesion) {
          const { no_control, nombre, rol } = JSON.parse(sesion)
          if (rol === 'docente') {
            setEstado(e => ({ ...e, usuario: { no_control, nombre, rol } }))
          } else {
            const datos = await cargarEstadoSupabase(no_control)
            setEstado({ usuario: { no_control, nombre, rol }, ...datos })
          }
        }
      } catch (e) {
        console.error('Error init:', e)
      }
      setCargando(false)
    }
    init()
  }, [])

  const login = async (pin, rol) => {
    if (rol === 'docente') {
      if (pin !== 'PROF179') return { error: 'Código incorrecto' }
      const usuario = { no_control: 'DOCENTE', nombre: 'Luis Eduardo Ibarra Hernández', rol: 'docente' }
      localStorage.setItem('mochila_sesion_activa', JSON.stringify(usuario))
      setEstado(e => ({ ...e, usuario }))
      return { success: true }
    }

    const { data, error } = await supabase
      .from('alumnos')
      .select('no_control, nombre')       // solo lo que necesitamos
      .eq('pin', pin.padStart(4, '0'))
      .maybeSingle()

    if (error || !data) return { error: 'PIN no encontrado. Verifica tus últimos 4 dígitos.' }

    const datos = await cargarEstadoSupabase(data.no_control)
    const usuario = { no_control: data.no_control, nombre: data.nombre, rol: 'alumno' }
    setEstado({ usuario, ...datos })
    localStorage.setItem('mochila_sesion_activa', JSON.stringify(usuario))
    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem('mochila_sesion_activa')
    window.location.reload()
  }

  const registrarCheckin = async (emocion) => {
    const hoy = new Date().toDateString()
    setEstado(e => ({ ...e, checkinHoy: { emocion, fecha: hoy } }))
    const no_control = estado.usuario?.no_control
    if (!no_control) return
    // Invalidar caché para que la próxima carga refleje el checkin
    cacheDel(`mochila_estado_${no_control}`)
    await supabase.from('checkins').upsert({
      no_control,
      nombre: estado.usuario.nombre,
      emocion,
      fecha: HOY_ISO,
      fecha_hora: new Date().toISOString(),
    }, { onConflict: 'no_control,fecha' })
  }

  const completarActividad = async (actividadId, ambitoId, xpGanado, badge, evidencia) => {
    if (estado.completadas.includes(actividadId)) return
    const nuevoXP = estado.xp + xpGanado
    const nuevasBadges = badge && !estado.badges.includes(badge)
      ? [...estado.badges, badge] : estado.badges
    const nuevasCompletadas = [...estado.completadas, actividadId]

    setEstado(e => ({
      ...e,
      xp: nuevoXP,
      badges: nuevasBadges,
      completadas: nuevasCompletadas,
      ultimaActividad: new Date().toDateString(),
    }))

    const no_control = estado.usuario?.no_control
    if (!no_control) return

    // Invalidar caché de estado para reflejar el progreso actualizado
    cacheDel(`mochila_estado_${no_control}`)

    const ops = [
      supabase.from('estado_alumno').upsert({
        no_control,
        xp: nuevoXP,
        badges: nuevasBadges,
        completadas: nuevasCompletadas,
        ultima_actividad: HOY_ISO,
        updated_at: new Date().toISOString(),
      }),
    ]
    if (evidencia) {
      ops.push(supabase.from('evidencias').insert({
        no_control,
        nombre: estado.usuario.nombre,
        actividad_id: actividadId,
        ambito_id: ambitoId,
        evidencia,
      }))
    }
    await Promise.all(ops)
  }

  const getNivel = () => NIVELES.findLast(n => estado.xp >= n.minXP) || NIVELES[0]

  const getProgreso = () => {
    const nivel = getNivel()
    const xpEnNivel = estado.xp - nivel.minXP
    const xpNecesario = nivel.maxXP - nivel.minXP
    return Math.min((xpEnNivel / xpNecesario) * 100, 100)
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center text-white space-y-3">
          <div className="text-7xl animate-bounce">🎒</div>
          <p className="font-bold text-xl">Cargando...</p>
          <p className="text-purple-200 text-sm">Mochila Socioemocional</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ estado, login, logout, registrarCheckin, completarActividad, getNivel, getProgreso }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
