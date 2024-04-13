import { getScrollTop, scrollTo } from 'zeppos-cross-api/page';
import {
  getChapter, getChaptersLang,
  getChaptersListRow,
  getFontSize,
  getLang,
  setChaptersListRow,
  useSimpleSurahName,
} from '../lib/config/default';
import { getVerseMapping } from '../lib/config/juzs';
import {
  NUM_JUZS, NUM_PAGES, PLAYER_TYPE_CHAPTER, PLAYER_TYPE_JUZ,
} from '../lib/constants';
import { getGlobal } from '../lib/global';
import { _, isRtlLang } from '../lib/i18n/lang';
import { ListScreen } from '../lib/mmk/ListScreen';
import {
  MAIN_COLOR,
  MAIN_COLOR_TXT,
  SECONDARY_COLOR,
  SECONDARY_COLOR_TXT,
  WARNING_COLOR,
  WARNING_COLOR_TXT,
} from '../lib/mmk/UiParams';
import { openPage } from '../lib/utils';

const playerPage = 'page/player';
const NUM_ROWS = 144;
const NUM_PER_PAGE = Math.ceil(NUM_ROWS / NUM_PAGES);
export class ChaptersScreen extends ListScreen {
  #pageNumber;
  #start;
  #end;

  constructor() {
    super(isRtlLang());
    this.fontSize = getFontSize();
  }

  start() {
    this.#render();
  }

  #render() {
    this.#pageNumber = getGlobal().pageNumber;
    this.#start = this.#pageNumber * NUM_PER_PAGE;
    this.#end = this.#start + pageLength(this.#pageNumber);
    let pos = 0;
    if (this.#pageNumber > 0) {
      this.replaceOrCreateRow(this.#addNextPreviousButton('Previous', this.#pageNumber - 1), pos++);
    }

    for (let i = this.#start; i < this.#end; i++) {
      this.replaceOrCreateRow(this.#getRow(i), pos++);
    }

    if (this.#pageNumber < (NUM_PAGES - 1)) {
      this.replaceOrCreateRow(this.#addNextPreviousButton('Next', this.#pageNumber + 1), pos++);
    }

    this.replaceOrCreateRow({ }, pos++);
    this.finalize(pos, getGlobal().scrollTop);
  }

  #getRow(rowNumber) {
    const row = getRow(rowNumber);
    row.card = {
      callback() {
        getGlobal().scrollTop = getScrollTop();
        openPage(playerPage, `type=${row.type}&number=${row.number}`);
      },
    };

    return row;
  }

  #addNextPreviousButton(label, pageNumber) {
    return {
      text: _(label),
      color: WARNING_COLOR_TXT,
      card: {
        color: 0x123456,
        callback: () => {
          getGlobal().pageNumber = pageNumber;
          scrollTo({ y: 0 });
          this.#render();
        },
      },
      iconText: this.rtl ? label === 'Next' ? '←' : '→' : label === 'Next' ? '→' : '←',
      iconColor: WARNING_COLOR,
    };
  }
}

function pageLength(pageNumber) {
  return pageNumber === (NUM_PAGES - 1) ? (((NUM_ROWS - 1) % NUM_PER_PAGE) + 1) : NUM_PER_PAGE;
}

export function getRow(rowNumber) {
  const row = getChaptersListRow(rowNumber);
  if (row !== undefined) {
    return row;
  }

  const rows = [];
  const uiAr = getLang() === 'ar';
  const chaptersAr = getChaptersLang() === 'ar';
  const excludeTranslation = uiAr && chaptersAr;
  const useSimpleNames = useSimpleSurahName() === 'true';
  const nameKey = uiAr ? 'nameArabic' : (useSimpleNames ? 'nameSimple' : 'nameComplex');
  let lastSurahNumber = -1;
  for (let i = 0; i < NUM_JUZS; i++) {
    rows.push(addJuzRow(i + 1));
    const verseMapping = getVerseMapping(i);
    // eslint-disable-next-line guard-for-in
    for (const surahNumberAttr in verseMapping) {
      const surahNumber = typeof surahNumberAttr === 'number' ? surahNumberAttr : parseInt(surahNumberAttr, 10);
      if (lastSurahNumber === surahNumber) {
        continue;
      }

      const chapter = getChapter(surahNumber - 1);
      const name = chapter[nameKey];
      const translation = excludeTranslation ? '' : (chaptersAr ? chapter.nameArabic : chapter.translatedName);
      rows.push(addChapterRow(surahNumber, name, translation));
      lastSurahNumber = surahNumber;
    }
  }

  for (let i = 0; i < rows.length; i++) {
    setChaptersListRow(i, rows[i]);
  }

  console.log('Initialized Rows');
  return rows[rowNumber];
}

function addJuzRow(juzNumber) {
  return {
    type: PLAYER_TYPE_JUZ,
    number: juzNumber,
    text: `${_('Juz\'')} ${_(`${juzNumber}`)}`,
    color: MAIN_COLOR_TXT,
    iconColor: MAIN_COLOR,
  };
}

function addChapterRow(surahNumber, name, translation) {
  return {
    type: PLAYER_TYPE_CHAPTER,
    number: surahNumber,
    text: `${_('Surah')} ${name}`,
    color: SECONDARY_COLOR_TXT,
    description: translation,
    iconText: _(surahNumber),
    iconColor: SECONDARY_COLOR,
  };
}
