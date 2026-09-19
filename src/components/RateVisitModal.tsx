import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRateVisit } from "@/lib/data";

export type RateTarget = { truckId: string; visitId: string; truckNumber: string };

export function RateVisitModal({
  target,
  onClose,
}: {
  target: RateTarget | null;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const rate = useRateVisit();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!target || rating === 0) return;
    rate.mutate(
      { truckId: target.truckId, visitId: target.visitId, rating, feedback },
      {
        onSuccess: () => {
          toast.success("Rating saved to the truck's profile");
          setRating(0);
          setFeedback("");
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <ResponsiveModal
      open={!!target}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Rate truck"
      description={target ? `${target.truckNumber} · this delivery` : undefined}
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} star`}
              >
                <Star
                  className={cn(
                    "size-7 transition-colors",
                    value <= rating
                      ? "fill-status-wait text-status-wait"
                      : "text-muted-foreground/40",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback">Feedback</Label>
          <Textarea
            id="feedback"
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Punctuality, condition of goods, driver conduct…"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={rating === 0 || rate.isPending}>
            {rate.isPending ? "Saving…" : "Save rating"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
