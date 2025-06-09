import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import Quote from '@editorjs/quote';

if (typeof window !== "undefined") {
  // 统一使用 EditorJSBundle 命名空间
  window.EditorJSBundle = { EditorJS, Header, Paragraph, Quote };
}