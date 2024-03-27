export const NUM_CHAPTERS = 30
export const NUM_VERSES = [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111,
  110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59,
  37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28,
  20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11,
  8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6]

export const PLAYER_BUFFER_SIZE = 5

export const NUM_PAGES = 4 // Use 3 or more see below

export const NEW_CHAPTERS_PER_JUZ = [
  2, 0, 1, 1, 0, 1, 1, 1, 1, 1,
  2, 1, 2, 2, 2, 2, 2, 3, 2, 2,
  4, 3, 3, 2, 4, 6, 6, 9, 11, 37
]

const NUM_PER_PAGE = Math.ceil(144 / NUM_PAGES)
let idx = 0
let chaptersNum = 0

export const CHAPTERS_PAGE_BOUNDARIES = Array.from({ length: NUM_PAGES + 1 })
  .fill(0)
  .map((_, i) => {
    if (i === 0) return 0
    if (i === NUM_PAGES) return NUM_CHAPTERS

    chaptersNum++
    while (idx < 30 && chaptersNum < (i * NUM_PER_PAGE)) {
      chaptersNum += NEW_CHAPTERS_PER_JUZ[idx]
      idx++
    }
    idx--
    return idx
  })

console.log(CHAPTERS_PAGE_BOUNDARIES)
