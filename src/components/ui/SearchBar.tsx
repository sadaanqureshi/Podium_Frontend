'use client';
import { Search } from "lucide-react";

export default function SearchBar({ placeholder, value, onChange }: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    // Container: bg-card-bg aur border-border-subtle use kar raha hai
    <div className="relative flex items-center w-full sm:max-w-full md:max-w-xl lg:max-w-lg border border-border-subtle rounded-2xl bg-card-bg focus-within:ring-2 focus-within:ring-accent-blue/50 transition-all duration-300 h-[48px] shadow-sm">
      
      {/* Icon: text-text-muted use kar raha hai */}
      <Search size={18} className="text-text-muted ml-4 flex-shrink-0" />
      
      <input
        type="text"
        placeholder={placeholder || "Search Intel..."}
        value={value}
        onChange={onChange}
        // Input: text-text-main aur placeholder color theme ke mutabiq
        className="w-full px-3 py-2 bg-transparent text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none font-medium italic"
      />
    </div>
  );
}