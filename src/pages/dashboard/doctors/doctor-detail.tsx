import {DashboardLayout} from '@/layout/dashboard-layout';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {useEffect, useState} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import DoctorInformation from '@/features/modules/doctor/doctor-details/doctor-information';
import Consultation from '@/features/modules/doctor/doctor-details/consultation';
import Finance from '@/features/modules/doctor/doctor-details/finance';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '@/services/store';
import {fetchDoctorById, fetchDoctorDashboardById} from '@/services/thunks';
import {Loader} from '@/components/ui/loading';
import DelectDoctor from '@/features/modules/doctor/delete';
import ToggleDoctorStatus from '@/features/modules/doctor/toggle-status';
import { normalizeImageSrc } from '@/utils/imgFormatter';

const DoctorDetails = () => {
  const [open, setOpen] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'information';
  const [activeTab, setActiveTab] = useState(initialTab);
  const {id} = useParams<{id: string}>();

  const dispatch = useDispatch<AppDispatch>();
  const {selectedDoctor, loading, error, dashboard} = useSelector(
    (state: RootState) => state.doctors,
  );

  // Fetch doctor info
  useEffect(() => {
    if (id) {
      dispatch(fetchDoctorById(id));
    }
  }, [id, dispatch]);

  // Fetch doctor dashboard when doctor is loaded
  useEffect(() => {
    if (selectedDoctor?.userId) {
      dispatch(fetchDoctorDashboardById(selectedDoctor.userId));
    }
  }, [selectedDoctor?.userId, dispatch]);

  const tabs = [
    {key: 'information', label: 'Doctor Information'},
    {key: 'consultation', label: 'Consultation'},
    {key: 'finance', label: 'Finance'},
  ];

  useEffect(() => {
    setSearchParams({tab: activeTab});
  }, [activeTab, setSearchParams]);

  const navigate = useNavigate()
  
  const photoSrc = selectedDoctor?.photo !== null ? normalizeImageSrc(selectedDoctor?.photo) : normalizeImageSrc(selectedDoctor?.profileImage);

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loader />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-red-600">
          {error}
        </div>
      ) : (
        <div className="bg-gray-100 overflow-scroll flex flex-col h-full">
          <Button
          className='w-16'
            onClick={() => navigate('/doctors/all-doctors')} // go back in history
          
          >
            ← Back
          </Button>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-6 mx-4 lg:mx-10 mt-16">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 rounded-lg">
                <AvatarImage
                  src={photoSrc || '/images/user.png'}
                  alt="Doctor"
                />
                <AvatarFallback className="uppercase bg-primary text-white font-bold">
                  {selectedDoctor?.firstName?.slice(0, 3) || 'HSP'}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-lg font-medium text-gray-700">
                  {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                </h1>
                <div className="flex items-center gap-6">
                  <p className="text-gray-600 text-md">
                    {selectedDoctor?.specialization}
                  </p>
                  <span className={`${selectedDoctor?.status.toLowerCase() === 'available' ? 'bg-green-100  text-green-500' : selectedDoctor?.status.toLowerCase() === 'offline' ? 'bg-red-100  text-red-500' : selectedDoctor?.status.toLowerCase() === 'inconsultation' ? 'bg-blue-100 text-blue-500' : 'bg-yellow-100 text-yellow-red-500'} p-1 text-sm`}>
                    {selectedDoctor?.status.toLowerCase() === 'available' ? 'Online' 
                      : selectedDoctor?.status.toLowerCase() === 'offline' ? 'Offline'
                      : selectedDoctor?.status.toLowerCase() === 'inconsultation' ? 'In Consultation'
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowToggle(true)}
              variant={selectedDoctor?.isActive ? 'destructive' : 'default'}
              className="py-3 rounded-md"
            >
              {selectedDoctor?.isActive ? 'Deactivate Doctor' : 'Activate Doctor'}
            </Button>
          </div>

          {/* Tabs */}
          <div className="bg-white mt-10 py-4 mx-4 lg:mx-10 rounded-md mb-24">
            <div className="flex gap-8 lg:gap-28 border-b border-gray-200 overflow-x-scroll">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 whitespace-nowrap -mb-px text-md transition-all border-b-4
                    ${
                      activeTab === tab.key
                        ? 'border-primary text-gray-700 font-medium'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'information' && (
                <DoctorInformation data={selectedDoctor} />
              )}
              {activeTab === 'consultation' && (
                <>
                  {(dashboard?.doctorRecentCalls || [])?.length > 0 ? (
                    <Consultation
                      consulation={selectedDoctor}
                      dashboard={dashboard}
                      loading={loading}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <p className="text-lg font-medium">
                        No consultations found
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'finance' && (
                <Finance
                  finance={selectedDoctor}
                  dashboard={dashboard}
                  loading={loading}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <DelectDoctor open={open} setOpen={setOpen} data={selectedDoctor} />
      
      {selectedDoctor && (
        <ToggleDoctorStatus
          open={showToggle}
          setOpen={setShowToggle}
          doctorId={selectedDoctor.id}
          doctorUserId={id!}
          isActive={selectedDoctor.isActive}
          doctorName={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
        />
      )}
    </DashboardLayout>
  );
};

export default DoctorDetails;
