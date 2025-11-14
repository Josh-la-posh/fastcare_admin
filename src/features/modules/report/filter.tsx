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
  onApply: (filters: { startDate?: string | null; endDate?: string | null; status?: string | null; speciality?: string | null }) => void;
  onReset: () => void;
}

export const EmergencyFilter = ({onApply, onReset}: EmergencyFilterProps) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [speciality, setSpeciality] = useState<string | null>(null);

  const handleApply = () => {
    onApply({startDate, endDate, status, speciality});
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setStatus(null);
    setSpeciality(null)
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Date range */}
        <div className="lg:col-span-2">
          <Label>Date</Label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="flex-1 border border-gray-300 rounded-md py-2 px-1 lg:px-3 outline-none"
              value={startDate ?? ''}
              onChange={e => setStartDate(e.target.value || null)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-md font-semibold">To</p>
            <input
              type="date"
              className="flex-1 border border-gray-300 rounded-md py-2 px-1 lg:px-3 outline-none"
              value={endDate ?? ''}
              onChange={e => setEndDate(e.target.value || null)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Status (Completed | Missed) */}
        <div className="flex flex-col gap-2">
          <Label>Status</Label>
          <Select value={status ?? undefined} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
            </SelectContent>
          </Select>
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
