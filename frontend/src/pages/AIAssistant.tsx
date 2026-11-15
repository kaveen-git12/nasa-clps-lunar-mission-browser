import { AppShell } from "@/components/app-shell";
import { AIPanel } from "@/features/ai/AIPanel";

export default function AIAssistant() {
  return (
    <AppShell>
      <AIPanel variant="dashboard" />
    </AppShell>
  );
}
