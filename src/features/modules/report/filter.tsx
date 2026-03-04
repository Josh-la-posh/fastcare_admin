import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useState} from 'react';

interface EmergencyFilterProps {
  onApply: (filters: {
    fromDate?: string | null;
    toDate?: string | null;
    status?: string | null;
    hospitalId?: string | null;
    doctorId?: string | null;
    minDuration?: string | null;
  }) => void;
  onReset: () => void;
}

export const EmergencyFilter = ({onApply, onReset}: EmergencyFilterProps) => {
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [minDuration, setMinDuration] = useState<string | null>(null);

  const handleApply = () => {
    onApply({fromDate, toDate, status, hospitalId, doctorId, minDuration});
  };

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setStatus(null);
    setHospitalId(null);
    setDoctorId(null);
    setMinDuration(null);
    onReset();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 py-3">
        <Label className="text-lg">Filter By</Label>
        <span
          onClick={handleReset}
          className="text-primary cursor-pointer hover:underline"
        >
          Reset filter
        </span>
      </div>

      {/* Grid Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date range */}
        <div className="sm:col-span-2">
          <Label>Date</Label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="flex-1 border border-gray-300 rounded-md py-2 px-1 lg:px-3 outline-none"
              value={fromDate ?? ''}
              onChange={e => setFromDate(e.target.value || null)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-md font-semibold">To</p>
            <input
              type="date"
              className="flex-1 border border-gray-300 rounded-md py-2 px-1 lg:px-3 outline-none"
              value={toDate ?? ''}
              onChange={e => setToDate(e.target.value || null)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Hospital ID</Label>
          <input
            type="number"
            className="border border-gray-300 rounded-md py-2 px-1 lg:px-3 outline-none"
            value={hospitalId ?? ''}
            onChange={e => setHospitalId(e.target.value || null)}
            placeholder="e.g. 123"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Doctor ID</Label>
          <input
            type="text"
            className="border border-gray-300 rounded-md py-2 px-1 lg:px-3 outline-none"
            value={doctorId ?? ''}
            onChange={e => setDoctorId(e.target.value || null)}
            placeholder="Doctor ID"
          />
        </div>

        {/* Status (Completed | Missed) */}
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select value={status ?? undefined} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Missed">Missed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Min Duration (mins)</Label>
          <input
            type="number"
            className="border border-gray-300 rounded-md py-2 px-1 lg:px-3 outline-none"
            value={minDuration ?? ''}
            onChange={e => setMinDuration(e.target.value || null)}
            placeholder="e.g. 10"
          />
        </div>

        <div className="mt-3">
          <Button className="py-2.5 rounded-md w-44" onClick={handleApply}>
            Apply Filter
          </Button>
        </div>
      </div>
    </div>
  );
};
