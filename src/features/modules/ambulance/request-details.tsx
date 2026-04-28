import {EyeIcon, X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {useEffect, useMemo, useState} from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Label} from '@/components/ui/label';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '@/services/store';
import {fetchDrivers, fetchRespondents} from '@/services/thunks';

type Props = {
  data?: any;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return 'N/A';
  return dateString.replace(';', ',');
};

export default function RequestDetails({data}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const {drivers} = useSelector((state: RootState) => state.drivers);
  const {respondents} = useSelector((state: RootState) => state.respondents);

  const [open, setOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedResponderId, setSelectedResponderId] = useState('');
  const [isLoadingAssignees, setIsLoadingAssignees] = useState(false);
  const [hasLoadedAssignees, setHasLoadedAssignees] = useState(false);

  const emergencyType = data?.emergencyType || 'N/A';
  const pickupAddress =
    data?.pickupAddress ||
    (data?.pickupLocation
      ? `${data.pickupLocation.latitude}, ${data.pickupLocation.longitude}`
      : 'N/A');
  const destinationAddress =
    data?.destinationAddress ||
    (data?.destinationLocation
      ? `${data.destinationLocation.latitude}, ${data.destinationLocation.longitude}`
      : 'N/A');
  const requestTime = formatDate(data?.creationDate || data?.requestDate || null);

  useEffect(() => {
    const loadAssignees = async () => {
      if (!open || hasLoadedAssignees) return;
      setIsLoadingAssignees(true);
      try {
        await Promise.all([
          dispatch(fetchDrivers()).unwrap(),
          dispatch(fetchRespondents()).unwrap(),
        ]);
        setHasLoadedAssignees(true);
      } finally {
        setIsLoadingAssignees(false);
      }
    };

    void loadAssignees();
  }, [dispatch, hasLoadedAssignees, open]);

  const driverOptions = useMemo(
    () =>
      drivers.map(driver => ({
        id: driver.id,
        label: `${driver.name}${driver.licenseNumber ? ` (${driver.licenseNumber})` : ''}`,
      })),
    [drivers],
  );

  const responderOptions = useMemo(
    () =>
      respondents.map(responder => ({
        id: responder.id,
        label: `${responder.name}${responder.professionalLicense ? ` (${responder.professionalLicense})` : ''}`,
      })),
    [respondents],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 text-[#135E9B] hover:underline"
          >
            <EyeIcon className="w-4 h-4 cursor-pointer" />
            <span>View</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex w-full items-center justify-between">
            <DialogTitle className="flex w-full items-center justify-between border-b">
              <span className="text-gray-800 text-2xl font-semibold py-3">
                Ambulance Request
              </span>

              <button
                onClick={() => setOpen(false)}
                type="button"
                className="p-1 border border-gray-300 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
            </DialogTitle>
          </DialogHeader>

          {/* Doctor Details Section */}
          {data ? (
            <div className="">
              <div className="flex items-center justify-end">

                <div className="flex items-center gap-3">
                  <Button type="button" className="py-2.5 w-36 rounded-md">
                    Accept & Dispatch
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <h1 className="text-primary border-b text-lg py-2">
                  Request Details
                </h1>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-6 w-full text-lg">
                <div className="space-y-3 ">
                  <div className="grid grid-cols-2  ">
                    <span className=" text-gray-600">Client Name: </span>
                    <span className="text-gray-900">{data?.clientName || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Request Type: </span>
                    <span className="text-gray-900">{emergencyType}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2  ">
                    <span className=" text-gray-600">Ambulance Number: </span>
                    <span className="text-gray-900">{data?.ambulanceNumber || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Pickup Location: </span>
                    <span className="text-gray-900">{pickupAddress}</span>
                  </div>
                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Destination: </span>
                    <span className="text-gray-900">{destinationAddress}</span>
                  </div>
                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Timestamp: </span>
                    <span className="text-gray-900">{requestTime}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h1 className="text-primary border-b text-lg py-2">
                  Assign Driver & Responder
                </h1>

                <div className="mt-6 flex items-center gap-4 ">
                  <div className="flex flex-col gap-2 w-full">
                    <Label>Driver</Label>
                    <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingAssignees
                              ? 'Loading drivers...'
                              : 'Select available driver...'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {driverOptions.length ? (
                          driverOptions.map(driver => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-driver" disabled>
                            No drivers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <Label>Responder</Label>
                    <Select value={selectedResponderId} onValueChange={setSelectedResponderId}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingAssignees
                              ? 'Loading responders...'
                              : 'Select available responder...'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {responderOptions.length ? (
                          responderOptions.map(responder => (
                            <SelectItem key={responder.id} value={responder.id}>
                              {responder.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-responder" disabled>
                            No responders available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">No details available.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
