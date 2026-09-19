import { useState } from "react";
import { toast } from "sonner";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddTruck } from "@/lib/data";

const empty = {
  truck_number: "",
  owner_name: "",
  owner_phone: "",
  driver_name: "",
  driver_phone: "",
};

export function AddTruckModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState<File | null>(null);
  const addTruck = useAddTruck();

  function set(key: keyof typeof empty, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    addTruck.mutate(
      { ...form, photo },
      {
        onSuccess: () => {
          toast.success(`Truck ${form.truck_number} added to the yard`);
          setForm(empty);
          setPhoto(null);
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add truck"
      description="Permanent truck details. A new visit at the hub is opened automatically."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="truck_number">Truck number</Label>
          <Input
            id="truck_number"
            required
            value={form.truck_number}
            onChange={(e) => set("truck_number", e.target.value)}
            placeholder="KA 01 AB 1234"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="owner_name">Owner name</Label>
            <Input
              id="owner_name"
              required
              value={form.owner_name}
              onChange={(e) => set("owner_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner_phone">Owner phone</Label>
            <Input
              id="owner_phone"
              value={form.owner_phone}
              onChange={(e) => set("owner_phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driver_name">Driver name</Label>
            <Input
              id="driver_name"
              required
              value={form.driver_name}
              onChange={(e) => set("driver_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="driver_phone">Driver phone</Label>
            <Input
              id="driver_phone"
              value={form.driver_phone}
              onChange={(e) => set("driver_phone", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="driver_photo">Driver photo</Label>
          <Input
            id="driver_photo"
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={addTruck.isPending}>
            {addTruck.isPending ? "Saving…" : "Add truck"}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
