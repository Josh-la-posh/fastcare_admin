import {EyeIcon, X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {useState} from 'react';

type Props = {
  data?: any;
};

export default function RespondersNoteDetails({data}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div>
            <EyeIcon className="w-4 h-4 cursor-pointer" />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="flex w-full items-center justify-between">
            <DialogTitle className="flex w-full items-center justify-between border-b">
              <span className="text-gray-800 text-2xl font-semibold py-3">
                Responder's Note
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
                    Note ID:{' '}
                    <span className="text-gray-600 "> {data?.note_id}</span>{' '}
                  </h1>
                </div>
              </div>
              <div className="mt-6">
                <h1 className="text-primary border-b text-lg py-2">
                  Request Details
                </h1>
              </div>
              <div className="mt-4  gap-6 w-full text-lg">
                <div className="  flex items-center gap-16">
                  <div className="flex flex-col gap-1  ">
                    <span className=" text-gray-600">Patient Name </span>
                    <span className="text-gray-900">{data?.name}</span>
                  </div>

                  <div className="flex flex-col gap-1  ">
                    <span className=" text-gray-600">Ambulance ID </span>
                    <span className="text-gray-900">{data?.amb_id}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h1 className="text-primary text-lg py-2">Note</h1>

                <div className="border p-4 text-md text-gray-600">
                  Patient was found unconsious and laying down by the road, then
                  i picked up my phone to dial the ambulance, i also performed
                  some first aid as said on the app.
                </div>
              </div>

              <div className="mt-6">
                <h1 className="text-primary text-lg py-2">Responder</h1>

                <div className="border p-2 text-md text-gray-600">
                  Samuel Oladimeji
                </div>
              </div>

              <div className="mt-6">
                <h1 className="text-primary text-lg py-2">Date</h1>

                <div className="border p-2 text-md text-gray-600">
                  22/04/2025
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
