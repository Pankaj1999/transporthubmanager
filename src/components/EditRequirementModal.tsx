import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateRequirement, type Requirement } from "@/lib/data";

export function EditRequirementModal({
  requirement,
  onClose,
}: {
  requirement: Requirement | null;
  onClose: () => void;
}) {
  const update = useUpdateRequirement();
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    destination: "",
    goods_description: "",
    price_amount: "",
  });

  useEffect(() => {
    if (!requirement) return;
    setForm({
      client_name: requirement.client_name,
      client_phone: requirement.client_phone ?? "",
      destination: requirement.destination,
      goods_description: requirement.goods_description ?? "",
      price_amount: String(requirement.price_amount ?? ""),
    });
  }, [requirement]);

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!requirement) return;
    update.mutate(
      { id: requirement.id, ...form },
      {
        onSuccess: () => {
          toast.success("Requirement updated");
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <ResponsiveModal
      open={!!requirement}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Edit requirement"
      description="Correct the client details, destination or price."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="edit_client_name">Client name</Label>
            <Input
              id="edit_client_name"
              required
              value={form.client_name}
              onChange={(e) => set("client_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_client_phone">Client phone</Label>
            <Input
              id="edit_client_phone"
              value={form.client_phone}
              onChange={(e) => set("client_phone", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_destination">Destination</Label>
          <Input
            id="edit_destination"
            required
            value={form.destination}
            onChange={(e) => set("destination", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_goods">Goods</Label>
          <Textarea
            id="edit_goods"
            rows={3}
            value={form.goods_description}
            onChange={(e) => set("goods_description", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit_price">Price</Label>
          <Input
            id="edit_price"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.price_amount}
            onChange={(e) => set("price_amount", e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
