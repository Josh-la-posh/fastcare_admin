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

export default function ResponderDetails({data}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div>
            <EyeIcon className="w-4 h-4 cursor-pointer" />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex w-full items-center justify-between">
            <DialogTitle className="flex w-full items-center justify-between border-b">
              <span className="text-gray-800 text-2xl font-semibold py-3">
                Responder Details
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

                {/* <div className="flex items-center gap-3">
                  <Button variant="ghost" className="py-2.5 w-36 rounded-md">
                    Edit
                  </Button>
                </div> */}
              </div>
              <div className="mt-6">
                <h1 className="text-primary border-b text-lg py-2">
                  Respondent information
                </h1>
              </div>
              <div className="mt-4  gap-6 w-full text-lg">
                <div className="space-y-3 ">
                  <div className="grid grid-cols-2  ">
                    <span className=" text-gray-600">Full Name: </span>
                    <span className="text-gray-900">{data?.name}</span>
                  </div>
                 
                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Certification Status: </span>
                    <span className="bg-green-100 text-green-500 p-2 rounded-lg w-24">
                      {data?.license}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Address: </span>
                    <span className="text-gray-900">{data?.address}</span>
                  </div>
                   <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Professional License: </span>
                    <span className="text-gray-900">{data?.professionalLicense}</span>
                  </div>
                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Phone Number: </span>
                    <span className="text-gray-900">{data?.phoneNumber}</span>
                  </div>
                  <div className="grid grid-cols-2 ">
                    <span className=" text-gray-600">Email: </span>
                    <span className="text-gray-900">{data?.email}</span>
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
