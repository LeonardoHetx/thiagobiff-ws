<?php
if (!defined('ABSPATH')) {
  exit();
}

/**
 * Main uipress ajax class. Loads all ajax functions for the main uipress functionality
 * @since 3.0.0
 */

class uip_ajax
{
  public function __construct()
  {
  }

  public function load_ajax()
  {
    //AJAX
    add_action('wp_ajax_uip_get_user_roles', [$this, 'uip_get_user_roles']);
    add_action('wp_ajax_uip_search_user_roles', [$this, 'uip_search_user_roles']);
    add_action('wp_ajax_uip_get_post_types', [$this, 'uip_get_post_types']);
    add_action('wp_ajax_uip_get_recent_posts', [$this, 'uip_get_recent_posts']);
    add_action('wp_ajax_uip_get_posts_for_table', [$this, 'uip_get_posts_for_table']);
    add_action('wp_ajax_uip_get_post_table_columns', [$this, 'uip_get_post_table_columns']);
    add_action('wp_ajax_uip_delete_post', [$this, 'uip_delete_post']);
    add_action('wp_ajax_uip_save_user_preference', [$this, 'uip_save_user_preference']);
    add_action('wp_ajax_uip_get_user_preference', [$this, 'uip_get_user_preference']);
    add_action('wp_ajax_uip_get_media', [$this, 'uip_get_media']);
    add_action('wp_ajax_uip_search_content', [$this, 'uip_search_content']);
    add_action('wp_ajax_uip_process_form_input', [$this, 'uip_process_form_input']);
    add_action('wp_ajax_uip_send_form_email', [$this, 'uip_send_form_email']);
    add_action('wp_ajax_uip_save_form_as_option', [$this, 'uip_save_form_as_option']);
    add_action('wp_ajax_uip_save_form_as_user_option', [$this, 'uip_save_form_as_user_option']);
    add_action('wp_ajax_uip_pre_populate_form_data', [$this, 'uip_pre_populate_form_data']);
    add_action('wp_ajax_uip_create_frame_switch', [$this, 'uip_create_frame_switch']);
    add_action('wp_ajax_uip_get_php_errors', [$this, 'uip_get_php_errors']);
    //add_action('wp_ajax_uip_get_login_form', [$this, 'uip_get_login_form']);
    //add_action('wp_ajax_nopriv_uip_get_login_form', [$this, 'uip_get_login_form']);
    add_action('wp_ajax_uip_check_for_template_updates', [$this, 'uip_check_for_template_updates']);
  }

  /**
   * Gets login form
   * @since 3.0.96
   */
  public function uip_check_for_template_updates()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $Tid = sanitize_text_field($_POST['template_id']);

      $updated = get_the_modified_date('U', $Tid);

      $returndata = [];
      $returndata['updated'] = $updated;
      $returndata['status'] = get_post_status($Tid);
      $returndata['success'] = true;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Gets login form || DISCONTINUED
   * @since 3.0.96
   */
  public function uip_get_login_form()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      //$shortCode = stripslashes(sanitize_text_field($_POST['shortCode']));

      ob_start();

      $args = [
        'echo' => true,
        'remember' => true,
        'value_remember' => true,
      ];

      wp_login_form($args);

      $code = ob_get_clean();

      $returndata = [];
      $returndata['loginForm'] = $code;
      $returndata['success'] = true;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Gets php errors for error log block
   * @since 3.0.92
   */
  public function uip_get_php_errors()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $perPage = sanitize_text_field($_POST['perPage']);
      $order = sanitize_text_field($_POST['order']);
      $search = sanitize_text_field($_POST['search']);
      $page = sanitize_text_field($_POST['page']);

      $logdir = ini_get('error_log');

      if (!$logdir) {
        $returndata['error'] = true;
        $returndata['message'] = __('Unable to locate error log', 'uipress-lite');
        $returndata['description'] = __('No error log path set in your PHP ini file', 'uipress-lite');
        wp_send_json($returndata);
      }

      if (!file_exists($logdir)) {
        $returndata['error'] = true;
        $returndata['message'] = __('Log file does not exist or is empty', 'uipress-lite');
        $returndata['description'] = __("Either the PHP error log path is incorrect or you don't have any errors yet. Path: ", 'uipress-lite') . $logdir;
        wp_send_json($returndata);
      }

      //Get all errors
      $allErrrors = [];
      foreach ($utils->getParsedLogFile($logdir) as $err) {
        $allErrrors[] = $err;
      }
      $allErrrors = $allErrrors[0];

      if ($search && $search != '') {
        $sL = strtolower($search);
        $errHolder = $allErrrors;
        $allErrrors = [];
        foreach ($errHolder as $err) {
          if ($err) {
            if (isset($err['message'])) {
              $hs = strtolower($err['message']);
              $file = strtolower($err['file']);
              $trace = strtolower(json_encode($err['stackTrace']));

              if (strpos($hs, $sL) !== false || strpos($file, $sL) !== false || strpos($trace, $sL) !== false) {
                $allErrrors[] = $err;
                continue;
              }
            }
          }
        }
      }

      if (!$allErrrors) {
        $allErrrors = [];
      }

      $totalFound = number_format(count($allErrrors));
      $totalPages = round(count($allErrrors) / $perPage);

      if ($order == 'desc') {
        $allErrrors = array_reverse($allErrrors);
        $startPoint = $perPage * $page;
        if (count($allErrrors) > $perPage) {
          $allErrrors = array_slice($allErrrors, $startPoint, $perPage);
        }
      } else {
        //$shortened = array_slice($allErrrors, 0, $perPage);
      }

      $returndata['success'] = true;
      $returndata['message'] = __('Errros fetched', 'uipress-lite');
      $returndata['errors'] = $allErrrors;
      $returndata['totalFound'] = $totalFound;
      $returndata['totalPages'] = $totalPages;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Creates a temporary transient for disabling uipress
   * @since 3.0.6
   */
  public function uip_create_frame_switch()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $uid = sanitize_text_field($_POST['uid']);

      if (!$uid) {
        $returndata['error'] = true;
        $returndata['message'] = __('Unable to create temporary frame', 'uipress-lite');
        wp_send_json($returndata);
      }

      set_transient(str_replace($uid, '-', '_'), 'uiptrue', 30);

      $returndata['success'] = true;
      $returndata['message'] = __('Transient created', 'uipress-lite');
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Processes data from a form and saves as a user meta
   * @since 3.0.0
   */
  public function uip_save_form_as_user_option()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $data = $utils->clean_ajax_input(json_decode(stripslashes($_POST['formData'])));
      $objectOrSingle = $utils->clean_ajax_input($_POST['objectOrSingle']);
      $userMetaObjectKey = sanitize_key($_POST['userMetaObjectKey']);

      if ($objectOrSingle == 'object' && !$userMetaObjectKey) {
        $returndata['error'] = true;
        $returndata['message'] = __('Config error: You need to specifiy a meta key to save the meta data to', 'uipress-lite');
        wp_send_json($returndata);
      }

      $userID = get_current_user_id();

      if ($objectOrSingle == 'object') {
        update_user_meta($userID, $userMetaObjectKey, $data);
        $returndata = [];
        $returndata['success'] = true;
        wp_send_json($returndata);
      }

      if ($objectOrSingle == 'single') {
        foreach ($data as $key => $value) {
          update_user_meta($userID, $key, $value);
        }
        $returndata = [];
        $returndata['success'] = true;
        wp_send_json($returndata);
      }

      $returndata['error'] = true;
      $returndata['message'] = __('Config error: Something went wrong', 'uipress-lite');
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Processes data from a form and saves as a site option
   * @since 3.0.0
   */
  public function uip_save_form_as_option()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $data = $utils->clean_ajax_input(json_decode(stripslashes($_POST['formData'])));
      $optionKey = sanitize_key($_POST['optionKey']);

      if (!$optionKey) {
        $returndata['error'] = true;
        $returndata['message'] = __('Config error: No site option name supplied', 'uipress-lite');
        wp_send_json($returndata);
      }

      update_site_option($optionKey, $data);

      $returndata = [];
      $returndata['success'] = true;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Processes data from a form to an email
   * @since 3.0.0
   */
  public function uip_send_form_email()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $data = $utils->clean_ajax_input(json_decode(stripslashes($_POST['formData'])));
      $emailTemplate = $utils->clean_ajax_input_width_code(stripslashes($_POST['emailTemplate']));
      $emailSubject = sanitize_text_field($_POST['emailSubject']);
      $emailTo = sanitize_email($_POST['emailTo']);

      if (!is_email($emailTo)) {
        $returndata['error'] = true;
        $returndata['message'] = __('Config error: Recipient email is not valid', 'uipress-lite');
        wp_send_json($returndata);
      }

      if ($emailTemplate == '') {
        $returndata['error'] = true;
        $returndata['message'] = __('Config error: No email template set', 'uipress-lite');
        wp_send_json($returndata);
      }

      foreach ($data as $key => $value) {
        $emailTemplate = str_replace('{{' . $key . '}}', $value, $emailTemplate);
      }

      $subject = $emailSubject;
      $content = $emailTemplate;
      $replyTo = $emailTo;

      $headers[] = 'From: ' . ' ' . get_bloginfo('name') . '<' . $emailTo . '>';
      $headers[] = 'Reply-To: ' . ' ' . $emailTo;
      $headers[] = 'Content-Type: text/html; charset=UTF-8';

      $wrap = '<table style="box-sizing:border-box;border-color:inherit;text-indent:0;padding:0;margin:64px auto;width:464px"><tbody>';
      $wrapend = '</tbody></table>';
      $formatted = $wrap . $content . $wrapend;

      $status = wp_mail($emailTo, $subject, $formatted, $headers);

      if (!$status) {
        $returndata['error'] = true;
        $returndata['message'] = __('Unable to send mail at this time', 'uipress-light');
        wp_send_json($returndata);
      }

      $returndata = [];
      $returndata['success'] = true;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Processes data from a form to user supplied function
   * @since 3.0.0
   */
  public function uip_pre_populate_form_data()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $formKeys = $utils->clean_ajax_input(json_decode(stripslashes($_POST['formKeys'])));
      $saveType = sanitize_text_field($_POST['saveType']);
      $objectOrSingle = sanitize_text_field($_POST['objectOrSingle']);
      $userMetaObjectKey = sanitize_key($_POST['userMetaObjectKey']);
      $siteOptionName = sanitize_key($_POST['siteOptionName']);

      $data = [];
      ///Handle user meta population
      if ($saveType == 'userMeta') {
        //Saving as an object but no key give,
        if ($objectOrSingle == 'object' && !$userMetaObjectKey) {
          wp_send_json([]);
        }
        if (!is_array($formKeys)) {
          wp_send_json([]);
        }

        $userID = get_current_user_id();

        if ($objectOrSingle == 'single') {
          foreach ($formKeys as $key) {
            $value = get_user_meta($userID, $key, true);
            $data[$key] = $value;
          }
        }

        if ($objectOrSingle == 'object') {
          $userdata = get_user_meta($userID, $userMetaObjectKey, true);

          if (is_array($userdata)) {
            foreach ($formKeys as $key) {
              if (isset($userdata[$key])) {
                $data[$key] = $userdata[$key];
              }
            }
          }
          if (is_object($userdata)) {
            foreach ($formKeys as $key) {
              if (isset($userdata->$key)) {
                $data[$key] = $userdata->$key;
              }
            }
          }
        }
      }
      //Site option
      if ($saveType == 'siteOption') {
        if (!$siteOptionName) {
          wp_send_json([]);
        }
        if (!is_array($formKeys)) {
          wp_send_json([]);
        }

        $sitedata = get_site_option($siteOptionName);

        if (is_array($sitedata)) {
          foreach ($formKeys as $key) {
            if (isset($sitedata[$key])) {
              $data[$key] = $sitedata[$key];
            }
          }
        }
        if (is_object($sitedata)) {
          foreach ($formKeys as $key) {
            if (isset($sitedata->$key)) {
              $data[$key] = $sitedata->$key;
            }
          }
        }
      }
      $returndata = [];
      $returndata['success'] = true;
      $returndata['formValues'] = $data;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Processes data from a form to user supplied function
   * @since 3.0.0
   */
  public function uip_process_form_input()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $data = $utils->clean_ajax_input(json_decode(stripslashes($_POST['formData'])));
      $userFunction = sanitize_text_field($_POST['userFunction']);

      if (!function_exists($userFunction)) {
        $returndata['error'] = true;
        $returndata['message'] = __('Passed function doesn\'t exist', 'uipress-lite');
        wp_send_json($returndata);
      }

      $state = $userFunction($data);

      if (!$state) {
        $returndata['error'] = true;
        $returndata['message'] = __('Unable to process form', 'uipress-lite');
        wp_send_json($returndata);
      }

      $returndata = [];
      $returndata['success'] = true;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Searches posts and pages by passed search string for the search block
   * @since 3.0.0
   */
  public function uip_search_content()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $string = sanitize_text_field($_POST['search']);
      $page = sanitize_option('page_for_posts', $_POST['page']);
      $authorLimit = sanitize_text_field($_POST['limitToauthor']);
      $types = $utils->clean_ajax_input(json_decode(stripslashes($_POST['postTypes'])));
      $filter = sanitize_text_field($_POST['filter']);

      if (!is_array($types) || empty($types)) {
        $types = 'post';
      }

      if ($filter && $filter != '' && $filter != 'all') {
        $types = $filter;
      }

      //Get template
      $args = [
        'post_type' => $types,
        's' => $string,
        'posts_per_page' => 10,
        'paged' => $page,
        'post_status' => 'any',
      ];

      if ($authorLimit == 'true') {
        $args['author'] = get_current_user_id();
      }

      $query = new WP_Query($args);
      $totalFound = $query->found_posts;
      $foundPosts = $query->get_posts();

      $formattedPosts = [];
      $types = [];
      $typesHolder = [];

      foreach ($foundPosts as $item) {
        $temp = [];

        $modified = get_the_modified_date('U', $item->ID);
        $humandate = human_time_diff($modified, strtotime(date('Y-D-M'))) . ' ' . __('ago', 'uipress-lite');
        $author_id = get_post_field('post_author', $item->ID);
        $user = get_user_by('id', $author_id);
        $username = $user->user_login;

        $pt = get_post_type($item->ID);
        $post_type_obj = get_post_type_object($pt);

        $temp['name'] = get_the_title($item->ID);
        $temp['link'] = get_permalink($item->ID);
        $temp['editLink'] = get_edit_post_link($item->ID, '&');
        $temp['modified'] = $humandate;
        $temp['type'] = $post_type_obj->labels->singular_name;
        $temp['author'] = $username;

        $icon = 'article';
        if ($pt == 'attachment') {
          $icon = wp_get_attachment_thumb_url($item->ID);
        } else {
          $thumb = get_the_post_thumbnail_url($item->ID);

          if ($thumb) {
            $icon = $thumb;
          }
        }

        $temp['icon'] = $icon;

        $formattedPosts[] = $temp;

        if (!in_array($post_type_obj->labels->singular_name, $typesHolder)) {
          $typesHolder[] = $post_type_obj->labels->singular_name;
          $temp = [];
          $temp['name'] = $pt;
          $temp['label'] = $post_type_obj->labels->singular_name;
          $types[] = $temp;
        }
      }

      //Return data to app
      $returndata = [];
      $returndata['success'] = true;
      $returndata['posts'] = $formattedPosts;
      $returndata['totalPages'] = $query->max_num_pages;
      $returndata['totalFound'] = $totalFound;
      $returndata['types'] = $types;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Gets user pref
   * @since 3.0.0
   */

  public function uip_get_user_preference()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $key = sanitize_text_field($_POST['key']);

      $userid = get_current_user_id();
      $current = get_user_meta($userid, 'uip-prefs', true);
      $currentValue = false;

      if (isset($current[$key])) {
        $currentValue = $current[$key];
      }

      $returndata['success'] = true;
      $returndata['value'] = $currentValue;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Updates user prefs
   * @since 3.0.0
   */

  public function uip_save_user_preference()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $key = sanitize_text_field($_POST['key']);
      $newValue = $utils->clean_ajax_input_width_code(json_decode(stripslashes($_POST['value'])));

      $userid = get_current_user_id();
      $current = get_user_meta($userid, 'uip-prefs', true);
      $currentValue = '';

      if (is_array($current)) {
        if (isset($current[$key])) {
          $currentValue = $current[$key];
          $current[$key] = $newValue;
        } else {
          $current[$key] = $newValue;
        }
      } else {
        $current = [];
        $current[$key] = $newValue;
      }

      if ($currentValue != $newValue) {
        $state = update_user_meta($userid, 'uip-prefs', $current);
      } else {
        $state = true;
      }

      $returndata['success'] = true;
      $returndata['message'] = __('Preference updated', 'uipress-lite');
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Deletes posts / cpt / pages by ID
   * Accepts single ID or array of IDS
   * @since 3.0.0
   */

  public function uip_delete_post()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $ids = $utils->clean_ajax_input_width_code(json_decode(stripslashes($_POST['id'])));

      if (!is_array($ids)) {
        $returndata['error'] = true;
        $returndata['message'] = __('Unable to read post ids to delete', 'uipress-lite');
        wp_send_json($returndata);
      }

      $errorcount = 0;
      foreach ($ids as $id) {
        if (!$id || $id == '' || !is_numeric($id)) {
          $errorcount += 1;
          continue;
        }

        if (!current_user_can('delete_post', $id)) {
          $errorcount += 1;
          continue;
        }

        $data = wp_delete_post($id, true);

        if (!$data) {
          $errorcount += 1;
          continue;
        }
      }

      $returndata['success'] = true;
      $returndata['message'] = __('Item deleted', 'uipress-lite');
      $returndata['errorCount'] = $errorcount;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Returns list of posts for recebt posts blocks
   * @since 3.0.0
   */

  public function uip_get_posts_for_table()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      //$string = $utils->clean_ajax_input($_POST['search']);
      $page = sanitize_option('page_for_posts', $_POST['page']);
      $types = $utils->clean_ajax_input(json_decode(stripslashes($_POST['postTypes'])));
      $perPage = sanitize_option('page_for_posts', $_POST['perPage']);
      $limitToAuthor = sanitize_text_field($_POST['limitToAuthor']);
      $string = sanitize_text_field($_POST['search']);
      $userCols = $utils->clean_ajax_input_width_code(json_decode(stripslashes($_POST['columns'])));
      $actions = $utils->clean_ajax_input_width_code(json_decode(stripslashes($_POST['actions'])));

      if (!$userCols || empty($userCols)) {
        $userCols = false;
      }
      if (!$actions || empty($actions)) {
        $actions = false;
      }

      if (!$perPage || $perPage == '') {
        $perPage = 10;
      }

      if (!is_array($types) || empty($types)) {
        $types = 'post';
      }
      //Get template
      $args = [
        'post_type' => $types,
        'posts_per_page' => $perPage,
        'paged' => $page,
        'post_status' => 'any',
        's' => $string,
      ];

      if ($limitToAuthor == 'true') {
        $args['author'] = get_current_user_id();
      }

      $query = new WP_Query($args);
      $totalFound = $query->found_posts;
      $foundPosts = $query->get_posts();

      $formattedPosts = [];
      $columns = [];

      foreach ($foundPosts as $item) {
        $temp = [];

        $modified = get_the_modified_date('U', $item->ID);
        $humandate = human_time_diff($modified, strtotime(date('Y-D-M'))) . ' ' . __('ago', 'uipress-lite');
        $author_id = get_post_field('post_author', $item->ID);
        $user = get_user_by('id', $author_id);
        $username = $user->user_login;
        $pt = get_post_type($item->ID);

        $post_type_obj = get_post_type_object(get_post_type($item->ID));

        //Get post categories
        $post_categories = wp_get_post_categories($item->ID);
        $cats = [];
        foreach ($post_categories as $c) {
          $cat = get_category($c);
          $cats[] = ['name' => $cat->name, 'slug' => $cat->slug];
        }

        //Get post tags
        $post_tags = wp_get_post_tags($item->ID);
        $tags = [];
        foreach ($post_tags as $tag) {
          $tags[] = ['name' => $tag->name, 'slug' => $tag->slug];
        }

        $link = get_permalink($item->ID);
        $editLink = get_edit_post_link($item->ID, '&');

        if ($pt == 'attachment') {
          $image = wp_get_attachment_image_url($item->ID);
        } else {
          $image = get_the_post_thumbnail_url($item->ID, 'post-thumbnail');
        }

        $temp['name'] = get_the_title($item->ID);
        $temp['link'] = $link;
        $temp['editLink'] = $editLink;
        $temp['modified'] = $humandate;
        $temp['type'] = $post_type_obj->labels->singular_name;
        $temp['author'] = $username;
        $temp['img'] = $image;
        $temp['authorLink'] = get_author_posts_url($author_id);
        $temp['excerpt'] = substr(get_the_excerpt($item->ID), 0, 60);
        $temp['categories'] = $cats;
        $temp['tags'] = $tags;
        $temp['id'] = $item->ID;

        if ($userCols) {
          foreach ($userCols as $col) {
            if ($col->type == 'meta') {
              $temp[$col->name] = get_post_meta($item->ID, $col->name, true);
            }
          }
        }

        $allActions = [
          'view' => ['name' => 'view', 'label' => __('View', 'uipress-lite'), 'icon' => 'visibility', 'link' => $link, 'type' => 'link', 'ID' => $item->ID],
          'edit' => ['name' => 'edit', 'label' => __('Edit', 'uipress-lite'), 'icon' => 'edit_document', 'link' => $editLink, 'type' => 'link', 'ID' => $item->ID],
          'delete' => ['name' => 'delete', 'label' => __('Delete', 'uipress-lite'), 'icon' => 'delete', 'link' => '', 'type' => 'link', 'ID' => $item->ID],
        ];

        $temp['actions'] = [];
        if ($actions) {
          foreach ($actions as $action) {
            $temp['actions'][] = $allActions[$action];
          }
        } else {
          $temp['actions'] = $allActions;
        }

        $formattedPosts[] = $temp;
      }

      if (!$userCols) {
        $columns = [
          [
            'name' => 'name',
            'label' => __('Title', 'uipress-lite'),
            'active' => true,
          ],
          [
            'name' => 'author',
            'label' => __('Author', 'uipress-lite'),
            'active' => false,
          ],
          [
            'name' => 'type',
            'label' => __('Type', 'uipress-lite'),
            'active' => true,
          ],
          [
            'name' => 'modified',
            'label' => __('Date', 'uipress-lite'),
            'active' => false,
          ],
          [
            'name' => 'categories',
            'label' => __('Categories', 'uipress-lite'),
            'active' => true,
          ],
          [
            'name' => 'tags',
            'label' => __('Tags', 'uipress-lite'),
            'active' => true,
          ],
          [
            'name' => 'id',
            'label' => __('ID', 'uipress-lite'),
            'active' => false,
          ],
          [
            'name' => 'actions',
            'label' => __('Actions', 'uipress-lite'),
            'active' => true,
          ],
        ];
      } else {
        $columns = $userCols;
      }

      //Return data to app
      $returndata = [];
      $returndata['success'] = true;
      $returndata['posts'] = $formattedPosts;
      $returndata['columns'] = $columns;
      $returndata['totalPages'] = $query->max_num_pages;
      $returndata['total'] = $totalFound;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Returns list of attachments for media browser
   * @since 3.0.0
   */

  public function uip_get_media()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      //$string = $utils->clean_ajax_input($_POST['search']);
      $search = sanitize_text_field($_POST['search']);
      $limitToAuthor = sanitize_text_field($_POST['limitToAuthor']);
      $perPage = sanitize_text_field($_POST['perPage']);
      $page = sanitize_option('page_for_posts', $_POST['page']);

      $all_mimes = get_allowed_mime_types();
      $types = array_diff($all_mimes, []);

      if (isset($_POST['fileTypes'])) {
        $fileTypes = $utils->clean_ajax_input(json_decode(stripslashes($_POST['fileTypes'])));
        if (is_array($fileTypes)) {
          $types = $fileTypes;
        }
      }

      if (!$perPage || !is_int((int) $perPage)) {
        $perPage = 20;
      }

      //Get template
      $args = [
        'post_type' => ['attachment'],
        'posts_per_page' => $perPage,
        'paged' => $page,
        'post_status' => 'any',
        's' => $search,
        'post_mime_type' => $types,
      ];

      if ($limitToAuthor == 'true') {
        $args['author'] = get_current_user_id();
      }

      $query = new WP_Query($args);
      $totalFound = $query->found_posts;
      $foundPosts = $query->get_posts();

      $formattedPosts = [];

      foreach ($foundPosts as $item) {
        $temp = [];

        $modified = get_the_modified_date('U', $item->ID);
        $humandate = human_time_diff($modified, strtotime(date('Y-D-M'))) . ' ' . __('ago', 'uipress-lite');
        $author_id = get_post_field('post_author', $item->ID);
        $user = get_user_by('id', $author_id);
        $username = $user->user_login;

        $fullSize = wp_get_attachment_url($item->ID);
        $regular = wp_get_attachment_image_src($item->ID, 'large');
        $medium = wp_get_attachment_image_src($item->ID, 'medium');
        $thumb = wp_get_attachment_image_src($item->ID, 'thumbnail');

        $previewLink = $medium[0];
        $height = $medium[1];
        $width = $medium[2];

        $sizes['full'] = $fullSize;
        if (isset($regular[0])) {
          $sizes['regular'] = $regular[0];
        }
        if (isset($medium[0])) {
          $sizes['small'] = $medium[0];
        }
        if (isset($thumb[0])) {
          $sizes['thumb'] = $thumb[0];
        }

        $temp['name'] = get_the_title($item->ID);
        $temp['url'] = wp_get_attachment_url($item->ID);
        $temp['preview'] = $previewLink;
        $temp['modified'] = $humandate;
        $temp['author'] = $username;
        $temp['id'] = $item->ID;
        $temp['urls'] = $sizes;
        $temp['type'] = get_post_mime_type($item->ID);
        $temp['ratio'] = $height . ' / ' . $width;

        $formattedPosts[] = $temp;
      }

      //Return data to app
      $returndata = [];
      $returndata['success'] = true;
      $returndata['media'] = $formattedPosts;
      $returndata['totalPages'] = $query->max_num_pages;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Returns list of posts for recebt posts blocks
   * @since 3.0.0
   */

  public function uip_get_recent_posts()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      //$string = $utils->clean_ajax_input($_POST['search']);
      $page = sanitize_option('page_for_posts', $_POST['page']);
      $types = $utils->clean_ajax_input(json_decode(stripslashes($_POST['postTypes'])));
      $perPage = sanitize_option('page_for_posts', $_POST['perPage']);
      $limitToAuthor = sanitize_text_field($_POST['limitToAuthor']);

      if (!$perPage || $perPage == '') {
        $perPage = 10;
      }

      if (!is_array($types) || empty($types)) {
        $types = 'post';
      }
      //Get template
      $args = [
        'post_type' => $types,
        'posts_per_page' => $perPage,
        'paged' => $page,
        'post_status' => 'any',
      ];

      if ($limitToAuthor == 'true') {
        $args['author'] = get_current_user_id();
      }

      $query = new WP_Query($args);
      $totalFound = $query->found_posts;
      $foundPosts = $query->get_posts();

      $formattedPosts = [];

      foreach ($foundPosts as $item) {
        $temp = [];

        $modified = get_the_modified_date('U', $item->ID);
        $humandate = human_time_diff($modified, strtotime(date('Y-D-M'))) . ' ' . __('ago', 'uipress-lite');
        $author_id = get_post_field('post_author', $item->ID);
        $user = get_user_by('id', $author_id);
        $username = $user->user_login;

        $post_type_obj = get_post_type_object(get_post_type($item->ID));

        $temp['name'] = get_the_title($item->ID);
        $temp['link'] = get_permalink($item->ID);
        $temp['editLink'] = get_edit_post_link($item->ID, '&');
        $temp['modified'] = $humandate;
        $temp['type'] = $post_type_obj->labels->singular_name;
        $temp['author'] = $username;
        $formattedPosts[] = $temp;
      }

      //Return data to app
      $returndata = [];
      $returndata['success'] = true;
      $returndata['posts'] = $formattedPosts;
      $returndata['totalPages'] = $query->max_num_pages;
      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Returns list of available columns for tables including meta fields
   * @since 3.0.0
   */

  public function uip_get_post_table_columns()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $utils = new uip_util();
      $keys = $utils->get_meta_keys_for_post_types('post');

      $returndata['keys'] = $keys;
      wp_send_json($returndata);
    }
    die();
  }
  /**
   * Returns list of available post types
   * @since 3.0.0
   */

  public function uip_get_post_types()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $multi = false;
      $returndata = [];

      $args = [];

      $output = 'objects';
      $operator = 'and';

      $post_types = get_post_types($args, $output, $operator);

      $formatted = [];

      foreach ($post_types as $type) {
        $temp = [];
        $temp['name'] = $type->name;
        $temp['label'] = $type->labels->singular_name;

        $formatted[] = $temp;
      }

      $returndata['postTypes'] = $formatted;

      wp_send_json($returndata);
    }
    die();
  }
  /**
   * Returns list of roles and users
   * @since 3.0.0
   */

  public function uip_get_user_roles()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $term = sanitize_text_field($_POST['searchString']);
      $multi = false;
      $returndata = [];

      if (!$term || $term == '') {
        $returndata['error'] = _e('Something went wrong', 'uipress-lite');
        wp_send_json($returndata);
      }

      $term = strtolower($term);

      $args = [
        'search' => '*' . esc_attr($term) . '*',
        'fields' => ['display_name'],
        'search_columns' => ['user_login', 'user_nicename', 'user_email', 'user_url'],
        'fields' => 'all',
      ];

      if (is_main_site() && is_multisite()) {
        $args['blog_id'] = 0;
      }

      $users = new WP_User_Query($args);

      $users_found = $users->get_results();
      $empty_array = [];

      foreach ($users_found as $user) {
        $temp = [];
        $temp['name'] = $user->display_name;
        $temp['label'] = $user->display_name;
        $temp['type'] = 'User';
        $temp['typeLocal'] = __('User', 'uipress-lite');
        $temp['icon'] = 'person';
        $temp['id'] = $user->ID;

        array_push($empty_array, $temp);
      }

      global $wp_roles;

      $editable_roles = get_editable_roles();

      foreach ($editable_roles as $role => $details) {
        $rolename = $role;

        if (strpos(strtolower($rolename), $term) !== false) {
          $temp = [];
          $temp['label'] = $rolename;
          $temp['name'] = $rolename;
          $temp['type'] = 'Role';
          $temp['typeLocal'] = __('Role', 'uipress-lite');
          $temp['icon'] = 'badge';

          array_push($empty_array, $temp);
        }
      }

      if (strpos(strtolower('Super Admin'), $term) !== false) {
        $temp = [];
        $temp['name'] = 'Super Admin';
        $temp['label'] = 'Super Admin';
        $temp['type'] = 'Role';
        $temp['typeLocal'] = __('Role', 'uipress-lite');
        $temp['icon'] = 'badge';

        array_push($empty_array, $temp);
      }

      $returndata['roles'] = $empty_array;
      $returndata['notfound'] = __('Nothing found for term:', 'uipress-lite');

      wp_send_json($returndata);
    }
    die();
  }

  /**
   * Returns list of roles and users
   * @since 3.0.97
   */

  public function uip_search_user_roles()
  {
    if (defined('DOING_AJAX') && DOING_AJAX && check_ajax_referer('uip-security-nonce', 'security') > 0) {
      $term = sanitize_text_field($_POST['searchString']);
      $type = sanitize_text_field($_POST['type']);
      $multi = false;
      $returndata = [];

      if (!$term || $term == '') {
        $returndata['error'] = _e('Something went wrong', 'uipress-lite');
        wp_send_json($returndata);
      }

      $term = strtolower($term);

      ///ONLY RETURN USERS
      if ($type == 'users') {
        $args = [
          'search' => '*' . esc_attr($term) . '*',
          'fields' => ['display_name'],
          'search_columns' => ['user_login', 'user_nicename', 'user_email', 'user_url'],
          'fields' => 'all',
        ];

        if (is_main_site() && is_multisite()) {
          $args['blog_id'] = 0;
        }

        $users = new WP_User_Query($args);

        $users_found = $users->get_results();
        $empty_array = [];

        foreach ($users_found as $user) {
          $temp = [];
          $temp['name'] = $user->display_name;
          $temp['label'] = $user->display_name;
          $temp['type'] = __('User', 'uipress-lite');
          $temp['icon'] = 'person';
          $temp['id'] = $user->ID;
          $temp['email'] = $user->user_email;
          $temp['login'] = $user->user_login;

          array_push($empty_array, $temp);
        }
      } else {
        //Only return roles
        global $wp_roles;
        $empty_array = [];
        $editable_roles = get_editable_roles();

        foreach ($editable_roles as $role => $details) {
          $rolename = $role;

          if (strpos(strtolower($rolename), $term) !== false) {
            $temp = [];
            $temp['label'] = $rolename;
            $temp['name'] = $rolename;
            $temp['type'] = __('Role', 'uipress-lite');
            $temp['icon'] = 'badge';

            array_push($empty_array, $temp);
          }
        }
      }

      $returndata['roles'] = $empty_array;
      $returndata['notfound'] = __('Nothing found for term:', 'uipress-lite');

      wp_send_json($returndata);
    }
    die();
  }
}
