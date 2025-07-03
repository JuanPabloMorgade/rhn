'use client';

import * as React from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
import { ImageStyle } from '@/components/tiptap-extension/image-style';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Underline } from '@tiptap/extension-underline';

// --- Custom Extensions ---
import { Link } from '@/components/tiptap-extension/link-extension';
import { Selection } from '@/components/tiptap-extension/selection-extension';
import { TrailingNode } from '@/components/tiptap-extension/trailing-node-extension';

// --- UI Primitives ---
import { Button } from '@/components/tiptap-ui-primitive/button';
import { Spacer } from '@/components/tiptap-ui-primitive/spacer';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar';

// --- Tiptap Node ---
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

// --- Tiptap UI ---
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button';
import { LinkContent } from '@/components/tiptap-ui/link-popover';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button';
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button';

// --- Icons ---
import { ArrowLeftIcon } from '@/components/tiptap-icons/arrow-left-icon';
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon';
import { LinkIcon } from '@/components/tiptap-icons/link-icon';

// --- Hooks ---
import { useMobile } from '@/hooks/use-mobile';
import { useWindowSize } from '@/hooks/use-window-size';
import { useCursorVisibility } from '@/hooks/use-cursor-visibility';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

// --- Styles ---
import '@/components/tiptap-templates/simple/simple-editor.scss';

import content from '@/components/tiptap-templates/simple/data/content.json';
import PlaceholderDropdown from '@/components/custom/placeHolders';
import HighlightDropdown from '@/components/custom/highlight-dropdown';
import ImageStyleDropdown from '@/components/custom/image-style-dropdown';

import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextColorDropdown from '@/components/custom/text-color-dropdown';
import { FontSize } from '@/components/tiptap-extension/font-size';
import FontSizeDropdown from '@/components/custom/font-size-dropdown';
import TextAlignDropdown from '@/components/custom/text-align-dropdown';
import { placeholdersCanvas, placeholdersFeriados } from '@/helpers/helpers';

const MainToolbarContent = ({
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(
    null
  );

  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ListDropdownMenu types={['bulletList', 'orderedList']} />
        <BlockquoteButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="underline" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <FontSizeDropdown
          isOpen={activeDropdown === 'fontSize'}
          onToggle={() =>
            setActiveDropdown(activeDropdown === 'fontSize' ? null : 'fontSize')
          }
        />

        <PlaceholderDropdown
          isOpen={activeDropdown === 'personal'}
          onToggle={() =>
            setActiveDropdown(activeDropdown === 'personal' ? null : 'personal')
          }
          items={placeholdersCanvas}
          label="Insertar placeholder Personal"
        />

        <PlaceholderDropdown
          isOpen={activeDropdown === 'feriados'}
          onToggle={() =>
            setActiveDropdown(activeDropdown === 'feriados' ? null : 'feriados')
          }
          items={placeholdersFeriados}
          label="Insertar placeholder Feriados"
        />

        <TextColorDropdown
          isOpen={activeDropdown === 'textColor'}
          onToggle={() => {
            setActiveDropdown(
              activeDropdown === 'textColor' ? null : 'textColor'
            );
          }}
        />

        <HighlightDropdown
          isOpen={activeDropdown === 'highlight'}
          onToggle={() => {
            setActiveDropdown(
              activeDropdown === 'highlight' ? null : 'highlight'
            );
          }}
        />
      </ToolbarGroup>
      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignDropdown />
      </ToolbarGroup>

      <ToolbarSeparator />
      <ToolbarGroup>
        <ImageUploadButton text="Agregar" />
        <ImageStyleDropdown
          isOpen={activeDropdown === 'imageStyle'}
          onToggle={() =>
            setActiveDropdown(
              activeDropdown === 'imageStyle' ? null : 'imageStyle'
            )
          }
        />
      </ToolbarGroup>
      {isMobile && <ToolbarSeparator />}
      <Spacer />
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: 'highlighter' | 'link';
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === 'highlighter' ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? (
      {
        /* <ColorHighlightPopoverContent /> */
      }
    ) : (
      <LinkContent />
    )}
  </>
);

import { Editor } from '@tiptap/react';

interface SimpleEditorProps {
  templateId: string;
  initialContent?: string;
  onInit?: (editor: Editor) => void;
  onUpdate?: (html: string) => void;
}

export function SimpleEditor({
  templateId,
  initialContent,
  onInit,
  onUpdate,
}: SimpleEditorProps) {
  const isMobile = useMobile();
  const windowSize = useWindowSize();
  const [mobileView, setMobileView] = React.useState<
    'main' | 'highlighter' | 'link'
  >('main');
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Main content area, start typing to enter text.',
      },
    },
    extensions: [
      TextStyle,
      FontSize,
      StarterKit,
      Color.configure({
        types: ['textStyle'],
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      ImageStyle,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: (file, onProgress, abortSignal) =>
          handleImageUpload(file, templateId, onProgress, abortSignal),
        onError: (error) => console.error('Upload failed:', error),
      }),
      TrailingNode,
      Link.configure({ openOnClick: false }),
    ],
    content: initialContent ?? content,
  });

  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  React.useEffect(() => {
    if (editor) {
      onInit?.(editor);
      const handler = () => onUpdate?.(editor.getHTML());
      editor.on('update', handler);
      return () => {
        editor.off('update', handler);
      };
    }
  }, [editor, onInit, onUpdate]);

  React.useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="h-full flex flex-col rounded-lg">
        <Toolbar
          ref={toolbarRef}
          className="!bg-white dark:!bg-gray-800 border-b shadow-sm sticky top-0 z-20 rounded-lg"
          style={
            isMobile
              ? { bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)` }
              : {}
          }
        >
          {mobileView === 'main' ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView('highlighter')}
              onLinkClick={() => setMobileView('link')}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
              onBack={() => setMobileView('main')}
            />
          )}
        </Toolbar>

        <div className="flex-1 overflow-y-auto p-4">
          <EditorContent
            editor={editor}
            className="
    simple-editor-content
    selection:bg-blue-200 selection:text-black
    dark:selection:bg-blue-800/50 dark:selection:text-white
  "
          />
        </div>
      </div>
    </EditorContext.Provider>
  );
}
