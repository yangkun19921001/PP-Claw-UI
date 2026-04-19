import { memo, useMemo } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

export const ChatMarkdown = memo(function ChatMarkdown({
  content,
  className,
}: ChatMarkdownProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className={cn(
        "chat-markdown text-sm leading-relaxed break-words",
        "[&_p]:mb-2 [&_p:last-child]:mb-0",
        "[&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:bg-[#1e1e2e] [&_pre]:p-3 [&_pre]:overflow-x-auto",
        "[&_pre_code]:text-[#cdd6f4] [&_pre_code]:text-xs [&_pre_code]:font-mono",
        "[&_:not(pre)>code]:bg-surface-3 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:rounded [&_:not(pre)>code]:text-xs [&_:not(pre)>code]:font-mono",
        "[&_a]:text-sky-500 [&_a]:underline [&_a]:underline-offset-2",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2",
        "[&_li]:mb-1",
        "[&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2",
        "[&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2",
        "[&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-1",
        "[&_table]:border-collapse [&_table]:w-full [&_table]:my-2",
        "[&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:bg-surface-2 [&_th]:text-xs [&_th]:font-semibold",
        "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs",
        "[&_hr]:border-border [&_hr]:my-3",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
