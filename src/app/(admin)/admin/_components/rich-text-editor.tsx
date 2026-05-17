"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { ReactRenderer } from "@tiptap/react";
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
import Suggestion from "@tiptap/suggestion";
import { Extension } from "@tiptap/core";
import tippy from "tippy.js";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Link2, ImageIcon, Quote, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  Subscript as SubIcon, Superscript as SupIcon,
  Eraser, ChevronDown, Code, Code2,
  Minus, CheckSquare, Heading1, Heading2, Heading3,
  Type,
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

// ── Slash command menu items ───────────────────────────────────────────────
const SLASH_ITEMS = [
  { title: "Text",        desc: "Plain paragraph",         icon: Type,         cmd: (e: Editor) => e.chain().focus().setParagraph().run() },
  { title: "Heading 1",   desc: "Large section title",     icon: Heading1,     cmd: (e: Editor) => e.chain().focus().setHeading({ level: 1 }).run() },
  { title: "Heading 2",   desc: "Medium section title",    icon: Heading2,     cmd: (e: Editor) => e.chain().focus().setHeading({ level: 2 }).run() },
  { title: "Heading 3",   desc: "Small section title",     icon: Heading3,     cmd: (e: Editor) => e.chain().focus().setHeading({ level: 3 }).run() },
  { title: "Bullet List", desc: "Simple bullet list",      icon: List,         cmd: (e: Editor) => e.chain().focus().toggleBulletList().run() },
  { title: "Numbered List",desc:"Numbered list",           icon: ListOrdered,  cmd: (e: Editor) => e.chain().focus().toggleOrderedList().run() },
  { title: "Task List",   desc: "Checkboxes",              icon: CheckSquare,  cmd: (e: Editor) => e.chain().focus().toggleTaskList().run() },
  { title: "Blockquote",  desc: "Highlighted quote",       icon: Quote,        cmd: (e: Editor) => e.chain().focus().toggleBlockquote().run() },
  { title: "Code Block",  desc: "Monospace code block",    icon: Code2,        cmd: (e: Editor) => e.chain().focus().toggleCodeBlock().run() },
  { title: "Divider",     desc: "Horizontal separator",    icon: Minus,        cmd: (e: Editor) => e.chain().focus().setHorizontalRule().run() },
];

// Slash menu React component
function SlashMenu({ items, command }: { items: typeof SLASH_ITEMS; command: (item: typeof SLASH_ITEMS[0]) => void }) {
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp")   { setSelected(s => Math.max(0, s - 1)); e.preventDefault(); }
      if (e.key === "ArrowDown") { setSelected(s => Math.min(items.length - 1, s + 1)); e.preventDefault(); }
      if (e.key === "Enter")     { command(items[selected]); e.preventDefault(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, selected, command]);

  return (
    <div className="bg-white border border-line rounded-xl shadow-xl overflow-hidden w-64 py-1">
      <p className="px-3 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">Blocks</p>
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); command(item); }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${i === selected ? "bg-champagne-dark" : "hover:bg-champagne-dark"}`}
          >
            <div className="w-7 h-7 rounded-lg bg-champagne-darker flex items-center justify-center shrink-0">
              <Icon size={14} className="text-ink" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{item.title}</p>
              <p className="text-[11px] text-muted">{item.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// SlashCommand TipTap extension
function createSlashExtension(_onImageRequest?: () => void) {
  return Extension.create({
    name: "slashCommand",
    addProseMirrorPlugins() {
      const editor = this.editor;
      return [
        (Suggestion as any)({
          editor,
          char: "/",
          startOfLine: false,
          command: ({ editor: ed, range, props }: any) => {
            ed.chain().focus().deleteRange(range).run();
            props.command(ed);
          },
          items: ({ query }: { query: string }) => {
            const q = query.toLowerCase();
            return SLASH_ITEMS.filter(
              (i) => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
            );
          },
          render: () => {
            let component: ReactRenderer;
            let popup: any;

            return {
              onStart(props: any) {
                component = new ReactRenderer(SlashMenu, {
                  props: { items: props.items, command: (item: any) => props.command(item) },
                  editor: props.editor,
                });
                if (!props.clientRect) return;
                popup = (tippy as any)("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                  theme: "none",
                  zIndex: 9999,
                });
              },
              onUpdate(props: any) {
                component?.updateProps({ items: props.items, command: (item: any) => props.command(item) });
                if (!props.clientRect) return;
                popup?.[0]?.setProps({ getReferenceClientRect: props.clientRect });
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") { popup?.[0]?.hide(); return true; }
                return false;
              },
              onExit() {
                popup?.[0]?.destroy();
                component?.destroy();
              },
            };
          },
        }),
      ];
    },
  });
}

// ── Toolbar helpers ────────────────────────────────────────────────────────
const BTN = "w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-champagne-darker disabled:opacity-30 shrink-0";
const ACTIVE = "bg-champagne-darker text-main";

function ToolBtn({ active, disabled, onClick, title, children }: {
  active?: boolean; disabled?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button type="button" title={title} disabled={disabled}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`${BTN} ${active ? ACTIVE : "text-ink"}`}>
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-line mx-0.5 shrink-0" />;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function RichTextEditor({ value, onChange, onImageRequest, editorRef, placeholder, minHeight = 320 }: Props) {
  const [linkInput, setLinkInput] = useState<string | null>(null);
  const linkRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
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
      createSlashExtension(onImageRequest),
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
    if (linkInput === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      const href = linkInput.startsWith("http") ? linkInput : `https://${linkInput}`;
      editor.chain().focus().setLink({ href }).run();
    }
    setLinkInput(null);
  }, [editor, linkInput]);

  if (!editor) return null;

  const isActive = (name: string, attrs?: object) => editor.isActive(name, attrs);

  return (
    <div className="tiptap-admin border border-line rounded-2xl bg-white overflow-hidden flex flex-col shadow-sm">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-line bg-white select-none sticky top-0 z-10">

        {/* Block type */}
        <div className="relative">
          <select
            className="h-7 pl-2 pr-6 text-xs rounded-lg bg-champagne-dark border-0 text-ink cursor-pointer appearance-none hover:bg-champagne-darker focus:outline-none font-medium"
            value={
              isActive("heading", { level: 1 }) ? "h1" :
              isActive("heading", { level: 2 }) ? "h2" :
              isActive("heading", { level: 3 }) ? "h3" :
              isActive("heading", { level: 4 }) ? "h4" : "p"
            }
            onChange={e => {
              const v = e.target.value;
              if (v === "p") editor.chain().focus().setParagraph().run();
              else editor.chain().focus().setHeading({ level: parseInt(v[1]) as 1|2|3|4 }).run();
            }}
          >
            <option value="p">Text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>
          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted" />
        </div>

        <Sep />

        {/* Text decoration */}
        <ToolBtn active={isActive("bold")}      onClick={() => editor.chain().focus().toggleBold().run()}      title="Bold (⌘B)"><Bold size={13} /></ToolBtn>
        <ToolBtn active={isActive("italic")}    onClick={() => editor.chain().focus().toggleItalic().run()}    title="Italic (⌘I)"><Italic size={13} /></ToolBtn>
        <ToolBtn active={isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (⌘U)"><UnderlineIcon size={13} /></ToolBtn>
        <ToolBtn active={isActive("strike")}    onClick={() => editor.chain().focus().toggleStrike().run()}    title="Strikethrough"><Strikethrough size={13} /></ToolBtn>
        <ToolBtn active={isActive("code")}      onClick={() => editor.chain().focus().toggleCode().run()}      title="Inline code"><Code size={13} /></ToolBtn>

        <Sep />

        {/* Blocks */}
        <ToolBtn active={isActive("blockquote")}   onClick={() => editor.chain().focus().toggleBlockquote().run()}   title="Blockquote"><Quote size={13} /></ToolBtn>
        <ToolBtn active={isActive("codeBlock")}    onClick={() => editor.chain().focus().toggleCodeBlock().run()}    title="Code block"><Code2 size={13} /></ToolBtn>
        <ToolBtn active={isActive("bulletList")}   onClick={() => editor.chain().focus().toggleBulletList().run()}   title="Bullet list"><List size={13} /></ToolBtn>
        <ToolBtn active={isActive("orderedList")}  onClick={() => editor.chain().focus().toggleOrderedList().run()}  title="Numbered list"><ListOrdered size={13} /></ToolBtn>
        <ToolBtn active={isActive("taskList")}     onClick={() => editor.chain().focus().toggleTaskList().run()}     title="Task list (checkboxes)"><CheckSquare size={13} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus size={13} /></ToolBtn>

        <Sep />

        {/* Link */}
        <div className="relative">
          <ToolBtn active={isActive("link")} onClick={setLink} title="Link (⌘K)"><Link2 size={13} /></ToolBtn>
          {linkInput !== null && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-line rounded-xl shadow-xl p-3 flex gap-2 items-center min-w-[280px]">
              <input
                ref={linkRef}
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setLinkInput(null); }}
                placeholder="https://example.com"
                className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-line outline-none focus:ring-1 focus:ring-main"
              />
              <button type="button" onClick={applyLink} className="text-xs px-3 py-1.5 bg-main text-white rounded-lg">OK</button>
              {isActive("link") && (
                <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkInput(null); }} className="text-xs px-2 py-1.5 text-error">Remove</button>
              )}
            </div>
          )}
        </div>

        {/* Image */}
        {onImageRequest && (
          <ToolBtn onClick={onImageRequest} title="Insert image"><ImageIcon size={13} /></ToolBtn>
        )}

        <Sep />

        {/* Alignment */}
        <ToolBtn active={editor.isActive({ textAlign: "left" })}    onClick={() => editor.chain().focus().setTextAlign("left").run()}    title="Left"><AlignLeft size={13} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "center" })}  onClick={() => editor.chain().focus().setTextAlign("center").run()}  title="Center"><AlignCenter size={13} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "right" })}   onClick={() => editor.chain().focus().setTextAlign("right").run()}   title="Right"><AlignRight size={13} /></ToolBtn>

        <Sep />

        {/* Sub / Sup */}
        <ToolBtn active={isActive("subscript")}   onClick={() => editor.chain().focus().toggleSubscript().run()}   title="Subscript"><SubIcon size={13} /></ToolBtn>
        <ToolBtn active={isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript"><SupIcon size={13} /></ToolBtn>

        <Sep />

        {/* Text color */}
        <div className="relative group">
          <button
            type="button"
            title="Text color"
            className={`${BTN} text-ink flex-col gap-0`}
          >
            <span className="text-[11px] font-bold leading-none">A</span>
            <span className="w-4 h-1 rounded-sm mt-0.5" style={{ background: editor.getAttributes("textStyle").color || "#1a1a1a" }} />
            <input
              type="color"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              value={editor.getAttributes("textStyle").color || "#1a1a1a"}
              onChange={e => editor.chain().focus().setColor(e.target.value).run()}
              title="Text color"
            />
          </button>
        </div>

        {/* Highlight */}
        <div className="relative">
          <button
            type="button"
            title="Highlight"
            className={`${BTN} text-ink flex-col gap-0 ${isActive("highlight") ? ACTIVE : ""}`}
          >
            <span className="text-[11px] font-bold leading-none" style={{ fontFamily: "serif" }}>H</span>
            <span className="w-4 h-1 rounded-sm mt-0.5" style={{ background: editor.getAttributes("highlight").color || "#ffe066" }} />
            <input
              type="color"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              value={editor.getAttributes("highlight").color || "#ffe066"}
              onChange={e => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
              title="Highlight color"
            />
          </button>
        </div>

        <Sep />

        <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting"><Eraser size={13} /></ToolBtn>
      </div>

      {/* ── Editor area ── */}
      <div className="relative flex-1">
        {editor.isEmpty && placeholder && (
          <div className="absolute top-6 left-8 text-sm text-black-30 pointer-events-none select-none">
            <p>{placeholder}</p>
            <p className="text-[11px] mt-1 text-black-20">Type <kbd className="bg-champagne-dark px-1 py-0.5 rounded text-[10px]">/</kbd> to insert blocks</p>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
