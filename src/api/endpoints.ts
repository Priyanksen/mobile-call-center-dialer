export const endpoints = {
  auth: {
    login: '/auth/login/',
    refresh: '/auth/refresh/',
    logout: '/auth/logout/',
  },
  agent: {
    me: '/agents/me/',
    status: '/agents/me/status/',
    stats: '/agents/me/stats/',
  },
  leads: {
    list: '/leads/',
    next: '/leads/next/',
    detail: (id: number | string) => `/leads/${id}/`,
  },
  calls: {
    list: '/calls/',
    initiate: '/calls/initiate/',
    hangup: '/calls/hangup/',
    disposition: '/calls/disposition/',
    detail: (id: string) => `/calls/${id}/`,
    status: (id: string) => `/calls/${id}/status/`,
  },
  callbacks: {
    list: '/callbacks/',
    detail: (id: number | string) => `/callbacks/${id}/`,
  },
  campaigns: {
    list: '/campaigns/',
    detail: (id: number | string) => `/campaigns/${id}/`,
  },
  notifications: {
    list: '/notifications/',
    read: (id: number | string) => `/notifications/${id}/read/`,
  },
  reports: {
    full: '/reports/',
  },
};
