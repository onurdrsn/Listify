export interface OLResult {
  key: string; title: string; author: string;
  year: number | null; coverUrl: string | null;
  isbn: string | null; pageCount: number | null; subjects: string[];
}

export async function searchOpenLibrary(query: string): Promise<OLResult[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,first_publish_year,cover_i,isbn,number_of_pages_median,subject`
  );
  if (!res.ok) throw new Error(`OpenLibrary ${res.status}`);
  const data = await res.json() as { docs: any[] };
  return data.docs.map(doc => ({
    key:       doc.key ?? "",
    title:     doc.title ?? "",
    author:    doc.author_name?.[0] ?? "Bilinmiyor",
    year:      doc.first_publish_year ?? null,
    coverUrl:  doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    isbn:      doc.isbn?.[0] ?? null,
    pageCount: doc.number_of_pages_median ?? null,
    subjects:  (doc.subject ?? []).slice(0, 5),
  }));
}
