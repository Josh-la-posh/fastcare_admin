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
    patientName?: string | null;
    scheduledDoctor?: string | null;
  }) => void;
  onReset: () => void;
}

export const EmergencyFilter = ({onApply, onReset}: EmergencyFilterProps) => {
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [scheduledDoctor, setScheduledDoctor] = useState<string | null>(null);

  const handleApply = () => {
    onApply({fromDate, toDate, status, patientName, scheduledDoctor});
  };

  const handleReset = () => {
    setFromDate(null);
    setToDate(null);
    setStatus(null);
    setPatientName(null);
    setScheduledDoctor(null);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <Label>Patient Name</Label>
          <input
            type="text"
            className="border border-gray-300 rounded-md py-2 px-1 lg:px-3 outline-none"
            value={patientName ?? ''}
            onChange={e => setPatientName(e.target.value || null)}
            placeholder="Patient name"
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
          <Label>Scheduled Doctor</Label>
          <input
            type="text"
            className="border border-gray-300 rounded-md py-2 px-1 lg:px-3 outline-none"
            value={scheduledDoctor ?? ''}
            onChange={e => setScheduledDoctor(e.target.value || null)}
            placeholder="Doctor name"
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
