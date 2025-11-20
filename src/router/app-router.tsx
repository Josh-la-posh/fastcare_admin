import { Route, Routes, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';

import SignIn from '@/pages/auth/signin';
import ForgetPassword from '@/pages/auth/forget-password';
import CreatePassword from '@/pages/auth/create-password';

import HospitalDetails from '@/pages/dashboard/hospitals/hospital-details';
import AllTransactions from '@/pages/dashboard/transactions/all-transactions';
import Refunds from '@/pages/dashboard/transactions/refunds';
import Checkers from '@/pages/dashboard/checker';
import UsersDetails from '@/features/modules/report/user-details';
import UnifiedReports from '@/pages/dashboard/reports';
import Settings from '@/pages/dashboard/settings';
import VerificationRequest from '@/pages/dashboard/doctors/request';

import DoctorDetails from '@/pages/dashboard/doctors/doctor-detail';
import MarketingCampaign from '@/pages/dashboard/marketing';
import Amenities from '@/pages/dashboard/ambulance/amenities';
import Providers from '@/pages/dashboard/ambulance/provider';
import Request from '@/pages/dashboard/ambulance/request';
import Drivers from '@/pages/dashboard/ambulance/drivers';
import Responders from '@/pages/dashboard/ambulance/responder';
import ResponderNote from '@/pages/dashboard/ambulance/responder-note';
import DispatchHistory from '@/pages/dashboard/ambulance/history';
import FAQ from '@/pages/dashboard/helpdesk/faq';
import Tutorials from '@/pages/dashboard/helpdesk/tutorial';
import Articles from '@/pages/dashboard/helpdesk/articles';
import ArticleDetails from '@/pages/dashboard/helpdesk/article-details';
import Feedbacks from '@/pages/dashboard/helpdesk/feedback';
import ProtectedRoutes from './ProtectedRoutes';

import AllDoctors from '@/pages/dashboard/doctors/all-doctors';
import { AllHospitals } from '@/pages/dashboard/hospitals/all-hospitals';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.signin} element={<SignIn />} />
      <Route path={ROUTES.forgot} element={<ForgetPassword />} />
      <Route path={ROUTES.reset} element={<CreatePassword />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path={ROUTES.hospitals.all} element={<AllHospitals />} />
        <Route path={ROUTES.hospitals.details} element={<HospitalDetails />} />

        <Route path={ROUTES.transactions.all} element={<AllTransactions />} />
        <Route path={ROUTES.transactions.refunds} element={<Refunds />} />

        <Route path={ROUTES.checkers} element={<Checkers />} />

  <Route path={ROUTES.reports.root} element={<UnifiedReports />} />
  <Route path={ROUTES.reports.userdetails} element={<UsersDetails />} />
  {/* Redirect legacy paths to new unified reports with tab query */}
  <Route path="/reports/users" element={<Navigate to="/reports?tab=signup&signupTab=patient" replace />} />
  <Route path="/reports/reporting" element={<Navigate to="/reports?tab=appointment" replace />} />
  <Route path="/reports/emergency-call" element={<Navigate to="/reports?tab=emergency" replace />} />

        <Route path={ROUTES.settings} element={<Settings />} />

        <Route path={ROUTES.doctors.request} element={<VerificationRequest />} />
        <Route path={ROUTES.doctors.all} element={<AllDoctors />} />
        <Route path={ROUTES.doctors.details} element={<DoctorDetails />} />

        <Route path={ROUTES.marketing} element={<MarketingCampaign />} />

        <Route path={ROUTES.ambulance.amenities} element={<Amenities />} />
        <Route path={ROUTES.ambulance.providers} element={<Providers />} />
        <Route path={ROUTES.ambulance.requests} element={<Request />} />
        <Route path={ROUTES.ambulance.drivers} element={<Drivers />} />
        <Route path={ROUTES.ambulance.responders} element={<Responders />} />
        <Route path={ROUTES.ambulance.note} element={<ResponderNote />} />
        <Route path={ROUTES.ambulance.history} element={<DispatchHistory />} />

        <Route path={ROUTES.helpdesk.faq} element={<FAQ />} />
        <Route path={ROUTES.helpdesk.tutorial} element={<Tutorials />} />
        <Route path={ROUTES.helpdesk.articles} element={<Articles />} />
        <Route path={ROUTES.helpdesk.details} element={<ArticleDetails />} />
        <Route path={ROUTES.helpdesk.feedback} element={<Feedbacks />} />
      </Route>
    </Routes>
  );
};
