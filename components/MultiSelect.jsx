'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function MultiSelect({ options, selected, onChange, placeholder, colorClass }) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()) && !selected.includes(o));

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map(item => (
          <span key={item} className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${colorClass}`}>
            {item}
            <button 
              type="button" 
              onClick={() => onChange(selected.filter(i => i !== item))} 
              className="hover:opacity-75 font-bold px-1"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none text-black"
        />
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(item => (
            <div
              key={item}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm text-black"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange([...selected, item]);
                setSearch('');
                setIsOpen(false);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
