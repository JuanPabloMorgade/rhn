'use client';

import * as React from 'react';
import { isNodeSelection, type Editor } from '@tiptap/react';

// --- Hooks ---
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';

// --- Icons ---
import { ChevronDownIcon } from '@/components/tiptap-icons/chevron-down-icon';
import { ListIcon } from '@/components/tiptap-icons/list-icon';

// --- Lib ---
import { isNodeInSchema } from '@/lib/tiptap-utils';

// --- Tiptap UI ---
import {
  ListButton,
  canToggleList,
  isListActive,
  listOptions,
  type ListType,
} from '@/components/tiptap-ui/list-button/list-button';

// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap-ui-primitive/button';
import { Button } from '@/components/tiptap-ui-primitive/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/tiptap-ui-primitive/dropdown-menu';
import Tippy from '@tippyjs/react';

export interface ListDropdownMenuProps extends Omit<ButtonProps, 'type'> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor;
  /**
   * The list types to display in the dropdown.
   */
  types?: ListType[];
  /**
   * Whether the dropdown should be hidden when no list types are available
   * @default false
   */
  hideWhenUnavailable?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function canToggleAnyList(
  editor: Editor | null,
  listTypes: ListType[]
): boolean {
  if (!editor) return false;
  return listTypes.some((type) => canToggleList(editor, type));
}

export function isAnyListActive(
  editor: Editor | null,
  listTypes: ListType[]
): boolean {
  if (!editor) return false;
  return listTypes.some((type) => isListActive(editor, type));
}

export function getFilteredListOptions(
  availableTypes: ListType[]
): typeof listOptions {
  return listOptions.filter(
    (option) => !option.type || availableTypes.includes(option.type)
  );
}

export function shouldShowListDropdown(params: {
  editor: Editor | null;
  listTypes: ListType[];
  hideWhenUnavailable: boolean;
  listInSchema: boolean;
  canToggleAny: boolean;
}): boolean {
  const { editor, hideWhenUnavailable, listInSchema, canToggleAny } = params;

  if (!listInSchema || !editor) {
    return false;
  }

  if (hideWhenUnavailable) {
    if (isNodeSelection(editor.state.selection) || !canToggleAny) {
      return false;
    }
  }

  return true;
}

export function useListDropdownState(
  editor: Editor | null,
  availableTypes: ListType[]
) {
  const [isOpen, setIsOpen] = React.useState(false);

  const listInSchema = availableTypes.some((type) =>
    isNodeInSchema(type, editor)
  );

  const filteredLists = React.useMemo(
    () => getFilteredListOptions(availableTypes),
    [availableTypes]
  );

  const canToggleAny = canToggleAnyList(editor, availableTypes);
  const isAnyActive = isAnyListActive(editor, availableTypes);

  const handleOpenChange = React.useCallback(
    (open: boolean, callback?: (isOpen: boolean) => void) => {
      setIsOpen(open);
      callback?.(open);
    },
    []
  );

  return {
    isOpen,
    setIsOpen,
    listInSchema,
    filteredLists,
    canToggleAny,
    isAnyActive,
    handleOpenChange,
  };
}

export function useActiveListIcon(
  editor: Editor | null,
  filteredLists: typeof listOptions
) {
  return React.useCallback(() => {
    const activeOption = filteredLists.find((option) =>
      isListActive(editor, option.type)
    );

    return activeOption ? (
      <activeOption.icon className="tiptap-button-icon" />
    ) : (
      <ListIcon className="tiptap-button-icon" />
    );
  }, [editor, filteredLists]);
}

export function ListDropdownMenu({
  editor: providedEditor,
  types = ['bulletList', 'orderedList', 'taskList'],
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: ListDropdownMenuProps) {
  const editor = useTiptapEditor(providedEditor);

  const {
    isOpen,
    listInSchema,
    filteredLists,
    canToggleAny,
    isAnyActive,
    handleOpenChange,
  } = useListDropdownState(editor, types);

  const getActiveIcon = useActiveListIcon(editor, filteredLists);

  const show = React.useMemo(() => {
    return shouldShowListDropdown({
      editor,
      listTypes: types,
      hideWhenUnavailable,
      listInSchema,
      canToggleAny,
    });
  }, [editor, types, hideWhenUnavailable, listInSchema, canToggleAny]);

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => handleOpenChange(open, onOpenChange),
    [handleOpenChange, onOpenChange]
  );

  if (!show || !editor || !editor.isEditable) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <Tippy
        content="Listas"
        delay={[500, 0]}
        placement="top"
        animation="shift-away"
        arrow
      >
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            data-active-state={isAnyActive ? 'on' : 'off'}
            role="button"
            tabIndex={-1}
            aria-label="List options"
            {...props}
          >
            {getActiveIcon()}
            <ChevronDownIcon className="tiptap-button-dropdown-small" />
          </Button>
        </DropdownMenuTrigger>
      </Tippy>

      <DropdownMenuContent className="
          bg-white dark:bg-gray-800
          border rounded shadow-lg
          p-1
        ">
        <DropdownMenuGroup>
          {filteredLists.map((option) => (
            <DropdownMenuItem key={option.type} asChild>
              <ListButton
                editor={editor}
                type={option.type}
                text={option.label}
                hideWhenUnavailable={hideWhenUnavailable}
                tooltip={''}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ListDropdownMenu;
