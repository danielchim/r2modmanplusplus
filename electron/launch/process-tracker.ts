/**
 * Process tracking for launched games
 * Maintains in-memory map of running processes by gameId
 */

interface TrackedProcess {
  gameId: string
  pid: number
  startedAt: number
}

/**
 * In-memory map of running processes
 * Key: gameId, Value: TrackedProcess
 */
const runningProcesses = new Map<string, TrackedProcess>()

/**
 * Checks if a process is still alive
 * Uses process.kill(pid, 0) which doesn't kill but throws if process doesn't exist
 */
function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Tracks a new process for a game
 */
export function trackProcess(gameId: string, pid: number): void {
  runningProcesses.set(gameId, {
    gameId,
    pid,
    startedAt: Date.now(),
  })
  console.log(`[ProcessTracker] Tracking process for ${gameId}: pid=${pid}`)
}

/**
 * Gets process status for a game
 * Automatically clears stale entries
 */
export function getProcessStatus(gameId: string): { running: boolean; pid?: number } {
  const tracked = runningProcesses.get(gameId)
  
  if (!tracked) {
    return { running: false }
  }
  
  // Check if process is still alive
  if (!isProcessAlive(tracked.pid)) {
    console.log(`[ProcessTracker] Process ${tracked.pid} for ${gameId} has exited, clearing`)
    runningProcesses.delete(gameId)
    return { running: false }
  }
  
  return {
    running: true,
    pid: tracked.pid,
  }
}

/**
 * Manually clears tracking for a game
 */
export function clearTracking(gameId: string): void {
  runningProcesses.delete(gameId)
}

/**
 * Gets all tracked processes
 */
export function getAllTrackedProcesses(): TrackedProcess[] {
  return Array.from(runningProcesses.values())
}
