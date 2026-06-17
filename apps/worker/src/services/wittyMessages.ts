type ListType = "movie" | "series" | "book" | "food_restaurant" | "food_recipe" | "shopping" | "general";
type ReminderType = "manual" | "weekly_digest" | "smart_idle";
type Locale = "tr" | "en";

interface WittyMessage { title: string; body: string; }

const messages: Record<Locale, Record<ReminderType, Record<ListType | "default", WittyMessage[]>>> = {
  tr: {
    manual: {
      movie: [
        { title: "🎬 Popcorn hazır mı?", body: "Hatırladın mı? O film hâlâ seni bekliyor. Popcorn yaparken değil, izlerken bulun sizi." },
        { title: "🎞️ Film vakti!", body: "Listenize aldığınız film sizi özlüyor. Bu gece kaçmayın!" },
      ],
      series: [
        { title: "📺 Binge-watch zamanı!", body: "O dizinin konusu ne miydi? Tam hatırlamadan önce ilk bölümü açın." },
        { title: "🍿 Dizi maratonuna ne dersin?", body: "Ekrana uzanıyorsunuz zaten, o diziyi neden izlemiyorsunuz?" },
      ],
      book: [
        { title: "📖 Kitap seni bekliyor!", body: "Kitap rafında toz toplarken içiniz sıkışıyor mu? İşte tam zamanı." },
        { title: "🔖 Okumak mı, kaçmak mı?", body: "Listenize eklediğiniz kitap hâlâ ilk sayfasında." },
      ],
      food_restaurant: [
        { title: "🍽️ Rezervasyon zamanı!", body: "O restoranı ne zaman denediniz? Spoiler: hiç. Bu gece değişsin." },
        { title: "🍴 Açsın mı mideniz?", body: "Denemek istediğiniz restoran hâlâ bekliyor. Masayı kapmadan önce deneyin!" },
      ],
      food_recipe: [
        { title: "👨‍🍳 Mutfak sizi çağırıyor!", body: "O tarif hâlâ ekranda duruyor. Mutfağınız boş, vaktiniz var, bahaneniz yok." },
        { title: "🥘 Pişirme zamanı!", body: "\"Bir gün pişireceğim\" diye eklediğiniz tarif size bakıyor." },
      ],
      shopping: [
        { title: "🛒 Alışveriş günü!", body: "Listeyi oluşturdunuz, şimdi markete gitme vakti." },
        { title: "🏪 Market kapanmadan önce!", body: "Alışveriş listeniz hazır, sadece market bekliyor." },
      ],
      general: [
        { title: "⏰ Hatırlatma!", body: "Kendiniz için ayarladığınız hatırlatma vakti geldi." },
      ],
      default: [
        { title: "⏰ Hatırlatma zamanı!", body: "Listenizde bekleyen bir şey var." },
      ],
    },
    weekly_digest: {
      movie: [{ title: "🎬 Haftalık Film Özetiniz", body: "Bu hafta izleme listenizde neler var bir bakalım..." }],
      series: [{ title: "📺 Haftalık Dizi Özetiniz", body: "Dizi listeniz büyümeye devam ediyor!" }],
      book: [{ title: "📚 Haftalık Kitap Özetiniz", body: "Okumak isteyip ertelediğiniz kitaplar sizi bekliyor." }],
      food_restaurant: [{ title: "🍽️ Haftalık Restoran Özetiniz", body: "Denemek istediğiniz restoranlar hâlâ listede!" }],
      food_recipe: [{ title: "👨‍🍳 Haftalık Tarif Özetiniz", body: "Bu hafta mutfağa girdiniz mi?" }],
      shopping: [{ title: "🛒 Haftalık Alışveriş Özetiniz", body: "Alınacaklar listeniz güncellendi mi?" }],
      general: [{ title: "📋 Haftalık Listelerin Özeti", body: "Tüm listelerinize bir göz atalım!" }],
      default: [{ title: "📋 Haftalık Özet", body: "Bu haftaki listelerinize bakma vakti." }],
    },
    smart_idle: {
      movie: [
        { title: "🎬 Hâlâ izlemediniz mi?", body: "O film listenize gireli bir süre oldu. Tarih yazmayalım ama biraz uzun..." },
        { title: "🍿 Film bekliyor, siz neredesiniz?", body: "Ekrana oturduğunuzda ne olacak biliyor musunuz? O film izlenecek." },
      ],
      series: [
        { title: "📺 Dizi toz tutuyor!", body: "O dizi ekleneli epey vakit geçti. Artık izlenme hakkını kazandı." },
      ],
      book: [
        { title: "📖 Kitap sinirlendi!", body: "Bakın, kitap sabırlıdır ama sınırsız değil. Okumaya ne zaman başlıyorsunuz?" },
        { title: "🔖 Kitap çok bekledi", body: "Listenizdeki kitap 'beni bekliyorsan neden okumuyorsun?' diye bakıyor." },
      ],
      food_restaurant: [
        { title: "🍴 Restoran sizi unuttu!", body: "O restoranı listeye ekleyeli kaç gün oldu? Gitmeden menüsü değişir." },
      ],
      food_recipe: [
        { title: "👨‍🍳 Tarif ağlıyor!", body: "O tarifi ekleyeli çok oldu. Malzemeler alınmadı, ocak açılmadı." },
      ],
      shopping: [
        { title: "🛒 Liste uzuyor!", body: "Alışveriş listeniz giderek büyüyor. Markete gitme vakti geldi." },
      ],
      general: [
        { title: "⚡ Uzun süredir bekleniyor", body: "Listenizde bekleyip bekleyip beklenen bir şey var." },
      ],
      default: [
        { title: "📌 Bekleme süresi doldu!", body: "Listenizde uzun süredir bekleyen bir öğe var." },
      ],
    },
  },
  en: {
    manual: {
      movie: [
        { title: "🎬 Popcorn ready?", body: "That movie is still waiting for you. Don't keep it waiting any longer!" },
      ],
      series: [
        { title: "📺 Binge time!", body: "That show on your list won't watch itself." },
      ],
      book: [
        { title: "📖 Your book misses you!", body: "The book on your list is collecting dust. Time to open it!" },
      ],
      food_restaurant: [
        { title: "🍽️ Time to book a table!", body: "That restaurant you've been meaning to try is still waiting." },
      ],
      food_recipe: [
        { title: "👨‍🍳 The kitchen is calling!", body: "That recipe is still saved. No more excuses — the stove is right there!" },
      ],
      shopping: [
        { title: "🛒 Shopping day!", body: "Your list is ready, the store is waiting." },
      ],
      general: [{ title: "⏰ Reminder!", body: "You set a reminder for yourself — here it is!" }],
      default: [{ title: "⏰ It's reminder time!", body: "Something on your list is waiting." }],
    },
    weekly_digest: {
      movie: [{ title: "🎬 Your Weekly Movie Digest", body: "Let's check what's on your watchlist this week..." }],
      series: [{ title: "📺 Your Weekly Series Digest", body: "Your series list keeps growing!" }],
      book: [{ title: "📚 Your Weekly Book Digest", body: "Books you meant to read are still waiting." }],
      food_restaurant: [{ title: "🍽️ Your Weekly Restaurant Digest", body: "Still haven't tried those restaurants?" }],
      food_recipe: [{ title: "👨‍🍳 Your Weekly Recipe Digest", body: "Did you cook anything this week?" }],
      shopping: [{ title: "🛒 Your Weekly Shopping Digest", body: "Time to update your shopping list!" }],
      general: [{ title: "📋 Weekly List Summary", body: "Let's take a look at all your lists!" }],
      default: [{ title: "📋 Weekly Digest", body: "Time to check your lists for this week." }],
    },
    smart_idle: {
      movie: [{ title: "🎬 Still haven't watched it?", body: "That movie has been sitting on your list for a while now..." }],
      series: [{ title: "📺 Your series is collecting dust!", body: "It's been a while since you added that show. Time to watch!" }],
      book: [{ title: "📖 Your book is getting impatient!", body: "Books are patient, but yours is starting to wonder if you'll ever read it." }],
      food_restaurant: [{ title: "🍴 The restaurant forgot you!", body: "It's been a while — go before the menu changes!" }],
      food_recipe: [{ title: "👨‍🍳 The recipe is crying!", body: "You saved that recipe ages ago. The ingredients aren't going to buy themselves." }],
      shopping: [{ title: "🛒 List getting long!", body: "Your shopping list is growing. Time to hit the store." }],
      general: [{ title: "⚡ Long wait over!", body: "Something on your list has been waiting for too long." }],
      default: [{ title: "📌 Overdue!", body: "An item on your list has been waiting a long time." }],
    },
  },
};

export function getWittyMessage(
  reminderType: ReminderType,
  listType: ListType,
  locale: Locale = "tr"
): WittyMessage {
  const pool = messages[locale][reminderType][listType]
    ?? messages[locale][reminderType]["default"]
    ?? [{ title: "⏰ Hatırlatma", body: "Listenizde bir şey bekliyor." }];
  return pool[Math.floor(Math.random() * pool.length)];
}
