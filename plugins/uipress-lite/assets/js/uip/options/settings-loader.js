///IMPORT TRANSLATIONS
const { __, _x, _n, _nx } = wp.i18n;

export function getSettings(globalDynamic, context) {
  return {
    trueFalse: {
      value: false,
      component: 'switch-select',
      renderStyle(value) {
        return value;
      },
    },
    title: {
      value: {
        string: __('Press me', 'uipress-lite'),
      },
      component: 'uip-dynamic-input',
      type: String,
      dynamic: true,
    },
    textField: {
      value: '',
      component: 'uip-input',
      type: String,
      dynamic: false,
    },
    paragraph: {
      value: __('I am a paragraph', 'uipress-lite'),
      component: 'uip-paragraph-input',
      type: String,
    },
    classes: {
      value: '',
      component: 'uip-input',
      type: 'classes',
      renderStyle(value) {
        return value;
      },
    },

    imageSelect: {
      dark: true,
      component: 'image-select',
      type: 'style',
      renderStyle(value) {
        let light = value;
        let src;

        if (light.dynamic) {
          if (light.dynamicKey in globalDynamic) {
            src = globalDynamic[light.dynamicKey].value;
          } else {
            src = light.url;
          }
        } else {
          src = light.url;
        }

        if (src && src != '') {
          return 'background-image: url(' + src + ');background-size:cover;';
        }
        return '';
      },
    },
    responsive: {
      value: {
        mobile: false,
        tablet: false,
        desktop: false,
      },
      dark: true,
      component: 'hidden-responsive',
      type: 'style',
      renderStyle(value, windowWidth) {
        let style = '';

        if (value.mobile) {
          if (value.mobile == true && windowWidth < 699) {
            style += 'display:none; ';
          }
        }
        if (value.tablet) {
          if (value.tablet == true && windowWidth < 990 && windowWidth >= 699) {
            style += 'display:none; ';
          }
        }

        if (value.desktop) {
          if (value.desktop == true && windowWidth > 990) {
            style += 'display:none; ';
          }
        }
        return style;
      },
    },
    choiceSelect: {
      value: {},
      component: 'choice-select',
      type: 'style',
      group: __('Style', 'uipress-lite'),
      label: __('Text alignment', 'uipress-lite'),
      renderStyle(value) {
        return '';
      },
    },
    textFormat: {
      args: { modes: ['solid', 'variables'] },
      dark: true,
      component: 'text-format',
      type: 'style',
      renderStyle(value) {
        let style = '';

        //Check for preset
        if (value.size.preset != '' && value.size.preset != 'custom') {
          if (value.size.preset == 'xs') {
            style = 'font-size: var(--uip-text-xs);';
          }
          if (value.size.preset == 'small') {
            style = 'font-size: var(--uip-text-s);';
          }
          if (value.size.preset == 'medium') {
            style = 'font-size: var(--uip-text-m);';
          }
          if (value.size.preset == 'large') {
            style = 'font-size: var(--uip-text-l);';
          }
          if (value.size.preset == 'xl') {
            style = 'font-size: var(--uip-text-xl);';
          }
        }
        //Custom size
        if (value.size.preset != '' && value.size.preset == 'custom') {
          if (value.size.value != '') {
            style += 'font-size: ' + value.size.value + value.size.units + ';';
          }
          if (value.lineHeight && value.lineHeight.value != '') {
            style += 'line-height: ' + value.lineHeight.value + value.lineHeight.units + ';';
          }
        }

        if (value.align != '') {
          style += 'text-align: ' + value.align + ';';
        }
        if (value.bold) {
          style += 'font-weight: bold;';
        }
        if (value.italic) {
          style += 'font-style: italic;';
        }
        if (value.underline) {
          style += 'text-decoration: underline;';
        }
        if (value.strikethrough) {
          style += 'text-decoration: line-through;';
        }

        if (value.weight && value.weight != '' && value.weight != 'inherit') {
          style += 'font-weight: ' + value.weight + ';';
        }
        if (value.transform && value.transform != '') {
          style += 'text-transform: ' + value.transform + ';';
        }
        if (value.font && value.font != '') {
          style += 'font-family: ' + value.font + ';';
        }

        let actualValue = value.color.value;
        if (value.color.type == 'variable') {
          actualValue = 'var(' + actualValue + ');';
        }

        if (actualValue != '') {
          style += 'color:  ' + actualValue + ';';
        }
        return style;
      },
    },
    flexWrap: {
      value: {
        value: 'wrap',
      },
      args: {
        options: [
          {
            value: 'wrap',
            label: __('Wrap', 'uipress-lite'),
            icon: 'wrap_text',
          },
          {
            value: 'wrap-reverse',
            label: __('Wrap reverse', 'uipress-lite'),
            icon: 'wrap_text',
            iconRotate: '-180',
          },
        ],
      },
      component: 'icon-choice-select',
      type: 'style',
      renderStyle(value) {
        if (value.value == 'noWrap') {
          return 'flex-wrap: nowrap;';
        }
        if (value.value == 'wrap') {
          return 'flex-wrap: wrap;';
        }
        if (value.value == 'wrap-reverse') {
          return 'flex-wrap: wrap-reverse;';
        }
        return '';
      },
    },
    flexGrow: {
      value: {
        value: 'none',
      },
      args: {
        options: [
          {
            value: 'grow',
            label: __('Grow', 'uipress-lite'),
            icon: 'expand',
          },
          {
            value: 'shrink',
            label: __('Shrink', 'uipress-lite'),
            icon: 'compress',
          },
        ],
      },
      component: 'icon-choice-select',
      type: 'style',
      renderStyle(value) {
        if (value.value == 'grow') {
          return 'flex-grow: 1;';
        }
        if (value.value == 'shrink') {
          return 'flex-shrink: 1;';
        }
        if (value.value == 'none') {
          return '';
        }
        return '';
      },
    },
    flexAlignSelf: {
      value: '',
      args: {
        options: [
          {
            value: 'baseline',
            label: __('Baseline', 'uipress-lite'),
            icon: 'align_vertical_top',
          },
          {
            value: 'center',
            label: __('Center', 'uipress-lite'),
            icon: 'align_vertical_center',
          },
          {
            value: 'end',
            label: __('End', 'uipress-lite'),
            icon: 'align_vertical_bottom',
          },
          {
            value: 'stretch',
            label: __('Stretch', 'uipress-lite'),
            icon: 'expand',
          },
        ],
      },
      component: 'icon-choice-select',
      type: 'style',
      renderStyle(value) {
        if (typeof value === 'undefined') {
          return '';
        }
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          return 'align-self: ' + value.value + ';';
        }
        if (value != '') {
          return 'align-self: ' + value + ';';
        }
        return '';
      },
    },
    defaultSelect: {
      value: {
        value: '',
      },
      args: { options: [] },
      component: 'default-select',
      type: 'blockOption',
      renderStyle(value) {
        return '';
      },
    },
    flexDirection: {
      value: '',
      args: {
        options: [
          {
            value: 'row',
            label: __('Row', 'uipress-lite'),
            icon: 'view_column_2',
          },
          {
            value: 'column',
            label: __('Column', 'uipress-lite'),
            icon: 'view_column_2',
            iconRotate: '90',
          },
          {
            value: 'row-reverse',
            label: __('Row reverse', 'uipress-lite'),
            icon: 'sync_alt',
          },
          {
            value: 'column-reverse',
            label: __('Column reverse', 'uipress-lite'),
            icon: 'sync_alt',
            iconRotate: '90',
          },
        ],
      },
      component: 'icon-choice-select',
      type: 'style',
      renderStyle(value) {
        if (typeof value === 'undefined') {
          return '';
        }
        let optionValue;
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          optionValue = value.value;
        } else {
          optionValue = value;
        }

        if (optionValue == 'row') {
          return 'flex-direction: row;';
        }
        if (optionValue == 'column') {
          return 'flex-direction: column;';
        }
        if (optionValue == 'row-reverse') {
          return 'flex-direction: row-reverse;';
        }
        if (optionValue == 'column-reverse') {
          return 'flex-direction: column-reverse;';
        }
        return '';
      },
    },
    stretchDirection: {
      value: {
        value: '',
      },
      args: {
        options: [
          {
            value: 'row',
            label: __('Vertical', 'uipress-lite'),
            icon: 'unfold_more',
          },
          {
            value: 'column',
            label: __('Horizontal', 'uipress-lite'),
            icon: 'unfold_more',
            iconRotate: '90',
          },
        ],
      },
      component: 'icon-choice-select',
      type: 'style',
      renderStyle(value) {
        if (value.value == 'row') {
          return 'flex-direction: row;';
        }
        if (value.value == 'column') {
          return 'flex-direction: column;';
        }
        return '';
      },
    },
    flexJustifyContent: {
      value: '',
      args: {
        options: [
          {
            value: 'left',
            label: __('Start', 'uipress-lite'),
            icon: 'align_horizontal_left',
          },
          {
            value: 'center',
            label: __('Center', 'uipress-lite'),
            icon: 'align_horizontal_center',
          },
          {
            value: 'right',
            label: __('End', 'uipress-lite'),
            icon: 'align_horizontal_right',
          },
          {
            value: 'spaceAround',
            label: __('Space around', 'uipress-lite'),
            icon: 'horizontal_distribute',
          },
          {
            value: 'spaceBetween',
            label: __('Space between', 'uipress-lite'),
            icon: 'expand',
            iconRotate: '90',
          },
          {
            value: 'spaceEvenly',
            label: __('Space evenly', 'uipress-lite'),
            icon: 'horizontal_distribute',
          },
        ],
      },
      component: 'icon-choice-select',
      type: 'style',
      renderStyle(value) {
        if (typeof value === 'undefined') {
          return '';
        }
        let optionValue;
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          optionValue = value.value;
        } else {
          optionValue = value;
        }
        if (optionValue == 'left') {
          return 'justify-content: start;';
        }
        if (optionValue == 'right') {
          return 'justify-content: end;';
        }
        if (optionValue == 'center') {
          return 'justify-content: center;';
        }
        if (optionValue == 'spaceAround') {
          return 'justify-content: space-around;';
        }
        if (optionValue == 'spaceBetween') {
          return 'justify-content: space-between;';
        }
        if (optionValue == 'spaceBetween') {
          return 'justify-content: space-evenly;';
        }
        return '';
      },
    },
    flexAlignItems: {
      value: 'flex-start',
      args: {
        options: [
          {
            value: 'flex-start',
            label: __('Start', 'uipress-lite'),
            icon: 'align_vertical_top',
          },
          {
            value: 'center',
            label: __('Center', 'uipress-lite'),
            icon: 'align_vertical_center',
          },
          {
            value: 'end',
            label: __('End', 'uipress-lite'),
            icon: 'align_vertical_bottom',
          },
          {
            value: 'stretch',
            label: __('Stretch', 'uipress-lite'),
            icon: 'expand',
          },
        ],
      },
      component: 'icon-choice-select',
      type: 'style',
      renderStyle(value) {
        if (typeof value === 'undefined') {
          return '';
        }
        let optionValue;
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          optionValue = value.value;
        } else {
          optionValue = value;
        }
        if (optionValue != '') {
          return 'align-items: ' + optionValue + ';';
        }
        return '';
      },
    },

    overFlow: {
      value: '',
      args: {
        options: [
          {
            value: 'auto',
            label: __('Auto', 'uipress-lite'),
          },
          {
            value: 'hidden',
            label: __('Hidden', 'uipress-lite'),
          },
          {
            value: 'scroll',
            label: __('Scroll', 'uipress-lite'),
          },
          {
            value: 'overlay',
            label: __('Overlay', 'uipress-lite'),
          },
          {
            value: 'visible',
            label: __('Visible', 'uipress-lite'),
          },
        ],
      },
      component: 'default-select',
      type: 'style',
      renderStyle(value) {
        if (typeof value !== 'undefined' && value != '') {
          return 'overflow:' + value + ';';
        }

        return '';
      },
    },
    headingType: {
      value: {
        value: 'h2',
      },
      args: {
        options: [
          {
            value: 'h1',
            label: __('H1', 'uipress-lite'),
          },
          {
            value: 'h2',
            label: __('H2', 'uipress-lite'),
          },
          {
            value: 'h3',
            label: __('H3', 'uipress-lite'),
          },
          {
            value: 'h4',
            label: __('H4', 'uipress-lite'),
          },
          {
            value: 'h5',
            label: __('H5', 'uipress-lite'),
          },
          {
            value: 'p',
            label: __('p', 'uipress-lite'),
          },
        ],
      },
      component: 'default-select',
      type: 'blockOption',
      renderStyle(value) {
        if (value == '') {
          return 'h1';
        } else {
          return value;
        }
        return '';
      },
    },
    postTypeSelect: {
      value: ['post'],
      component: 'post-types',
      type: 'blockOption',
      renderStyle(value) {
        return '';
      },
    },
    postMetaSelect: {
      value: [],
      component: 'post-meta',
      type: 'blockOption',
      renderStyle(value) {
        return '';
      },
    },
    valueUnits: {
      value: {
        value: '',
        units: '%',
      },
      component: 'value-units',
      type: 'blockOptions',
      renderStyle(value) {
        return value;
      },
    },
    number: {
      value: '',
      component: 'uip-number',
      type: 'blockOptions',
      renderStyle(value) {
        return value;
      },
    },
    columnGap: {
      value: {
        value: '',
        units: '%',
      },
      component: 'value-units',
      type: 'style',
      renderStyle(value) {
        if (value.value != '') {
          return 'column-gap: ' + value.value + value.units + ';';
        }
        return '';
      },
    },
    tabCreator: {
      value: {
        tabs: [
          { name: __('Tab', 'uipress-lite'), id: '' },
          { name: __('Another tab', 'uipress-lite'), id: '' },
        ],
      },
      component: 'tab-builder',
      type: 'blockSpecific',
      renderStyle(value) {
        return value;
      },
    },
    rowGap: {
      value: {
        value: '',
        units: '%',
      },
      component: 'value-units',
      type: 'style',
      renderStyle(value) {
        if (value.value != '') {
          return 'row-gap: ' + value.value + value.units + ';';
        }
        return '';
      },
    },
    subMenuStyle: {
      value: {
        value: 'dynamic',
      },
      args: {
        options: [
          {
            value: 'inline',
            label: __('Inline', 'uipress-lite'),
          },
          {
            value: 'hover',
            label: __('Hover', 'uipress-lite'),
          },
          {
            value: 'dynamic',
            label: __('Dynamic', 'uipress-lite'),
          },
        ],
      },
      component: 'choice-select',
      type: 'blockOption',
      renderStyle(value) {
        return '';
      },
    },
    multiSelect: {
      value: [],
      component: 'multi-select-option',
      type: 'blockOption',
      renderStyle(value) {
        return '';
      },
    },
    customCode: {
      value: '',
      component: 'code-editor',
      type: 'blockOption',
      renderStyle(value) {
        return '';
      },
    },
    hiddenMenuItems: {
      value: [],
      component: 'hiden-menu-items-select',
      type: 'adminMenuOption',
      renderStyle(value) {
        return '';
      },
    },
    hiddenToolbarItems: {
      value: [],
      component: 'hiden-toolbar-items-select',
      type: 'toolbarOption',
      renderStyle(value) {
        return '';
      },
    },
    editToolbarItems: {
      value: {},
      component: 'edit-toolbar-items',
      type: 'toolbarOption',
      renderStyle(value) {
        return '';
      },
    },
    editMenuItems: {
      value: {},
      component: 'edit-menu-items',
      type: 'menuOption',
      renderStyle(value) {
        return '';
      },
    },
    horizontalAlign: {
      value: {
        value: '',
      },
      args: {
        options: [
          {
            value: 'left',
            label: __('Left', 'uipress-lite'),
            icon: 'align_horizontal_left',
          },
          {
            value: 'center',
            label: __('Center', 'uipress-lite'),
            icon: 'align_horizontal_center',
          },
          {
            value: 'right',
            label: __('Right', 'uipress-lite'),
            icon: 'align_horizontal_right',
          },
        ],
      },
      component: 'icon-choice-select',
      type: 'style',
      renderStyle(value) {
        if (value.value == 'left') {
          return 'margin-right:auto;';
        }
        if (value.value == 'right') {
          return 'margin-left:auto;align-self: flex-end;';
        }
        if (value.value == 'center') {
          return 'margin-right:auto;margin-left:auto;align-self: center;';
        }
        return '';
      },
    },
    verticalAlign: {
      value: {
        value: '',
      },
      args: {
        options: [
          {
            value: 'top',
            label: __('Top', 'uipress-lite'),
            icon: 'align_vertical_top',
          },
          {
            value: 'center',
            label: __('Center', 'uipress-lite'),
            icon: 'align_vertical_center',
          },
          {
            value: 'bottom',
            label: __('Bottom', 'uipress-lite'),
            icon: 'align_vertical_bottom',
          },
        ],
      },
      component: 'icon-choice-select',
      type: 'style',
      renderStyle(value) {
        if (value.value == 'top') {
          return 'margin-bottom: auto;';
        }
        if (value.value == 'bottom') {
          return 'margin-top: auto;';
        }
        if (value.value == 'center') {
          return 'margin-top: auto;margin-bottom: auto;';
        }
        return '';
      },
    },
    dimensions: {
      component: 'dimensions',
      type: 'style',
      renderStyle(value) {
        let style = '';

        if (typeof value === 'undefined') {
          return '';
        }
        if ('width' in value && value.width.value != '') {
          if ('value' in value.width && value.width.value != '') {
            style += 'width: ' + value.width.value + value.width.units + ';';
          }
        }
        if ('height' in value && value.height.value != '') {
          if ('value' in value.height && value.height.value != '') {
            style += 'height: ' + value.height.value + value.height.units + ';';
          }
        }

        if ('maxHeight' in value && value.maxHeight.value != '') {
          if ('value' in value.maxHeight && value.maxHeight.value != '') {
            style += 'max-height: ' + value.maxHeight.value + value.maxHeight.units + ';';
          }
        }

        if ('minHeight' in value && value.minHeight.value != '') {
          if ('value' in value.minHeight && value.minHeight.value != '') {
            style += 'min-height: ' + value.minHeight.value + value.minHeight.units + ';';
          }
        }

        if ('maxWidth' in value && value.maxWidth.value != '') {
          if ('value' in value.maxWidth && value.maxWidth.value != '') {
            style += 'max-width: ' + value.maxWidth.value + value.maxWidth.units + ';';
          }
        }

        if ('minWidth' in value && value.minWidth.value != '') {
          if ('value' in value.minWidth && value.minWidth.value != '') {
            style += 'min-width: ' + value.minWidth.value + value.minWidth.units + ';';
          }
        }

        return style;
      },
    },
    backgroundPosition: {
      component: 'background-position',
      type: 'style',
      renderStyle(value) {
        let style = '';

        if (typeof value === 'undefined') {
          return '';
        }

        if ('position' in value) {
          if (value.position != '') {
            style += 'background-position: ' + value.position + ';';
          }
        }
        if ('repeat' in value) {
          if (value.repeat != '') {
            style += 'background-repeat: ' + value.repeat + ';';
          }
        }
        if ('size' in value) {
          if (value.size != '') {
            style += 'background-size: ' + value.size + ';';
          }
        }
        return style;
      },
    },
    padding: {
      component: 'uip-padding',
      type: 'style',
      renderStyle(value) {
        let style = '';
        //Presets
        if (value.preset != '' && value.preset != 'custom') {
          if (value.preset == 'remove') {
            style = 'padding: 0;';
          }
          if (value.preset == 'xs') {
            style = 'padding: var(--uip-padding-xxs);';
          }
          if (value.preset == 'small') {
            style = 'padding: var(--uip-padding-xs);';
          }
          if (value.preset == 'medium') {
            style = 'padding: var(--uip-padding-s);';
          }
          if (value.preset == 'large') {
            style = 'padding: var(--uip-padding-m);';
          }
          if (value.preset == 'xl') {
            style = 'padding: var(--uip-padding-l);';
          }
        }
        //Custom
        if (value.preset != '' && value.preset == 'custom' && value.sync != false) {
          style = 'padding:' + value.left + value.units + ';';
        }
        //Custom per side
        if (value.preset != '' && value.preset == 'custom' && value.sync != true) {
          style += 'padding-left:' + value.left + value.units + ';';
          style += 'padding-right:' + value.right + value.units + ';';
          style += 'padding-top:' + value.top + value.units + ';';
          style += 'padding-bottom:' + value.bottom + value.units + ';';
        }

        return style;
      },
    },
    margin: {
      component: 'uip-margin',
      type: 'style',
      renderStyle(value) {
        let style = '';
        //Presets
        if (value.preset != '' && value.preset != 'custom') {
          if (value.preset == 'remove') {
            style = 'margin: 0;';
          }
          if (value.preset == 'xs') {
            style = 'margin: var(--uip-margin-xxs);';
          }
          if (value.preset == 'small') {
            style = 'margin: var(--uip-margin-xs);';
          }
          if (value.preset == 'medium') {
            style = 'margin: var(--uip-margin-s);';
          }
          if (value.preset == 'large') {
            style = 'margin: var(--uip-margin-m);';
          }
          if (value.preset == 'xl') {
            style = 'margin: var(--uip-margin-l);';
          }
        }
        //Custom
        if (value.preset != '' && value.preset == 'custom' && value.sync != false) {
          style = 'margin:' + value.left + value.units + ';';
        }
        //Custom per side
        if (value.preset != '' && value.preset == 'custom' && value.sync != true) {
          style += 'margin-left:' + value.left + value.units + ';';
          style += 'margin-right:' + value.right + value.units + ';';
          style += 'margin-top:' + value.top + value.units + ';';
          style += 'margin-bottom:' + value.bottom + value.units + ';';
        }

        return style;
      },
    },
    colorSelect: {
      args: { modes: ['solid', 'gradient', 'variables'] },
      dark: true,
      component: 'color-select',
      type: 'style',
      renderStyle(value) {
        let actualValue = value.value;

        if (typeof actualValue === 'undefined') {
          return;
        }

        if (value.type == 'variable') {
          actualValue = 'var(' + actualValue + ');';
        }

        if (actualValue == '') {
          return '';
        }

        if (value.type == 'gradient' || value.type == 'linear' || value.type == 'radial' || actualValue.includes('gradient')) {
          return 'background:  ' + actualValue + ';';
        }

        if (actualValue != '' && value.type != 'gradient') {
          return 'background-color:  ' + actualValue + ';';
        }
        return '';
      },
    },
    simpleColorPicker: {
      component: 'simple-color-picker',
      type: 'blockOption',
      renderStyle(value) {
        return '';
      },
    },
    iconSelect: {
      component: 'icon-select',
      renderStyle(value) {
        return value.value;
      },
    },

    linkSelect: {
      component: 'link-select',
      renderStyle(value) {
        return value;
      },
    },
    iconPosition: {
      args: {
        options: [
          {
            value: 'left',
            label: __('Left', 'uipress-lite'),
          },
          {
            value: 'right',
            label: __('Right', 'uipress-lite'),
          },
        ],
      },
      component: 'choice-select',
      renderStyle(value) {
        return value.value;
      },
    },
    positionDesigner: {
      component: 'position-designer',
      type: 'style',
      renderStyle(value) {
        let style = '';
        if (value.position && value.position != '') {
          style += 'position:' + value.position + ';';
        }

        if (value.offset.left != null) {
          if (value.offset && (value.offset.left != '' || value.offset.left === 0)) {
            style += 'left:' + value.offset.left + value.offset.units + ';';
          }
        }

        if (value.offset.top != null) {
          if (value.offset && (value.offset.top != '' || value.offset.top === 0)) {
            style += 'top:' + value.offset.top + value.offset.units + ';';
          }
        }

        if (value.offset.right != null) {
          if (value.offset && (value.offset.right != '' || value.offset.right === 0)) {
            style += 'right:' + value.offset.right + value.offset.units + ';';
          }
        }

        if (value.offset.bottom != null) {
          if (value.offset && (value.offset.bottom != '' || value.offset.bottom === 0)) {
            style += 'bottom:' + value.offset.bottom + value.offset.units + ';';
          }
        }

        return style;
      },
    },

    border: {
      component: 'border-designer',
      type: 'style',
      dark: true,
      renderStyle(value) {
        let style = '';
        let borderPos = '';

        if (value.color.value != '') {
          if (value.position == 'solid') {
            borderPos = 'border:';
          }
          if (value.position == 'left') {
            borderPos = 'border-left:';
          }
          if (value.position == 'right') {
            borderPos = 'border-right:';
          }
          if (value.position == 'top') {
            borderPos = 'border-top:';
          }
          if (value.position == 'bottom') {
            borderPos = 'border-bottom:';
          }
        }

        if (value.radius.value) {
          if (value.radius.value.sync && value.radius.value.topleft != '') {
            style += 'border-radius: ' + value.radius.value.topleft + value.radius.value.units + ';';
          } else {
            if (value.radius.value) {
              if (value.radius.value.topleft) {
                style +=
                  'border-radius: ' +
                  value.radius.value.topleft +
                  value.radius.value.units +
                  ' ' +
                  value.radius.value.topright +
                  value.radius.value.units +
                  ' ' +
                  value.radius.value.bottomright +
                  value.radius.value.units +
                  ' ' +
                  value.radius.value.bottomleft +
                  value.radius.value.units +
                  ';';
              }
            }
          }
        }

        let actualValue = value.color.value;
        if (value.color.type == 'variable') {
          actualValue = 'var(' + actualValue + ');';
        }

        if (value.width.value && value.width.units && value.style && value.color.value) {
          style += borderPos + value.width.value + value.width.units + ' ' + value.style + ' ' + actualValue + ';';
        }

        return style;
      },
    },
    shadow: {
      dark: true,
      component: 'shadow-designer',
      type: 'style',
      group: __('Shadow', 'uipress-lite'),
      label: __('Box shadow', 'uipress-lite'),
      renderStyle(value) {
        let style = '';
        let borderPos = '';

        if (value.color.value != '') {
          let horiz = value.horizDistance.value;
          let vert = value.verticalDistance.value;
          let blur = value.blur.value;

          if (typeof horiz === 'undefined' || typeof vert === 'undefined' || typeof blur === 'undefined') {
            return '';
          }
          style += 'box-shadow: ' + value.horizDistance.value + value.horizDistance.units;
          style += ' ' + value.verticalDistance.value + value.verticalDistance.units;
          style += ' ' + value.blur.value + value.blur.units;
          style += ' ' + value.spread.value + value.spread.units;
          style += ' ' + value.color.value + ';';
        }
        return style;
      },
    },
    submitAction: {
      value: {
        action: '',
        emailAddress: '',
        emailSubject: '',
        emailTemplate: '',
        siteOptionName: '',
        phpFunction: '',
        objectOrSingle: '',
        userMetaObjectKey: '',
        redirectURL: [],
      },
      component: 'submit-actions',
      type: 'blockOption',
      renderStyle(value) {
        return;
      },
    },
    selectOptionCreator: {
      value: {
        options: [
          { label: __('Option 1', 'uipress-lite'), name: '' },
          { label: __('Option 2', 'uipress-lite'), name: '' },
        ],
      },
      component: 'select-option-builder',
      type: 'blockSpecific',
      renderStyle(value) {
        return value;
      },
    },
  };
}
