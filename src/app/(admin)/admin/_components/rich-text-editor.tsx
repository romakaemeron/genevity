"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Extension } from "@tiptap/core";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Link2, ImageIcon, Quote, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  Subscript as SubIcon, Superscript as SupIcon,
  Eraser, ChevronDown, Code, Code2,
  Minus, CheckSquare, Heading2, Heading3,
  Type, TableIcon, Trash2,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  onImageRequest?: () => void;
  editorRef?: React.MutableRefObject<Editor | null>;
  placeholder?: string;
  minHeight?: number;
}

// ── Slash command items ────────────────────────────────────────────────────
const SLASH_ITEMS = [
  { title: "Text",         desc: "Plain paragraph",       icon: Type,        cmd: (e: Editor) => e.chain().focus().setParagraph().run() },
  { title: "Heading 2",   desc: "Section title",          icon: Heading2,    cmd: (e: Editor) => e.chain().focus().setHeading({ level: 2 }).run() },
  { title: "Heading 3",   desc: "Sub-section",            icon: Heading3,    cmd: (e: Editor) => e.chain().focus().setHeading({ level: 3 }).run() },
  { title: "Bullet List", desc: "Simple bullet list",     icon: List,        cmd: (e: Editor) => e.chain().focus().toggleBulletList().run() },
  { title: "Numbered",    desc: "Numbered list",          icon: ListOrdered, cmd: (e: Editor) => e.chain().focus().toggleOrderedList().run() },
  { title: "Task List",   desc: "Checkboxes",             icon: CheckSquare, cmd: (e: Editor) => e.chain().focus().toggleTaskList().run() },
  { title: "Table",       desc: "3×3 table",              icon: TableIcon,   cmd: (e: Editor) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { title: "Blockquote",  desc: "Highlighted quote",      icon: Quote,       cmd: (e: Editor) => e.chain().focus().toggleBlockquote().run() },
  { title: "Code Block",  desc: "Monospace code block",   icon: Code2,       cmd: (e: Editor) => e.chain().focus().toggleCodeBlock().run() },
  { title: "Divider",     desc: "Horizontal separator",   icon: Minus,       cmd: (e: Editor) => e.chain().focus().setHorizontalRule().run() },
];

// ── Slash menu state type ──────────────────────────────────────────────────
interface SlashMenuState {
  top: number;
  left: number;
  from: number;  // document position of the "/" character
  query: string;
}

// Minimal placeholder extension (slash detection handled via DOM keydown in React)
function createSlashExtension() {
  return Extension.create({ name: "slashCommand" });
}

// ── Toolbar helpers ────────────────────────────────────────────────────────
const BTN = "w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-champagne-darker disabled:opacity-30 shrink-0";
const ACTIVE_CLS = "bg-champagne-darker text-main";

function ToolBtn({ active, disabled, onClick, title, children }: {
  active?: boolean; disabled?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button type="button" title={title} disabled={disabled}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`${BTN} ${active ? ACTIVE_CLS : "text-foreground"}`}
    >
      {children}
    </button>
  );
}

function Sep() { return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />; }

// ── Floating bubble toolbar (appears on text selection) ───────────────────
function FloatingToolbar({ editor, onLinkClick }: { editor: Editor; onLinkClick: () => void }) {
  const ia = (name: string, attrs?: Record<string, unknown>) => editor.isActive(name, attrs);
  return (
    <div className="flex items-center gap-0.5 bg-foreground rounded-xl px-1.5 py-1 shadow-2xl border border-white/10">
      {/* Heading toggles */}
      <button type="button" title="Heading 2" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
        className={`px-2 h-6 rounded text-[11px] font-semibold transition-colors ${ia("heading", { level: 2 }) ? "bg-white text-foreground" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
        H2
      </button>
      <button type="button" title="Heading 3" onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); }}
        className={`px-2 h-6 rounded text-[11px] font-semibold transition-colors ${ia("heading", { level: 3 }) ? "bg-white text-foreground" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
        H3
      </button>
      <div className="w-px h-4 bg-white/20 mx-0.5" />
      {/* Inline marks */}
      {[
        { name: "bold",      icon: <Bold size={12} />,              cmd: () => editor.chain().focus().toggleBold().run(),      title: "Bold (⌘B)" },
        { name: "italic",    icon: <Italic size={12} />,            cmd: () => editor.chain().focus().toggleItalic().run(),    title: "Italic (⌘I)" },
        { name: "underline", icon: <UnderlineIcon size={12} />,     cmd: () => editor.chain().focus().toggleUnderline().run(), title: "Underline" },
        { name: "strike",    icon: <Strikethrough size={12} />,     cmd: () => editor.chain().focus().toggleStrike().run(),    title: "Strike" },
        { name: "code",      icon: <Code size={12} />,              cmd: () => editor.chain().focus().toggleCode().run(),      title: "Inline code" },
      ].map(({ name, icon, cmd, title }) => (
        <button key={name} type="button" title={title}
          onMouseDown={e => { e.preventDefault(); cmd(); }}
          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${ia(name) ? "bg-white text-foreground" : "text-white/80 hover:text-white hover:bg-white/10"}`}
        >
          {icon}
        </button>
      ))}
      <div className="w-px h-4 bg-white/20 mx-0.5" />
      {/* Link */}
      <button type="button" title="Link" onMouseDown={e => { e.preventDefault(); onLinkClick(); }}
        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${ia("link") ? "bg-white text-foreground" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
        <Link2 size={12} />
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
// ── Custom floating bubble menu ────────────────────────────────────────────
function useBubbleMenu(editor: Editor | null) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      const { selection } = editor.state;
      if (selection.empty || editor.isActive("image")) {
        setPos(null);
        return;
      }
      const { from, to } = selection;
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const container = containerRef.current?.getBoundingClientRect();
      if (!container) return;
      const midX = (start.left + end.right) / 2 - container.left;
      const topY = start.top - container.top - 44;
      setPos({ top: Math.max(4, topY), left: Math.max(0, midX - 140) });
    };
    const clearPos = () => setPos(null);
    editor.on("selectionUpdate", update);
    editor.on("blur", clearPos);
    return () => { editor.off("selectionUpdate", update); editor.off("blur", clearPos); };
  }, [editor]);

  return { pos, containerRef };
}

export default function RichTextEditor({ value, onChange, onImageRequest, editorRef, placeholder, minHeight = 320 }: Props) {
  const [linkInput, setLinkInput] = useState<string | null>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const [slashSelected, setSlashSelected] = useState(0);
  const slashMenuRef = useRef<SlashMenuState | null>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = document.createElement("div");
    div.id = "slash-menu-root";
    document.body.appendChild(div);
    portalContainerRef.current = div;
    return () => { document.body.removeChild(div); portalContainerRef.current = null; };
  }, []);

  const closeSlash = useCallback(() => {
    setSlashMenu(null);
    slashMenuRef.current = null;
    setSlashSelected(0);
  }, []);

  const slashExt = useRef(createSlashExtension()).current;

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      slashExt,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "outline-none px-8 py-6 notion-editor",
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  useEffect(() => { if (editorRef) editorRef.current = editor ?? null; }, [editor, editorRef]);

  const prevValue = useRef(value);
  useEffect(() => {
    if (!editor || value === prevValue.current) return;
    prevValue.current = value;
    if (editor.getHTML() !== value) editor.commands.setContent(value || "");
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (linkInput === null) {
      const current = editor?.getAttributes("link").href || "";
      setLinkInput(current);
      setTimeout(() => linkRef.current?.focus(), 50);
    }
  }, [editor, linkInput]);

  const applyLink = useCallback(() => {
    if (!editor || linkInput === null) return;
    if (linkInput === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: linkInput.startsWith("http") ? linkInput : `https://${linkInput}` }).run();
    setLinkInput(null);
  }, [editor, linkInput]);

  // Detect "/" keypress — listen on document, check target is inside editor
  useEffect(() => {
    if (!editor) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!editor.view.dom.contains(e.target as Node)) return;
      if (e.key === "Escape" && slashMenuRef.current) { closeSlash(); return; }
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      setTimeout(() => {
        const { from: cursorAfter } = editor.state.selection;
        const slashPos = cursorAfter - 1;
        if (slashPos < 1) return;
        const charAtSlash = editor.state.doc.textBetween(slashPos, cursorAfter, "");
        if (charAtSlash !== "/") return;
        const coords = editor.view.coordsAtPos(slashPos);
        const menuH = 360;
        const spaceBelow = window.innerHeight - coords.bottom;
        const top = spaceBelow < menuH ? Math.max(4, coords.top - menuH - 4) : coords.bottom + 4;
        const state: SlashMenuState = { top, left: coords.left, from: slashPos, query: "" };
        slashMenuRef.current = state;
        setSlashMenu(state);
        setSlashSelected(0);
      }, 0);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); };
  }, [editor, closeSlash]);

  // Track query as user types after "/"
  useEffect(() => {
    if (!editor) return;
    const onTransaction = () => {
      const current = slashMenuRef.current;
      if (!current) return;
      const { from } = editor.state.selection;
      if (from <= current.from) { closeSlash(); return; }
      const textNode = editor.state.doc.textBetween(current.from, from, "");
      if (!textNode.startsWith("/")) { closeSlash(); return; }
      const query = textNode.slice(1);
      if (query !== current.query) {
        const next = { ...current, query };
        slashMenuRef.current = next;
        setSlashMenu(next);
        setSlashSelected(0);
      }
    };
    editor.on("transaction", onTransaction);
    return () => { editor.off("transaction", onTransaction); };
  }, [editor, closeSlash]);

  // Keyboard nav for slash menu
  useEffect(() => {
    if (!slashMenu) return;
    const q = slashMenu.query.toLowerCase();
    const filtered = q
      ? SLASH_ITEMS.filter(i => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q))
      : SLASH_ITEMS;

    const onKey = (e: KeyboardEvent) => {
      if (!slashMenuRef.current) return;
      if (e.key === "ArrowUp")   { e.preventDefault(); setSlashSelected(s => Math.max(0, s - 1)); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSlashSelected(s => Math.min(filtered.length - 1, s + 1)); return; }
      if (e.key === "Enter" && filtered.length > 0) {
        e.preventDefault();
        const item = filtered[slashSelected] ?? filtered[0];
        if (item && slashMenuRef.current && editor) {
          const { from } = slashMenuRef.current;
          const to = editor.state.selection.from;
          editor.chain().focus().deleteRange({ from, to }).run();
          item.cmd(editor);
        }
        closeSlash();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [slashMenu, slashSelected, editor, closeSlash]);

  const { pos, containerRef } = useBubbleMenu(editor);

  if (!editor) return null;

  // Slash menu filtered items
  const slashQuery = slashMenu?.query.toLowerCase() ?? "";
  const slashItems = slashQuery
    ? SLASH_ITEMS.filter(i => i.title.toLowerCase().includes(slashQuery) || i.desc.toLowerCase().includes(slashQuery))
    : SLASH_ITEMS;

  const ia = (name: string, attrs?: Record<string, unknown>) => editor.isActive(name, attrs);
  const inTable = editor.isActive("tableCell") || editor.isActive("tableHeader");

  return (
    <div ref={containerRef} className="tiptap-admin border border-border rounded-2xl bg-champagne overflow-clip flex flex-col shadow-sm relative">

      {/* ── Slash command menu (dedicated portal container) ── */}
      {slashMenu && slashItems.length > 0 && portalContainerRef.current && createPortal(
        <div
          className="fixed z-[9999] bg-white border border-border rounded-xl shadow-xl w-60 py-1 overflow-y-auto"
          style={{ top: slashMenu.top, left: slashMenu.left, maxHeight: "min(360px, calc(100vh - 16px))" }}
          onMouseDown={e => e.preventDefault()}
        >
          <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Blocks</p>
          {slashItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={item.title} type="button"
                onMouseDown={e => {
                  e.preventDefault();
                  if (slashMenuRef.current && editor) {
                    const { from } = slashMenuRef.current;
                    const to = editor.state.selection.from;
                    editor.chain().focus().deleteRange({ from, to }).run();
                    item.cmd(editor);
                  }
                  closeSlash();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${i === slashSelected ? "bg-champagne-dark" : "hover:bg-champagne-dark"}`}
              >
                <div className="w-7 h-7 rounded-lg bg-champagne-darker flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>,
        portalContainerRef.current
      )}

      {/* ── Floating bubble on text selection ── */}
      {pos && (
        <div
          className="absolute z-50 pointer-events-auto"
          style={{ top: pos.top, left: pos.left }}
          onMouseDown={e => e.preventDefault()}
        >
          <FloatingToolbar editor={editor} onLinkClick={setLink} />
        </div>
      )}

      {/* ── Sticky toolbar group (main + table context) ── */}
      <div className="sticky top-14 z-20 shrink-0">
      {/* Main toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-white select-none">

        {/* Block type */}
        <div className="relative">
          <select
            className="h-7 pl-2 pr-6 text-xs rounded-lg bg-champagne-dark border-0 text-foreground cursor-pointer appearance-none hover:bg-champagne-darker focus:outline-none font-medium"
            value={ia("heading", { level: 2 }) ? "h2" : ia("heading", { level: 3 }) ? "h3" : ia("heading", { level: 4 }) ? "h4" : "p"}
            onMouseDown={e => e.stopPropagation()}
            onChange={e => {
              const v = e.target.value;
              if (v === "p") editor.chain().focus().setParagraph().run();
              else editor.chain().focus().setHeading({ level: parseInt(v[1]) as 1|2|3|4 }).run();
            }}
          >
            <option value="p">Text</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>
          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
        </div>

        <Sep />

        <ToolBtn active={ia("bold")}      onClick={() => editor.chain().focus().toggleBold().run()}      title="Bold (⌘B)"><Bold size={13} /></ToolBtn>
        <ToolBtn active={ia("italic")}    onClick={() => editor.chain().focus().toggleItalic().run()}    title="Italic (⌘I)"><Italic size={13} /></ToolBtn>
        <ToolBtn active={ia("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon size={13} /></ToolBtn>
        <ToolBtn active={ia("strike")}    onClick={() => editor.chain().focus().toggleStrike().run()}    title="Strike"><Strikethrough size={13} /></ToolBtn>
        <ToolBtn active={ia("code")}      onClick={() => editor.chain().focus().toggleCode().run()}      title="Code"><Code size={13} /></ToolBtn>

        <Sep />

        <ToolBtn active={ia("blockquote")}  onClick={() => editor.chain().focus().toggleBlockquote().run()}  title="Blockquote"><Quote size={13} /></ToolBtn>
        <ToolBtn active={ia("codeBlock")}   onClick={() => editor.chain().focus().toggleCodeBlock().run()}   title="Code block"><Code2 size={13} /></ToolBtn>
        <ToolBtn active={ia("bulletList")}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Bullet list"><List size={13} /></ToolBtn>
        <ToolBtn active={ia("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list"><ListOrdered size={13} /></ToolBtn>
        <ToolBtn active={ia("taskList")}    onClick={() => editor.chain().focus().toggleTaskList().run()}    title="Task list"><CheckSquare size={13} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={13} /></ToolBtn>

        <Sep />

        {/* Insert table button */}
        <ToolBtn
          active={inTable}
          onClick={() => !inTable && editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert table"
        >
          <TableIcon size={13} />
        </ToolBtn>

        <Sep />

        {/* Link */}
        <div className="relative">
          <ToolBtn active={ia("link")} onClick={setLink} title="Link (⌘K)"><Link2 size={13} /></ToolBtn>
          {linkInput !== null && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-border rounded-xl shadow-xl p-3 flex gap-2 items-center min-w-[280px]">
              <input ref={linkRef} value={linkInput} onChange={e => setLinkInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setLinkInput(null); }}
                placeholder="https://example.com"
                className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-border outline-none focus:ring-1 focus:ring-main"
              />
              <button type="button" onClick={applyLink} className="text-xs px-3 py-1.5 bg-main text-white rounded-lg">OK</button>
              {ia("link") && (
                <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkInput(null); }} className="text-xs px-2 py-1.5 text-destructive">×</button>
              )}
            </div>
          )}
        </div>

        {onImageRequest && (
          <ToolBtn onClick={onImageRequest} title="Insert image"><ImageIcon size={13} /></ToolBtn>
        )}

        <Sep />

        <ToolBtn active={editor.isActive({ textAlign: "left" })}   onClick={() => editor.chain().focus().setTextAlign("left").run()}   title="Left"><AlignLeft size={13} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Center"><AlignCenter size={13} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "right" })}  onClick={() => editor.chain().focus().setTextAlign("right").run()}  title="Right"><AlignRight size={13} /></ToolBtn>

        <Sep />

        <ToolBtn active={ia("subscript")}   onClick={() => editor.chain().focus().toggleSubscript().run()}   title="Subscript"><SubIcon size={13} /></ToolBtn>
        <ToolBtn active={ia("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript"><SupIcon size={13} /></ToolBtn>

        <Sep />

        {/* Text color */}
        <div className="relative">
          <button type="button" title="Text color" className={`${BTN} text-foreground flex-col gap-0`}>
            <span className="text-[11px] font-bold leading-none">A</span>
            <span className="w-4 h-1 rounded-sm mt-0.5" style={{ background: editor.getAttributes("textStyle").color || "#1a1a1a" }} />
            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              value={editor.getAttributes("textStyle").color || "#1a1a1a"}
              onChange={e => editor.chain().focus().setColor(e.target.value).run()} />
          </button>
        </div>

        {/* Highlight */}
        <div className="relative">
          <button type="button" title="Highlight" className={`${BTN} flex-col gap-0 ${ia("highlight") ? ACTIVE_CLS : "text-foreground"}`}>
            <span className="text-[11px] font-bold leading-none" style={{ fontFamily: "serif" }}>H</span>
            <span className="w-4 h-1 rounded-sm mt-0.5" style={{ background: editor.getAttributes("highlight").color || "#ffe066" }} />
            <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              value={editor.getAttributes("highlight").color || "#ffe066"}
              onChange={e => editor.chain().focus().setHighlight({ color: e.target.value }).run()} />
          </button>
        </div>

        <Sep />

        <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting"><Eraser size={13} /></ToolBtn>
      </div>

      {/* Table context bar (auto-shows when cursor is inside a table) */}
      {inTable && (
        <div className="flex items-center gap-1 px-3 py-1.5 border-b border-main/20 bg-champagne-dark select-none animate-in fade-in duration-150">
          <TableIcon size={12} className="text-main shrink-0" />
          <span className="text-[11px] font-semibold text-main mr-1.5">Таблиця</span>
          <div className="w-px h-4 bg-main/20 mx-0.5" />
          <button type="button" title="Add column before" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }}
            className="h-6 px-2 rounded text-[11px] font-medium text-foreground hover:bg-main/10 transition-colors">← Стовпець</button>
          <button type="button" title="Add column after" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}
            className="h-6 px-2 rounded text-[11px] font-medium text-foreground hover:bg-main/10 transition-colors">Стовпець →</button>
          <div className="w-px h-4 bg-main/20 mx-0.5" />
          <button type="button" title="Add row before" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }}
            className="h-6 px-2 rounded text-[11px] font-medium text-foreground hover:bg-main/10 transition-colors">↑ Рядок</button>
          <button type="button" title="Add row after" onMouseDown={e => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}
            className="h-6 px-2 rounded text-[11px] font-medium text-foreground hover:bg-main/10 transition-colors">Рядок ↓</button>
          <div className="w-px h-4 bg-main/20 mx-0.5" />
          <button type="button" title="Delete column" onMouseDown={e => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }}
            className="h-6 px-2 rounded text-[11px] font-medium text-red-500 hover:bg-red-50 transition-colors">− Стовпець</button>
          <button type="button" title="Delete row" onMouseDown={e => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }}
            className="h-6 px-2 rounded text-[11px] font-medium text-red-500 hover:bg-red-50 transition-colors">− Рядок</button>
          <div className="w-px h-4 bg-main/20 mx-0.5" />
          <button type="button" title="Delete table" onMouseDown={e => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }}
            className="h-6 px-2 rounded text-[11px] font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1">
            <Trash2 size={11} /> Видалити
          </button>
        </div>
      )}
      </div>{/* end sticky toolbar group */}

      {/* ── Editor area ── */}
      <div className="relative flex-1"
        onKeyDown={e => {
          if (e.key === "Escape" && slashMenuRef.current) { closeSlash(); return; }
          if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
          setTimeout(() => {
            if (slashMenuRef.current) return;
            const { from: cur } = editor.state.selection;
            const sp = cur - 1;
            if (sp < 1) return;
            const ch = editor.state.doc.textBetween(sp, cur, "");
            if (ch !== "/") return;
            const c = editor.view.coordsAtPos(sp);
            const below = window.innerHeight - c.bottom;
            const top = below < 360 ? Math.max(4, c.top - 364) : c.bottom + 4;
            const state: SlashMenuState = { top, left: c.left, from: sp, query: "" };
            slashMenuRef.current = state;
            setSlashMenu(state);
            setSlashSelected(0);
          }, 0);
        }}
      >
        {editor.isEmpty && placeholder && (
          <div className="absolute top-6 left-8 text-sm text-muted-foreground/50 pointer-events-none select-none">
            <p>{placeholder}</p>
            <p className="text-[11px] mt-1 text-muted-foreground/30">Type <kbd className="bg-champagne-dark px-1 py-0.5 rounded text-[10px]">/</kbd> to insert blocks</p>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
