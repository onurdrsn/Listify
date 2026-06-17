const TMDB_BASE = "https://api.themoviedb.org/3";
const genreCache: Record<string, Record<number, string>> = {};

export interface TMDBResult {
  id: number; title: string; originalTitle: string;
  year: string; posterUrl: string | null;
  overview: string; genre: string[]; voteAverage: number;
}

export async function searchTMDB(query: string, type: "movie" | "series", apiKey: string): Promise<TMDBResult[]> {
  const endpoint = type === "movie" ? "search/movie" : "search/tv";
  const res = await fetch(`${TMDB_BASE}/${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=tr-TR`);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const data = await res.json() as { results: any[] };
  const gmap = await getGenreMap(apiKey, type === "movie" ? "movie" : "tv");
  return data.results.slice(0, 10).map(item => ({
    id: item.id,
    title:         type === "movie" ? item.title : item.name,
    originalTitle: type === "movie" ? item.original_title : item.original_name,
    year:          (type === "movie" ? item.release_date : item.first_air_date)?.slice(0, 4) ?? "",
    posterUrl:     item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
    overview:      item.overview ?? "",
    genre:         (item.genre_ids as number[]).map(id => gmap[id] ?? "").filter(Boolean),
    voteAverage:   item.vote_average ?? 0,
  }));
}

async function getGenreMap(apiKey: string, mediaType: "movie" | "tv"): Promise<Record<number, string>> {
  if (genreCache[mediaType]) return genreCache[mediaType];
  const res = await fetch(`${TMDB_BASE}/genre/${mediaType}/list?api_key=${apiKey}&language=tr-TR`);
  const data = await res.json() as { genres: { id: number; name: string }[] };
  const map: Record<number, string> = {};
  for (const g of data.genres) map[g.id] = g.name;
  genreCache[mediaType] = map;
  return map;
}
