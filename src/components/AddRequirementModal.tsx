import { useState } from "react";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddRequirement } from "@/lib/data";

const empty = {
  client_name: "",
  client_phone: "",
  destination: "",
  goods_description: "",
  price_amount: "",
};

export function AddRequirementModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState(empty);
  const addRequirement = useAddRequirement();

  function set(key: keyof typeof empty, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addRequirement.mutate(form, {
      onSuccess: () => {
        toast.success("Requirement created");
        setForm(empty);
        onOpenChange(false);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="New requirement"
      description="A delivery a client needs covered."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="client_name">Client name</Label>
            <Input
              id="client_name"
              required
              value={form.client_name}
              onChange={(e) => set("client_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_phone">Client phone</Label>
            <Input
              id="client_phone"
              value={form.client_phone}
              onChange={(e) => set("client_phone", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input
            id="destination"
            required
            value={form.destination}
            onChange={(e) => set("destination", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="goods_description">Goods</Label>
          <Textarea
            id="goods_description"
            rows={3}
            value={form.goods_description}
            onChange={(e) => set("goods_description", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_amount">Price</Label>
          <Input
            id="price_amount"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.price_amount}
            onChange={(e) => set("price_amount", e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={addRequirement.isPending}>
            {addRequirement.isPending ? "Saving…" : "Create requirement"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
