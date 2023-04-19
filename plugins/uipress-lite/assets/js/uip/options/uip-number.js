export function moduleData() {
  return {
    props: {
      returnData: Function,
      value: [String, Number],
      placeHolder: String,
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
        },
        deep: true,
      },
    },
    template: '<div class="uip-flex">\
      <input  type="number" class="uip-input-small" v-model="option" :placeholder="placeHolder">\
    </div>',
  };
}
