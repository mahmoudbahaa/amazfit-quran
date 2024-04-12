const playerInfo = {
  type: undefined,
  number: undefined,
  curVerse: undefined,
  curDownloadedVerse: undefined,
  verseStartTime: undefined
}

export class PlayerInfo {
  static get type () {
    return playerInfo.type
  }

  static set type (type) {
    playerInfo.type = type
  }

  static get number () {
    return playerInfo.type
  }

  static set number (num) {
    playerInfo.number = num
  }

  static set curVerse (curVerse) {
    playerInfo.curVerse = curVerse
  }

  static get curVerse () {
    return playerInfo.curVerse
  }

  static set curDownloadedVerse (curDownloadedVerse) {
    playerInfo.curDownloadedVerse = curDownloadedVerse
  }

  static get curDownloadedVerse () {
    return playerInfo.curDownloadedVerse
  }

  static set verseStartTime (verseStartTime) {
    playerInfo.verseStartTime = verseStartTime
  }

  static get verseStartTime () {
    return playerInfo.verseStartTime
  }

  static get continue () {
    return playerInfo.continue
  }

  static set continue (cont) {
    playerInfo.continue = cont
  }
}
