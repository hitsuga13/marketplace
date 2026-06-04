// Purpose: Small localStorage wrapper used by the mock browser database modules.
export const loadState = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch {
    return fallback
  }
}

export const saveState = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}
