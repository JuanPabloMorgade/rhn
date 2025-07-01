interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export default function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-medium">{label}:</span>
      <span className="ml-1">{value || '—'}</span>
    </div>
  );
}
