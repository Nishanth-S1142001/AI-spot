// lib/memoryStore.js
export let summaries = []

export function addSummary(newSummary) {
  summaries.length = 0
  const index = summaries.findIndex((s) => s.url === newSummary.url)
  if (index !== -1) {
    // Replace existing
    summaries[index] = newSummary
  } else {
    summaries.push(newSummary)
  }
}

export function clearSummaries() {
  summaries = []
}
