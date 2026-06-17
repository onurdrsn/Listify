import { Modal } from "./Modal";
import { Button } from "./Button";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onCancel} title={title || "Onay Gerekli"} size="sm">
      <div className="space-y-6">
        <p className="text-sm text-text-secondary leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="ghost" onClick={onCancel} className="cursor-pointer">
            {cancelText || t("actions.cancel") || "İptal"}
          </Button>
          <Button onClick={onConfirm} className="cursor-pointer bg-white text-slate-950 hover:bg-slate-200">
            {confirmText || "Tamam"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
