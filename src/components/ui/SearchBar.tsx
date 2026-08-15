'use client';
import { Search } from "lucide-react";

export default function SearchBar({ placeholder, value, onChange }: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    // Container: bg-card-bg aur border-border-subtle use kar raha hai
    <div className="relative flex items-center w-full h-11 border border-border-subtle rounded-xl bg-card-bg focus-within:ring-2 focus-within:ring-accent-blue/40 focus-within:border-accent-blue/40 shadow-sm">
      
      <Search size={16} className="text-text-muted ml-3.5 flex-shrink-0" />
      
      <input
        type="text"
        placeholder={placeholder || "Search Intel..."}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-transparent text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none font-medium"
      />
    </div>
  );
}