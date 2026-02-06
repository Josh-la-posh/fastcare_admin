import { LeftArrowIcon, RightArrowIcon } from './icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  totalEntriesSize: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
};

export const Pagination = ({
  totalEntriesSize,
  totalPages,
  currentPage,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: Props) => {
  const safePageSize = pageSize > 0 ? pageSize : 10;
  const startItem =
    totalEntriesSize === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const endItem = Math.min(currentPage * safePageSize, totalEntriesSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-6 w-full pt-4">
      <p className="text-sm text-neutral-900">
        {totalEntriesSize > 0
          ? `Showing ${startItem} - ${endItem} of ${totalEntriesSize}`
          : 'No results found'}
      </p>

      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-700">Rows per page</span>

        <Select
          value={pageSize.toString()} // use the prop directly
          onValueChange={val => {
            const size = Number(val);
            onPageSizeChange(size); // set the new page size
            onPageChange(1);         // reset to page 1
          }}
        >
          <SelectTrigger className="w-[80px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map(size => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center justify-center w-8 h-8 rounded-full disabled:opacity-50"
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <LeftArrowIcon className="w-5 h-5 text-gray-900" />
          </button>

          <span className="text-sm font-semibold">
            {currentPage} / {totalPages || 1}
          </span>

          <button
            className="flex items-center justify-center w-8 h-8 rounded-full disabled:opacity-50"
            onClick={() =>
              currentPage < totalPages && onPageChange(currentPage + 1)
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <RightArrowIcon className="w-5 h-5 text-gray-900" />
          </button>
        </div>
      </div>
    </div>
  );
};
