import {FileIcon, X} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {useState} from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/services/store';
import { updateRefundStatus, fetchRefunds } from '@/services/thunks';
import toast from 'react-hot-toast';
import Success from '../dashboard/success';
import { Refund } from '@/types';

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: Refund | null;
};

export default function CheckerDetails({open, setOpen, data}: Props) {
  const [openSuccess, setOpenSuccess] = useState(false);
  const [loadingAction, setLoadingAction] = useState<null | 'approve' | 'reject'>(null);
  const dispatch = useDispatch<AppDispatch>();
  // ✅ function to get status color
  const getStatusColor = (status?: string) => {
    if (!status) return 'text-gray-500';

    const s = status.toLowerCase();
    if (s === 'successful' || s === 'approved')
      return 'text-green-600 bg-green-100';
    if (s === 'pending') return 'text-yellow-600 bg-yellow-100';
    if (s === 'failed' || s === 'disputed') return 'text-red-600 bg-red-100';

    return 'text-gray-500';
  };

  const RefundStatusEnum = {
    Pending: 1 as const,
    Approved: 2 as const,
    Rejected: 3 as const,
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!data?.id) return;
    setLoadingAction(action);
    const status = action === 'approve' ? RefundStatusEnum.Approved : RefundStatusEnum.Rejected;
    try {
      await dispatch(updateRefundStatus({ id: Number(data.id), status })).unwrap();
      toast.success(`Refund ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setOpen(false);
      setOpenSuccess(true);
      // refresh pending list (filter outside or refetch all)
      dispatch(fetchRefunds(undefined));
    } catch (err: unknown) {
      // err here is the value passed to rejectWithValue (string) or a thrown error
      const hasMessage = (e: unknown): e is { message: string } =>
        typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message?: unknown }).message === 'string';
      const message = typeof err === 'string'
        ? err
        : hasMessage(err)
          ? err.message
          : 'Failed to update refund';
      toast.error(message);
    } finally {
      setLoadingAction(null);
    }
  };

  console.log('Refund details data:', data);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="flex w-full items-center justify-between">
          <DialogTitle className="flex w-full items-center justify-between border-b">
            <span className="text-gray-800 text-xl font-normal py-3">
              Transaction Details
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

        <div className="overflow-scroll max-h-[450px] py-4">
          {/* Amount in middle */}
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm">Refund Amount</p>
            <p className="text-2xl font-bold text-gray-900">{data?.refundAmount}</p>
          </div>

          {/* Other details */}
          <div className="divide-y">
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Transaction status</span>
              <span
                className={`font-medium py-1 px-2 rounded-md  ${getStatusColor(
                  data?.status,
                )}`}
              >
                {data?.status}
              </span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Transaction Id</span>
              <span className="font-medium">{data?.transactionId}</span>
            </div>

            <div className="flex justify-between py-4">
              <span className="text-gray-600">Patient Name</span>
              <span className="font-medium">{data?.patientName}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Patient Id</span>
              <span className="font-medium">{data?.patientId || 'PT023'}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium">{data?.refundAmount}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Wallet account</span>
              <span className="font-medium">
                {data?.walletNumber + ' 2345677899'}
              </span>
            </div>

            <div className="flex justify-between py-4">
              <span className="text-gray-600">Requested by </span>
              <span className="font-medium">{data?.createdBy}</span>
            </div>

            <div className="flex justify-between py-4">
              <span className="text-gray-600">Date</span>
              <span className="font-medium">{data?.requestDate}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Refund Reference</span>
              <span className="font-medium">{data?.refundReference || '-'}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Refund Reason</span>
              <span className="font-medium max-w-xs text-right truncate" title={data?.refundReason}>{data?.refundReason || '-'}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Request Date</span>
              <span className="font-medium">{data?.requestDate || '-'}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Dispute Date</span>
              <span className="font-medium">{data?.disputeDate || '-'}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Wallet Number</span>
              <span className="font-medium">{data?.walletNumber || '-'}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-gray-600">Document</span>
              <span className="font-medium">
                {data?.document ? (
                  <div className="flex items-center gap-3">
                    {data.document.match(/\.(png|jpg|jpeg|gif|webp)$/i) ? (
                      <a href={data.document} target="_blank" rel="noopener noreferrer" className="group">
                        <img
                          src={data.document}
                          alt="refund-doc"
                          className="w-12 h-12 object-cover rounded border group-hover:opacity-80"
                        />
                      </a>
                    ) : (
                      <a
                        href={data.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <FileIcon className="w-4 h-4" /> View document
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = data.document as string;
                        a.download = 'refund-document';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                      }}
                      className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 border"
                    >
                      View
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">No document</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {data?.status?.toLowerCase() === 'pending' && (
          <div className="flex justify-center items-center mt-4 gap-4">
            <Button
              onClick={() => handleAction('approve')}
              disabled={loadingAction !== null}
              className="py-3 bg-green-600 hover:bg-green-700 w-40 border-none flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loadingAction === 'approve' && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Approve
            </Button>
            <Button
              onClick={() => handleAction('reject')}
              variant="destructive"
              disabled={loadingAction !== null}
              className="py-3 w-40 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loadingAction === 'reject' && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Reject
            </Button>
          </div>
        )}
      </DialogContent>

      <Success
        open={openSuccess}
        setOpen={setOpenSuccess}
        title="Approved"
        text="You've successfully approved this refund"
      />
    </Dialog>
  );
}
