=== UiPress lite | Effortless custom dashboards, admin themes and pages ===
Contributors: uipress
Tags: admin theme, custom dashboard, google analytics, woocommerce analytics, white label
Requires at least: 6.0
Requires PHP: 7.0
Tested up to: 6.1.1
Stable tag: 3.1.1
License: GPLv2 or later

Effortless custom WordPress admin dashboards.

== Description ==

UiPress is an all in one solution for tailoring your WordPress admin.
From custom dashboards, admin themes, profile pages to entire admin frameworks, the uiBuilder can do it all. Pre-made intuitive blocks and a library of professional templates make it super easy to transform the way your site users interact with your content.

### Major features in UiPress lite include:

* A fast, modern and intuitive block based builder
* Create functional admin pages and ui templates
* Fully responsive templates
* Developer friendly with an extendable API
* Custom forms that can do anything, whether it be sending emails, passing form data to functions or saving the data to site options or user meta, UiPress has you covered.
* Global styles system
* Smart patterns for saving out templates and updating across all your templates
* Over 50+ blocks and counting
* Custom login pages
* Google analytics
* Woocommerce analytics
* User role editor
* Private user posts and media
* Integrated php error log


### A powerful builder that lets you customise everything

With the uiBuilder you are in control, it's easy to use, lightning fast and packed full of features. Creating custom admin pages and UI frameworks that go beyond just the visual has never been so easy.

## Forms that go the extra mile

The form block allows you to create and customise unique forms for any purpose. Whether it be sending emails, passing form data to functions or saving the data to site options or user meta, UiPress has you covered.

## Beautiful login pages

Modernise the login experience for your site users with the UiPress login page settings. Match the login page to your brand for a smooth user experience.

## The uiBuilder is a modern web app and is built with Vue.js

UiPress has countless options and customisations built in including the option to override block templates. For those that want to go further we have a well documented and easy to use API for creating custom blocks, options and more.

== Installation ==

Upload the UiPress plugin to your blog, activate it, and then navigate to the uiBuilder page (admin menu > settings > uipress).

1, 2, 3: You're done!

== Changelog ==

= 3.1.1 =
*Release Date 22 March 2023*

* Fixed bug where switching status from the template list table would not update status within the template settings
* Added fix for fluent forms form editor layout issue
* Fixed fluent forms issue that occurs when you access pages directly and could cause a whiteout
* Fixed bug with site settings that could cause theme styles / vars to reset
* Fixed bug that could cause dropdowns to be offscreen
* Added fix for breakdance builder | while using an active template you couldn't access media modal from breakdance builder
* Added option to allow offcanvas panels to close on page change
* Fixed dropdowns on wp toolbar - drops now open on hover and links respond to shortcuts (command / ctrl click etc)

= 3.1.0 =
*Release Date 13 March 2023*

* Fixed styling on wordpress events widget in dark mode
* Added catch for plugins missing the correct closing div tags which could push the uipress app into the #wpcontent div which is hidden when templates are active
* Added filter to remove '&amp;' from links and item names in the admin menu
* Fixed issue with plugin update icons in safari 
* Fixed issue where custom menu classes were only being applied on the dynamic menu
* Added catch for cron jobs so uipress does not run
* Removed vue router from active ui templates
* Fixed conflict issues with Crocoblock plugins and any other plugin using vue.js
* Fixed conflict with fluent forms & fluent crm
* Fixed issue with redirection plugin and any other plugin that could get stuck in a continuous loop (caused by query loop params being removed)
* Several performance updates
* Fixed tab block
* Added new background settings options (background image position, repeat and size)

= 3.0.99 =
*Release Date 20 February 2023*

* Fixed bug where importing some templates using dynamic site logo option could cause errors when no site logo set

= 3.0.98 =
*Release Date 17 February 2023*

* Fixed issue with named menu separators and the collapsed menu
* Fixed woocommerce order item select issue in dark mode
* Fixed issue with menu where it would remain in created language when user switched wp lang
* Fixed and cleaned up several inconsistencies with admin menu block and optimized the performance
* Removed 'hidden items' and rename / change icon option for admin menu block - these were conflicting too much with the advanced menu editor (pro) 
* Added option to disable autoload on top level menu item click
* Fixed bug with hover style menu where custom icons in submenu would show as text
* Rewrote most of the admin menu logic
* Admin menu now inherits site language and responds to site language changes
* Admin pages are now added to the top of the menu by default
* Added theme styles to the global site settings area
* Fixed bug where templates would not load when using a language other than English with a full translation for uipress
* Fixed layout issue with plugin cookieYES
* Added work around for ultimo and auth0 plugin issues when using the 'wp_login_url' function
* Added new setup wizard

= 3.0.97 =
*Release Date 2 February 2023*

* Fixed style issue with background images on login page when using the centered form
* Fixed issue with basic theme where menu and toolbar overlapped gutenburg editor
* Several ux and ui improvements to the search block and added filter options
* Fixed issue with dropdowns where the could be difficult to close
* Added icon styles to button element
* Admin menu block now responds to default meta clicks for opening in new windows / new tabs etc
* Added site option setting for disabling dynamic loading
* Theme library now defaults to order by newest
* Added new frontend toolbar template type
* Admin menu can now be collapsed

= 3.0.96 =
*Release Date 27 January 2023*

* Fixed block settings showing options as pro when new style options have been added to the builder since the block was added to the template
* Added option to heading block to control icon size
* Fixed issue with multi select containers that would sometimes show as dark in light mode
* Fixed issue with fullscreen mode when using a standalone full screen button with the default full screen disabled you wouldn't be able to escape full screen
* fixed issue with displaying post modified date in the post tables not displaying the correct timezone time
* Fixed issue where code added to the head would fire in the frame and outside it
* Fixed issue with Elementor templates not showing sub menu for some items
* Added new login page features to style out the login page
* Added a new admin them option to the site settings that allows you to quickly enable a simple and modern admin theme to the wordpress admin without using the builder
* Added options to changed the 'howdy' message in the toolbar
* Added admin page link to the builder settings

For older changelog entries, please see https://uipress.co/uipresschangelog/


== Screenshots ==

1. Customise everything in the admin

2. An overview of the builder

3. An image showing the mobile preview in the builder

4. A view of the plugin area with a custom ui template active

