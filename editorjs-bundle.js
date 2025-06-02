import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";

if (typeof window !== "undefined") {
  window.EditorJS = EditorJS;
  window.Header = Header;
  window.Paragraph = Paragraph;
  window.EditorJSBundle = { EditorJS, Header, Paragraph };
}
