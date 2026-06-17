const TMDB_BASE = "https://api.themoviedb.org/3";
const genreCache: Record<string, Record<number, string>> = {};

export interface TMDBResult {
  id: number; title: string; originalTitle: string;
  year: string; posterUrl: string | null;
  overview: string; genre: string[]; voteAverage: number;
  mediaType: "movie" | "series";
}

export async function searchTMDB(query: string, apiKey: string): Promise<TMDBResult[]> {
  const res = await fetch(`${TMDB_BASE}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=tr-TR`);
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  const data = await res.json() as { results: any[] };
  
  const movieGmap = await getGenreMap(apiKey, "movie");
  const tvGmap = await getGenreMap(apiKey, "tv");

  return data.results
    .filter(item => item.media_type === "movie" || item.media_type === "tv")
    .slice(0, 10)
    .map(item => {
      const isMovie = item.media_type === "movie";
      return {
        id: item.id,
        title:         isMovie ? item.title : item.name,
        originalTitle: isMovie ? item.original_title : item.original_name,
        year:          (isMovie ? item.release_date : item.first_air_date)?.slice(0, 4) ?? "",
        posterUrl:     item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null,
        overview:      item.overview ?? "",
        genre:         (item.genre_ids as number[]).map(id => (isMovie ? movieGmap : tvGmap)[id] ?? "").filter(Boolean),
        voteAverage:   item.vote_average ?? 0,
        mediaType:     isMovie ? "movie" : "series",
      };
    });
}

export async function getTMDBDetails(id: number, type: "movie" | "series", apiKey: string): Promise<{ seasonCount?: number }> {
  if (type === "movie") return {};
  const res = await fetch(`${TMDB_BASE}/tv/${id}?api_key=${apiKey}&language=tr-TR`);
  if (!res.ok) return {};
  const data = await res.json() as { number_of_seasons?: number };
  return { seasonCount: data.number_of_seasons };
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
