import { describe, it, expect } from 'vitest'
import { scoreGame, type FrameInput } from './scoring'

function f(r1: number | null, r2: number | null = null, r3: number | null = null): FrameInput {
  return { roll1: r1, roll2: r2, roll3: r3 }
}

function strike(): FrameInput { return f(10) }
function spare(r1: number): FrameInput { return f(r1, 10 - r1) }
function open(r1: number, r2: number): FrameInput { return f(r1, r2) }

describe('scoreGame', () => {
  it('perfect game = 300', () => {
    const frames: FrameInput[] = [
      ...Array(9).fill(null).map(() => strike()),
      f(10, 10, 10), // 10th frame
    ]
    const results = scoreGame(frames)
    expect(results[9].cumulative).toBe(300)
    expect(results.every((r) => r.resultType === 'strike')).toBe(true)
  })

  it('all spares with 5 = 150', () => {
    const frames: FrameInput[] = [
      ...Array(9).fill(null).map(() => spare(5)),
      f(5, 5, 5), // 10th spare + bonus
    ]
    const results = scoreGame(frames)
    expect(results[9].cumulative).toBe(150)
  })

  it('open game: 3+4 every frame = 70', () => {
    const frames = Array(10).fill(null).map(() => open(3, 4)) as FrameInput[]
    const results = scoreGame(frames)
    expect(results[9].cumulative).toBe(70)
  })

  it('turkey in frames 1-3, rest open', () => {
    const frames: FrameInput[] = [
      strike(), strike(), strike(),
      ...Array(7).fill(null).map(() => open(3, 4)),
    ]
    const results = scoreGame(frames)
    // frame1: 10+10+10=30, frame2: 10+10+3=23, frame3: 10+3+4=17, frames4-10: 7*7=49 → total 119
    expect(results[9].cumulative).toBe(119)
  })

  it('spare in frame 10 with bonus roll', () => {
    const frames: FrameInput[] = [
      ...Array(9).fill(null).map(() => open(3, 4)),
      f(5, 5, 7), // 10th: spare + 7
    ]
    const results = scoreGame(frames)
    // 9 frames of 7 = 63, 10th = 5+5+7 = 17 → 80
    expect(results[9].cumulative).toBe(80)
  })

  it('strike in 10th with two bonus rolls', () => {
    const frames: FrameInput[] = [
      ...Array(9).fill(null).map(() => open(3, 4)),
      f(10, 7, 2), // 10th: strike + 7 + 2
    ]
    const results = scoreGame(frames)
    // 9×7=63, 10th=19 → 82
    expect(results[9].cumulative).toBe(82)
  })

  it('frames with null rolls return null frame score (incomplete)', () => {
    const frames: FrameInput[] = [f(null)]
    const results = scoreGame(frames)
    expect(results[0].frameScore).toBeNull()
    expect(results[0].resultType).toBe('incomplete')
  })

  it('spare awaiting bonus shows null frame score', () => {
    const frames: FrameInput[] = [spare(6)]
    const results = scoreGame(frames)
    // No next frame yet
    expect(results[0].frameScore).toBeNull()
    expect(results[0].resultType).toBe('spare')
  })

  it('strike followed by open frame resolves correctly', () => {
    const frames: FrameInput[] = [strike(), open(3, 4)]
    const results = scoreGame(frames)
    expect(results[0].frameScore).toBe(17)
    expect(results[1].frameScore).toBe(7)
    expect(results[1].cumulative).toBe(24)
  })
})
