// lib/memoryStore.js
export let summaries = [];

export function addSummary(summary) {
  summaries.push(summary);
}

export function clearSummaries() {
  summaries = [];
}
    