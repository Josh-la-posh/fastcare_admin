import {X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {AmbulanceProvider} from '@/types';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ActivateProvider from './activate';
import DeactivateProvider from './deactivate';

type Props = {
  data?: AmbulanceProvider;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ProvidersDetails({data, open, setOpen}: Props) {

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
        <DialogContent className="max-w-xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="flex w-full items-center justify-between">
            <DialogTitle className="flex w-full items-center justify-between border-b">
              <span className="text-gray-800 text-2xl font-semibold py-3">
                Providers Details
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <h1 className="text-primary  text-lg">
                    Registration Number:{' '}
                    <span className="text-gray-600 ">
                      {' '}
                      {data?.registrationNumber}
                    </span>{' '}
                  </h1>
                </div>

                <div className='flex items-center gap-3'>
                  <Button
                   onClick={handleApprove}
                    className="py-2 bg-green-500 w-28 border-none"
                  >
                    Activate
                  </Button>
                  <Button
                    onClick={handleReject}
                    className="py-2 w-28 bg-red-100 text-red-500 border border-red-500"
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
              <div className="mt-6">
                <h1 className="text-primary border-b text-lg py-2">
                  Provider information
                </h1>
              </div>
              <div className="mt-4  gap-6 w-full text-lg">
                <div className="space-y-3 ">
                  <div className="grid grid-cols-2  ">
                    <span className=" text-gray-600">Admin name: </span>
                    <span className="text-gray-900">{data?.adminName}</span>
                  </div>

                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Email: </span>
                    <span className="text-gray-900">{data?.email}</span>
                  </div>
                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Address: </span>
                    <span className="text-gray-900">{data?.address}</span>
                  </div>

                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Phone Number: </span>
                    <span className="text-gray-900">{data?.phoneNumber}</span>
                  </div>

                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Service Charge: </span>
                    <span className="text-gray-900">{data?.serviceCharge}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mt-4">No details available.</p>
          )}
        </DialogContent>
      </Dialog>

      <ActivateProvider open={openConfirm} setOpen={setOpenConfirm} data={data} />
      <DeactivateProvider open={openReject} setOpen={setOpenReject} data={data} />
    </>
  );
}
