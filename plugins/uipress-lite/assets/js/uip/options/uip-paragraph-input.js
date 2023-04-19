export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: String,
    },
    data: function () {
      return {
        option: this.value,
        quillEditor: '',
        variableTrigger: false,
      };
    },
    watch: {},
    mounted: function () {
      this.startEditor();
    },
    methods: {
      startEditor() {
        let self = this;
        let container = self.$refs.uipeditor;

        self.quillEditor = new Quill(container, {
          theme: 'snow',
        });

        self.quillEditor.on('text-change', function (delta, oldDelta, source) {
          self.returnData(self.quillEditor.root.innerHTML);
        });
      },
      getCaretGlobalPosition() {
        const r = document.getSelection().getRangeAt(0);
        const node = r.startContainer;
        const offset = r.startOffset;
        const pageOffset = { x: window.pageXOffset, y: window.pageYOffset };
        let rect, r2;

        if (offset > 0) {
          r2 = document.createRange();
          r2.setStart(node, offset - 1);
          r2.setEnd(node, offset);
          rect = r2.getBoundingClientRect();
          return { left: rect.right + pageOffset.x, top: rect.bottom + pageOffset.y };
        }
      },
    },
    template: '\
    <div class="uip-flex uip-flex-column uip-min-h-200">\
      <div ref="uipeditor" class="uip-h-100p" v-html="option"></div>\
    </div>',
  };
}
