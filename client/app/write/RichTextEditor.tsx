import React, { useMemo, useState } from "react";
import { createEditor, Descendant, Editor, BaseEditor } from "slate";
import { Slate, Editable, withReact, ReactEditor, RenderLeafProps } from "slate-react";

// Define custom element and text types for TypeScript
type CustomElement = { type: "paragraph"; children: CustomText[] };
type CustomText = { 
  text: string; 
  bold?: boolean; 
  italic?: boolean; 
  underline?: boolean;
};

// Extend Slate's types
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Type for format marks
type FormatType = 'bold' | 'italic' | 'underline';

// Configuration interface for different editor modes
interface EditorConfig {
  enabledFormats: FormatType[];
  placeholder: string;
  minHeight: string;
  showToolbar: boolean;
  compact: boolean;
}

// Predefined configurations for different content types
const editorConfigs: Record<string, EditorConfig> = {
  fullEditor: {
    enabledFormats: ['bold', 'italic', 'underline'],
    placeholder: "Write your blog post...",
    minHeight: "200px",
    showToolbar: true,
    compact: false,
  },
  captionEditor: {
    enabledFormats: ['bold', 'italic'],
    placeholder: "Add a caption...",
    minHeight: "80px",
    showToolbar: true,
    compact: true,
  },
  descriptionEditor: {
    enabledFormats: ['bold', 'italic'],
    placeholder: "Add a description...",
    minHeight: "100px",
    showToolbar: true,
    compact: true,
  },
  quoteEditor: {
    enabledFormats: ['italic'],
    placeholder: "Enter your quote...",
    minHeight: "120px",
    showToolbar: true,
    compact: false,
  },
};

// Toolbar component that adapts to configuration
const AdaptiveToolbar: React.FC<{ 
  editor: Editor; 
  config: EditorConfig;
}> = ({ editor, config }) => {
  if (!config.showToolbar) return null;

  const toggleMark = (format: FormatType) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const isMarkActive = (editor: Editor, format: FormatType): boolean => {
    const marks = Editor.marks(editor);
    return marks ? (marks as any)[format] === true : false;
  };

  const buttonSize = config.compact ? "px-2 py-1 text-sm" : "px-3 py-1";
  const gap = config.compact ? "gap-1" : "gap-2";

  return (
    <div className={`flex ${gap} mb-2`}>
      {config.enabledFormats.includes('bold') && (
        <button
          type="button"
          onClick={() => toggleMark("bold")}
          className={`${buttonSize} rounded font-bold transition-all ${
            isMarkActive(editor, "bold")
              ? "bg-white text-black"
              : "bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300"
          }`}
        >
          B
        </button>
      )}
      
      {config.enabledFormats.includes('italic') && (
        <button
          type="button"
          onClick={() => toggleMark("italic")}
          className={`${buttonSize} rounded italic transition-all ${
            isMarkActive(editor, "italic")
              ? "bg-blue-500 text-white"
              : "bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300"
          }`}
        >
          I
        </button>
      )}
      
      {config.enabledFormats.includes('underline') && (
        <button
          type="button"
          onClick={() => toggleMark("underline")}
          className={`${buttonSize} rounded underline transition-all ${
            isMarkActive(editor, "underline")
              ? "bg-blue-500 text-white"
              : "bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300"
          }`}
        >
          U
        </button>
      )}
    </div>
  );
};

// Main flexible rich text editor component
interface FlexibleRichTextEditorProps {
  editorType?: keyof typeof editorConfigs;
  customConfig?: Partial<EditorConfig>;
  onContentChange?: (content: Descendant[]) => void;
  initialValue?: Descendant[];
}

const FlexibleRichTextEditor: React.FC<FlexibleRichTextEditorProps> = ({ 
  editorType = 'fullEditor',
  customConfig,
  onContentChange,
  initialValue,
}) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  
  // Merge default config with custom config
  const config: EditorConfig = {
    ...editorConfigs[editorType],
    ...customConfig,
  };

  const [value, setValue] = useState<Descendant[]>(
    initialValue || [{ type: "paragraph", children: [{ text: "" }] }]
  );

  // Helper function for keyboard shortcuts
  const toggleMark = (format: FormatType) => {
    const marks = Editor.marks(editor);
    const isActive = marks ? (marks as any)[format] === true : false;
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  // Render text with formatting
  const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    if (leaf.bold && config.enabledFormats.includes('bold')) {
      children = <strong>{children}</strong>;
    }
    if (leaf.italic && config.enabledFormats.includes('italic')) {
      children = <em>{children}</em>;
    }
    if (leaf.underline && config.enabledFormats.includes('underline')) {
      children = <u>{children}</u>;
    }
    return <span {...attributes}>{children}</span>;
  };

  const handleChange = (newValue: Descendant[]) => {
    //console.log('Editor value:', JSON.stringify(newValue, null, 2));
    if (newValue && Array.isArray(newValue) && newValue.every(node => node && 'type' in node && 'children' in node)) {
      setValue(newValue);
      if (onContentChange) {
        onContentChange(newValue);
      }
    } else {
      console.error('Invalid editor value:', newValue);
    }
  };

  const padding = config.compact ? "p-3" : "p-4";

  return (
    <div className={config.compact ? "w-full" : "p-4"}>
      <Slate 
        editor={editor} 
        initialValue={value} 
        onValueChange={handleChange}
      >
        <AdaptiveToolbar editor={editor} config={config} />
        <Editable
          renderLeaf={renderLeaf}
          placeholder={config.placeholder}
          className={`w-full ${padding} bg-white border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          style={{ minHeight: config.minHeight }}
          onKeyDown={(event) => {
            if (event.ctrlKey || event.metaKey) {
              let handled = false;
              switch (event.key) {
                case "b":
                  if (config.enabledFormats.includes('bold')) {
                    event.preventDefault();
                    toggleMark("bold");
                    handled = true;
                  }
                  break;
                case "i":
                  if (config.enabledFormats.includes('italic')) {
                    event.preventDefault();
                    toggleMark("italic");
                    handled = true;
                  }
                  break;
                case "u":
                  if (config.enabledFormats.includes('underline')) {
                    event.preventDefault();
                    toggleMark("underline");
                    handled = true;
                  }
                  break;
              }
            }
            // Log for debugging
            {/*if (event.key === 'Backspace') {
              console.log('Backspace pressed');
            }*/}
          }}
        />
      </Slate>
    </div>
  );
};

export default FlexibleRichTextEditor;
export { editorConfigs };
export type { EditorConfig, FlexibleRichTextEditorProps };