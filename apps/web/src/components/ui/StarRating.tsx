import { useState } from "react";
import { cn } from "../../lib/utils";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
}

export function StarRating({ rating, onChange, disabled = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1 select-none">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= displayRating;

        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && setHoverRating(starValue)}
            onMouseLeave={() => !disabled && setHoverRating(null)}
            onClick={() => !disabled && onChange?.(starValue)}
            className={cn(
              "text-xl transition-transform duration-100 focus:outline-none p-0.5",
              !disabled ? "hover:scale-120 cursor-pointer" : "pointer-events-none",
              active ? "text-film" : "text-slate-700"
            )}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
