import { Home, Blocks, Wind, Umbrella, Target } from "lucide-react";
import type { ShelterDesign } from "../../types/prediction";

const DESIGN_FIELDS: Array<{ key: keyof ShelterDesign; label: string; icon: typeof Home }> = [
  { key: "roof", label: "Roof", icon: Home },
  { key: "walls", label: "Walls", icon: Blocks },
  { key: "ventilation", label: "Ventilation", icon: Wind },
  { key: "shading", label: "Shading", icon: Umbrella },
  { key: "priority", label: "Priority", icon: Target },
];

export default function ShelterDesignCard({ design }: { design: ShelterDesign }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {DESIGN_FIELDS.map((field) => (
        <div key={field.key} className="card flex gap-3.5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <field.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{field.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-900">{design[field.key]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
