import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ArrowUp, Check, Copy, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../lib/api";
import { Button, Spinner, toast } from "../shared";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CODE_LANGUAGE_LABELS: Record<string, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  tsx: "TypeScript (JSX)",
  jsx: "JavaScript (JSX)",
  py: "Python",
  html: "HTML",
  css: "CSS",
  sh: "Shell",
  bash: "Bash",
  json: "JSON",
  md: "Markdown",
  sql: "SQL",
  cpp: "C++",
  c: "C",
  java: "Java",
  rb: "Ruby",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  dart: "Dart",
  scala: "Scala",
  r: "R",
  latex: "LaTeX",
  yaml: "YAML",
  yml: "YAML",
  toml: "TOML",
  xml: "XML",
};

const CodeBlock = ({ value, language }: { value: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const label = language
    ? CODE_LANGUAGE_LABELS[language.toLowerCase()] || language.toUpperCase()
    : "Code";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative my-3 overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] font-mono text-sm text-zinc-300">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#161b22] px-3 py-1.5 text-xs font-medium text-zinc-400">
        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md p-1 text-zinc-500 transition hover:bg-white/10 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} strokeWidth={1.8} className="text-emerald-400" />
              <span className="text-[11px] text-zinc-300">Copied</span>
            </>
          ) : (
            <Copy size={14} strokeWidth={1.8} />
          )}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto p-3">
        <code>{value}</code>
      </pre>
    </div>
  );
};

interface MarkdownContentProps {
  content: string;
  className?: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => (
  <div className={className}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="my-4 text-xl font-bold tracking-tight text-white">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="my-3 text-lg font-bold tracking-tight text-white">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="my-2.5 text-base font-bold tracking-tight text-white">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="my-2 text-sm font-bold tracking-tight text-zinc-300">{children}</h4>
        ),
        p: ({ children }) => (
          <p className="my-2 leading-relaxed text-zinc-200">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="my-2 list-disc space-y-1 pl-6 text-zinc-200">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-2 list-decimal space-y-1 pl-6 text-zinc-200">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="my-1 leading-relaxed text-zinc-200">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-zinc-600 pl-4 italic text-zinc-400">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-zinc-300 underline underline-offset-2 transition hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="my-4 border-white/10" />,
        strong: ({ children }) => (
          <strong className="font-semibold text-white">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-zinc-200">{children}</em>
        ),
        del: ({ children }) => (
          <del className="text-zinc-500">{children}</del>
        ),
        pre: ({ children }) => <>{children}</>,
        code: ({ className, children, ...props }) => {
          const match = /language-([\w-]+)/.exec(className || "");
          const raw = String(children ?? "").replace(/\n$/, "");
          const isBlock = Boolean(match) || raw.includes("\n");

          if (isBlock) {
            return <CodeBlock value={raw} language={match?.[1]} />;
          }

          return (
            <code
              className="rounded-md bg-[#0d1117] px-1.5 py-0.5 font-mono text-xs text-zinc-300"
              {...props}
            >
              {children}
            </code>
          );
        },
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto">
            <table className="w-full border-collapse border border-white/10 text-left text-sm text-zinc-200">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-white/10">{children}</thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className="border-b border-white/10 last:border-0">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="p-2 font-semibold text-zinc-400">{children}</th>
        ),
        td: ({ children }) => (
          <td className="p-2 text-zinc-200">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="max-w-none leading-relaxed text-zinc-200 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
    <MarkdownContent content={content} />
  </div>
);

const UserMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-sm leading-6 text-black">
    {content}
  </div>
);

const AssistantMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-2.5">
    <MarkdownMessage content={content} />
  </div>
);

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMessage = searchParams.get("message");

  const [messages, setMessages] = useState<Message[]>(() =>
    initialMessage ? [{ role: "user", content: initialMessage }] : [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(() => !!initialMessage);
  const hasFetched = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setLoading(true);
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");

      try {
        const { data } = await api.post("chat", { message: trimmed });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data?.data || "Sorry, I could not get a response.",
          },
        ]);
      } catch (error) {
        console.error("Error sending message:", error);
        toast.add({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to send message.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  useEffect(() => {
    if (hasFetched.current || !initialMessage) return;
    hasFetched.current = true;
    setSearchParams({}, { replace: true });

    (async () => {
      try {
        const { data } = await api.post("chat", { message: initialMessage });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data?.data || "Sorry, I could not get a response.",
          },
        ]);
      } catch (error) {
        console.error("Error sending message:", error);
        toast.add({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to send message.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [initialMessage, setSearchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex h-screen flex-col bg-black text-white selection:bg-zinc-700/50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate("/")}
              aria-label="Back to home"
            >
              <ArrowLeft size={18} />
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
              <Sparkles size={21} strokeWidth={2.2} />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Automata
              <span className="text-zinc-500"> AI</span>
            </span>
          </div>
          <span className="text-xs text-zinc-600">Not saved — refresh clears chat</span>
        </div>
      </header>

      {/* Messages */}
      <main className="mx-auto w-full max-w-3xl flex-1 overflow-x-hidden overflow-y-auto px-5 py-6 sm:px-8">
        <div className="space-y-6">
          {messages.length === 0 && !loading && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-zinc-500">
                No messages yet. Ask something to get started.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              {msg.role === "user" ? (
                <UserMessage content={msg.content} />
              ) : (
                <AssistantMessage content={msg.content} />
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-400">
                <Spinner size="sm" inline />
                Thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <div className="border-t border-white/8 bg-black/80 backdrop-blur-xl">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl items-center gap-2 px-5 py-4 sm:px-8"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Automata AI..."
            aria-label="Message"
            disabled={loading}
            className="h-11 w-full min-w-0 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-white/25 disabled:opacity-60"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <ArrowUp size={17} />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;