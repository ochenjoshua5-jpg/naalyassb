"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { Bold, Heading2, Heading3, Image as ImageIcon, Italic, Link as LinkIcon, List, Redo2, Undo2, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Callout, Panel } from "./ui";
import { formatEatDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";

export const DRAFT_KEY = "staff:news-draft:v1";
export const AUTOSAVE_MS = 30_000;
export const CHARACTER_LIMIT = 2000;

/** Only web and email links. Blocks javascript:, data: and other schemes. */
export function isSafeLink(url: string): boolean {
  return /^(https?:\/\/|mailto:)/i.test(url.trim());
}
/** Images must be https. Alt text is mandatory (see the insert form). */
export function isSafeImageUrl(url: string): boolean {
  return /^https:\/\/[^\s]+$/i.test(url.trim());
}

interface Draft {
  title: string;
  doc: unknown;
  savedAt: string;
}

export function ContentEditor({ canPublish }: { canPublish: boolean }) {
  const [title, setTitle] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const [imageForm, setImageForm] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const titleRef = useRef(title);
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  // Restores this device's saved draft once, when the editor is created (not in an effect).
  function restoreDraft(instance: Editor) {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Draft;
      if (typeof draft.title === "string") setTitle(draft.title);
      if (draft.doc) instance.commands.setContent(draft.doc as Record<string, unknown>, { emitUpdate: false });
      setSavedAt(typeof draft.savedAt === "string" ? draft.savedAt : null);
      setCount(instance.storage.characterCount.characters());
    } catch {
      // A damaged draft is ignored rather than loaded.
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    onCreate: ({ editor: instance }) => restoreDraft(instance),
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { HTMLAttributes: { class: "list-disc pl-6" } },
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
        // StarterKit ships its own Link. Turn it off: only the Link configured below (which checks
        // every address with isSafeLink) may create links.
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: false,
        isAllowedUri: (url) => isSafeLink(url),
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Image.configure({ allowBase64: false, inline: false }),
      Placeholder.configure({ placeholder: "Start writing your news article…" }),
      // No "limit" here: the extension would silently cut the text at 2,000 characters. Instead the
      // counter shows the true length and asks the author to shorten it, so nothing is lost unseen.
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-[22rem] max-w-[720px] mx-auto text-[18px] leading-[1.75] text-navy focus:outline-none prose-headings:font-serif [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:font-serif [&_h3]:text-2xl [&_img]:rounded-xl [&_a]:underline [&_a]:decoration-gold [&_a]:decoration-2",
        "aria-label": "News article body",
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor: instance }) => {
      setDirty(true);
      setCount(instance.storage.characterCount.characters());
    },
  });

  const saveDraft = useCallback(
    (instance: Editor | null) => {
      if (!instance) return;
      const draft: Draft = { title: titleRef.current, doc: instance.getJSON(), savedAt: new Date().toISOString() };
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setSavedAt(draft.savedAt);
        setDirty(false);
      } catch {
        // Storage can be full or blocked. Say so, rather than pretend it saved.
        setSavedAt(null);
      }
    },
    [],
  );

  // Autosave every 30 seconds while there are unsaved changes.
  useEffect(() => {
    if (!editor) return;
    const timer = window.setInterval(() => {
      if (editor && (dirty || titleRef.current)) saveDraft(editor);
    }, AUTOSAVE_MS);
    return () => window.clearInterval(timer);
  }, [editor, dirty, saveDraft]);

  // Also save when the staff member leaves the page.
  useEffect(() => {
    function onHide() {
      if (document.visibilityState === "hidden") saveDraft(editor);
    }
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [editor, saveDraft]);

  useEffect(() => {
    if (preview && editor) editor.setEditable(false);
    else if (editor) editor.setEditable(true);
  }, [preview, editor]);

  function submitImage(event: React.FormEvent) {
    event.preventDefault();
    if (!editor) return;
    if (!isSafeImageUrl(imageUrl)) {
      setImageError("Please paste the full web address of an approved image. It must start with https://");
      return;
    }
    if (imageAlt.trim().length < 5) {
      setImageError("Please describe the picture in at least 5 words or characters for people who cannot see it.");
      return;
    }
    editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() }).run();
    setImageForm(false);
    setImageUrl("");
    setImageAlt("");
    setImageError(null);
    setDirty(true);
  }

  function submitLink(event: React.FormEvent) {
    event.preventDefault();
    if (!editor) return;
    if (!isSafeLink(linkUrl)) {
      setLinkError("Please use a full address that starts with https://, or an email address that starts with mailto:");
      return;
    }
    const href = linkUrl.trim();
    if (editor.state.selection.empty && !editor.isActive("link")) {
      // Nothing selected: the address itself becomes the linked text, so the click always does something.
      editor.chain().focus().insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkForm(false);
    setLinkUrl("");
    setLinkError(null);
    setDirty(true);
  }

  const over = count > CHARACTER_LIMIT;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-navy md:text-4xl">News and notices</h1>
          <p className="mt-2 text-base text-ink-muted">Write a notice the way it should read on the website.</p>
        </div>
      </header>

      {!canPublish ? (
        <Callout tone="urgent" title="Only the admissions team and the Headmaster can edit news.">
          <p>Please ask them to publish a notice for you.</p>
        </Callout>
      ) : null}

      <Callout tone="info" title="Publishing is not switched on yet.">
        <p>
          Drafts are saved on this device only and are not visible to parents. Publishing and scheduling need the school’s
          approval and a connected store before they can go live.
        </p>
      </Callout>

      <Panel className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-navy">Headline</span>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setDirty(true);
            }}
            maxLength={120}
            disabled={!canPublish || preview}
            placeholder="For example: Parents’ meeting date"
            className="min-h-12 rounded-xl border border-line bg-card px-4 font-serif text-2xl text-navy disabled:opacity-70"
          />
        </label>

        {!preview ? (
          <div role="toolbar" aria-label="Formatting" className="sticky top-16 z-10 flex flex-wrap items-center gap-1 rounded-xl bg-soft-grey p-2">
            <ToolButton label="Bold" pressed={!!editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} disabled={!canPublish}><Bold aria-hidden className="size-5" /></ToolButton>
            <ToolButton label="Italic" pressed={!!editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} disabled={!canPublish}><Italic aria-hidden className="size-5" /></ToolButton>
            <ToolButton label="Heading 2" pressed={!!editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} disabled={!canPublish}><Heading2 aria-hidden className="size-5" /></ToolButton>
            <ToolButton label="Heading 3" pressed={!!editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} disabled={!canPublish}><Heading3 aria-hidden className="size-5" /></ToolButton>
            <ToolButton label="Bullet list" pressed={!!editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} disabled={!canPublish}><List aria-hidden className="size-5" /></ToolButton>
            <ToolButton label="Link" pressed={!!editor?.isActive("link")} onClick={() => { setLinkForm((v) => !v); setLinkError(null); }} disabled={!canPublish}><LinkIcon aria-hidden className="size-5" /></ToolButton>
            <ToolButton label="Insert image" pressed={imageForm} onClick={() => { setImageForm((v) => !v); setImageError(null); }} disabled={!canPublish}><ImageIcon aria-hidden className="size-5" /></ToolButton>
            <ToolButton label="Undo" onClick={() => editor?.chain().focus().undo().run()} disabled={!canPublish}><Undo2 aria-hidden className="size-5" /></ToolButton>
            <ToolButton label="Redo" onClick={() => editor?.chain().focus().redo().run()} disabled={!canPublish}><Redo2 aria-hidden className="size-5" /></ToolButton>
          </div>
        ) : null}

        {linkForm && !preview ? (
          <form onSubmit={submitLink} className="flex flex-col gap-2 rounded-xl border border-line bg-card p-4" aria-label="Add a link">
            <label className="flex flex-col gap-1 text-sm font-semibold text-navy">
              Web address (https://…) or email (mailto:…)
              <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="min-h-11 rounded-lg border border-line px-3 text-base font-normal" />
            </label>
            {linkError ? <p role="alert" className="text-sm font-semibold text-red-800">{linkError}</p> : null}
            <div><Button type="submit" className="min-h-11">Add link</Button></div>
          </form>
        ) : null}

        {imageForm && !preview ? (
          <form onSubmit={submitImage} className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4" aria-label="Insert an image">
            <p className="text-sm text-ink-muted">Use only approved school photos. Alt text is required.</p>
            <label className="flex flex-col gap-1 text-sm font-semibold text-navy">
              Image web address (https://…)
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="min-h-11 rounded-lg border border-line px-3 text-base font-normal" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-navy">
              Describe the picture (required)
              <input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} className="min-h-11 rounded-lg border border-line px-3 text-base font-normal" />
            </label>
            {imageError ? <p role="alert" className="text-sm font-semibold text-red-800">{imageError}</p> : null}
            <div><Button type="submit" className="min-h-11">Insert picture</Button></div>
          </form>
        ) : null}

        <div className={cn("rounded-xl bg-card", preview ? "p-6 md:p-10" : "border border-line p-4 md:p-6")}>
          {preview ? <p className="mb-6 text-center text-sm font-semibold text-ink-muted">Preview: how this will look on the News page</p> : null}
          {preview && title ? <h2 className="mx-auto mb-6 max-w-[720px] font-serif text-4xl font-semibold text-navy">{title}</h2> : null}
          <EditorContent editor={editor} className="tiptap-staff" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className={cn("font-semibold tabular-nums", over ? "text-red-800" : "text-ink-muted")} aria-live="polite">
            {count} / {CHARACTER_LIMIT} characters{over ? " — please shorten the article" : ""}
          </p>
          <p role="status" className="text-ink-muted">
            {savedAt ? `Saved on this device at ${formatEatDateTime(savedAt)}` : "Not saved yet"}
            {dirty ? " · unsaved changes" : ""}
          </p>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="min-h-12" onClick={() => setPreview((v) => !v)} aria-pressed={preview}>
          {preview ? <><Pencil aria-hidden className="size-5" /> Back to editing</> : <><Eye aria-hidden className="size-5" /> Preview</>}
        </Button>
        <Button className="min-h-12" onClick={() => saveDraft(editor)} disabled={!canPublish}>
          Save draft on this device
        </Button>
        <Button className="min-h-12" disabled aria-describedby="publish-note">
          Publish
        </Button>
        <Button variant="outline" className="min-h-12" disabled aria-describedby="publish-note">
          Schedule
        </Button>
        <p id="publish-note" className="text-sm text-ink-muted">
          Publish and Schedule are off until the school approves publishing and a store is connected.
        </p>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  pressed,
  onClick,
  disabled,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-lg text-navy hover:bg-card disabled:opacity-40",
        pressed && "bg-navy text-warm-white hover:bg-navy",
      )}
    >
      {children}
    </button>
  );
}
