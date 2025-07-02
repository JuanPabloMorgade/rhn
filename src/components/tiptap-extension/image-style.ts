import TiptapImage from '@tiptap/extension-image'
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageStyle: {
      setImageWidth: (width: string | null) => ReturnType;
      setImageAlign: (align: "left" | "center" | "right" | null) => ReturnType;
    };
  }
}


export const ImageStyle = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('data-width'),
        renderHTML: attrs => {
          return {
            'data-width': attrs.width,
            style: attrs.width ? `width: ${attrs.width};` : null,
          }
        },
      },
      align: {
        default: null,
        parseHTML: element => element.getAttribute('data-align'),
        renderHTML: attrs => (attrs.align ? { 'data-align': attrs.align } : {}),
      },
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageWidth:
        width =>
        ({ commands }) => {
          return commands.updateAttributes('image', { width })
        },
      setImageAlign:
        align =>
        ({ commands }) => {
          return commands.updateAttributes('image', { align })
        },
    }
  },
})

export default ImageStyle
