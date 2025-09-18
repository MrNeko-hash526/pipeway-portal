import React from "react"

type ExecFn = (cmd: string, val?: string) => void

export function PolicyToolbar(props: {
  exec: ExecFn
  insertImage: (file: File) => void
  createLink: () => void
  insertTable: (rows: number, cols: number) => void
}) {
  const fileRef = React.useRef<HTMLInputElement | null>(null)
  const [formatBlock, setFormatBlock] = React.useState<string>("p")
  const [fontSize, setFontSize] = React.useState<string>("3")
  const [color, setColor] = React.useState<string>("#000000")
  const [bgColor, setBgColor] = React.useState<string>("#ffffff")
  const [active, setActive] = React.useState<Record<string, boolean>>({})

  // update active state when selection changes
  React.useEffect(() => {
    const update = () => {
      setActive({
        bold: document.queryCommandState?.("bold") ?? false,
        italic: document.queryCommandState?.("italic") ?? false,
        underline: document.queryCommandState?.("underline") ?? false,
        strike: document.queryCommandState?.("strikeThrough") ?? false,
        ul: document.queryCommandState?.("insertUnorderedList") ?? false,
        ol: document.queryCommandState?.("insertOrderedList") ?? false,
      })
    }
    document.addEventListener("selectionchange", update)
    update()
    return () => document.removeEventListener("selectionchange", update)
  }, [])

  const btnBase = "px-2 text-sm rounded"
  const activeCls = "bg-sky-600 text-white"
  const idleCls = "text-slate-700 dark:text-slate-100"

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border rounded px-2 py-1">
        <button
          type="button"
          onClick={() => props.exec("bold")}
          title="Bold (Ctrl/Cmd+B)"
          className={`${btnBase} ${active.bold ? activeCls : idleCls}`}
          aria-pressed={!!active.bold}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => props.exec("italic")}
          title="Italic (Ctrl/Cmd+I)"
          className={`${btnBase} ${active.italic ? activeCls : idleCls}`}
          aria-pressed={!!active.italic}
        >
          I
        </button>

        <button
          type="button"
          onClick={() => props.exec("underline")}
          title="Underline (Ctrl/Cmd+U)"
          className={`${btnBase} ${active.underline ? activeCls : idleCls}`}
          aria-pressed={!!active.underline}
        >
          U
        </button>

        <button
          type="button"
          onClick={() => props.exec("strikeThrough")}
          title="Strikethrough"
          className={`${btnBase} ${active.strike ? activeCls : idleCls}`}
          aria-pressed={!!active.strike}
        >
          S
        </button>
      </div>

      <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border rounded px-2 py-1">
        <button
          type="button"
          onClick={() => props.exec("insertUnorderedList")}
          title="Bulleted list"
          className={`${btnBase} ${active.ul ? activeCls : idleCls}`}
          aria-pressed={!!active.ul}
        >
          •
        </button>

        <button
          type="button"
          onClick={() => props.exec("insertOrderedList")}
          title="Numbered list"
          className={`${btnBase} ${active.ol ? activeCls : idleCls}`}
          aria-pressed={!!active.ol}
        >
          1.
        </button>

        <button type="button" onClick={() => props.exec("outdent")} title="Outdent" className={`${btnBase} ${idleCls}`}>↲</button>
        <button type="button" onClick={() => props.exec("indent")} title="Indent" className={`${btnBase} ${idleCls}`}>↳</button>
      </div>

      <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border rounded px-2 py-1">
        <select
          aria-label="Block format"
          value={formatBlock}
          onChange={(e) => {
            const v = e.target.value
            setFormatBlock(v)
            // use formatBlock with execCommand formatBlock using tags like <h1>
            props.exec("formatBlock", v === "p" ? "<p>" : `<${v}>`)
          }}
          className="bg-transparent text-sm"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="blockquote">Blockquote</option>
          <option value="pre">Pre</option>
        </select>

        <select
          aria-label="Font size"
          value={fontSize}
          onChange={(e) => {
            const v = e.target.value
            setFontSize(v)
            // fontSize uses 1..7 in execCommand
            props.exec("fontSize", v)
          }}
          className="bg-transparent text-sm"
        >
          <option value="1">XS</option>
          <option value="2">S</option>
          <option value="3">M</option>
          <option value="4">L</option>
          <option value="5">XL</option>
          <option value="6">2XL</option>
          <option value="7">3XL</option>
        </select>
      </div>

      <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border rounded px-2 py-1">
        <button type="button" onClick={() => props.exec("justifyLeft")} title="Align left" className={`${btnBase} ${idleCls}`}>L</button>
        <button type="button" onClick={() => props.exec("justifyCenter")} title="Center" className={`${btnBase} ${idleCls}`}>C</button>
        <button type="button" onClick={() => props.exec("justifyRight")} title="Right" className={`${btnBase} ${idleCls}`}>R</button>
        <button type="button" onClick={() => props.exec("justifyFull")} title="Justify" className={`${btnBase} ${idleCls}`}>J</button>
      </div>

      <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border rounded px-2 py-1">
        <button type="button" onClick={() => props.exec("undo")} title="Undo" className={`${btnBase} ${idleCls}`}>↺</button>
        <button type="button" onClick={() => props.exec("redo")} title="Redo" className={`${btnBase} ${idleCls}`}>↻</button>
        <button type="button" onClick={() => props.exec("removeFormat")} title="Clear formatting" className={`${btnBase} ${idleCls}`}>Clear</button>
        <button type="button" onClick={() => props.exec("insertHorizontalRule")} title="Insert rule" className={`${btnBase} ${idleCls}`}>―</button>
      </div>

      <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border rounded px-2 py-1">
        <button type="button" onClick={() => props.createLink()} title="Insert link" className={`${btnBase} ${idleCls}`}>🔗</button>

        <label className="cursor-pointer px-2">
          🖼️
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files && e.target.files[0]
              if (f) props.insertImage(f)
              if (fileRef.current) fileRef.current.value = ""
            }}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={() => {
            const r = parseInt(window.prompt("Rows", "2") || "0", 10)
            const c = parseInt(window.prompt("Cols", "2") || "0", 10)
            if (r > 0 && c > 0) props.insertTable(r, c)
          }}
          title="Insert table"
          className={`${btnBase} ${idleCls}`}
        >
          ⊞
        </button>
      </div>

      <div className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border rounded px-2 py-1">
        <input
          aria-label="Text color"
          type="color"
          value={color}
          onChange={(e) => {
            setColor(e.target.value)
            props.exec("foreColor", e.target.value)
          }}
          className="w-8 h-8 p-0 border-0"
          title="Text color"
        />
        <input
          aria-label="Highlight color"
          type="color"
          value={bgColor}
          onChange={(e) => {
            setBgColor(e.target.value)
            try {
              props.exec("hiliteColor", e.target.value)
            } catch {
              props.exec("backColor", e.target.value)
            }
          }}
          className="w-8 h-8 p-0 border-0"
          title="Highlight color"
        />
      </div>

      <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">Policy editor</div>
    </div>
  )
}

/* PolicyEditor component: toolbar + editor, fires onChange with HTML */
export default function PolicyEditor(props: {
  initialContent?: string
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
}) {
  const editorRef = React.useRef<HTMLDivElement | null>(null)
  const [html, setHtml] = React.useState<string>(props.initialContent ?? "")

  React.useEffect(() => {
    if (props.initialContent && editorRef.current) {
      editorRef.current.innerHTML = props.initialContent
      setHtml(props.initialContent)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exec = (cmd: string, val?: string) => {
    const ed = editorRef.current
    if (ed) ed.focus()
    try {
      document.execCommand(cmd, false, val)
      const newHtml = ed ? ed.innerHTML : ""
      setHtml(newHtml)
      props.onChange?.(newHtml)
    } catch {
      // noop
    }
  }

  const insertImage = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result || "")
      exec("insertImage", url)
    }
    reader.readAsDataURL(file)
  }

  const createLink = () => {
    const selection = document.getSelection()
    const text = selection?.toString() || ""
    const url = window.prompt("Enter URL (https://...)", "https://")
    if (!url) return
    // if there is selected text, wrap it, otherwise insert link
    if (text) {
      exec("createLink", url)
    } else {
      // insert anchor HTML
      exec("insertHTML", `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
    }
  }

  const insertTable = (rows: number, cols: number) => {
    if (!rows || !cols) return
    let htmlTable = '<table style="width:100%; border-collapse:collapse;">'
    for (let r = 0; r < rows; r++) {
      htmlTable += "<tr>"
      for (let c = 0; c < cols; c++) {
        htmlTable += `<td style="border:1px solid #cbd5e1; padding:6px;">&nbsp;</td>`
      }
      htmlTable += "</tr>"
    }
    htmlTable += "</table><p></p>"
    exec("insertHTML", htmlTable)
  }

  // keyboard shortcuts inside editor
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const key = e.key.toLowerCase()
      if (key === "b") {
        e.preventDefault()
        exec("bold")
      } else if (key === "i") {
        e.preventDefault()
        exec("italic")
      } else if (key === "u") {
        e.preventDefault()
        exec("underline")
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  // paste sanitization: insert plain text only to remove bad styles
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    // preserve newlines by converting to <br> or paragraphs
    const sanitized = text
      .split(/\r?\n\r?\n/)
      .map(p => `<p>${p.replace(/\r?\n/g, "<br/>")}</p>`)
      .join("")
    exec("insertHTML", sanitized)
  }

  return (
    <div className={props.className}>
      <PolicyToolbar exec={exec} insertImage={insertImage} createLink={createLink} insertTable={insertTable} />

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          const v = editorRef.current ? editorRef.current.innerHTML : ""
          setHtml(v)
          props.onChange?.(v)
        }}
        onPaste={handlePaste}
        className="min-h-[300px] border rounded bg-white dark:bg-slate-800 p-4 text-sm text-slate-900 dark:text-slate-100 overflow-auto"
        aria-label="Policy content editor"
        role="textbox"
      >
        {props.initialContent ? (
          <div dangerouslySetInnerHTML={{ __html: props.initialContent }} />
        ) : (
          <p className="text-slate-400 dark:text-slate-500">{props.placeholder ?? "Start typing your policy content here..."}</p>
        )}
      </div>
    </div>
  )
}