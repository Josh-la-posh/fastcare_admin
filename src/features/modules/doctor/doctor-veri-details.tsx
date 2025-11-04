import {X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import Confirm from './confirm';
import Reject from './reject';
import {Doctor} from '@/types';

type Props = {
  data?: Doctor;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;

};

export default function DoctorVerificationDetails({data, open, setOpen}: Props) {
 
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openReject, setOpenReject] = useState(false);

  const handleReject = () => {
    setOpen(false);
    setOpenReject(true);
  };
  
  const handleApprove = () => {
    setOpen(false);
    setOpenConfirm(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
       
        <DialogContent className="max-w-xl">
          <DialogHeader className="flex w-full items-center justify-between">
            <DialogTitle className="flex w-full items-center justify-between border-b">
              <span className="text-gray-800 text-xl font-normal py-3">
                Doctor Verification Detail Panel
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
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-primary  text-xl">{data.name}</h1>

                <div className="flex items-center gap-3">
                  {(() => {
                    const statusRaw = (data.registrationStatus || '').toLowerCase();
                    // Action buttons only if pending or in review
                    if (['pending', 'inreview', 'in_review'].includes(statusRaw)) {
                      return (
                        <>
                          <Button
                            onClick={handleApprove}
                            className="py-2 bg-green-500 w-28 border-none"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={handleReject}
                            className="py-2 w-28 bg-red-100 text-red-500 border border-red-500"
                          >
                            Reject
                          </Button>
                        </>
                      );
                    } else if (statusRaw === 'approved') {
                      return (
                        <Button
                          onClick={handleReject}
                          className="py-2 w-28 bg-red-100 text-red-500 border border-red-500"
                        >
                          Reject
                        </Button>
                      )
                    } else if (statusRaw === 'rejected') {
                      return (
                        <Button
                          onClick={handleApprove}
                          className="py-2 bg-green-500 w-28 border-none"
                        >
                          Approve
                        </Button>
                      )
                    }
                    // Badge display for terminal states
                    let label = data.registrationStatus || 'Pending';
                    const sr = label.toLowerCase();
                    if (sr === 'inreview' || sr === 'in_review') label = 'In Review';
                    let classes = 'py-1 px-3 font-semibold rounded ';
                    if (sr === 'approved') classes += 'bg-green-100 text-green-700';
                    else if (sr === 'rejected') classes += 'bg-red-100 text-red-700';
                    else if (sr === 'pending') classes += 'bg-yellow-100 text-yellow-700';
                    else if (sr === 'inreview' || sr === 'in_review') classes += 'bg-blue-100 text-blue-700';
                    else classes += 'bg-gray-100 text-gray-600';
                    return <span className={classes}>{label}</span>;
                  })()}
                </div>
              </div>
              <div className="mt-6">
                <h1 className="text-primary border-b text-lg">
                  Doctor Information
                </h1>
              </div>
              <div className="space-y-4 mt-4 text-md">
                <div className="flex gap-2 ">
                  <span className=" text-gray-600">Full Name:</span>
                  <span className="text-gray-900">
                    {data.firstName} {data.lastName}
                  </span>
                </div>
                <div className="flex gap-2 ">
                  <span className=" text-gray-600">Speciality:</span>
                  <span className="text-gray-900">{data.specialization}</span>
                </div>
                <div className="flex gap-2 ">
                  <span className=" text-gray-600">License No:</span>
                  <span className="text-gray-900">{data.licenseNumber}</span>
                </div>
                <div className="flex gap-2">
                  <span className=" text-gray-600">Expiry Date:</span>
                  <span className="text-gray-900">
                    {data.licenseExpirationDate || '--'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">No details available.</p>
          )}
        </DialogContent>
      </Dialog>

      <Confirm open={openConfirm} setOpen={setOpenConfirm} data={data} />

      <Reject open={openReject} setOpen={setOpenReject} data={data} />
    </>
  );
}
