import { NUM_CHAPTERS } from '../constants';
import { setChapter } from './default';

export function setEnChapters() {
  const chapters = {
    chapters: getChapters(),
  };
  for (let i = 0; i < NUM_CHAPTERS; i++) {
    setChapter(i, chapters.chapters[i]);
  }

  delete chapters.chapters;
}

function getChapters() {
  return [{
    nameSimple: 'Al-Fatihah',
    nameComplex: 'Al-Fātiĥah',
    nameArabic: 'الفاتحة',
    translatedName: 'The Opener',
  }, {
    nameSimple: 'Al-Baqarah',
    nameComplex: 'Al-Baqarah',
    nameArabic: 'البقرة',
    translatedName: 'The Cow',
  }, {
    nameSimple: 'Ali \'Imran',
    nameComplex: 'Āli `Imrān',
    nameArabic: 'آل عمران',
    translatedName: 'Family of Imran',
  }, {
    nameSimple: 'An-Nisa',
    nameComplex: 'An-Nisā',
    nameArabic: 'النساء',
    translatedName: 'The Women',
  }, {
    nameSimple: 'Al-Ma\'idah',
    nameComplex: 'Al-Mā\'idah',
    nameArabic: 'المائدة',
    translatedName: 'The Table Spread',
  }, {
    nameSimple: 'Al-An\'am',
    nameComplex: 'Al-\'An`ām',
    nameArabic: 'الأنعام',
    translatedName: 'The Cattle',
  }, {
    nameSimple: 'Al-A\'raf',
    nameComplex: 'Al-\'A`rāf',
    nameArabic: 'الأعراف',
    translatedName: 'The Heights',
  }, {
    nameSimple: 'Al-Anfal',
    nameComplex: 'Al-\'Anfāl',
    nameArabic: 'الأنفال',
    translatedName: 'The Spoils of War',
  }, {
    nameSimple: 'At-Tawbah',
    nameComplex: 'At-Tawbah',
    nameArabic: 'التوبة',
    translatedName: 'The Repentance',
  }, {
    nameSimple: 'Yunus',
    nameComplex: 'Yūnus',
    nameArabic: 'يونس',
    translatedName: 'Jonah',
  }, {
    nameSimple: 'Hud',
    nameComplex: 'Hūd',
    nameArabic: 'هود',
    translatedName: 'Hud',
  }, {
    nameSimple: 'Yusuf',
    nameComplex: 'Yūsuf',
    nameArabic: 'يوسف',
    translatedName: 'Joseph',
  }, {
    nameSimple: 'Ar-Ra\'d',
    nameComplex: 'Ar-Ra`d',
    nameArabic: 'الرعد',
    translatedName: 'The Thunder',
  }, {
    nameSimple: 'Ibrahim',
    nameComplex: 'Ibrāhīm',
    nameArabic: 'ابراهيم',
    translatedName: 'Abraham',
  }, {
    nameSimple: 'Al-Hijr',
    nameComplex: 'Al-Ĥijr',
    nameArabic: 'الحجر',
    translatedName: 'The Rocky Tract',
  }, {
    nameSimple: 'An-Nahl',
    nameComplex: 'An-Naĥl',
    nameArabic: 'النحل',
    translatedName: 'The Bee',
  }, {
    nameSimple: 'Al-Isra',
    nameComplex: 'Al-\'Isrā',
    nameArabic: 'الإسراء',
    translatedName: 'The Night Journey',
  }, {
    nameSimple: 'Al-Kahf',
    nameComplex: 'Al-Kahf',
    nameArabic: 'الكهف',
    translatedName: 'The Cave',
  }, {
    nameSimple: 'Maryam',
    nameComplex: 'Maryam',
    nameArabic: 'مريم',
    translatedName: 'Mary',
  }, {
    nameSimple: 'Taha',
    nameComplex: 'Ţāhā',
    nameArabic: 'طه',
    translatedName: 'Ta-Ha',
  }, {
    nameSimple: 'Al-Anbya',
    nameComplex: 'Al-\'Anbyā',
    nameArabic: 'الأنبياء',
    translatedName: 'The Prophets',
  }, {
    nameSimple: 'Al-Hajj',
    nameComplex: 'Al-Ĥajj',
    nameArabic: 'الحج',
    translatedName: 'The Pilgrimage',
  }, {
    nameSimple: 'Al-Mu\'minun',
    nameComplex: 'Al-Mu\'minūn',
    nameArabic: 'المؤمنون',
    translatedName: 'The Believers',
  }, {
    nameSimple: 'An-Nur',
    nameComplex: 'An-Nūr',
    nameArabic: 'النور',
    translatedName: 'The Light',
  }, {
    nameSimple: 'Al-Furqan',
    nameComplex: 'Al-Furqān',
    nameArabic: 'الفرقان',
    translatedName: 'The Criterion',
  }, {
    nameSimple: 'Ash-Shu\'ara',
    nameComplex: 'Ash-Shu`arā',
    nameArabic: 'الشعراء',
    translatedName: 'The Poets',
  }, {
    nameSimple: 'An-Naml',
    nameComplex: 'An-Naml',
    nameArabic: 'النمل',
    translatedName: 'The Ant',
  }, {
    nameSimple: 'Al-Qasas',
    nameComplex: 'Al-Qaşaş',
    nameArabic: 'القصص',
    translatedName: 'The Stories',
  }, {
    nameSimple: 'Al-\'Ankabut',
    nameComplex: 'Al-`Ankabūt',
    nameArabic: 'العنكبوت',
    translatedName: 'The Spider',
  }, {
    nameSimple: 'Ar-Rum',
    nameComplex: 'Ar-Rūm',
    nameArabic: 'الروم',
    translatedName: 'The Romans',
  }, {
    nameSimple: 'Luqman',
    nameComplex: 'Luqmān',
    nameArabic: 'لقمان',
    translatedName: 'Luqman',
  }, {
    nameSimple: 'As-Sajdah',
    nameComplex: 'As-Sajdah',
    nameArabic: 'السجدة',
    translatedName: 'The Prostration',
  }, {
    nameSimple: 'Al-Ahzab',
    nameComplex: 'Al-\'Aĥzāb',
    nameArabic: 'الأحزاب',
    translatedName: 'The Combined Forces',
  }, {
    nameSimple: 'Saba',
    nameComplex: 'Saba',
    nameArabic: 'سبإ',
    translatedName: 'Sheba',
  }, {
    nameSimple: 'Fatir',
    nameComplex: 'Fāţir',
    nameArabic: 'فاطر',
    translatedName: 'Originator',
  }, {
    nameSimple: 'Ya-Sin',
    nameComplex: 'Yā-Sīn',
    nameArabic: 'يس',
    translatedName: 'Ya Sin',
  }, {
    nameSimple: 'As-Saffat',
    nameComplex: 'Aş-Şāffāt',
    nameArabic: 'الصافات',
    translatedName: 'Those who set the Ranks',
  }, {
    nameSimple: 'Sad',
    nameComplex: 'Şād',
    nameArabic: 'ص',
    translatedName: 'The Letter "Saad"',
  }, {
    nameSimple: 'Az-Zumar',
    nameComplex: 'Az-Zumar',
    nameArabic: 'الزمر',
    translatedName: 'The Troops',
  }, {
    nameSimple: 'Ghafir',
    nameComplex: 'Ghāfir',
    nameArabic: 'غافر',
    translatedName: 'The Forgiver',
  }, {
    nameSimple: 'Fussilat',
    nameComplex: 'Fuşşilat',
    nameArabic: 'فصلت',
    translatedName: 'Explained in Detail',
  }, {
    nameSimple: 'Ash-Shuraa',
    nameComplex: 'Ash-Shūra\xe1',
    nameArabic: 'الشورى',
    translatedName: 'The Consultation',
  }, {
    nameSimple: 'Az-Zukhruf',
    nameComplex: 'Az-Zukhruf',
    nameArabic: 'الزخرف',
    translatedName: 'The Ornaments of Gold',
  }, {
    nameSimple: 'Ad-Dukhan',
    nameComplex: 'Ad-Dukhān',
    nameArabic: 'الدخان',
    translatedName: 'The Smoke',
  }, {
    nameSimple: 'Al-Jathiyah',
    nameComplex: 'Al-Jāthiyah',
    nameArabic: 'الجاثية',
    translatedName: 'The Crouching',
  }, {
    nameSimple: 'Al-Ahqaf',
    nameComplex: 'Al-\'Aĥqāf',
    nameArabic: 'الأحقاف',
    translatedName: 'The Wind-Curved Sandhills',
  }, {
    nameSimple: 'Muhammad',
    nameComplex: 'Muĥammad',
    nameArabic: 'محمد',
    translatedName: 'Muhammad',
  }, {
    nameSimple: 'Al-Fath',
    nameComplex: 'Al-Fatĥ',
    nameArabic: 'الفتح',
    translatedName: 'The Victory',
  }, {
    nameSimple: 'Al-Hujurat',
    nameComplex: 'Al-Ĥujurāt',
    nameArabic: 'الحجرات',
    translatedName: 'The Rooms',
  }, {
    nameSimple: 'Qaf',
    nameComplex: 'Qāf',
    nameArabic: 'ق',
    translatedName: 'The Letter "Qaf"',
  }, {
    nameSimple: 'Adh-Dhariyat',
    nameComplex: 'Adh-Dhāriyāt',
    nameArabic: 'الذاريات',
    translatedName: 'The Winnowing Winds',
  }, {
    nameSimple: 'At-Tur',
    nameComplex: 'Aţ-Ţūr',
    nameArabic: 'الطور',
    translatedName: 'The Mount',
  }, {
    nameSimple: 'An-Najm',
    nameComplex: 'An-Najm',
    nameArabic: 'النجم',
    translatedName: 'The Star',
  }, {
    nameSimple: 'Al-Qamar',
    nameComplex: 'Al-Qamar',
    nameArabic: 'القمر',
    translatedName: 'The Moon',
  }, {
    nameSimple: 'Ar-Rahman',
    nameComplex: 'Ar-Raĥmān',
    nameArabic: 'الرحمن',
    translatedName: 'The Beneficent',
  }, {
    nameSimple: 'Al-Waqi\'ah',
    nameComplex: 'Al-Wāqi`ah',
    nameArabic: 'الواقعة',
    translatedName: 'The Inevitable',
  }, {
    nameSimple: 'Al-Hadid',
    nameComplex: 'Al-Ĥadīd',
    nameArabic: 'الحديد',
    translatedName: 'The Iron',
  }, {
    nameSimple: 'Al-Mujadila',
    nameComplex: 'Al-Mujādila',
    nameArabic: 'المجادلة',
    translatedName: 'The Pleading Woman',
  }, {
    nameSimple: 'Al-Hashr',
    nameComplex: 'Al-Ĥashr',
    nameArabic: 'الحشر',
    translatedName: 'The Exile',
  }, {
    nameSimple: 'Al-Mumtahanah',
    nameComplex: 'Al-Mumtaĥanah',
    nameArabic: 'الممتحنة',
    translatedName: 'She that is to be examined',
  }, {
    nameSimple: 'As-Saf',
    nameComplex: 'Aş-Şaf',
    nameArabic: 'الصف',
    translatedName: 'The Ranks',
  }, {
    nameSimple: 'Al-Jumu\'ah',
    nameComplex: 'Al-Jumu`ah',
    nameArabic: 'الجمعة',
    translatedName: 'The Congregation, Friday',
  }, {
    nameSimple: 'Al-Munafiqun',
    nameComplex: 'Al-Munāfiqūn',
    nameArabic: 'المنافقون',
    translatedName: 'The Hypocrites',
  }, {
    nameSimple: 'At-Taghabun',
    nameComplex: 'At-Taghābun',
    nameArabic: 'التغابن',
    translatedName: 'The Mutual Disillusion',
  }, {
    nameSimple: 'At-Talaq',
    nameComplex: 'Aţ-Ţalāq',
    nameArabic: 'الطلاق',
    translatedName: 'The Divorce',
  }, {
    nameSimple: 'At-Tahrim',
    nameComplex: 'At-Taĥrīm',
    nameArabic: 'التحريم',
    translatedName: 'The Prohibition',
  }, {
    nameSimple: 'Al-Mulk',
    nameComplex: 'Al-Mulk',
    nameArabic: 'الملك',
    translatedName: 'The Sovereignty',
  }, {
    nameSimple: 'Al-Qalam',
    nameComplex: 'Al-Qalam',
    nameArabic: 'القلم',
    translatedName: 'The Pen',
  }, {
    nameSimple: 'Al-Haqqah',
    nameComplex: 'Al-Ĥāqqah',
    nameArabic: 'الحاقة',
    translatedName: 'The Reality',
  }, {
    nameSimple: 'Al-Ma\'arij',
    nameComplex: 'Al-Ma`ārij',
    nameArabic: 'المعارج',
    translatedName: 'The Ascending Stairways',
  }, {
    nameSimple: 'Nuh',
    nameComplex: 'Nūĥ',
    nameArabic: 'نوح',
    translatedName: 'Noah',
  }, {
    nameSimple: 'Al-Jinn',
    nameComplex: 'Al-Jinn',
    nameArabic: 'الجن',
    translatedName: 'The Jinn',
  }, {
    nameSimple: 'Al-Muzzammil',
    nameComplex: 'Al-Muzzammil',
    nameArabic: 'المزمل',
    translatedName: 'The Enshrouded One',
  }, {
    nameSimple: 'Al-Muddaththir',
    nameComplex: 'Al-Muddaththir',
    nameArabic: 'المدثر',
    translatedName: 'The Cloaked One',
  }, {
    nameSimple: 'Al-Qiyamah',
    nameComplex: 'Al-Qiyāmah',
    nameArabic: 'القيامة',
    translatedName: 'The Resurrection',
  }, {
    nameSimple: 'Al-Insan',
    nameComplex: 'Al-\'Insān',
    nameArabic: 'الانسان',
    translatedName: 'The Man',
  }, {
    nameSimple: 'Al-Mursalat',
    nameComplex: 'Al-Mursalāt',
    nameArabic: 'المرسلات',
    translatedName: 'The Emissaries',
  }, {
    nameSimple: 'An-Naba',
    nameComplex: 'An-Naba',
    nameArabic: 'النبإ',
    translatedName: 'The Tidings',
  }, {
    nameSimple: 'An-Nazi\'at',
    nameComplex: 'An-Nāzi`āt',
    nameArabic: 'النازعات',
    translatedName: 'Those who drag forth',
  }, {
    nameSimple: '\'Abasa',
    nameComplex: '`Abasa',
    nameArabic: 'عبس',
    translatedName: 'He Frowned',
  }, {
    nameSimple: 'At-Takwir',
    nameComplex: 'At-Takwīr',
    nameArabic: 'التكوير',
    translatedName: 'The Overthrowing',
  }, {
    nameSimple: 'Al-Infitar',
    nameComplex: 'Al-\'Infiţār',
    nameArabic: 'الإنفطار',
    translatedName: 'The Cleaving',
  }, {
    nameSimple: 'Al-Mutaffifin',
    nameComplex: 'Al-Muţaffifīn',
    nameArabic: 'المطففين',
    translatedName: 'The Defrauding',
  }, {
    nameSimple: 'Al-Inshiqaq',
    nameComplex: 'Al-\'Inshiqāq',
    nameArabic: 'الإنشقاق',
    translatedName: 'The Sundering',
  }, {
    nameSimple: 'Al-Buruj',
    nameComplex: 'Al-Burūj',
    nameArabic: 'البروج',
    translatedName: 'The Mansions of the Stars',
  }, {
    nameSimple: 'At-Tariq',
    nameComplex: 'Aţ-Ţāriq',
    nameArabic: 'الطارق',
    translatedName: 'The Nightcommer',
  }, {
    nameSimple: 'Al-A\'la',
    nameComplex: 'Al-\'A`l\xe1',
    nameArabic: 'الأعلى',
    translatedName: 'The Most High',
  }, {
    nameSimple: 'Al-Ghashiyah',
    nameComplex: 'Al-Ghāshiyah',
    nameArabic: 'الغاشية',
    translatedName: 'The Overwhelming',
  }, {
    nameSimple: 'Al-Fajr',
    nameComplex: 'Al-Fajr',
    nameArabic: 'الفجر',
    translatedName: 'The Dawn',
  }, {
    nameSimple: 'Al-Balad',
    nameComplex: 'Al-Balad',
    nameArabic: 'البلد',
    translatedName: 'The City',
  }, {
    nameSimple: 'Ash-Shams',
    nameComplex: 'Ash-Shams',
    nameArabic: 'الشمس',
    translatedName: 'The Sun',
  }, {
    nameSimple: 'Al-Layl',
    nameComplex: 'Al-Layl',
    nameArabic: 'الليل',
    translatedName: 'The Night',
  }, {
    nameSimple: 'Ad-Duhaa',
    nameComplex: 'Ađ-Đuĥa\xe1',
    nameArabic: 'الضحى',
    translatedName: 'The Morning Hours',
  }, {
    nameSimple: 'Ash-Sharh',
    nameComplex: 'Ash-Sharĥ',
    nameArabic: 'الشرح',
    translatedName: 'The Relief',
  }, {
    nameSimple: 'At-Tin',
    nameComplex: 'At-Tīn',
    nameArabic: 'التين',
    translatedName: 'The Fig',
  }, {
    nameSimple: 'Al-\'Alaq',
    nameComplex: 'Al-`Alaq',
    nameArabic: 'العلق',
    translatedName: 'The Clot',
  }, {
    nameSimple: 'Al-Qadr',
    nameComplex: 'Al-Qadr',
    nameArabic: 'القدر',
    translatedName: 'The Power',
  }, {
    nameSimple: 'Al-Bayyinah',
    nameComplex: 'Al-Bayyinah',
    nameArabic: 'البينة',
    translatedName: 'The Clear Proof',
  }, {
    nameSimple: 'Az-Zalzalah',
    nameComplex: 'Az-Zalzalah',
    nameArabic: 'الزلزلة',
    translatedName: 'The Earthquake',
  }, {
    nameSimple: 'Al-\'Adiyat',
    nameComplex: 'Al-`Ādiyāt',
    nameArabic: 'العاديات',
    translatedName: 'The Courser',
  }, {
    nameSimple: 'Al-Qari\'ah',
    nameComplex: 'Al-Qāri`ah',
    nameArabic: 'القارعة',
    translatedName: 'The Calamity',
  }, {
    nameSimple: 'At-Takathur',
    nameComplex: 'At-Takāthur',
    nameArabic: 'التكاثر',
    translatedName: 'The Rivalry in world increase',
  }, {
    nameSimple: 'Al-\'Asr',
    nameComplex: 'Al-`Aşr',
    nameArabic: 'العصر',
    translatedName: 'The Declining Day',
  }, {
    nameSimple: 'Al-Humazah',
    nameComplex: 'Al-Humazah',
    nameArabic: 'الهمزة',
    translatedName: 'The Traducer',
  }, {
    nameSimple: 'Al-Fil',
    nameComplex: 'Al-Fīl',
    nameArabic: 'الفيل',
    translatedName: 'The Elephant',
  }, {
    nameSimple: 'Quraysh',
    nameComplex: 'Quraysh',
    nameArabic: 'قريش',
    translatedName: 'Quraysh',
  }, {
    nameSimple: 'Al-Ma\'un',
    nameComplex: 'Al-Mā`ūn',
    nameArabic: 'الماعون',
    translatedName: 'The Small kindnesses',
  }, {
    nameSimple: 'Al-Kawthar',
    nameComplex: 'Al-Kawthar',
    nameArabic: 'الكوثر',
    translatedName: 'The Abundance',
  }, {
    nameSimple: 'Al-Kafirun',
    nameComplex: 'Al-Kāfirūn',
    nameArabic: 'الكافرون',
    translatedName: 'The Disbelievers',
  }, {
    nameSimple: 'An-Nasr',
    nameComplex: 'An-Naşr',
    nameArabic: 'النصر',
    translatedName: 'The Divine Support',
  }, {
    nameSimple: 'Al-Masad',
    nameComplex: 'Al-Masad',
    nameArabic: 'المسد',
    translatedName: 'The Palm Fiber',
  }, {
    nameSimple: 'Al-Ikhlas',
    nameComplex: 'Al-\'Ikhlāş',
    nameArabic: 'الإخلاص',
    translatedName: 'The Sincerity',
  }, {
    nameSimple: 'Al-Falaq',
    nameComplex: 'Al-Falaq',
    nameArabic: 'الفلق',
    translatedName: 'The Daybreak',
  }, {
    nameSimple: 'An-Nas',
    nameComplex: 'An-Nās',
    nameArabic: 'الناس',
    translatedName: 'Mankind',
  }];
}
