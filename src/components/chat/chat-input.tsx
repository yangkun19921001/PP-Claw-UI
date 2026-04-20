import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, Image as ImageIcon, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".ico"]);
function isImageFile(url: string): boolean {
  const ext = url.split(".").pop()?.toLowerCase();
  return ext ? IMAGE_EXTS.has(`.${ext}`) : false;
}

interface ChatInputProps {
  onSend: (content: string, media?: string[]) => void;
  disabled?: boolean;
  reconnecting?: boolean;
}

export function ChatInput({ onSend, disabled, reconnecting }: ChatInputProps) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = !disabled && (text.trim().length > 0 || pendingMedia.length > 0);

  const handleSend = () => {
    if (!canSend) return;
    const content = text.trim();
    onSend(content || "[media]", pendingMedia.length > 0 ? pendingMedia : undefined);
    setText("");
    setPendingMedia([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const result = await apiClient.uploadFiles(Array.from(files));
      if (result.files.length > 0) {
        setPendingMedia((prev) => [...prev, ...result.files]);
        toast.success(t("chat.uploaded", { count: result.count }));
      }
    } catch (err) {
      toast.error(t("chat.uploadFailed", {
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="border-t border-border bg-surface-0 p-4">
      {reconnecting && (
        <div className="mb-2 flex items-center gap-2 text-xs text-warning">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{t("chat.reconnecting")}</span>
        </div>
      )}
      {pendingMedia.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingMedia.map((url, i) => (
            <div
              key={i}
              className="relative group rounded-lg overflow-hidden border border-border"
            >
              {isImageFile(url) ? (
                <img
                  src={url.startsWith("http") ? url : apiClient.getFileURL(url)}
                  alt=""
                  className="h-16 w-16 object-cover"
                />
              ) : (
                <div className="h-16 w-16 flex flex-col items-center justify-center bg-surface-1 gap-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground truncate max-w-[56px] px-1">
                    {url.split("/").pop()}
                  </span>
                </div>
              )}
              <button
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
                onClick={() =>
                  setPendingMedia((prev) => prev.filter((_, idx) => idx !== i))
                }
              >
                {t("chat.remove")}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex gap-0.5">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            multiple
            onChange={handleFileUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.accept = "";
                fileRef.current.click();
              }
            }}
            disabled={uploading}
            title={t("chat.attachFile")}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => {
              if (fileRef.current) {
                fileRef.current.accept = "image/*";
                fileRef.current.click();
              }
            }}
            disabled={uploading}
            title={t("chat.sendImage")}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? t("chat.processingPlaceholder") : t("chat.typePlaceholder")}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-input bg-surface-1 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 max-h-40"
        />

        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="h-9 w-9"
          title={disabled ? t("chat.waitingResponse") : t("chat.send")}
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
