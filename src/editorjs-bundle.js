import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import Quote from '@editorjs/quote';
import ImageTool from "@editorjs/image";
import RawTool from '@editorjs/raw';
import DragDrop from "editorjs-drag-drop";

if (typeof window !== "undefined") {
  // 统一使用 EditorJSBundle 命名空间
  window.EditorJSBundle = { 
    EditorJS,
    Header,
    Paragraph,
    Quote,
    ImageTool,
    RawTool,
    DragDrop,
  };
}