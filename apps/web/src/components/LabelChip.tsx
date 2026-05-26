interface LabelChipProps {
  name: string;
  color?: string;
  className?: string;
}

export function LabelChip({ name, color = '#A78BFA', className = '' }: LabelChipProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-medium ${className}`}
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}
