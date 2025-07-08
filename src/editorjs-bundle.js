/**
 * EditorJS Bundle - 所有EditorJS模块的统一入口文件
 * 用于Vite打包成单个文件，减少加载时间
 */

// 导入EditorJS核心
import EditorJS from "@editorjs/editorjs";

// 导入所有插件
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Code from "@editorjs/code";
import Delimiter from "@editorjs/delimiter";
import ImageTool from '@editorjs/image';
import InlineCode from "@editorjs/inline-code";
import Marker from "@editorjs/marker";
import Quote from "@editorjs/quote";
import Raw from "@editorjs/raw";
import Underline from "@editorjs/underline";
import DragDrop from "editorjs-drag-drop";

// 将所有插件挂载到EditorJS上，方便使用
EditorJS.Header = Header;
EditorJS.Paragraph = Paragraph;
EditorJS.List = List;
EditorJS.Code = Code;
EditorJS.Delimiter = Delimiter;
EditorJS.ImageTool  = ImageTool;
EditorJS.InlineCode = InlineCode;
EditorJS.Marker = Marker;
EditorJS.Quote = Quote;
EditorJS.Raw = Raw;
EditorJS.Underline = Underline;
EditorJS.DragDrop = DragDrop;

// 导出到全局变量
if (typeof window !== "undefined") {
  window.EditorJS = EditorJS;
}

export default EditorJS;
export {
  EditorJS,
  Header,
  Paragraph,
  List,
  Code,
  Delimiter,
  ImageTool,
  InlineCode,
  Marker,
  Quote,
  Raw,
  Underline,
  DragDrop,
};
