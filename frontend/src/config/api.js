const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://2hbookshopproject.site/api';

export const API_URLS = {
  AUTH: {
    LOGIN: `${BACKEND_URL}/auth/login`,
    REGISTER: `${BACKEND_URL}/auth/register`,
    ME: `${BACKEND_URL}/auth/me`,
    VERIFY_EMAIL: `${BACKEND_URL}/auth/verify-email`,
  },
  BOOK: {
    LIST: `${BACKEND_URL}/book/`,
    DETAIL: (id) => `${BACKEND_URL}/book/${id}`,
  },
  CART: {
    GET: `${BACKEND_URL}/cart/`,
    ADD: `${BACKEND_URL}/cart/items`,
    UPDATE: (id) => `${BACKEND_URL}/cart/items/${id}`,
    REMOVE: (id) => `${BACKEND_URL}/cart/items/${id}`,
    DELETE: `${BACKEND_URL}/cart/`,
  }
};