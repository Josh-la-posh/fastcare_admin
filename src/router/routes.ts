

export const ROUTES = {
  signin: '/',
  forgot: '/auth/forgot-password',
  reset: '/auth/create-password',

  // Dashboard
  home: '/home',

  enrolees: {
    all: '/enrolees/all-enrolees',
     register: '/enrolees/registration',
   individual: '/enrolees/registration/individual',
   corporate: '/enrolees/registration/corporate',
    details: '/enrolees/details/:id',
  },

  providers: {
    all: '/providers/all-providers',
    register: '/providers/registration',
    details: '/providers/details/:id',
  },



   hospitals: {
    all: '/hospitals/all-hospitals',
    details: '/hospitals/details/:id',
  },

  doctors: {
    request: '/doctors/request',
    all: '/doctors/all-doctors',
    details: '/doctors/doctor-details/:id',
  },

  transactions: {
    all: '/transactions/all-transactions',
    refunds: '/transactions/refunds',
  },

  checkers: '/checkers',
  marketing: '/marketing-campaign',
  adCampaigns: '/marketing-campaign/ad-campaigns',
  promotionalCodes: '/marketing-campaign/promotional-codes',
  referralCode: '/referral-code',
  referral: {
    codes: '/marketing-campaign/referral-codes',
    // detail by id can reuse modal fetch so path optional
  },


  payments: {
    claims: '/payments/claims',
    claimsDetails: '/payments/claims/claims-details/:id',
    auth: '/payments/authorization',
    authDetails: '/payments/auth/auth-details/:id',
    tracker: '/payments/tracker',
  },

  reports: {
   root: '/reports',
   signup: '/reports/signup',
   appointment: '/reports/appointment',
   emergency: '/reports/emergency',
   userdetails: '/reports/users/user-details/:id',
  },

  ambulance: {
     amenities: '/ambulance/amenities',
     all: '/ambulance/all',
     providers: '/ambulance/providers',
     requests: '/ambulance/requests',
     drivers: '/ambulance/drivers',
     responders: '/ambulance/responders',
     note: '/ambulance/note',
     history: '/ambulance/dispatch-history',
  },

   helpdesk: {
     faq: '/help-desk/faq',
     tutorial: '/help-desk/tutorials',
     articles: '/help-desk/articles',
     details: '/help-desk/articles/:id',
     feedback: '/help-desk/feedback',  
  },


  hmo: '/hmo-management',
  settings: '/settings',
};
