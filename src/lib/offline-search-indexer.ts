/**
 * §6.5 — Offline-First BM25 Full-Text Local Search Indexer
 *
 * Implements a complete, lightweight, pure-JavaScript full-text search engine 
 * (utilizing tokenization, stop-word filtering, TF-IDF calculations, and BM25 relevance scoring).
 * Operates 100% offline inside Service Workers and local browser registers, enabling complex
 * county and constitutional keyword searches completely off-grid.
 */

export interface IndexedDocument {
  id: string; // Unique identifier (e.g. "047", "CONST-ART-10", "BUDGET-Kajiado")
  title: string;
  body: string;
  category: string; // e.g. "County", "Constitution", "Budget"
}

interface IndexEntry {
  df: number; // Document frequency
  postings: Record<string, number>; // docId -> term frequency (tf)
}

export class OfflineBM25SearchIndexer {
  private index: Record<string, IndexEntry> = {};
  private documentLengths: Record<string, number> = {};
  private documentStore: Record<string, IndexedDocument> = {};
  private averageDocLength: number = 0;
  private totalDocs: number = 0;

  // BM25 parameters
  private readonly k1: number = 1.2;
  private readonly b: number = 0.75;

  // Stop words to filter out
  private readonly stopWords: Set<string> = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
    'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
    'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres',
    'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is',
    'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of',
    'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same',
    'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
    'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve',
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'weve',
    'were', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom',
    'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours',
    'yourself', 'yourselves', 'na', 'kwa', 'ya', 'la', 'wa' // include Swahili stop-words!
  ]);

  /** Tokenizes and cleans a text string */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u00C0-\u017F]/g, ' ') // Strip punctuation, preserve accented and Swahili chars
      .split(/\s+/)
      .filter(token => token.length > 1 && !this.stopWords.has(token));
  }

  /** Indexes a single document */
  public addDocument(doc: IndexedDocument) {
    const tokens = this.tokenize(`${doc.title} ${doc.body}`);
    const docId = doc.id;
    
    this.documentStore[docId] = doc;
    this.documentLengths[docId] = tokens.length;
    this.totalDocs++;

    // Calculate term frequencies (tf) for this document
    const tfMap: Record<string, number> = {};
    tokens.forEach(token => {
      tfMap[token] = (tfMap[token] || 0) + 1;
    });

    // Merge into global inverted index
    for (const [term, tf] of Object.entries(tfMap)) {
      if (!this.index[term]) {
        this.index[term] = { df: 0, postings: {} };
      }
      this.index[term].postings[docId] = tf;
      this.index[term].df++;
    }

    // Update average doc length calculation
    const totalLength = Object.values(this.documentLengths).reduce((a, b) => a + b, 0);
    this.averageDocLength = totalLength / this.totalDocs;
  }

  /**
   * Performs BM25 keyword search queries.
   * Returns documents sorted by mathematical relevance scores.
   */
  public search(query: string, limit: number = 10) {
    const queryTokens = this.tokenize(query);
    const scores: Record<string, number> = {};

    queryTokens.forEach(term => {
      const entry = this.index[term];
      if (!entry) return; // Term not in index

      // Calculate Inverse Document Frequency (IDF) with BM25 smoothing
      // idf(t) = ln(1 + (N - df(t) + 0.5) / (df(t) + 0.5))
      const idf = Math.log(1 + (this.totalDocs - entry.df + 0.5) / (entry.df + 0.5));

      for (const [docId, tf] of Object.entries(entry.postings)) {
        const docLength = this.documentLengths[docId] || 0;
        
        // Calculate Okapi BM25 term weight
        // score(D, Q) = Sum( idf(qi) * (tf(qi, D) * (k1 + 1)) / (tf(qi, D) + k1 * (1 - b + b * (len(D) / avgDL))) )
        const numerator = tf * (this.k1 + 1);
        const denominator = tf + this.k1 * (1 - this.b + this.b * (docLength / this.averageDocLength));
        
        const termScore = idf * (numerator / denominator);
        scores[docId] = (scores[docId] || 0) + termScore;
      }
    });

    // Sort document candidates by relevance score descend
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([docId, score]) => ({
        document: this.documentStore[docId],
        score: parseFloat(score.toFixed(4))
      }));
  }

  /** Serialize and save index to local storage (or index DB) for fast offline loading */
  public serialize(): string {
    return JSON.stringify({
      index: this.index,
      documentLengths: this.documentLengths,
      documentStore: this.documentStore,
      averageDocLength: this.averageDocLength,
      totalDocs: this.totalDocs
    });
  }

  /** Restores index from serialized JSON */
  public deserialize(serialized: string) {
    const parsed = JSON.parse(serialized);
    this.index = parsed.index;
    this.documentLengths = parsed.documentLengths;
    this.documentStore = parsed.documentStore;
    this.averageDocLength = parsed.averageDocLength;
    this.totalDocs = parsed.totalDocs;
  }
}
