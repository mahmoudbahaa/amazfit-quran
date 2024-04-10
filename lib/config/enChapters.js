import { NUM_CHAPTERS } from '../constants'
import { setChapter } from './default'

export function setEnChapters (cb) {
  const chapters = {
    chapters: getChapters()
  }
  for (let i = 0; i < NUM_CHAPTERS; i++) {
    setChapter(i, chapters.chapters[i])
  }

  delete chapters.chapters
}

function getChapters () {
  return [{
    name_simple: 'Al-Fatihah',
    name_complex: 'Al-Fātiĥah',
    name_arabic: 'الفاتحة',
    translated_name: 'The Opener'
  }, {
    name_simple: 'Al-Baqarah',
    name_complex: 'Al-Baqarah',
    name_arabic: 'البقرة',
    translated_name: 'The Cow'
  }, {
    name_simple: 'Ali \'Imran',
    name_complex: 'Āli `Imrān',
    name_arabic: 'آل عمران',
    translated_name: 'Family of Imran'
  }, {
    name_simple: 'An-Nisa',
    name_complex: 'An-Nisā',
    name_arabic: 'النساء',
    translated_name: 'The Women'
  }, {
    name_simple: 'Al-Ma\'idah',
    name_complex: 'Al-Mā\'idah',
    name_arabic: 'المائدة',
    translated_name: 'The Table Spread'
  }, {
    name_simple: 'Al-An\'am',
    name_complex: 'Al-\'An`ām',
    name_arabic: 'الأنعام',
    translated_name: 'The Cattle'
  }, {
    name_simple: 'Al-A\'raf',
    name_complex: 'Al-\'A`rāf',
    name_arabic: 'الأعراف',
    translated_name: 'The Heights'
  }, {
    name_simple: 'Al-Anfal',
    name_complex: 'Al-\'Anfāl',
    name_arabic: 'الأنفال',
    translated_name: 'The Spoils of War'
  }, {
    name_simple: 'At-Tawbah',
    name_complex: 'At-Tawbah',
    name_arabic: 'التوبة',
    translated_name: 'The Repentance'
  }, {
    name_simple: 'Yunus',
    name_complex: 'Yūnus',
    name_arabic: 'يونس',
    translated_name: 'Jonah'
  }, {
    name_simple: 'Hud',
    name_complex: 'Hūd',
    name_arabic: 'هود',
    translated_name: 'Hud'
  }, {
    name_simple: 'Yusuf',
    name_complex: 'Yūsuf',
    name_arabic: 'يوسف',
    translated_name: 'Joseph'
  }, {
    name_simple: 'Ar-Ra\'d',
    name_complex: 'Ar-Ra`d',
    name_arabic: 'الرعد',
    translated_name: 'The Thunder'
  }, {
    name_simple: 'Ibrahim',
    name_complex: 'Ibrāhīm',
    name_arabic: 'ابراهيم',
    translated_name: 'Abraham'
  }, {
    name_simple: 'Al-Hijr',
    name_complex: 'Al-Ĥijr',
    name_arabic: 'الحجر',
    translated_name: 'The Rocky Tract'
  }, {
    name_simple: 'An-Nahl',
    name_complex: 'An-Naĥl',
    name_arabic: 'النحل',
    translated_name: 'The Bee'
  }, {
    name_simple: 'Al-Isra',
    name_complex: 'Al-\'Isrā',
    name_arabic: 'الإسراء',
    translated_name: 'The Night Journey'
  }, {
    name_simple: 'Al-Kahf',
    name_complex: 'Al-Kahf',
    name_arabic: 'الكهف',
    translated_name: 'The Cave'
  }, {
    name_simple: 'Maryam',
    name_complex: 'Maryam',
    name_arabic: 'مريم',
    translated_name: 'Mary'
  }, {
    name_simple: 'Taha',
    name_complex: 'Ţāhā',
    name_arabic: 'طه',
    translated_name: 'Ta-Ha'
  }, {
    name_simple: 'Al-Anbya',
    name_complex: 'Al-\'Anbyā',
    name_arabic: 'الأنبياء',
    translated_name: 'The Prophets'
  }, {
    name_simple: 'Al-Hajj',
    name_complex: 'Al-Ĥajj',
    name_arabic: 'الحج',
    translated_name: 'The Pilgrimage'
  }, {
    name_simple: 'Al-Mu\'minun',
    name_complex: 'Al-Mu\'minūn',
    name_arabic: 'المؤمنون',
    translated_name: 'The Believers'
  }, {
    name_simple: 'An-Nur',
    name_complex: 'An-Nūr',
    name_arabic: 'النور',
    translated_name: 'The Light'
  }, {
    name_simple: 'Al-Furqan',
    name_complex: 'Al-Furqān',
    name_arabic: 'الفرقان',
    translated_name: 'The Criterion'
  }, {
    name_simple: 'Ash-Shu\'ara',
    name_complex: 'Ash-Shu`arā',
    name_arabic: 'الشعراء',
    translated_name: 'The Poets'
  }, {
    name_simple: 'An-Naml',
    name_complex: 'An-Naml',
    name_arabic: 'النمل',
    translated_name: 'The Ant'
  }, {
    name_simple: 'Al-Qasas',
    name_complex: 'Al-Qaşaş',
    name_arabic: 'القصص',
    translated_name: 'The Stories'
  }, {
    name_simple: 'Al-\'Ankabut',
    name_complex: 'Al-`Ankabūt',
    name_arabic: 'العنكبوت',
    translated_name: 'The Spider'
  }, {
    name_simple: 'Ar-Rum',
    name_complex: 'Ar-Rūm',
    name_arabic: 'الروم',
    translated_name: 'The Romans'
  }, {
    name_simple: 'Luqman',
    name_complex: 'Luqmān',
    name_arabic: 'لقمان',
    translated_name: 'Luqman'
  }, {
    name_simple: 'As-Sajdah',
    name_complex: 'As-Sajdah',
    name_arabic: 'السجدة',
    translated_name: 'The Prostration'
  }, {
    name_simple: 'Al-Ahzab',
    name_complex: 'Al-\'Aĥzāb',
    name_arabic: 'الأحزاب',
    translated_name: 'The Combined Forces'
  }, {
    name_simple: 'Saba',
    name_complex: 'Saba',
    name_arabic: 'سبإ',
    translated_name: 'Sheba'
  }, {
    name_simple: 'Fatir',
    name_complex: 'Fāţir',
    name_arabic: 'فاطر',
    translated_name: 'Originator'
  }, {
    name_simple: 'Ya-Sin',
    name_complex: 'Yā-Sīn',
    name_arabic: 'يس',
    translated_name: 'Ya Sin'
  }, {
    name_simple: 'As-Saffat',
    name_complex: 'Aş-Şāffāt',
    name_arabic: 'الصافات',
    translated_name: 'Those who set the Ranks'
  }, {
    name_simple: 'Sad',
    name_complex: 'Şād',
    name_arabic: 'ص',
    translated_name: 'The Letter "Saad"'
  }, {
    name_simple: 'Az-Zumar',
    name_complex: 'Az-Zumar',
    name_arabic: 'الزمر',
    translated_name: 'The Troops'
  }, {
    name_simple: 'Ghafir',
    name_complex: 'Ghāfir',
    name_arabic: 'غافر',
    translated_name: 'The Forgiver'
  }, {
    name_simple: 'Fussilat',
    name_complex: 'Fuşşilat',
    name_arabic: 'فصلت',
    translated_name: 'Explained in Detail'
  }, {
    name_simple: 'Ash-Shuraa',
    name_complex: 'Ash-Shūra\xe1',
    name_arabic: 'الشورى',
    translated_name: 'The Consultation'
  }, {
    name_simple: 'Az-Zukhruf',
    name_complex: 'Az-Zukhruf',
    name_arabic: 'الزخرف',
    translated_name: 'The Ornaments of Gold'
  }, {
    name_simple: 'Ad-Dukhan',
    name_complex: 'Ad-Dukhān',
    name_arabic: 'الدخان',
    translated_name: 'The Smoke'
  }, {
    name_simple: 'Al-Jathiyah',
    name_complex: 'Al-Jāthiyah',
    name_arabic: 'الجاثية',
    translated_name: 'The Crouching'
  }, {
    name_simple: 'Al-Ahqaf',
    name_complex: 'Al-\'Aĥqāf',
    name_arabic: 'الأحقاف',
    translated_name: 'The Wind-Curved Sandhills'
  }, {
    name_simple: 'Muhammad',
    name_complex: 'Muĥammad',
    name_arabic: 'محمد',
    translated_name: 'Muhammad'
  }, {
    name_simple: 'Al-Fath',
    name_complex: 'Al-Fatĥ',
    name_arabic: 'الفتح',
    translated_name: 'The Victory'
  }, {
    name_simple: 'Al-Hujurat',
    name_complex: 'Al-Ĥujurāt',
    name_arabic: 'الحجرات',
    translated_name: 'The Rooms'
  }, {
    name_simple: 'Qaf',
    name_complex: 'Qāf',
    name_arabic: 'ق',
    translated_name: 'The Letter "Qaf"'
  }, {
    name_simple: 'Adh-Dhariyat',
    name_complex: 'Adh-Dhāriyāt',
    name_arabic: 'الذاريات',
    translated_name: 'The Winnowing Winds'
  }, {
    name_simple: 'At-Tur',
    name_complex: 'Aţ-Ţūr',
    name_arabic: 'الطور',
    translated_name: 'The Mount'
  }, {
    name_simple: 'An-Najm',
    name_complex: 'An-Najm',
    name_arabic: 'النجم',
    translated_name: 'The Star'
  }, {
    name_simple: 'Al-Qamar',
    name_complex: 'Al-Qamar',
    name_arabic: 'القمر',
    translated_name: 'The Moon'
  }, {
    name_simple: 'Ar-Rahman',
    name_complex: 'Ar-Raĥmān',
    name_arabic: 'الرحمن',
    translated_name: 'The Beneficent'
  }, {
    name_simple: 'Al-Waqi\'ah',
    name_complex: 'Al-Wāqi`ah',
    name_arabic: 'الواقعة',
    translated_name: 'The Inevitable'
  }, {
    name_simple: 'Al-Hadid',
    name_complex: 'Al-Ĥadīd',
    name_arabic: 'الحديد',
    translated_name: 'The Iron'
  }, {
    name_simple: 'Al-Mujadila',
    name_complex: 'Al-Mujādila',
    name_arabic: 'المجادلة',
    translated_name: 'The Pleading Woman'
  }, {
    name_simple: 'Al-Hashr',
    name_complex: 'Al-Ĥashr',
    name_arabic: 'الحشر',
    translated_name: 'The Exile'
  }, {
    name_simple: 'Al-Mumtahanah',
    name_complex: 'Al-Mumtaĥanah',
    name_arabic: 'الممتحنة',
    translated_name: 'She that is to be examined'
  }, {
    name_simple: 'As-Saf',
    name_complex: 'Aş-Şaf',
    name_arabic: 'الصف',
    translated_name: 'The Ranks'
  }, {
    name_simple: 'Al-Jumu\'ah',
    name_complex: 'Al-Jumu`ah',
    name_arabic: 'الجمعة',
    translated_name: 'The Congregation, Friday'
  }, {
    name_simple: 'Al-Munafiqun',
    name_complex: 'Al-Munāfiqūn',
    name_arabic: 'المنافقون',
    translated_name: 'The Hypocrites'
  }, {
    name_simple: 'At-Taghabun',
    name_complex: 'At-Taghābun',
    name_arabic: 'التغابن',
    translated_name: 'The Mutual Disillusion'
  }, {
    name_simple: 'At-Talaq',
    name_complex: 'Aţ-Ţalāq',
    name_arabic: 'الطلاق',
    translated_name: 'The Divorce'
  }, {
    name_simple: 'At-Tahrim',
    name_complex: 'At-Taĥrīm',
    name_arabic: 'التحريم',
    translated_name: 'The Prohibition'
  }, {
    name_simple: 'Al-Mulk',
    name_complex: 'Al-Mulk',
    name_arabic: 'الملك',
    translated_name: 'The Sovereignty'
  }, {
    name_simple: 'Al-Qalam',
    name_complex: 'Al-Qalam',
    name_arabic: 'القلم',
    translated_name: 'The Pen'
  }, {
    name_simple: 'Al-Haqqah',
    name_complex: 'Al-Ĥāqqah',
    name_arabic: 'الحاقة',
    translated_name: 'The Reality'
  }, {
    name_simple: 'Al-Ma\'arij',
    name_complex: 'Al-Ma`ārij',
    name_arabic: 'المعارج',
    translated_name: 'The Ascending Stairways'
  }, {
    name_simple: 'Nuh',
    name_complex: 'Nūĥ',
    name_arabic: 'نوح',
    translated_name: 'Noah'
  }, {
    name_simple: 'Al-Jinn',
    name_complex: 'Al-Jinn',
    name_arabic: 'الجن',
    translated_name: 'The Jinn'
  }, {
    name_simple: 'Al-Muzzammil',
    name_complex: 'Al-Muzzammil',
    name_arabic: 'المزمل',
    translated_name: 'The Enshrouded One'
  }, {
    name_simple: 'Al-Muddaththir',
    name_complex: 'Al-Muddaththir',
    name_arabic: 'المدثر',
    translated_name: 'The Cloaked One'
  }, {
    name_simple: 'Al-Qiyamah',
    name_complex: 'Al-Qiyāmah',
    name_arabic: 'القيامة',
    translated_name: 'The Resurrection'
  }, {
    name_simple: 'Al-Insan',
    name_complex: 'Al-\'Insān',
    name_arabic: 'الانسان',
    translated_name: 'The Man'
  }, {
    name_simple: 'Al-Mursalat',
    name_complex: 'Al-Mursalāt',
    name_arabic: 'المرسلات',
    translated_name: 'The Emissaries'
  }, {
    name_simple: 'An-Naba',
    name_complex: 'An-Naba',
    name_arabic: 'النبإ',
    translated_name: 'The Tidings'
  }, {
    name_simple: 'An-Nazi\'at',
    name_complex: 'An-Nāzi`āt',
    name_arabic: 'النازعات',
    translated_name: 'Those who drag forth'
  }, {
    name_simple: '\'Abasa',
    name_complex: '`Abasa',
    name_arabic: 'عبس',
    translated_name: 'He Frowned'
  }, {
    name_simple: 'At-Takwir',
    name_complex: 'At-Takwīr',
    name_arabic: 'التكوير',
    translated_name: 'The Overthrowing'
  }, {
    name_simple: 'Al-Infitar',
    name_complex: 'Al-\'Infiţār',
    name_arabic: 'الإنفطار',
    translated_name: 'The Cleaving'
  }, {
    name_simple: 'Al-Mutaffifin',
    name_complex: 'Al-Muţaffifīn',
    name_arabic: 'المطففين',
    translated_name: 'The Defrauding'
  }, {
    name_simple: 'Al-Inshiqaq',
    name_complex: 'Al-\'Inshiqāq',
    name_arabic: 'الإنشقاق',
    translated_name: 'The Sundering'
  }, {
    name_simple: 'Al-Buruj',
    name_complex: 'Al-Burūj',
    name_arabic: 'البروج',
    translated_name: 'The Mansions of the Stars'
  }, {
    name_simple: 'At-Tariq',
    name_complex: 'Aţ-Ţāriq',
    name_arabic: 'الطارق',
    translated_name: 'The Nightcommer'
  }, {
    name_simple: 'Al-A\'la',
    name_complex: 'Al-\'A`l\xe1',
    name_arabic: 'الأعلى',
    translated_name: 'The Most High'
  }, {
    name_simple: 'Al-Ghashiyah',
    name_complex: 'Al-Ghāshiyah',
    name_arabic: 'الغاشية',
    translated_name: 'The Overwhelming'
  }, {
    name_simple: 'Al-Fajr',
    name_complex: 'Al-Fajr',
    name_arabic: 'الفجر',
    translated_name: 'The Dawn'
  }, {
    name_simple: 'Al-Balad',
    name_complex: 'Al-Balad',
    name_arabic: 'البلد',
    translated_name: 'The City'
  }, {
    name_simple: 'Ash-Shams',
    name_complex: 'Ash-Shams',
    name_arabic: 'الشمس',
    translated_name: 'The Sun'
  }, {
    name_simple: 'Al-Layl',
    name_complex: 'Al-Layl',
    name_arabic: 'الليل',
    translated_name: 'The Night'
  }, {
    name_simple: 'Ad-Duhaa',
    name_complex: 'Ađ-Đuĥa\xe1',
    name_arabic: 'الضحى',
    translated_name: 'The Morning Hours'
  }, {
    name_simple: 'Ash-Sharh',
    name_complex: 'Ash-Sharĥ',
    name_arabic: 'الشرح',
    translated_name: 'The Relief'
  }, {
    name_simple: 'At-Tin',
    name_complex: 'At-Tīn',
    name_arabic: 'التين',
    translated_name: 'The Fig'
  }, {
    name_simple: 'Al-\'Alaq',
    name_complex: 'Al-`Alaq',
    name_arabic: 'العلق',
    translated_name: 'The Clot'
  }, {
    name_simple: 'Al-Qadr',
    name_complex: 'Al-Qadr',
    name_arabic: 'القدر',
    translated_name: 'The Power'
  }, {
    name_simple: 'Al-Bayyinah',
    name_complex: 'Al-Bayyinah',
    name_arabic: 'البينة',
    translated_name: 'The Clear Proof'
  }, {
    name_simple: 'Az-Zalzalah',
    name_complex: 'Az-Zalzalah',
    name_arabic: 'الزلزلة',
    translated_name: 'The Earthquake'
  }, {
    name_simple: 'Al-\'Adiyat',
    name_complex: 'Al-`Ādiyāt',
    name_arabic: 'العاديات',
    translated_name: 'The Courser'
  }, {
    name_simple: 'Al-Qari\'ah',
    name_complex: 'Al-Qāri`ah',
    name_arabic: 'القارعة',
    translated_name: 'The Calamity'
  }, {
    name_simple: 'At-Takathur',
    name_complex: 'At-Takāthur',
    name_arabic: 'التكاثر',
    translated_name: 'The Rivalry in world increase'
  }, {
    name_simple: 'Al-\'Asr',
    name_complex: 'Al-`Aşr',
    name_arabic: 'العصر',
    translated_name: 'The Declining Day'
  }, {
    name_simple: 'Al-Humazah',
    name_complex: 'Al-Humazah',
    name_arabic: 'الهمزة',
    translated_name: 'The Traducer'
  }, {
    name_simple: 'Al-Fil',
    name_complex: 'Al-Fīl',
    name_arabic: 'الفيل',
    translated_name: 'The Elephant'
  }, {
    name_simple: 'Quraysh',
    name_complex: 'Quraysh',
    name_arabic: 'قريش',
    translated_name: 'Quraysh'
  }, {
    name_simple: 'Al-Ma\'un',
    name_complex: 'Al-Mā`ūn',
    name_arabic: 'الماعون',
    translated_name: 'The Small kindnesses'
  }, {
    name_simple: 'Al-Kawthar',
    name_complex: 'Al-Kawthar',
    name_arabic: 'الكوثر',
    translated_name: 'The Abundance'
  }, {
    name_simple: 'Al-Kafirun',
    name_complex: 'Al-Kāfirūn',
    name_arabic: 'الكافرون',
    translated_name: 'The Disbelievers'
  }, {
    name_simple: 'An-Nasr',
    name_complex: 'An-Naşr',
    name_arabic: 'النصر',
    translated_name: 'The Divine Support'
  }, {
    name_simple: 'Al-Masad',
    name_complex: 'Al-Masad',
    name_arabic: 'المسد',
    translated_name: 'The Palm Fiber'
  }, {
    name_simple: 'Al-Ikhlas',
    name_complex: 'Al-\'Ikhlāş',
    name_arabic: 'الإخلاص',
    translated_name: 'The Sincerity'
  }, {
    name_simple: 'Al-Falaq',
    name_complex: 'Al-Falaq',
    name_arabic: 'الفلق',
    translated_name: 'The Daybreak'
  }, {
    name_simple: 'An-Nas',
    name_complex: 'An-Nās',
    name_arabic: 'الناس',
    translated_name: 'Mankind'
  }]
}
