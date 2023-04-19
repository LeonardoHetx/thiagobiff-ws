export function moduleData() {
  return {
    props: {
      hover: Boolean,
      dropPos: String, // Dropdown position 'top-left' 'top-right' 'right' 'left' 'bottom-left' 'bottom-right'
      externalOpen: Boolean, //Allows drop to be opened from outside the component
      triggerClass: String, // Allows custom classes to be set on the trigger container
      onOpen: Function, //Custom function to run when the drop opens
      shortCut: [Boolean, String, Array],
    },
    data: function () {
      return {
        modelOpen: false,
        dropWidth: 0,
        position: this.dropPos,
      };
    },
    watch: {
      externalOpen: {
        handler(newValue, oldValue) {
          if (newValue) {
            this.openThisComponent();
          }
        },
        deep: true,
      },
    },
    mounted: function () {
      this.mountShortcut();
    },
    destroyed() {
      document.removeEventListener('scroll', this.handleScroll, true);
    },
    unmounted() {
      document.removeEventListener('scroll', this.handleScroll, true);
    },
    methods: {
      mountShortcut() {
        if (!this.shortCut) {
          return;
        }

        let shortcut = JSON.parse(JSON.stringify(this.shortCut));
        let pressedKeys = [];

        window.addEventListener('keydown', (event) => {
          let shortcutPressed = false;

          pressedKeys.push(event.key.toString());

          shortcutPressed = true;
          for (let item of shortcut) {
            if (!pressedKeys.includes(item)) {
              shortcutPressed = false;
              break;
            }
          }

          if (shortcutPressed) {
            this.openThisComponent();
          }
        });

        window.addEventListener('keyup', (event) => {
          pressedKeys = [];
        });
      },
      handleScroll(event) {
        this.setPosition();
      },
      onClickOutside(event) {
        if (!this.$refs.uipdrop) {
          return;
        }
        const path = event.composedPath ? event.composedPath() : undefined;
        // check if the MouseClick occurs inside the component
        if (path && !path.includes(this.$refs.uipdrop) && !this.$refs.uipdrop.contains(event.target)) {
          this.closeThisComponent(); // whatever method which close your component
        }
      },
      openThisComponent() {
        this.modelOpen = !this.modelOpen;

        if (this.modelOpen == true) {
          document.addEventListener('scroll', this.handleScroll, true);
        }
        //this.setPosition();
        // You can also use Vue.$nextTick or setTimeout
        requestAnimationFrame(() => {
          document.documentElement.addEventListener('click', this.onClickOutside, true);

          //Adds a listener for clicks to the frame
          let frame = document.getElementsByClassName('uip-page-content-frame');
          if (frame[0]) {
            frame[0].contentWindow.document.body.addEventListener('click', this.onClickOutside, true);
          }

          if (this.onOpen) {
            this.onOpen();
          }

          this.setPosition();
        });
      },
      closeThisComponent() {
        this.modelOpen = false; // whatever codes which close your component
        document.documentElement.removeEventListener('click', this.onClickOutside, true);
        document.removeEventListener('scroll', this.handleScroll, true);

        let frame = document.getElementsByClassName('uip-page-content-frame');
        if (frame[0]) {
          frame[0].contentWindow.document.body.removeEventListener('click', this.onClickOutside, true);
        }
      },
      setPosition() {
        self = this;
        let returnDatat = 0;
        ///SET TOP

        if (!self.$el) {
          return;
        }

        //When drops are used in the template preview area, the position is off due to the container being scaled. The below works out the offset
        let containerOffsetTop = 0;
        let containerOffsetLeft = 0;
        let containerOffsetBottom = 0;
        let containerOffsetRight = 0;
        let preview = document.getElementById('uip-ui-preview-area');
        if (preview) {
          if (preview.contains(self.$refs.uipdrop)) {
            containerOffsetTop = preview.getBoundingClientRect().top;
            containerOffsetLeft = preview.getBoundingClientRect().left;
            containerOffsetRight = window.innerWidth - preview.getBoundingClientRect().right;
            containerOffsetBottom = window.innerHeight - preview.getBoundingClientRect().bottom;
          }
        }

        let drop = self.$refs.uipdrop;
        let triger = self.$refs.droptrigger;

        let POStop = 'auto';
        let POSbottom = 'auto';
        let POSleft = 'auto';
        let POSright = 'auto';

        if (!this.position) {
          this.position = 'bottom-left';
        }

        //If trigger is near bottom of page flip to top
        if (drop.getBoundingClientRect().bottom > window.innerHeight) {
          this.position = this.position.replace('bottom', 'top');
          if (this.position == 'left') {
            this.position = 'top-right';
          }
          if (this.position == 'right') {
            this.position = 'top-left';
          }
        }
        //If trigger is near right of page flip to left
        if (drop.getBoundingClientRect().right > window.innerWidth) {
          if (this.position == 'right') {
            this.position = 'left';
          }
          if (this.position == 'bottom-left' || this.position == 'top-left') {
            this.position = this.position.replace('left', 'right');
          }
        }

        //If trigger is near left of page flip to right
        if (drop.getBoundingClientRect().left < 10) {
          if (this.position == 'top-right') {
            this.position == 'top-left';
          }
          if (this.position == 'left') {
            this.position = this.position.replace('left', 'right');
          }
        }

        if (!this.position || this.position == 'bottom-left') {
          POStop = triger.getBoundingClientRect().bottom + 10 - containerOffsetTop + 'px';
          POSleft = triger.getBoundingClientRect().left - containerOffsetLeft + 'px';
        }

        if (this.position == 'top-left') {
          POSbottom = window.innerHeight - triger.getBoundingClientRect().top + 10 - containerOffsetBottom + 'px';
          POSleft = triger.getBoundingClientRect().left - containerOffsetLeft + 'px';
        }

        if (this.position == 'bottom-right') {
          POStop = triger.getBoundingClientRect().bottom + 10 - containerOffsetTop + 'px';
          POSright = window.innerWidth - triger.getBoundingClientRect().right - containerOffsetLeft + 'px';
        }

        if (this.position == 'top-right') {
          POSbottom = window.innerHeight - triger.getBoundingClientRect().top + 10 - containerOffsetBottom + 'px';
          POSright = window.innerWidth - triger.getBoundingClientRect().right - containerOffsetRight + 'px';
        }

        if (this.position == 'right') {
          POStop = triger.getBoundingClientRect().top - containerOffsetTop + 'px';
          POSleft = triger.getBoundingClientRect().right + 10 - containerOffsetLeft + 'px';
        }

        if (this.position == 'left') {
          POStop = triger.getBoundingClientRect().top - containerOffsetTop + 'px';
          POSright = window.innerWidth - triger.getBoundingClientRect().left + 10 - containerOffsetRight + 'px';
        }

        drop.style.bottom = POSbottom;
        drop.style.left = POSleft;
        drop.style.right = POSright;
        drop.style.top = POStop;
      },
      openOnHover() {
        if (this.hover) {
          this.modelOpen = true;
          //this.setPosition();
          // You can also use Vue.$nextTick or setTimeout
          requestAnimationFrame(() => {
            document.documentElement.addEventListener('click', this.onClickOutside, true);
            if (this.onOpen) {
              this.onOpen();
            }
            if (!this.hover) {
              return;
            }
            this.setPosition();
          });
        }
      },
      closeOnHover() {
        if (this.hover) {
          this.modelOpen = false;
        }
      },
    },
    template:
      '<div class="uip-position-relative" @mouseover="openOnHover()" @mouseleave="closeOnHover()">\
	  	  <div class="uip-flex">\
		  		<div class="uip-cursor-pointer" :class="triggerClass" ref="droptrigger" @click="openThisComponent()"><slot name="trigger"></slot></div>\
			    <slot name="post-trigger"></slot>\
		    </div>\
		    <div v-if="modelOpen"  ref="uipdrop" class="uip-position-fixed uip-z-index-9999 uip-modal-open">\
          <div class="" style="position: absolute; background: rgba(0,0,0,0); inset: -20px; z-index:0"></div>\
          <div class="uip-shadow uip-position-relative uip-dropdown-conatiner uip-background-default uip-border-round uip-border uip-margin-xl uip-z-index-1">\
		        <slot name="content"></slot>\
		      </div>\
        </div>\
	    </div>',
  };
}
