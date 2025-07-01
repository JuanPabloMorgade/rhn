import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Aplica un font-size (p. ej. "16px")
       */
      setFontSize: (options: { fontSize: string }) => ReturnType;
      /**
       * Quita el font-size
       */
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Mark.create({
  name: 'fontSize',
  addOptions() {
    return { HTMLAttributes: {} };
  },
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
        renderHTML: (attrs) => {
          if (!attrs.fontSize) return {};
          return { style: `font-size: ${attrs.fontSize}` };
        },
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span[style*="font-size"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (options) =>
        ({ chain }) => {
          return chain()
            .setMark(this.name, { fontSize: options.fontSize })
            .run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});
