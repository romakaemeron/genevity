"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { deleteSubmission } from "../../../_actions/forms";

export default function DeleteSubmissionButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onDelete = () => {
    if (!confirm("Видалити цю заявку? Цю дію неможливо скасувати.")) return;
    startTransition(async () => {
      await deleteSubmission(id);
      router.push("/admin/forms");
    });
  };

  return (
    <Button variant="destructive-ghost" size="xs" onClick={onDelete} disabled={pending}>
      {pending ? "Видаляємо…" : "Видалити заявку"}
    </Button>
  );
}
