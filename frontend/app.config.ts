
export const AUTH = {
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  LOGOUT_ALL: '/api/auth/logout-all',
  ME: '/api/auth/me',
};

export const PRODUCTS = {
  GET_PRODUCTS: '/api/products',
  GET_PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  CREATE_PRODUCT: '/api/products',
  UPDATE_PRODUCT: (id: string) => `/api/products/${id}`,
  TOGGLE_PRODUCT: (id: string) => `/api/products/${id}/toggle`,
  DELETE_PRODUCT: (id: string) => `/api/products/${id}`,
};

export const PROMOTIONS = {
  GET_PROMOTIONS: '/api/promotions',
  GET_ACTIVE_PROMOTIONS: '/api/promotions/active',
  GET_PROMOTION_BY_ID: (id: string) => `/api/promotions/${id}`,
  CREATE_PROMOTION: '/api/promotions',
  UPDATE_PROMOTION: (id: string) => `/api/promotions/${id}`,
  TOGGLE_PROMOTION: (id: string) => `/api/promotions/${id}/toggle`,
};

export const ORDERS = {
  CREATE_ORDER: '/api/orders',
  GET_MY_ORDERS: '/api/orders/my',
  GET_ORDER_BY_ID: (id: string) => `/api/orders/${id}`,
  GET_ORDERS: '/api/orders',
  GET_ORDER_STATS: '/api/orders/stats',
};

export const ANALYTICS = {
  GET_DASHBOARD_STATS: '/api/analytics/dashboard',
};

