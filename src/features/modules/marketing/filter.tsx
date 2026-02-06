import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Label} from '@/components/ui/label';
import { Filter } from 'lucide-react';
// removed select components as filters now only use text inputs

import {useState} from 'react';

interface MarketingFilterProps {
  onApply: (filters: { Code?: string; StaffName?: string }) => void;
  onReset: () => void;
}

export const MarketingFilter = ({onApply, onReset}: MarketingFilterProps) => {
  const [code, setCode] = useState<string>('');
  const [staffName, setStaffName] = useState<string>('');

  const handleApply = () => {
    onApply({ Code: code || undefined, StaffName: staffName || undefined });
  };

  const handleReset = () => {
    setCode('');
    setStaffName('');
    onReset();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-fit py-2.5"><Filter /></Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="p-6 w-[400px]">
        <div className="flex items-center justify-between mb-6 border-b py-3">
          <Label>Filter</Label>

          <span onClick={handleReset} className="text-primary cursor-pointer">
            Reset filter
          </span>
        </div>
        {/* 2x2 Grid Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label>Code</Label>
            <input
              type="text"
              placeholder="Enter code"
              className="border border-gray-300 rounded-md py-2 px-3 outline-none"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Staff Name</Label>
            <input
              type="text"
              placeholder="Enter staff name"
              className="border border-gray-300 rounded-md py-2 px-3 outline-none"
              value={staffName}
              onChange={e => setStaffName(e.target.value)}
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
