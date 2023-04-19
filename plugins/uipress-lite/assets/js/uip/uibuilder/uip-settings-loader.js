/**
 * Builds the main ui builder shell
 * @since 3.0.0
 */
const { __, _x, _n, _nx } = wp.i18n;
export function moduleData() {
  return {
    data: function () {
      return {};
    },
    template:
      '<div class="uip-h-100p uip-w-100p uip-max-h-100p uip-max-w-100p uip-overflow-hidden uip-flex-grow uip-flex uip-flex-column">\
          <uip-block-settings></uip-block-settings>\
      </div>',
  };
}
