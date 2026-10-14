import { CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";

// Estado de vazio ou erro: ícone + título + texto de apoio + ação opcional.
// Neutro de propósito — cor é reservada para condição do mar.
export default function StateMessage({ icon: Icon, title, description, action, compact = false, role }) {
  return (
    <div
      role={role}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "var(--spacing-md)",
        padding: `${compact ? "var(--spacing-lg)" : "var(--spacing-xl)"} var(--spacing-md)`,
      }}
    >
      {Icon && <Icon size={40} strokeWidth={1.5} aria-hidden="true" style={{ color: "var(--text-secondary)" }} />}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-xs)" }}>
        {title && <span className="text-token-body-bold" style={{ color: "var(--text-primary)" }}>{title}</span>}
        {description && <span className="text-token-body" style={{ color: "var(--text-secondary)" }}>{description}</span>}
      </div>
      {action && (
        <Button variant="outline" onClick={action.onClick} className="text-[var(--text-primary)]">
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  onRetry,
  title = "Não deu pra carregar.",
  description = "Confere a conexão e tenta de novo.",
  compact,
}) {
  return (
    <StateMessage
      role="alert"
      icon={CloudOff}
      title={title}
      description={description}
      action={onRetry ? { label: "Tentar de novo", onClick: onRetry } : undefined}
      compact={compact}
    />
  );
}
