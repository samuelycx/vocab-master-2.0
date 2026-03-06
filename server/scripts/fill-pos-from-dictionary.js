const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MAP = {
  noun: 'n.',
  verb: 'v.',
  adjective: 'adj.',
  adverb: 'adv.',
  preposition: 'prep.',
  conjunction: 'conj.',
  pronoun: 'pron.',
  interjection: 'int.',
  article: 'art.',
  numeral: 'num.',
};

function toPos(raw) {
  if (!raw) return null;
  return MAP[String(raw).trim().toLowerCase()] || null;
}

async function fetchPos(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'vocab-master-pos-filler/1.0',
        Accept: 'application/json',
      },
    });
    if (res.status === 429) {
      await sleep(1200 * (i + 1));
      continue;
    }
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return [];
    const list = [];
    for (const entry of data) {
      if (!Array.isArray(entry.meanings)) continue;
      for (const m of entry.meanings) {
        const p = toPos(m?.partOfSpeech);
        if (p && !list.includes(p)) list.push(p);
      }
    }
    return list;
  }
  return [];
}

function parseFirstMeaning(raw) {
  try {
    const arr = JSON.parse(raw || '[]');
    if (!Array.isArray(arr) || arr.length === 0) return '';
    return String(arr[0] || '').trim();
  } catch {
    return String(raw || '').trim();
  }
}

function choosePos(candidates, firstMeaning) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  const m = String(firstMeaning || '');
  if (/的$/.test(m) && candidates.includes('adj.')) return 'adj.';
  if (/地$/.test(m) && candidates.includes('adv.')) return 'adv.';
  if (/^(因为|为了|关于|在|从|向|对|由|通过)/.test(m) && candidates.includes('prep.')) return 'prep.';
  if (/^(并且|而且|虽然|尽管|但是|然而|或者)/.test(m) && candidates.includes('conj.')) return 'conj.';
  if (/(人|者|性|度|力|率|学|术|法|品|物|体|气候|历史|语言|环境|细胞|世纪|类别|概念)$/.test(m) && candidates.includes('n.')) return 'n.';
  if (/^(使|让|把|将|进行|做|提高|改善|沟通|传达|阻止|探索|调查|分类|补偿|提倡|影响|买得起|承认|采用|调整|钦佩|预测|偏爱|创作|妥协|导致|取消|捕捉|雕刻|追逐|欺骗|点击|倒塌|收集|结合|比较|竞争|抱怨|确认|混淆|连接|检测|决定|消失|展示|区分|分配|打扰|划分|拖拽|赚取|出现|注册|爆发|建立|进化|超过|冻结|实现|抓取|猜测|处理|伤害|雇用|狩猎|忽视|想象|包括|增加|制造|融化|误解|混合|忽略|服从|观察|获得|占据|发生|污染|推迟|准备|保存|假装|生产|促进|发音|证明|提供|发布|惩罚|购买|退出|到达|推荐|尊重|回应|恢复|限制|保留|找回|返回|翻转|复习|奖励|航行|拯救|搜索|寻求|服务|安顿|传播|伸展|提交|成功|建议|支持|假设|包围|调查|暂停|切换|撕裂|触摸|上传|投票|等待|警告|浪费|担忧|包裹)/.test(m) && candidates.includes('v.')) return 'v.';
  return candidates[0];
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const rows = await prisma.word.findMany({
    where: { partOfSpeech: null },
    select: { id: true, text: true, meanings: true },
  });
  const targets = rows.filter((r) => /^[A-Za-z-]+$/.test(r.text));
  const skipped = rows.length - targets.length;

  let filled = 0;
  const unresolved = [];

  console.log(`Missing POS total=${rows.length}, targetSingleWords=${targets.length}, skippedPhrases=${skipped}`);

  for (let i = 0; i < targets.length; i++) {
    const row = targets[i];
    const candidates = await fetchPos(row.text);
    const pos = choosePos(candidates, parseFirstMeaning(row.meanings));
    if (pos) {
      await prisma.word.update({
        where: { id: row.id },
        data: { partOfSpeech: pos },
      });
      filled++;
      console.log(`[${i + 1}/${targets.length}] OK ${row.text} -> ${pos}`);
    } else {
      unresolved.push(row.text);
      console.log(`[${i + 1}/${targets.length}] MISS ${row.text}`);
    }
    await sleep(260);
  }

  console.log(JSON.stringify({
    totalMissing: rows.length,
    targets: targets.length,
    filled,
    unresolved: unresolved.length,
    unresolvedWords: unresolved,
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
