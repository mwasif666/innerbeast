"use client";

import { useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  BlockQuote,
  Bold,
  Bookmark,
  ClassicEditor,
  Code,
  CodeBlock,
  Emoji,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Fullscreen,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlEmbed,
  Image,
  ImageCaption,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  PageBreak,
  Paragraph,
  PasteFromOffice,
  PictureEditing,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TodoList,
  Underline,
} from "ckeditor5";
import { uploadContentImage } from "@/services/upload.service";

type EditorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

type Loader = {
  file: Promise<File>;
};

class ContentUploadAdapter {
  constructor(private loader: Loader) {}

  async upload() {
    const file = await this.loader.file;
    const response = await uploadContentImage(file);

    return {
      default: response.data.url,
    };
  }

  abort() {}
}

const ContentUploadAdapterPlugin = (editor: any) => {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: Loader) =>
    new ContentUploadAdapter(loader);
};

const toolbarItems = [
  "undo",
  "redo",
  "|",
  "sourceEditing",
  "showBlocks",
  "findAndReplace",
  "selectAll",
  "fullscreen",
  "|",
  "heading",
  "style",
  "|",
  "fontFamily",
  "fontSize",
  "fontColor",
  "fontBackgroundColor",
  "highlight",
  "|",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "subscript",
  "superscript",
  "code",
  "removeFormat",
  "|",
  "alignment",
  "outdent",
  "indent",
  "|",
  "bulletedList",
  "numberedList",
  "todoList",
  "|",
  "link",
  "bookmark",
  "insertImage",
  "mediaEmbed",
  "insertTable",
  "blockQuote",
  "codeBlock",
  "htmlEmbed",
  "|",
  "horizontalLine",
  "pageBreak",
  "specialCharacters",
  "emoji",
];

export default function CkeditorBlogEditorClient({ value = "", onChange }: EditorProps) {
  const editorRef = useRef<any>(null);
  const emittedValueRef = useRef(value);

  useEffect(() => {
    const editor = editorRef.current;

    if (editor && value !== emittedValueRef.current && value !== editor.getData()) {
      editor.setData(value || "");
      emittedValueRef.current = value;
    }
  }, [value]);

  return (
    <div className="ckeditor-blog-editor">
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        config={{
          licenseKey: "GPL",
          extraPlugins: [ContentUploadAdapterPlugin],
          plugins: [
            Alignment,
            Autoformat,
            AutoImage,
            AutoLink,
            BlockQuote,
            Bold,
            Bookmark,
            Code,
            CodeBlock,
            Emoji,
            Essentials,
            FindAndReplace,
            FontBackgroundColor,
            FontColor,
            FontFamily,
            FontSize,
            Fullscreen,
            GeneralHtmlSupport,
            Heading,
            Highlight,
            HorizontalLine,
            HtmlEmbed,
            Image,
            ImageCaption,
            ImageInsert,
            ImageInsertViaUrl,
            ImageResize,
            ImageStyle,
            ImageTextAlternative,
            ImageToolbar,
            ImageUpload,
            Indent,
            IndentBlock,
            Italic,
            Link,
            LinkImage,
            List,
            ListProperties,
            MediaEmbed,
            PageBreak,
            Paragraph,
            PasteFromOffice,
            PictureEditing,
            RemoveFormat,
            SelectAll,
            ShowBlocks,
            SourceEditing,
            SpecialCharacters,
            SpecialCharactersArrows,
            SpecialCharactersCurrency,
            SpecialCharactersEssentials,
            SpecialCharactersLatin,
            SpecialCharactersMathematical,
            SpecialCharactersText,
            Strikethrough,
            Style,
            Subscript,
            Superscript,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            TodoList,
            Underline,
          ],
          toolbar: {
            items: toolbarItems,
            shouldNotGroupWhenFull: true,
          },
          heading: {
            options: [
              { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
              { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
              { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
              { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
              { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
            ],
          },
          fontFamily: {
            supportAllValues: true,
          },
          fontSize: {
            options: [10, 12, 14, "default", 18, 20, 24, 28, 32, 40],
            supportAllValues: true,
          },
          htmlSupport: {
            allow: [
              {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true,
              },
            ],
          },
          image: {
            insert: {
              integrations: ["upload", "url"],
            },
            resizeOptions: [
              { name: "resizeImage:original", label: "Original", value: null },
              { name: "resizeImage:25", label: "25%", value: "25" },
              { name: "resizeImage:50", label: "50%", value: "50" },
              { name: "resizeImage:75", label: "75%", value: "75" },
            ],
            toolbar: [
              "imageTextAlternative",
              "toggleImageCaption",
              "|",
              "imageStyle:inline",
              "imageStyle:wrapText",
              "imageStyle:breakText",
              "|",
              "resizeImage",
              "|",
              "linkImage",
            ],
          },
          link: {
            addTargetToExternalLinks: true,
            defaultProtocol: "https://",
            decorators: {
              toggleDownloadable: {
                mode: "manual",
                label: "Downloadable",
                attributes: {
                  download: "file",
                },
              },
            },
          },
          list: {
            properties: {
              styles: true,
              startIndex: true,
              reversed: true,
            },
          },
          mediaEmbed: {
            previewsInData: true,
          },
          style: {
            definitions: [
              { name: "Lead paragraph", element: "p", classes: ["lead"] },
              { name: "Small text", element: "p", classes: ["text-small"] },
              { name: "Info box", element: "p", classes: ["info-box"] },
              { name: "Marker", element: "span", classes: ["marker"] },
            ],
          },
          table: {
            contentToolbar: [
              "tableColumn",
              "tableRow",
              "mergeTableCells",
              "tableProperties",
              "tableCellProperties",
              "toggleTableCaption",
            ],
          },
        }}
        onReady={(editor) => {
          editorRef.current = editor;
        }}
        onChange={(_, editor) => {
          const html = editor.getData();
          emittedValueRef.current = html;
          onChange?.(html);
        }}
      />
      <style jsx global>{`
        .ckeditor-blog-editor {
          color: #111;
        }

        .ckeditor-blog-editor .ck-toolbar__items {
          flex-wrap: wrap !important;
        }

        .ckeditor-blog-editor .ck-editor__editable_inline {
          min-height: 420px;
        }

        .ckeditor-blog-editor .ck-content img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
