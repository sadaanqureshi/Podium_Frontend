// components/ui/SearchBar.tsx
import { Search } from "lucide-react";

export default function SearchBar({ placeholder, value, onChange }: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="relative flex items-center w-full sm:max-w-full md:max-w-xl lg:max-w-lg border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-black h-[42px]">
      <Search size={18} className="text-gray-400 ml-3 flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder || "Search..."}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-transparent text-sm focus:outline-none"
      />
    </div>
  );
}
