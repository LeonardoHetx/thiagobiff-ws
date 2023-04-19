export function moduleData() {
  return {
    props: {
      options: Object,
      activeValue: String,
      returnValue: Function,
    },
    data: function () {
      return {
        open: false,
      };
    },

    mounted: function () {},
    methods: {
      returnData(data) {
        this.returnValue(data);
      },
    },
    template: `
    <div class="uip-border-box uip-min-w-100">
        <div class="uip-background-muted uip-border-round uip-padding-xxs uip-flex uip-gap-xxs uip-flex-content-stretch uip-flex-wrap">
          <template v-for="option in options">
            <uip-tooltip containerClass="uip-flex uip-flex-grow" :message="option.placeHolder" :delay="200">
              <button type="button" class="uip-button-default uip-padding-xxxs uip-border-transparent uip-padding-left-xxs uip-padding-right-xxs uip-no-wrap uip-flex-grow"
              :class="{'uip-background-default uip-border uip-shadow-small' : option.value == activeValue}"
              @click="returnData(option.value)">
                {{option.label}}
              </button>
            </uip-tooltip>
          </template>
        </div>
      </div>`,
  };
}
