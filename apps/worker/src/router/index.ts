import { authRouter } from "./auth";
import { itemsRouter } from "./items";
import { shoppingRouter } from "./shopping";
import { remindersRouter } from "./reminders";
import { notificationsRouter } from "./notifications";
import { statsRouter } from "./stats";
import { userRouter } from "./user";
import { t } from "./trpc";

export const appRouter = t.router({
  auth: authRouter,
  items: itemsRouter,
  shopping: shoppingRouter,
  reminders: remindersRouter,
  notifications: notificationsRouter,
  stats: statsRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
