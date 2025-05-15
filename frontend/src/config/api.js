const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const API_URLS = {
  AUTH: {
    LOGIN: `${BACKEND_URL}/auth/login`,
    REGISTER: `${BACKEND_URL}/auth/register`,
    ME: `${BACKEND_URL}/auth/me`,
    VERIFY_EMAIL: `${BACKEND_URL}/auth/verify-email`,
  },
  BOOK: {
    LIST: `${BACKEND_URL}/book`,
    DETAIL: (id) => `${BACKEND_URL}/book/${id}`,
    UPLOAD_IMAGE: `${BACKEND_URL}/book/upload-image`,
  },
  CART: {
    GET: `${BACKEND_URL}/cart`,
    ADD: `${BACKEND_URL}/cart/add`,
    UPDATE: `${BACKEND_URL}/cart/update`,
    REMOVE: `${BACKEND_URL}/cart/remove`,
  },
  ORDER: {
    CREATE: `${BACKEND_URL}/order/create`,
    LIST: `${BACKEND_URL}/order/list`,
    DETAIL: (id) => `${BACKEND_URL}/order/${id}`,
  }
};