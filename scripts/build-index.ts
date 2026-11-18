// 규정 문서를 검색 단위로 나누고 임베딩해서 data/rules-index.json 으로 저장한다.
// 실행: npm run index   (.env 의 GOOGLE_API_KEY, GEMINI_EMBEDDING_MODEL 필요)
// 임베딩 없이 나눈 결과만 보려면: npm run index -- --chunks-only
import { readFileSync, writeFileSync } from "node:fs";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { chunkRules, chunkToContext } from "../lib/chunk-rules.ts";

const root = new URL("..", import.meta.url);
const markdown = readFileSync(new URL("rules_with_tables.md", root), "utf-8");
const chunks = chunkRules(markdown);

writeFileSync(new URL("data/rules-chunks.json", root), JSON.stringify(chunks, null, 2) + "\n");
console.log(`덩어리 ${chunks.length}개:`);
for (const c of chunks) console.log(`  ${c.label.padEnd(10)} ${c.title} (${c.text.length}자)`);

if (process.argv.includes("--chunks-only")) process.exit(0);

const model = process.env.GEMINI_EMBEDDING_MODEL;
if (!process.env.GOOGLE_API_KEY || !model) {
  console.error("\n.env 에 GOOGLE_API_KEY 와 GEMINI_EMBEDDING_MODEL 을 넣은 뒤 다시 실행하세요.");
  process.exit(1);
}

const embeddings = new GoogleGenerativeAIEmbeddings({ model });
const vectors = await embeddings.embedDocuments(chunks.map(chunkToContext));

const index = {
  embeddingModel: model,
  createdAt: new Date().toISOString(),
  chunks: chunks.map((c, i) => ({ ...c, embedding: vectors[i].map((v) => Number(v.toFixed(6))) })),
};
writeFileSync(new URL("data/rules-index.json", root), JSON.stringify(index) + "\n");
console.log(`\ndata/rules-index.json 저장 완료 (모델: ${model}, 차원: ${vectors[0].length})`);
