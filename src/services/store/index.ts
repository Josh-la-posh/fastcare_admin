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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
