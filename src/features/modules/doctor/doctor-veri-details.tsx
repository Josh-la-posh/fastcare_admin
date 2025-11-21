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
import {normalizeImageSrc} from '@/utils/imgFormatter';

type Props = {
  data?: Doctor;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;

};

export default function DoctorVerificationDetails({data, open, setOpen}: Props) {
 
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [openLicense, setOpenLicense] = useState(false);
  const [openPhoto, setOpenPhoto] = useState(false);

  const licenseDataUri = data?.licenseContent
    ? `data:${data.licenseType || 'image/jpeg'};base64,${data.licenseContent}`
    : undefined;

  const imgSrc = normalizeImageSrc(data?.photo);

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
       
        <DialogContent className="max-w-xl h-fit overflow-y-auto">
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
              <div className="flex justify-between">
                <div className="flex items-center gap-4">
                  {data.photo ? (
                    <button
                      type="button"
                      onClick={() => setOpenPhoto(true)}
                      className="group relative focus:outline-none"
                      aria-label="View profile photo full size"
                      title="Click to enlarge"
                    >
                      <img
                        src={imgSrc || ''}
                        alt={data.name || 'Doctor profile photo'}
                        className="w-16 h-16 rounded-full object-cover border group-hover:ring-2 group-hover:ring-primary/50 transition"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 flex items-center justify-center text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition">
                        View
                      </span>
                    </button>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                      No Photo
                    </div>
                  )}
                  <h1 className="text-primary  text-xl font-semibold">{data.name}</h1>
                </div>

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
                {/* License document preview */}
                {licenseDataUri ? (
                  <div className="mt-6 space-y-3">
                    <h2 className="text-primary border-b text-lg mb-2">License Document</h2>
                    <div className="relative group">
                      <img
                        src={licenseDataUri}
                        alt="Doctor License"
                        className="w-full max-h-64 object-contain rounded border shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpenLicense(true)}
                        className="text-sm"
                      >
                        View Full Size
                      </Button>
                      <a
                        href={licenseDataUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border text-sm rounded-md hover:bg-gray-50"
                      >
                        Open in New Tab
                      </a>
                      {/* <a
                        href={licenseDataUri}
                        download={`license-${data.id}`}
                        className="inline-flex items-center px-3 py-2 border text-sm rounded-md hover:bg-gray-50"
                      >
                        Download
                      </a> */}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    <h2 className="text-primary border-b text-lg mb-2">License Document</h2>
                    <p className="text-gray-500 text-sm">No license document uploaded.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">No details available.</p>
          )}
        </DialogContent>
      </Dialog>

      <Confirm open={openConfirm} setOpen={setOpenConfirm} data={data} />

      <Reject open={openReject} setOpen={setOpenReject} data={data} />

      {/* Full size license preview modal */}
      <Dialog open={openLicense} onOpenChange={setOpenLicense}>
        <DialogContent className="max-w-4xl">
          <DialogHeader className="flex w-full items-center justify-between">
            <DialogTitle className="flex w-full items-center justify-between border-b">
              <span className="text-gray-800 text-xl font-normal py-3">License Document Preview</span>
              <button
                onClick={() => setOpenLicense(false)}
                type="button"
                className="p-1 border border-gray-300 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
            </DialogTitle>
          </DialogHeader>
          {licenseDataUri ? (
            <div className="w-full">
              <img
                src={licenseDataUri}
                alt="Doctor License Full"
                className="w-full max-h-[70vh] object-contain rounded border"
              />
            </div>
          ) : (
            <p className="text-gray-500">No license document available.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Full size profile photo preview modal */}
      <Dialog open={openPhoto} onOpenChange={setOpenPhoto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="flex w-full items-center justify-between">
            <DialogTitle className="flex w-full items-center justify-between border-b">
              <span className="text-gray-800 text-xl font-normal py-3">Profile Photo</span>
              <button
                onClick={() => setOpenPhoto(false)}
                type="button"
                className="p-1 border border-gray-300 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
            </DialogTitle>
          </DialogHeader>
          {data?.photo ? (
            <div className="space-y-4">
              <img
                src={data.photo}
                alt={data.name || 'Doctor profile photo full size'}
                className="w-full max-h-[70vh] object-contain rounded border"
              />
              <div className="flex gap-3">
                <a
                  href={data.photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border text-sm rounded-md hover:bg-gray-50"
                >
                  Open in New Tab
                </a>
                <a
                  href={data.photo}
                  download={`doctor-photo-${data.id || 'profile'}`}
                  className="inline-flex items-center px-3 py-2 border text-sm rounded-md hover:bg-gray-50"
                >
                  Download
                </a>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No profile photo available.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
