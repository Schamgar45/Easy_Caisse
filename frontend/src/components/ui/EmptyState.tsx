import { Button } from "@/components/ui/Button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="flex flex-col items-center px-4 py-12 text-center">
    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400"><Icon className="h-6 w-6" /></span>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
    <Button type="button" onClick={onAction} className="mt-5">{actionLabel}</Button>
  </div>
);

export default EmptyState;
