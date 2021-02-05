import { FC } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void;
}

const CodeEditor: FC<CodeEditorProps> = ({ initialValue, onChange }) => {
  const onDidMount = (getEditorValue: () => string, self: any) => {
    self.onDidChangeModelContent(() => onChange(getEditorValue()));
  }


  return (
    <Editor
      value={ initialValue } // !! initial value, not tracked value
      editorDidMount={ onDidMount }
      height="500px"
      language="javascript"
      theme="dark"
      options={{
        // TODO -> Make this configurable with a toolbar?
        wordWrap: "on",
        minimap: { enabled: false },
        showUnused: false,
        folding: false,
        lineNumbersMinChars: 3,
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true
      }}
    />
  );
}

export { CodeEditor };