'use client';
import { useState } from 'react';

// FIX: Added default value selectedFilters = {} to prevent "t is undefined" crash
export default function FilterSidebar({ filters, selectedFilters = {}, onFilterChange }) {
  const [openSections, setOpenSections] = useState({
    dateRange: true,
    journals: true,
    years: true,
    authors: true,
    keywords: false, 
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (category, value) => {
    // Safe access now guaranteed by default prop
    const current = selectedFilters[category] || [];
    const isSelected = current.includes(value);
    let updated;

    if (category === 'year' || category === 'dateRange') {
        updated = isSelected ? null : value;
    } else {
        updated = isSelected
        ? current.filter(item => item !== value)
        : [...current, value];
    }
    onFilterChange(category, updated);
  };

  const renderSection = (title, category, items, isSingleSelect = false) => (
    <div className="mb-4 border-b border-gray-200 pb-4">
      <button 
        onClick={() => toggleSection(category)}
        className="flex justify-between items-center w-full text-left font-bold text-gray-700 hover:text-indigo-700 mb-2 transition-colors"
      >
        {title}
        <span className="text-gray-400 text-sm">{openSections[category] ? '▼' : '▶'}</span>
      </button>
      
      {openSections[category] && (
        <div className="max-h-48 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-300">
          {Array.isArray(items) && items.length > 0 ? (
            items.map((item) => {
               const label = item.label || item;
               const value = item.value || item;
               
               // FIX: Safe access to selectedFilters[category]
               const isChecked = isSingleSelect 
                  ? selectedFilters[category] === value
                  : (selectedFilters[category] || []).includes(value);

               return (
                <label key={value} className="flex items-center text-sm text-gray-600 hover:bg-gray-50 p-1 rounded cursor-pointer transition-colors group">
                  <input
                    type={isSingleSelect ? "radio" : "checkbox"}
                    checked={isChecked || false}
                    onChange={() => handleCheckboxChange(category, value)}
                    onClick={(e) => {
                        if(isSingleSelect && isChecked) {
                            e.preventDefault();
                            handleCheckboxChange(category, value);
                        }
                    }}
                    className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className={`truncate group-hover:text-indigo-600 ${isChecked ? 'font-medium text-indigo-700' : ''}`} title={label}>
                      {label}
                  </span>
                </label>
              );
            })
          ) : (
            <p className="text-xs text-gray-400 italic ml-6">No options available</p>
          )}
        </div>
      )}
    </div>
  );

  const dateAddedOptions = [
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
    { label: 'This Year', value: 'thisYear' },
  ];

  const safeFilters = filters || {};

  return (
    <div className="w-full bg-white p-5 rounded-lg shadow-sm border border-gray-200 h-fit sticky top-4">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Refine by</h3>
        <button 
            onClick={() => onFilterChange('reset')}
            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
        >
            Clear All
        </button>
      </div>

      {renderSection('Date Added', 'dateRange', dateAddedOptions, true)}
      {renderSection('Journal / Source', 'journal', safeFilters.journals || [])}
      {renderSection('Publication Year', 'year', safeFilters.years || [], true)}
      {renderSection('Authors', 'authors', safeFilters.authors || [])}
      {renderSection('Keywords', 'keywords', safeFilters.keywords || [])}
    </div>
  );
}