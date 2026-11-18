import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import indexFile from "@/data/rules-index.json";
import type { RuleChunk } from "./chunk-rules";

type IndexedChunk = RuleChunk & { embedding: number[] };
type RulesIndex = { embeddingModel: string | null; createdAt: string | null; chunks: IndexedChunk[] };

export type RetrievedChunk = RuleChunk & { score: number };

const index = indexFile as unknown as RulesIndex;

let embedder: GoogleGenerativeAIEmbeddings | null = null;
let store: MemoryVectorStore | null = null;

/** 검색 준비가 안 됐으면 이유를, 됐으면 null 을 돌려준다. */
export function indexProblem(): string | null {
  const model = process.env.GEMINI_EMBEDDING_MODEL;
  if (!index.chunks.length) return "규정 검색 색인이 없습니다. `npm run index`로 data/rules-index.json을 만드세요.";
  if (!process.env.GOOGLE_API_KEY) return "GOOGLE_API_KEY 환경변수가 없습니다.";
  if (!model) return "GEMINI_EMBEDDING_MODEL 환경변수가 없습니다.";
  if (model !== index.embeddingModel)
    return `색인은 ${index.embeddingModel}로 만들어졌는데 GEMINI_EMBEDDING_MODEL은 ${model}입니다. npm run index를 다시 실행하세요.`;
  return null;
}

/** 미리 만들어 둔 임베딩을 LangChain 메모리 벡터 저장소에 채운다 (서버가 켜진 뒤 처음 한 번만). */
async function getStore(): Promise<{ embedder: GoogleGenerativeAIEmbeddings; store: MemoryVectorStore }> {
  embedder ??= new GoogleGenerativeAIEmbeddings({ model: process.env.GEMINI_EMBEDDING_MODEL! });
  if (!store) {
    const s = new MemoryVectorStore(embedder);
    await s.addVectors(
      index.chunks.map((c) => c.embedding),
      index.chunks.map((c) => {
        const { embedding: _omit, ...chunk } = c;
        return new Document({ pageContent: chunk.text, metadata: chunk });
      }),
    );
    store = s;
  }
  return { embedder, store };
}

export async function retrieve(query: string, k = 6): Promise<RetrievedChunk[]> {
  const { embedder, store } = await getStore();
  const q = await embedder.embedQuery(query);
  const hits = await store.similaritySearchVectorWithScore(q, k);
  return hits.map(([doc, score]) => ({ ...(doc.metadata as RuleChunk), score }));
}

/** 근거 배지 이름 → 조 제목 (배지 옆 설명용) */
export function titleOfLabel(label: string): string | undefined {
  return index.chunks.find((c) => c.label === label)?.title;
}
