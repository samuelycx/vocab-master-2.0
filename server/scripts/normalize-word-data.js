const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const POS_SET = new Set(['n.', 'v.', 'adj.', 'adv.', 'prep.', 'conj.', 'pron.', 'num.', 'art.', 'int.', 'vt.', 'vi.']);

const MANUAL_POS_FIX = {
  accurate: 'adj.',
  adequate: 'adj.',
  approximate: 'adj.',
  intermediate: 'adj.',
  precise: 'adj.',
  private: 'adj.',
  candidate: 'n.',
  climate: 'n.',
  aim: 'n.',
  arrive: 'v.',
  deceive: 'v.',
  enable: 'v.',
  finding: 'n.',
  service: 'n.',
  assign: 'v.',
  borrow: 'v.',
  browse: 'v.',
  burn: 'v.',
  bury: 'v.',
  contact: 'v.',
  continue: 'v.',
  define: 'v.',
  instruct: 'v.',
  interrupt: 'v.',
  learn: 'v.',
  remove: 'v.',
  remain: 'v.',
  solve: 'v.',
  retrieve: 'v.',
  save: 'v.',
  seek: 'v.',
  surround: 'v.',
  toward: 'prep.',
  training: 'n.',
  painting: 'n.',
  opening: 'n.',
  feeling: 'n.',
  twinkle: 'v.',
  refuse: 'v.',
  reject: 'v.',
  seldom: 'adv.',
  understanding: 'n.',
};

function normalizePos(pos) {
  if (!pos) return null;
  const p = String(pos).trim().toLowerCase().replace(/\s+/g, '');
  if (!p) return null;
  const withDot = p.endsWith('.') ? p : `${p}.`;
  return POS_SET.has(withDot) ? withDot : null;
}

function cleanChunk(text) {
  if (text == null) return '';
  let s = String(text);
  s = s.replace(/\r?\n+/g, ' ');
  s = s.replace(/【释[^】\]]*[】\]]?/g, ' ');
  s = s.replace(/[【\[]\s*释[^】\]]*[】\]]?/g, ' ');
  s = s.replace(/^\s*[\]\[【】.。,，;；:：]+\s*/g, '');
  s = s.replace(/\s{2,}/g, ' ').trim();
  return s;
}

function parseArrayField(raw) {
  if (Array.isArray(raw)) return raw.map(cleanChunk).filter(Boolean);
  if (raw == null) return [];
  const text = String(raw);
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map(cleanChunk).filter(Boolean);
    return [cleanChunk(parsed)].filter(Boolean);
  } catch {
    return [cleanChunk(text)].filter(Boolean);
  }
}

function uniq(arr) {
  return [...new Set(arr)];
}

function inferPos(word, meanings) {
  const w = String(word || '').trim().toLowerCase();
  if (!w || /\s/.test(w) || /\.\.\./.test(w)) return null;
  const m = (meanings && meanings[0]) ? String(meanings[0]).trim() : '';
  if (!m) return null;

  if (/的$/.test(m)) return 'adj.';
  if (/地$/.test(m)) return 'adv.';
  if (/^(因为|为了|关于|在|从|向|对|由|通过)/.test(m)) return 'prep.';
  if (/^(并且|而且|虽然|尽管|但是|然而|或者)/.test(m)) return 'conj.';
  if (/(人|者|性|度|力|率|学|术|法|品|物|体|气候|历史|语言|环境|细胞|世纪|类别|概念)$/.test(m)) return 'n.';
  if (/^(使|让|把|将|进行|做|提高|改善|沟通|传达|阻止|探索|调查|分类|补偿|提倡|影响|买得起|承认|采用|调整|钦佩|预测|偏爱|创作|妥协)/.test(m)) return 'v.';

  if (/(tion|sion|ment|ness|ity|er|or|ist|ship|age)$/.test(w)) return 'n.';
  if (/(ous|ful|less|able|ible|al|ive|ic|ary|ory|ent|ant)$/.test(w)) return 'adj.';
  if (/ly$/.test(w)) return 'adv.';
  if (/(ize|ise|ate|fy|en)$/.test(w)) return 'v.';
  return null;
}

async function main() {
  const words = await prisma.word.findMany();

  let updated = 0;
  let cleanedMeanings = 0;
  let cleanedExamples = 0;
  let fixedPos = 0;
  let inferredPos = 0;

  for (const row of words) {
    const meanings = uniq(parseArrayField(row.meanings));
    const examples = uniq(parseArrayField(row.examples));

    let pos = normalizePos(row.partOfSpeech);
    const manual = MANUAL_POS_FIX[row.text?.toLowerCase()];
    if (manual && pos !== manual) {
      pos = manual;
      fixedPos++;
    }

    if (!pos) {
      const inferred = inferPos(row.text, meanings);
      if (inferred) {
        pos = inferred;
        inferredPos++;
      }
    } else {
      const firstMeaning = meanings[0] || '';
      if (pos === 'v.' && /的$/.test(firstMeaning)) {
        pos = 'adj.';
        fixedPos++;
      } else if (pos === 'v.' && /(人|者|性|度|力|率|学|术|法|品|物|体|气候|历史|语言|环境|细胞|世纪|类别|概念)$/.test(firstMeaning)) {
        pos = 'n.';
        fixedPos++;
      } else if (pos === 'n.' && /地$/.test(firstMeaning)) {
        pos = 'adv.';
        fixedPos++;
      } else if (pos === 'n.' && /的$/.test(firstMeaning)) {
        pos = 'adj.';
        fixedPos++;
      } else if (pos === 'n.' && /^(因为|为了|关于|在|从|向|对|由|通过)/.test(firstMeaning)) {
        pos = 'prep.';
        fixedPos++;
      } else if (pos === 'n.' && /^(并且|而且|虽然|尽管|但是|然而|或者)/.test(firstMeaning)) {
        pos = 'conj.';
        fixedPos++;
      } else if (pos === 'n.' && /^(使|让|把|将|进行|做|提高|改善|沟通|传达|阻止|探索|调查|分类|补偿|提倡|影响|买得起|承认|采用|调整|钦佩|预测|偏爱|创作|妥协|导致|取消|捕捉|雕刻|追逐|欺骗|点击|倒塌|收集|结合|比较|竞争|抱怨|得出结论|确认|混淆|连接|检测|决定|消失|展示|区分|分配|打扰|划分|拖拽|赚取|出现|注册|爆发|建立|进化|超过|冻结|实现|抓取|猜测|处理|伤害|雇用|狩猎|忽视|想象|包括|增加|制造|融化|误解|混合|忽略|服从|观察|获得|占据|发生|污染|推迟|准备|保存|假装|生产|促进|发音|证明|提供|发布|惩罚|购买|退出|到达|推荐|尊重|回应|恢复|限制|保留|找回|返回|翻转|复习|奖励|航行|拯救|搜索|寻求|服务|安顿|传播|伸展|提交|成功|建议|支持|假设|包围|调查|暂停|切换|撕裂|触摸|上传|投票|等待|警告|浪费|担忧|包裹)/.test(firstMeaning)) {
        pos = 'v.';
        fixedPos++;
      }
    }

    const newMeanings = JSON.stringify(meanings);
    const newExamples = JSON.stringify(examples);
    const oldPos = row.partOfSpeech || null;
    const newPos = pos || null;

    const meaningChanged = newMeanings !== row.meanings;
    const exampleChanged = newExamples !== row.examples;
    const posChanged = newPos !== oldPos;

    if (meaningChanged || exampleChanged || posChanged) {
      await prisma.word.update({
        where: { id: row.id },
        data: {
          meanings: newMeanings,
          examples: newExamples,
          partOfSpeech: newPos,
        },
      });
      updated++;
      if (meaningChanged) cleanedMeanings++;
      if (exampleChanged) cleanedExamples++;
    }
  }

  const after = await prisma.word.findMany({
    select: { partOfSpeech: true, meanings: true, examples: true },
  });
  const missingPos = after.filter((x) => !x.partOfSpeech).length;
  const polluted = after.filter((x) => {
    const all = [...parseArrayField(x.meanings), ...parseArrayField(x.examples)];
    return all.some((s) => /【释|\[\s*释|^\s*[\]\[]/.test(String(s)) || /\n/.test(String(s)));
  }).length;

  console.log(JSON.stringify({
    total: words.length,
    updated,
    cleanedMeanings,
    cleanedExamples,
    fixedPos,
    inferredPos,
    remainingMissingPos: missingPos,
    remainingPollutedRows: polluted,
  }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
