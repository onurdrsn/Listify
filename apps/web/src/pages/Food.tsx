import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GenericListPage } from "../components/lists/GenericListPage";
import { Tabs } from "../components/ui/Tabs";

export function Food() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"restaurant" | "recipe">("restaurant");

  return (
    <div>
      <div className="px-6 pt-6">
        <Tabs
          tabs={[
            { id: "restaurant", label: `🍽️ ${t("food.restaurant")}` },
            { id: "recipe",     label: `👨‍🍳 ${t("food.recipe")}` },
          ]}
          active={tab}
          onChange={(id) => setTab(id as "restaurant" | "recipe")}
          color="var(--color-food)"
        />
      </div>
      {tab === "restaurant"
        ? <GenericListPage type="food_restaurant" icon="🍽️" color="var(--color-food)" />
        : <GenericListPage type="food_recipe"     icon="👨‍🍳" color="var(--color-food)" />
      }
    </div>
  );
}
