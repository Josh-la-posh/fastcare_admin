import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../slice/authSlice'
import enrolleesReducer from "../slice/enrolleesSlice";
import hospitalsReducer from "../slice/hospitalSlice"
import doctorsReducer from "../slice/doctorsSlice"
import faqsReducer from '../slice/faqsSlice'
import accountReducer from '../slice/accountSlice'
import ambulanceReducer from '../slice/ambulanceSlice'
import articlesReducer from '../slice/articleSlice'
import transactionsReducer from '../slice/transactionSlice'
import refundsReducer from '../slice/refundSlice'
import referralsReducer from '../slice/referralSlice'
import adminUsersReducer from '../slice/adminUsersSlice'
import userReportsReducer from '../slice/userReportsSlice'
import appointmentReportsReducer from '../slice/appointmentReportsSlice'
import emergencyReportsReducer from '../slice/emergencyReportsSlice'
import appFeedbackReducer from '../slice/appFeedbackSlice'
import marketingCampaignsReducer from '../slice/marketingCampaignSlice'
import adCampaignsReducer from '../slice/adCampaignSlice'
import promoCodesReducer from '../slice/promoCodeSlice'
// Ambulance-related reducers
import allAmbulancesReducer from '../slice/allAmbulancesSlice'
import ambulanceProvidersReducer from '../slice/ambulanceProviderSlice'
import driversReducer from '../slice/driverSlice'
import respondentsReducer from '../slice/respondentsSlice'
import ambulanceRequestsReducer from '../slice/ambulanceRequestSlice'
import amenitiesReducer from '../slice/amenitiesSlice'


export const store = configureStore({
  reducer: {
    auth: authReducer,
    enrollees: enrolleesReducer,
    hospitals: hospitalsReducer,
    doctors: doctorsReducer,
    faqs: faqsReducer,
    account: accountReducer,
    ambulance: ambulanceReducer,
    articles: articlesReducer,
    transactions: transactionsReducer,
    refunds: refundsReducer,
    referrals: referralsReducer,
    adminUsers: adminUsersReducer,
    userReports: userReportsReducer,
    appointmentReports: appointmentReportsReducer,
    emergencyReports: emergencyReportsReducer,
    appFeedback: appFeedbackReducer,
    marketingCampaigns: marketingCampaignsReducer,
    adCampaigns: adCampaignsReducer,
    promoCodes: promoCodesReducer,
    // Ambulance-related stores
    allAmbulances: allAmbulancesReducer,
    ambulanceProviders: ambulanceProvidersReducer,
    drivers: driversReducer,
    respondents: respondentsReducer,
    ambulanceRequests: ambulanceRequestsReducer,
    amenities: amenitiesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
