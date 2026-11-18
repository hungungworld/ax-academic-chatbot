// 규정 문서(rules_with_tables.md)를 검색 단위로 나눈다.
//  - Ⅰ 과정 소개: 한 덩어리
//  - Ⅱ 과정 개요 / Ⅲ 커리큘럼 / Ⅴ 기타 안내: "1. 제목" 단위 (앞에 [구역 이름]을 붙임)
//  - Ⅳ 학사관리 규정: 제N조 단위 (조 뒤에 붙은 표·비고는 그 조에 포함)
//  - 교육센터 생활수칙 표: 한 덩어리
export type RuleChunk = { id: string; label: string; title: string; text: string };

type Part = { roman: string; name: string; start: number; end: number };

const PART_NAMES: Record<string, string> = { "Ⅱ": "과정 개요", "Ⅲ": "커리큘럼", V: "기타 안내" };

const clean = (lines: string[]) => lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

export function chunkRules(markdown: string): RuleChunk[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  // 큰 구역(Ⅰ~Ⅴ) 경계
  const partStarts: { roman: string; line: number }[] = [];
  lines.forEach((l, i) => {
    const m = l.match(/^(Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|V)\.\s/);
    if (m) partStarts.push({ roman: m[1] === "Ⅴ" ? "V" : m[1], line: i });
  });
  const parts: Part[] = partStarts.map((p, k) => ({
    roman: p.roman,
    name: PART_NAMES[p.roman] ?? "",
    start: p.line,
    end: k + 1 < partStarts.length ? partStarts[k + 1].line : lines.length,
  }));

  const chunks: RuleChunk[] = [];

  for (const part of parts) {
    if (part.roman === "Ⅰ") {
      chunks.push({
        id: "part-1",
        label: "과정 소개",
        title: "과정 소개·교육목표·특징",
        text: clean(lines.slice(part.start, part.end)),
      });
    } else if (part.roman === "Ⅳ") {
      chunks.push(...chunkArticles(lines.slice(part.start + 1, part.end)));
    } else {
      chunks.push(...chunkNumbered(lines.slice(part.start + 1, part.end), part));
    }
  }
  return chunks;
}

/** "1. 제목" 단위로 나눈다. 첫 제목 앞의 안내 문장은 첫 덩어리 제목 다음 줄에 붙인다. */
function chunkNumbered(body: string[], part: Part): RuleChunk[] {
  const out: RuleChunk[] = [];
  const preamble: string[] = [];
  let cur: { n: string; title: string; lines: string[] } | null = null;
  const flush = () => {
    if (!cur) return;
    out.push({
      id: `part-${part.roman}-${cur.n}`,
      label: `${part.name} ${cur.n}`,
      title: cur.title,
      text: clean([`[${part.name}] ${cur.n}. ${cur.title}`, ...cur.lines]),
    });
  };
  for (const line of body) {
    const m = line.match(/^(\d+)\.\s+(.+)$/);
    if (m) {
      const first: boolean = cur === null;
      flush();
      cur = { n: m[1], title: m[2].trim(), lines: first ? [...preamble] : [] };
    } else if (cur) {
      cur.lines.push(line);
    } else {
      preamble.push(line);
    }
  }
  flush();
  return out;
}

/** 제N조 단위. 장 제목과 개정일 줄은 버리고, 생활수칙 표는 따로 뺀다. */
function chunkArticles(body: string[]): RuleChunk[] {
  const out: RuleChunk[] = [];
  let cur: { n: string; title: string; lines: string[] } | null = null;
  const flush = () => {
    if (cur) out.push({ id: `article-${cur.n}`, label: `제${cur.n}조`, title: cur.title, text: clean(cur.lines) });
    cur = null;
  };
  for (const line of body) {
    const art = line.match(/^제(\d+)조\(([^)]+)\)/);
    if (art) {
      flush();
      cur = { n: art[1], title: art[2].trim(), lines: [line] };
      continue;
    }
    if (/^제\s*\d+\s*장\s/.test(line)) {
      flush();
      continue;
    }
    if (line.startsWith("| 교육센터 생활수칙")) {
      flush();
      out.push({ id: "living-rules", label: "생활수칙", title: "교육센터 생활수칙", text: "" });
      continue;
    }
    const last = out[out.length - 1];
    if (cur) cur.lines.push(line);
    else if (last?.id === "living-rules") last.text = clean([last.text, line].filter(Boolean));
  }
  flush();
  // 생활수칙 표 줄 자체를 텍스트에 넣는다
  const living = out.find((c) => c.id === "living-rules");
  if (living) {
    const tableLine = body.find((l) => l.startsWith("| 교육센터 생활수칙"))!;
    living.text = clean([tableLine, living.text]);
  }
  return out;
}

/** 임베딩할 때 쓰는 글: 조 이름과 제목을 앞에 붙여 검색이 잘 되게 한다. */
export function chunkToContext(c: RuleChunk): string {
  return `${c.label} ${c.title}\n${c.text}`;
}
