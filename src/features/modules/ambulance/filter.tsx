import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Label} from '@/components/ui/label';

import {useState} from 'react';

type RequestFilterValues = {
  requestDate?: string;
};

type Props = {
  onApply: (filters: RequestFilterValues) => void;
  onReset: () => void;
};

export const RequestFilter = ({onApply, onReset}: Props) => {
  const [requestDate, setRequestDate] = useState<string | undefined>();

  const handleApply = () => {
    onApply({
      requestDate,
    });
  };

  const handleReset = () => {
    setRequestDate(undefined);
    onReset();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-36 py-2.5">Filter</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="p-6 w-[400px]">
        <div className="flex items-center justify-between mb-6 border-b py-3">
          <Label>Filter</Label>

          <span onClick={handleReset} className="text-primary cursor-pointer">
            Reset filter
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-2">
            <Label>Booking Date</Label>
            <input
              type="date"
              className="border border-gray-300 rounded-md py-2 px-3"
              value={requestDate || ''}
              onChange={e => setRequestDate(e.target.value || undefined)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-16">
          <Button className="py-2" onClick={handleApply}>
            Apply Filter
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
