import { useEffect, useState } from 'react'

// Uploaded images, audio and video live in the browser's IndexedDB, so large
// files never touch localStorage. If IndexedDB is unavailable they are kept in
// memory for this visit only.
const DB = 'swaane-studio'
const STORE = 'media'
const memory = new Map<string, Blob>()
let dbPromise: Promise<IDBDatabase | null> | null = null

function db(): Promise<IDBDatabase | null> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB, 1)
        req.onupgradeneeded = () => req.result.createObjectStore(STORE)
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => resolve(null)
      } catch {
        resolve(null)
      }
    })
  }
  return dbPromise
}

export async function putMedia(id: string, blob: Blob): Promise<boolean> {
  const d = await db()
  if (!d) {
    memory.set(id, blob)
    return false
  }
  return new Promise((resolve) => {
    try {
      const tx = d.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(blob, id)
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => {
        memory.set(id, blob)
        resolve(false)
      }
    } catch {
      memory.set(id, blob)
      resolve(false)
    }
  })
}

export async function getMedia(id: string): Promise<Blob | undefined> {
  if (memory.has(id)) return memory.get(id)
  const d = await db()
  if (!d) return undefined
  return new Promise((resolve) => {
    try {
      const req = d.transaction(STORE, 'readonly').objectStore(STORE).get(id)
      req.onsuccess = () => resolve(req.result as Blob | undefined)
      req.onerror = () => resolve(undefined)
    } catch {
      resolve(undefined)
    }
  })
}

export async function deleteMedia(id: string) {
  memory.delete(id)
  const d = await db()
  if (!d) return
  try {
    d.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)
  } catch {
    /* ignore */
  }
}

export function useMediaUrl(id: string | undefined): string | undefined {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!id) return
    let alive = true
    let made: string | undefined
    getMedia(id).then((blob) => {
      if (!alive || !blob) return
      made = URL.createObjectURL(blob)
      setUrl(made)
    })
    return () => {
      alive = false
      if (made) URL.revokeObjectURL(made)
      setUrl(undefined)
    }
  }, [id])
  return url
}
