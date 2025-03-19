import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";

export const initializeEditor = (editorContainer, initialCode) => {
  if (!editorContainer.value) {
    console.error("Editor container not found!");
    return null;
  }

  return new EditorView({
    doc: initialCode,
    parent: editorContainer.value,
    extensions: [basicSetup, python()],
  });
};
