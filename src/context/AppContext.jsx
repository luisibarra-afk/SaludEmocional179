import { createContext, useContext, useState, useEffect } from 'react'
import { NIVELES } from '../data/actividades'

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

// Estado por matrícula para que cada alumno tenga el suyo
const cargarEstadoUsuario = (matricula) => {
  try {
    const key = `mochila_estado_${matricula}`
    const guardado = localStorage.getItem(key)
    return guardado ? JSON.parse(guardado) : { ...defaultEstado }
  } catch {
    return { ...defaultEstado }
  }
}

const guardarEstadoUsuario = (matricula, estado) => {
  try {
    localStorage.setItem(`mochila_estado_${matricula}`, JSON.stringify(estado))
  } catch {}
}

// Store compartido de submissions (para que el docente las vea)
export const getSubmissions = () => {
  try {
    return JSON.parse(localStorage.getItem('mochila_submissions') || '[]')
  } catch { return [] }
}

const addSubmission = (sub) => {
  const subs = getSubmissions()
  const nuevas = [sub, ...subs].slice(0, 200) // máx 200 entradas
  localStorage.setItem('mochila_submissions', JSON.stringify(nuevas))
}

// Store compartido de check-ins emocionales
export const getCheckins = () => {
  try {
    return JSON.parse(localStorage.getItem('mochila_checkins') || '[]')
  } catch { return [] }
}

const addCheckinStore = (entry) => {
  const lista = getCheckins()
  // Evitar duplicado del mismo alumno en el mismo día
  const filtrada = lista.filter(c => !(c.matricula === entry.matricula && c.fecha === entry.fecha))
  const nueva = [entry, ...filtrada].slice(0, 500)
  localStorage.setItem('mochila_checkins', JSON.stringify(nueva))
}

export function AppProvider({ children }) {
  const [estado, setEstado] = useState(() => {
    try {
      const sesion = localStorage.getItem('mochila_sesion_activa')
      if (sesion) {
        const { matricula } = JSON.parse(sesion)
        const estadoGuardado = cargarEstadoUsuario(matricula)
        return { ...estadoGuardado }
      }
    } catch {}
    return { ...defaultEstado }
  })

  // Guardar estado cuando cambia (solo si hay usuario)
  useEffect(() => {
    if (estado.usuario?.matricula) {
      guardarEstadoUsuario(estado.usuario.matricula, estado)
    }
  }, [estado])

  const login = (matricula, nombre, rol = 'alumno') => {
    const estadoPrevio = cargarEstadoUsuario(matricula)
    const nuevoEstado = { ...estadoPrevio, usuario: { matricula, nombre, rol } }
    setEstado(nuevoEstado)
    localStorage.setItem('mochila_sesion_activa', JSON.stringify({ matricula, nombre, rol }))
  }

  const logout = () => {
    localStorage.removeItem('mochila_sesion_activa')
    window.location.href = '/'
  }

  const registrarCheckin = (emocion) => {
    const hoy = new Date().toDateString()
    setEstado(e => ({
      ...e,
      checkinHoy: { emocion, fecha: hoy },
    }))
    // Guardar en store compartido para que el docente lo vea
    addCheckinStore({
      matricula: estado.usuario?.matricula,
      nombre: estado.usuario?.nombre,
      emocion,
      fecha: hoy,
      fechaHora: new Date().toLocaleString('es-MX'),
    })
  }

  const completarActividad = (actividadId, ambitoId, xpGanado, badge, evidencia) => {
    if (estado.completadas.includes(actividadId)) return
    setEstado(e => ({
      ...e,
      xp: e.xp + xpGanado,
      badges: badge && !e.badges.includes(badge) ? [...e.badges, badge] : e.badges,
      completadas: [...e.completadas, actividadId],
      ultimaActividad: new Date().toDateString(),
      racha: e.ultimaActividad === new Date(Date.now() - 86400000).toDateString()
        ? e.racha + 1 : e.racha,
    }))
    // Guardar submission para el docente
    if (evidencia) {
      addSubmission({
        id: `${actividadId}_${Date.now()}`,
        alumno: { nombre: estado.usuario?.nombre, matricula: estado.usuario?.matricula },
        ambitoId,
        actividadId,
        ...evidencia,
        fecha: new Date().toLocaleString('es-MX'),
      })
    }
  }

  const getNivel = () => NIVELES.findLast(n => estado.xp >= n.minXP) || NIVELES[0]

  const getProgreso = () => {
    const nivel = getNivel()
    const xpEnNivel = estado.xp - nivel.minXP
    const xpNecesario = nivel.maxXP - nivel.minXP
    return Math.min((xpEnNivel / xpNecesario) * 100, 100)
  }

  return (
    <AppContext.Provider value={{ estado, login, logout, registrarCheckin, completarActividad, getNivel, getProgreso }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
