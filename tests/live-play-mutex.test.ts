import { describe, expect, it } from 'vitest'
import { enqueueLivePlay } from '../shared/live-play-mutex'

describe('enqueueLivePlay', () => {
  it('runs tasks one after another', async () => {
    const order: number[] = []

    const first = enqueueLivePlay(async () => {
      await new Promise(r => setTimeout(r, 30))
      order.push(1)
    })
    const second = enqueueLivePlay(async () => {
      order.push(2)
    })

    await Promise.all([first, second])
    expect(order).toEqual([1, 2])
  })

  it('continues the chain after a rejected task', async () => {
    const order: number[] = []

    await enqueueLivePlay(async () => {
      order.push(1)
      throw new Error('reject')
    }).catch(() => {})

    await enqueueLivePlay(async () => {
      order.push(2)
    })

    expect(order).toEqual([1, 2])
  })
})
