import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import Quote from "@editorjs/quote";
// import ImageTool from "@editorjs/image"; // 替换为自定义实现
import CustomWeChatImageTool from './content/tools/custom-wechat-image-tool.js';
import RawTool from "@editorjs/raw";
import DragDrop from "editorjs-drag-drop";
import Delimiter from "@editorjs/delimiter";
import List from "@editorjs/list";
import Code from "@editorjs/code";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Underline from "@editorjs/underline";

if (typeof window !== "undefined") {
  // 统一使用 EditorJSBundle 命名空间
  window.EditorJSBundle = {
    EditorJS,
    Header,
    Paragraph,
    Quote,
    ImageTool: CustomWeChatImageTool, // 使用自定义微信图片工具
    RawTool,
    Delimiter,
    Marker,
    InlineCode,
    Underline,
    List,
    Code,
    DragDrop,
  };
}
