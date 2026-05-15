"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Link2, ImageIcon, Quote, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Subscript as SubIcon, Superscript as SupIcon,
  Eraser, ChevronDown,
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

const BTN = "w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-champagne-darker disabled:opacity-30";
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

function Divider() {
  return <div className="w-px h-5 bg-line mx-0.5 shrink-0" />;
}

export default function RichTextEditor({ value, onChange, onImageRequest, editorRef, placeholder, minHeight = 320 }: Props) {
  const [linkInput, setLinkInput] = useState<string | null>(null);
  const [colorInput, setColorInput] = useState<string | null>(null);
  const [highlightInput, setHighlightInput] = useState<string | null>(null);
  const linkRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "outline-none px-4 py-3",
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  // Expose editor instance to parent
  useEffect(() => { if (editorRef) editorRef.current = editor ?? null; }, [editor, editorRef]);

  // Sync external value changes (e.g. language switch)
  const prevValue = useRef(value);
  useEffect(() => {
    if (!editor || value === prevValue.current) return;
    prevValue.current = value;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "");
    }
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
    <div className="tiptap-admin border border-line rounded-xl bg-white overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-line bg-champagne/60 select-none">

        {/* Paragraph / Heading dropdown */}
        <div className="relative">
          <select
            className="h-7 pl-2 pr-6 text-xs rounded bg-transparent border border-line text-ink cursor-pointer appearance-none hover:bg-champagne-darker focus:outline-none"
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
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>
          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-black-40" />
        </div>

        <Divider />

        <ToolBtn active={isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (⌘B)">
          <Bold size={13} />
        </ToolBtn>
        <ToolBtn active={isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (⌘I)">
          <Italic size={13} />
        </ToolBtn>
        <ToolBtn active={isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (⌘U)">
          <UnderlineIcon size={13} />
        </ToolBtn>
        <ToolBtn active={isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough size={13} />
        </ToolBtn>

        <Divider />

        {/* Link */}
        <div className="relative">
          <ToolBtn active={isActive("link")} onClick={setLink} title="Link">
            <Link2 size={13} />
          </ToolBtn>
          {linkInput !== null && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-line rounded-xl shadow-lg p-3 flex gap-2 items-center min-w-[260px]">
              <input
                ref={linkRef}
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") applyLink(); if (e.key === "Escape") setLinkInput(null); }}
                placeholder="https://example.com"
                className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-line outline-none focus:ring-1 focus:ring-main"
              />
              <button type="button" onClick={applyLink} className="text-xs px-3 py-1.5 bg-main text-white rounded-lg hover:bg-main/80 transition-colors">OK</button>
              {isActive("link") && (
                <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkInput(null); }} className="text-xs px-2 py-1.5 text-red-500 hover:text-red-700">Remove</button>
              )}
            </div>
          )}
        </div>

        {/* Image */}
        <ToolBtn onClick={() => onImageRequest?.()} title="Insert image from library">
          <ImageIcon size={13} />
        </ToolBtn>

        <Divider />

        <ToolBtn active={isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
          <Quote size={13} />
        </ToolBtn>
        <ToolBtn active={isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <ListOrdered size={13} />
        </ToolBtn>
        <ToolBtn active={isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <List size={13} />
        </ToolBtn>

        <Divider />

        <ToolBtn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left">
          <AlignLeft size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center">
          <AlignCenter size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right">
          <AlignRight size={13} />
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Justify">
          <AlignJustify size={13} />
        </ToolBtn>

        <Divider />

        <ToolBtn active={isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()} title="Subscript">
          <SubIcon size={13} />
        </ToolBtn>
        <ToolBtn active={isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()} title="Superscript">
          <SupIcon size={13} />
        </ToolBtn>

        <Divider />

        {/* Text color */}
        <div className="relative">
          <ToolBtn
            active={colorInput !== null}
            onClick={() => setColorInput(colorInput === null ? (editor.getAttributes("textStyle").color || "#000000") : null)}
            title="Text color"
          >
            <span className="flex flex-col items-center gap-0.5">
              <Bold size={11} className="text-ink" />
              <span className="w-4 h-1 rounded-sm" style={{ background: editor.getAttributes("textStyle").color || "#000000" }} />
            </span>
          </ToolBtn>
          {colorInput !== null && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-line rounded-xl shadow-lg p-3 flex flex-col gap-2">
              <input type="color" value={colorInput} onChange={e => { setColorInput(e.target.value); editor.chain().focus().setColor(e.target.value).run(); }} className="w-8 h-8 cursor-pointer rounded border-0" />
              <button type="button" onClick={() => { editor.chain().focus().unsetColor().run(); setColorInput(null); }} className="text-[11px] text-black-40 hover:text-black">Reset</button>
            </div>
          )}
        </div>

        {/* Highlight */}
        <div className="relative">
          <ToolBtn
            active={isActive("highlight")}
            onClick={() => setHighlightInput(highlightInput === null ? (editor.getAttributes("highlight").color || "#ffe066") : null)}
            title="Highlight"
          >
            <span className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-bold leading-none" style={{ fontFamily: "serif" }}>A</span>
              <span className="w-4 h-1 rounded-sm" style={{ background: editor.getAttributes("highlight").color || "#ffe066" }} />
            </span>
          </ToolBtn>
          {highlightInput !== null && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-line rounded-xl shadow-lg p-3 flex flex-col gap-2">
              <input type="color" value={highlightInput} onChange={e => { setHighlightInput(e.target.value); editor.chain().focus().setHighlight({ color: e.target.value }).run(); }} className="w-8 h-8 cursor-pointer rounded border-0" />
              <button type="button" onClick={() => { editor.chain().focus().unsetHighlight().run(); setHighlightInput(null); }} className="text-[11px] text-black-40 hover:text-black">Reset</button>
            </div>
          )}
        </div>

        <Divider />

        <ToolBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
          <Eraser size={13} />
        </ToolBtn>
      </div>

      {/* Editor area */}
      <div className="relative">
        {editor.isEmpty && placeholder && (
          <p className="absolute top-3 left-4 text-sm text-black-30 pointer-events-none select-none">{placeholder}</p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
