import { create, id } from 'zeppos-cross-api/media'

const START_AFTER = 100
const COMPLETE_AFTER = 10000
export class Player {
  #player
  constructor (playCallback, completeCallBack) {
    try {
      this.#player = new RealPlayer(create(id.PLAYER), playCallback, completeCallBack)
    } catch (err) {
      this.#player = new DummyPlayer(playCallback, completeCallBack)
    }
  }

  play () {
    this.#player.play()
  }

  pause () {
    this.#player.pause()
  }

  resume () {
    this.#player.resume()
  }

  stop () {
    this.#player.stop()
  }

  release () {
    this.#player.stop()
  }

  setSource (path) {
    this.#player.setSource(path)
  }

  isStarted () {
    return this.#player.isStarted()
  }

  isPaused () {
    return this.#player.isPaused()
  }

  incrVolume (volumneIncrement) {
    this.#player.incrVolume(volumneIncrement)
  }
}

class RealPlayer {
  #player
  constructor (player, playCallback, completeCallBack) {
    this.#player = player
    this.#player.addEventListener(this.#player.event.PREPARE, (result) => {
      if (result) {
        if (playCallback) {
          playCallback()
        }
        this.#player.start()
      } else {
        console.log('=== prepare fail ===')
        this.#player.release()
      }
    })

    if (completeCallBack) {
      this.#player.addEventListener(this.#player.event.COMPLETE, (result) => {
        completeCallBack()
      })
    }
  }

  play () {
    this.#player.prepare()
  }

  pause () {
    this.#player.pause()
  }

  resume () {
    this.#player.resume()
  }

  stop () {
    this.#player.stop()
  }

  release () {
    this.#player.release()
  }

  setSource (path) {
    this.#player.setSource(this.#player.source.FILE, { file: path })
  }

  isStarted () {
    return this.#player.getStatus() === (this.#player.state.STARTED || 5) ||
  this.#player.getStatus() === (this.#player.state.PREPARED || 3) ||
  this.#player.getStatus() === (this.#player.state.PREPARING || 2)
  }

  isPaused () {
    return this.#player.getStatus() === this.#player.state.PAUSED
  }

  incrVolume (volumneIncrement) {
    this.#player.setVolume(this.#player.getVolume() + volumneIncrement)
  }
}

class DummyPlayer {
  #isPlaying
  #playCallback
  #completeCallBack

  constructor (playCallback, completeCallBack) {
    this.#isPlaying = false
    this.#playCallback = playCallback
    this.#completeCallBack = completeCallBack
  }

  play () {
    this.#isPlaying = true
    if (this.#playCallback) setTimeout(() => this.#playCallback(), START_AFTER)

    setTimeout(() => {
      this.#isPlaying = false
      if (this.#completeCallBack) this.#completeCallBack()
    }, COMPLETE_AFTER)
  }

  pause () {
    this.#isPlaying = false
  }

  resume () {
    this.#isPlaying = true
  }

  stop () {
    this.#isPlaying = false
  }

  release () {
    this.#isPlaying = false
  }

  setSource (path) {
    // Do Nothing
  }

  isStarted () {
    return this.#isPlaying
  }

  isPaused () {
    return !this.#isPlaying
  }

  incrVolume (volumneIncrement) {
    // Do Nothing
  }
}
