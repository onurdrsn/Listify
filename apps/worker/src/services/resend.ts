type Locale = "tr" | "en";

interface ReminderEmailParams {
  to: string;
  name: string;
  subject: string;
  body: string;
  itemTitle?: string;
  itemType?: string;
  appUrl: string;
  locale: Locale;
}

export async function sendReminderEmail(
  apiKey: string,
  params: ReminderEmailParams
): Promise<void> {
  const { to, name, subject, body, itemTitle, itemType, appUrl, locale } = params;

  const cta = locale === "tr" ? "Listemi Aç" : "Open My List";
  const greeting = locale === "tr" ? `Merhaba ${name},` : `Hi ${name},`;
  const itemLabel = locale === "tr" ? "Öğe:" : "Item:";
  const unsubLabel = locale === "tr" ? "Bildirimleri yönet" : "Manage notifications";

  const typeEmojis: Record<string, string> = {
    movie: "🎬", series: "📺", book: "📖",
    food_restaurant: "🍽️", food_recipe: "👨‍🍳", shopping: "🛒",
  };
  const emoji = itemType ? (typeEmojis[itemType] ?? "📋") : "📋";

  const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin:0; padding:0; background:#0A0C10; font-family:'Inter',sans-serif; color:#ECEAF4; }
    .container { max-width:520px; margin:40px auto; background:#0F1117; border:1px solid rgba(255,255,255,0.06); border-radius:12px; overflow:hidden; }
    .header { background:#161820; padding:28px 32px; border-bottom:1px solid rgba(255,255,255,0.06); }
    .logo { font-size:22px; font-weight:800; color:#E8B04B; letter-spacing:-0.5px; }
    .body { padding:32px; }
    .greeting { font-size:15px; color:#9896A8; margin-bottom:16px; }
    .message-box { background:#161820; border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:20px 24px; margin:20px 0; }
    .message-title { font-size:18px; font-weight:600; color:#ECEAF4; margin-bottom:8px; }
    .message-body { font-size:14px; color:#9896A8; line-height:1.6; }
    .item-chip { display:inline-flex; align-items:center; gap:6px; background:#1E2130; border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:6px 12px; font-size:13px; color:#ECEAF4; margin:16px 0; }
    .cta { display:block; width:fit-content; background:#E8B04B; color:#0A0C10; font-weight:600; font-size:14px; padding:12px 24px; border-radius:6px; text-decoration:none; margin:24px 0 8px; }
    .footer { padding:20px 32px; border-top:1px solid rgba(255,255,255,0.06); font-size:12px; color:#555368; text-align:center; }
    .footer a { color:#555368; text-decoration:underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><span class="logo">Listify</span></div>
    <div class="body">
      <p class="greeting">${greeting}</p>
      <div class="message-box">
        <div class="message-title">${emoji} ${subject}</div>
        <div class="message-body">${body}</div>
      </div>
      ${itemTitle ? `<div class="item-chip">${emoji} <span>${itemLabel} ${itemTitle}</span></div>` : ""}
      <a href="${appUrl}/dashboard" class="cta">${cta} →</a>
    </div>
    <div class="footer">
      <a href="${appUrl}/ayarlar">${unsubLabel}</a>
    </div>
  </div>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Listify <bildirim@onurd.com.tr>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    throw new Error(`Resend failed: ${res.status}`);
  }
}

export async function sendWeeklyDigestEmail(
  apiKey: string,
  params: {
    to: string;
    name: string;
    locale: Locale;
    appUrl: string;
    stats: {
      pendingMovies: number;
      pendingSeries: number;
      pendingBooks: number;
      pendingFood: number;
      pendingShopping: number;
      completedThisWeek: number;
    };
  }
): Promise<void> {
  const { to, name, locale, appUrl, stats } = params;
  const subject = locale === "tr"
    ? "📋 Listify — Haftalık Özet"
    : "📋 Listify — Weekly Digest";

  const rows = locale === "tr"
    ? [
        { label: "🎬 Bekleyen Filmler",      value: stats.pendingMovies },
        { label: "📺 Bekleyen Diziler",      value: stats.pendingSeries },
        { label: "📖 Bekleyen Kitaplar",     value: stats.pendingBooks },
        { label: "🍽️ Bekleyen Yemekler",    value: stats.pendingFood },
        { label: "🛒 Bekleyen Alışveriş",   value: stats.pendingShopping },
        { label: "✅ Bu Hafta Tamamlanan",  value: stats.completedThisWeek },
      ]
    : [
        { label: "🎬 Pending Movies",        value: stats.pendingMovies },
        { label: "📺 Pending Series",        value: stats.pendingSeries },
        { label: "📖 Pending Books",         value: stats.pendingBooks },
        { label: "🍽️ Pending Food",         value: stats.pendingFood },
        { label: "🛒 Pending Shopping",     value: stats.pendingShopping },
        { label: "✅ Completed This Week",  value: stats.completedThisWeek },
      ];

  const tableRows = rows
    .filter(r => r.value > 0)
    .map(r => `<tr><td style="padding:8px 0;color:#9896A8;font-size:14px;">${r.label}</td><td style="padding:8px 0;color:#ECEAF4;font-size:14px;font-weight:600;text-align:right;">${r.value}</td></tr>`)
    .join("");

  const cta = locale === "tr" ? "Listelerimi Gör" : "View My Lists";
  const greeting = locale === "tr" ? `Merhaba ${name},` : `Hi ${name},`;
  const intro = locale === "tr"
    ? "Bu haftaki liste özetiniz hazır. Tamamlamak için tıklayın!"
    : "Here's your weekly list summary. Click to get things done!";

  const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <style>
    body { margin:0; padding:0; background:#0A0C10; font-family:'Inter',sans-serif; color:#ECEAF4; }
    .container { max-width:520px; margin:40px auto; background:#0F1117; border:1px solid rgba(255,255,255,0.06); border-radius:12px; overflow:hidden; }
    .header { background:#161820; padding:28px 32px; border-bottom:1px solid rgba(255,255,255,0.06); }
    .logo { font-size:22px; font-weight:800; color:#E8B04B; }
    .body { padding:32px; }
    .greeting { font-size:15px; color:#9896A8; margin-bottom:8px; }
    .intro { font-size:15px; color:#ECEAF4; margin-bottom:24px; }
    table { width:100%; border-collapse:collapse; }
    .cta { display:block; width:fit-content; background:#E8B04B; color:#0A0C10; font-weight:600; font-size:14px; padding:12px 24px; border-radius:6px; text-decoration:none; margin-top:24px; }
    .footer { padding:20px 32px; border-top:1px solid rgba(255,255,255,0.06); font-size:12px; color:#555368; text-align:center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><span class="logo">Listify</span></div>
    <div class="body">
      <p class="greeting">${greeting}</p>
      <p class="intro">${intro}</p>
      <table>${tableRows}</table>
      <a href="${appUrl}/dashboard" class="cta">${cta} →</a>
    </div>
    <div class="footer">Listify • <a href="${appUrl}/ayarlar" style="color:#555368;">Bildirimleri yönet</a></div>
  </div>
</body>
</html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Listify <bildirim@listify.app>", to: [to], subject, html }),
  });
}

/* Cron tetikleyici: tüm aktif kullanıcılara haftalık özet */
export async function fireWeeklyDigests(db: any, env: any): Promise<void> {
  const { users, listItems } = await import("../db/schema");
  const { eq, and, isNull, gte } = await import("drizzle-orm");

  const activeUsers = await db.query.users.findMany({
    where: and(eq(users.weeklyDigest, true), isNull(users.deletedAt)),
  });

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  for (const user of activeUsers) {
    const [pending, completed] = await Promise.all([
      db.query.listItems.findMany({
        where: and(eq(listItems.userId, user.id), eq(listItems.status, "pending")),
        columns: { type: true },
      }),
      db.query.listItems.findMany({
        where: and(
          eq(listItems.userId, user.id),
          eq(listItems.status, "completed"),
          gte(listItems.completedAt, oneWeekAgo)
        ),
        columns: { id: true },
      }),
    ]);

    const countByType = (type: string) => pending.filter((p: any) => p.type === type).length;

    await sendWeeklyDigestEmail(env.RESEND_API_KEY, {
      to: user.email,
      name: user.name,
      locale: user.locale as "tr" | "en",
      appUrl: env.APP_URL,
      stats: {
        pendingMovies:   countByType("movie"),
        pendingSeries:   countByType("series"),
        pendingBooks:    countByType("book"),
        pendingFood:     countByType("food_restaurant") + countByType("food_recipe"),
        pendingShopping: countByType("shopping"),
        completedThisWeek: completed.length,
      },
    });
  }
}
