import { GenericListPage } from "./GenericListPage";

export function FoodList({ type }: { type: "food_restaurant" | "food_recipe" }) {
  return (
    <GenericListPage
      type={type}
      icon={type === "food_restaurant" ? "🍽️" : "👨‍🍳"}
      color="var(--color-food)"
    />
  );
}
