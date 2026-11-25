// English question text, keyed by question id. See js/data/questions.js (applyEnglish).
import sains from './sains.js';
import sejarah from './sejarah.js';
import geografi from './geografi.js';
import teknologi from './teknologi.js';
import matematika from './matematika.js';
import sastra from './sastra.js';
import seni from './seni.js';
import olahraga from './olahraga.js';
import hiburan from './hiburan.js';
import umum from './umum.js';

export const QUESTIONS_EN = { ...sains, ...sejarah, ...geografi, ...teknologi, ...matematika, ...sastra, ...seni, ...olahraga, ...hiburan, ...umum };
