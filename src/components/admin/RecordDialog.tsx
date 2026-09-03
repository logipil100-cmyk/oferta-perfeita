import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "switch" | "select" | "date" | "file";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  help?: string;
};

export type RecordValues = Record<string, unknown>;

export function RecordDialog({
  title,
  description,
  fields,
  initial,
  trigger,
  submitLabel = "Guardar",
  onSubmit,
}: {
  title: string;
  description?: string;
  fields: Field[];
  initial?: RecordValues;
  trigger: ReactNode;
  submitLabel?: string;
  onSubmit: (values: RecordValues) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<RecordValues>(initial ?? {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setValues(initial ?? {});
  }, [open, initial]);

  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4">
          {fields.map((f) => {
            const id = `field-${f.name}`;
            const raw = values[f.name];
            if (f.type === "switch") {
              return (
                <div key={f.name} className="flex items-center justify-between gap-4 rounded-xl border p-3">
                  <Label htmlFor={id}>{f.label}</Label>
                  <Switch id={id} checked={!!raw} onCheckedChange={(c) => set(f.name, c)} />
                </div>
              );
            }
            return (
              <div key={f.name} className="grid gap-1.5">
                <Label htmlFor={id}>{f.label}</Label>
                {f.type === "file" ? (
                  <Input
                    id={id}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required={f.required}
                    onChange={(e) => set(f.name, e.target.files?.[0] ?? null)}
                  />
                ) : f.type === "textarea" ? (
                  <Textarea
                    id={id}
                    value={(raw as string) ?? ""}
                    placeholder={f.placeholder}
                    required={f.required}
                    onChange={(e) => set(f.name, e.target.value || null)}
                  />
                ) : f.type === "select" ? (
                  <select
                    id={id}
                    value={(raw as string) ?? ""}
                    required={f.required}
                    onChange={(e) => set(f.name, e.target.value || null)}
                    className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">—</option>
                    {(f.options ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={id}
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    step={f.type === "number" ? "0.01" : undefined}
                    value={(raw as string | number | undefined) ?? ""}
                    placeholder={f.placeholder}
                    required={f.required}
                    onChange={(e) => {
                      const v = e.target.value;
                      set(f.name, f.type === "number" ? (v === "" ? null : Number(v)) : v || null);
                    }}
                  />
                )}
                {f.help ? <p className="text-xs text-muted-foreground">{f.help}</p> : null}
              </div>
            );
          })}

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "A guardar…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
