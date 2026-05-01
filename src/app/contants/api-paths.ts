const api_path_tree = {
  protected: {
    my_saved: "/api/protected/my-saved",
    amazon: {
      search: {
        pa_api: "/api/protected/amazon/search/pa-api",
        get_html: {
          v1: "/api/protected/amazon/search/get_html/browser-rendering-cloudflare",
          v2: "/api/protected/amazon/search/get_html/default-server-request-cloudflare",
        },
      },
    },
    ebay: {
      deals: {
        get_default_deals: "/api/protected/ebay/deals/get-default-deals",
        get_html_deals: "/api/protected/ebay/deals/get-html-deals",
      },
      events: {
        get_event_items_by_id:
          "/api/protected/ebay/events/get-event-items-by-id",
        get_deals_and_events: "/api/protected/ebay/events/get-deals-and-events",
      },
      search: {
        default_search: "/api/protected/ebay/search/default-search",
        search_by_image: "/api/protected/ebay/search/search-by-image",
        get_item_by_id: "/api/protected/ebay/search/get-item-by-id",
        get_items_by_item_group:
          "/api/protected/ebay/search/get-items-by-item-group",
        get_item_by_legacy_id:
          "/api/protected/ebay/search/get-item-by-legacy-id",
      },
    },
    ali_express: {
      search: {
        default_search: "/api/protected/ali-express/search/default-search",
      },
    },
  },
  auth: {
    user_me: "/api/auth/user-me",
  },
};

/**
 * @description These are convenience aliases for `api_path_tree`
 * - The tree is the source of truth - update paths there first
 * - We did this to make it easier to update the paths without going to each file
 * - In a way it's an abstraction of the `true` api path for conveience
 */
export const api_paths: Record<string, string> = {
  // accounts
  my_saved: api_path_tree.protected.my_saved,
  get_user: api_path_tree.auth.user_me,

  // amazon
  get_amazon_html: api_path_tree.protected.amazon.search.get_html.v2,
  amazon_search_pa_api: api_path_tree.protected.amazon.search.pa_api,

  // ebay deals and events
  ebay_default_deals: api_path_tree.protected.ebay.deals.get_default_deals,
  ebay_get_event_items_by_id:
    api_path_tree.protected.ebay.events.get_event_items_by_id,
  ebay_get_deals_and_events:
    api_path_tree.protected.ebay.events.get_deals_and_events,
  ebay_get_html_deals: api_path_tree.protected.ebay.deals.get_html_deals,

  // ebay_search
  ebay_default_search: api_path_tree.protected.ebay.search.default_search,
  ebay_search_by_image: api_path_tree.protected.ebay.search.search_by_image,
  ebay_get_item_by_id: api_path_tree.protected.ebay.search.get_item_by_id,
  ebay_get_items_by_item_group:
    api_path_tree.protected.ebay.search.get_items_by_item_group,
  ebay_get_item_by_legacy_id:
    api_path_tree.protected.ebay.search.get_item_by_legacy_id,

  // ali express
  ali_express_default_search:
    api_path_tree.protected.ali_express.search.default_search,
} as const;
