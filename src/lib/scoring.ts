export interface FrameInput {
  roll1: number | null
  roll2: number | null
  roll3: number | null // only meaningful in frame 10
}

export interface FrameResult {
  frameScore: number | null       // null while awaiting bonus rolls
  cumulative: number | null
  resultType: 'strike' | 'spare' | 'open' | 'foul' | 'incomplete'
  isStrike: boolean
  isSpare: boolean
}

function isStrikeFrame(f: FrameInput): boolean {
  return f.roll1 === 10
}

function isSpareFrame(f: FrameInput): boolean {
  return f.roll1 !== null && f.roll2 !== null && f.roll1 !== 10 && f.roll1 + f.roll2 === 10
}

function rv(v: number | null): number {
  return v ?? 0
}

// Returns the first two bonus rolls that follow frame[i] for strike scoring.
// Frame indices are 0-based; the last (10th) frame is index 9.
function getBonusRolls(frames: FrameInput[], i: number): [number | null, number | null] {
  const next = frames[i + 1]
  if (!next) return [null, null]

  const b1 = next.roll1

  let b2: number | null
  if (i + 1 === 9) {
    // Next frame is the 10th — its roll2 is the second bonus roll for our strike.
    b2 = next.roll2
  } else if (isStrikeFrame(next)) {
    // Next is also a strike in frames 1-9; bonus roll 2 comes from the frame after that.
    const afterNext = frames[i + 2]
    b2 = afterNext ? afterNext.roll1 : null
  } else {
    b2 = next.roll2
  }

  return [b1, b2]
}

export function scoreGame(frames: FrameInput[]): FrameResult[] {
  const results: FrameResult[] = []
  let cumulative = 0

  for (let i = 0; i < Math.min(frames.length, 10); i++) {
    const f = frames[i]
    const isLast = i === 9

    const strike = isStrikeFrame(f)
    const spare = !strike && isSpareFrame(f)

    let frameScore: number | null = null
    let resultType: FrameResult['resultType'] = 'incomplete'

    if (f.roll1 === null) {
      resultType = 'incomplete'
    } else if (isLast) {
      // 10th frame: sum all rolls actually entered
      if (f.roll2 !== null) {
        if (!strike && !spare) {
          frameScore = rv(f.roll1) + rv(f.roll2)
          resultType = 'open'
        } else if (f.roll3 !== null) {
          frameScore = rv(f.roll1) + rv(f.roll2) + rv(f.roll3)
          resultType = strike ? 'strike' : 'spare'
        } else {
          resultType = strike ? 'strike' : 'spare'
        }
      } else {
        resultType = strike ? 'strike' : 'incomplete'
      }
    } else if (strike) {
      const [b1, b2] = getBonusRolls(frames, i)
      if (b1 !== null && b2 !== null) {
        frameScore = 10 + b1 + b2
      }
      resultType = 'strike'
    } else if (spare) {
      const next = frames[i + 1]
      const b1 = next ? next.roll1 : null
      if (b1 !== null) {
        frameScore = 10 + b1
      }
      resultType = 'spare'
    } else if (f.roll2 !== null) {
      frameScore = rv(f.roll1) + rv(f.roll2)
      resultType = 'open'
    }

    if (frameScore !== null) cumulative += frameScore
    results.push({
      frameScore,
      cumulative: frameScore !== null ? cumulative : null,
      resultType,
      isStrike: strike,
      isSpare: spare,
    })
  }

  return results
}

export function pinsLeft(frame: FrameInput, afterRoll: 1 | 2): number {
  if (afterRoll === 1) return 10 - rv(frame.roll1)
  if (frame.roll1 === 10) return 10 // after strike, all pins re-set
  return 10 - rv(frame.roll1) - rv(frame.roll2)
}

export { isStrikeFrame as isStrike, isSpareFrame as isSpare }
