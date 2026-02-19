import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VibeButtonProps = {
  commentAddress: string;
  up: boolean;
  onVote: (commentAddress: string, up: boolean) => Promise<boolean>;
  disabled?: boolean;
  className?: string;
};

export function VibeButton({
  commentAddress,
  up,
  onVote,
  disabled,
  className,
}: VibeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleClick = async () => {
    if (disabled || loading) return;
    setLoading(true);
    setAnimating(true);
    try {
      await onVote(commentAddress, up);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={disabled || loading}
      onClick={handleClick}
      className={cn(
        "transition-transform duration-200",
        animating && "scale-110",
        className
      )}
      aria-label={up ? "Vote up" : "Vote down"}
    >
      {up ? (
        <span className="text-lg leading-none">↑</span>
      ) : (
        <span className="text-lg leading-none">↓</span>
      )}
    </Button>
  );
}
