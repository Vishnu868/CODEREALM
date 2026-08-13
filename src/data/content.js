/**
 * Runtime content loader.
 *
 * Missions are fetched from /content/, which is emitted by `npm run
 * content:build`. Two consequences worth knowing:
 *
 *  - Fixing a typo in a mission is a content push, not an app redeploy.
 *  - The JS bundle stays the same size whether there are 5 missions or 500.
 *    Only the index (a few bytes per mission) loads up front; a mission's
 *    problem text, reference solution and generator load when it is opened.
 */

const cache = new Map()
let indexPromise = null

/** Loads the campaign index: enough to draw the map, nothing more. */
export function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch('/content/index.json')
      .then((r) => {
        if (!r.ok) throw new Error(`content index unavailable (${r.status})`)
        return r.json()
      })
      .then((data) => ({
        ...data,
        missions: [...data.missions].sort((a, b) => a.level - b.level)
      }))
      .catch((err) => {
        indexPromise = null
        throw err
      })
  }
  return indexPromise
}

/**
 * Loads one full mission and hydrates its executable parts.
 *
 * `refSrc` and `genSrc` are evaluated here. They are first-party content served
 * from our own origin, and the whole verification model already runs
 * player-authored code in this browser — see SECURITY.md. This adds no
 * privilege that the game does not already exercise by design.
 */
export async function loadMission(id) {
  if (cache.has(id)) return cache.get(id)

  const res = await fetch(`/content/${id}.json`)
  if (!res.ok) throw new Error(`mission ${id} unavailable (${res.status})`)
  const doc = await res.json()

  const mission = {
    ...doc,
    ref: new Function(doc.refSrc)(),
    gen: new Function(doc.genSrc)()
  }
  delete mission.refSrc
  delete mission.genSrc

  cache.set(id, mission)
  return mission
}

/** Language weights, measured by `npm run content:measure`, not guessed. */
export function weightsFrom(index) {
  return index?.calibration?.weights ?? { javascript: 1, python: 5 }
}
