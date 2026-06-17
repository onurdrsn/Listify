export async function purgeDeletedUsers(db: any): Promise<void> {
  const { users } = await import("../db/schema");
  const { and, isNotNull, lte } = await import("drizzle-orm");
  await db.delete(users).where(
    and(isNotNull(users.deletedAt), isNotNull(users.scheduledPurgeAt), lte(users.scheduledPurgeAt, new Date()))
  );
}
