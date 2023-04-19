export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: String,
      placeHolder: String,
      args: Object,
      size: String,
    },
    data: function () {
      return {
        option: this.value,
      };
    },
    watch: {
      option: {
        handler(newValue, oldValue) {
          this.returnData(this.option);

          if (!this.args) {
            return;
          }
          if (this.args.metaKey) {
            if (newValue) {
              let ammended = newValue;

              ammended = ammended.replace(' ', '_');
              ammended = ammended.replace(/[&/#,+()$~%.'":*?<>{}]/g, '');
              ammended = ammended.toLowerCase();

              this.option = ammended;
            }
          }
        },
        deep: true,
      },
    },
    template: `<div class="uip-flex">
      <input  type="text" class="uip-input-small" v-model="option" :placeholder="placeHolder" :class="{'uip-w-100' : size == 'xsmall'}">
    </div>`,
  };
}
