export const EVENTS = {
    USER_SIGNUP: 'user_signed_up',
    APP_OPENED: 'app_opened',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    SCREEN_VIEW: 'screen_view',
    FEATURE_USED: 'feature_used',
    ERROR_OCCURRED: 'error_occurred',
    BUTTON_CLICK: 'button_click',
    LINK_CLICK: 'link_click',
    SEARCH_SUBMIT: 'search_submit',
    FORM_SUBMIT: 'form_submit',
    TIMED_EVENT_START: 'timed_event_start',
    MEAL_ADDED: 'meal_added',
} as const;

export const COMMON_PROPERTIES = {
    APP_VERSION: 'app_version',
    PLATFORM: 'platform',
    DEVICE_ID: 'device_id',
} as const;