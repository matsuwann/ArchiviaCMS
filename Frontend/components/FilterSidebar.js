'use client';
import { useState } from 'react';

export default function FilterSidebar({ filters, selectedFilters, onFilterChange }) {
  const [openSections, setOpenSections] = useState({
    dateAdded: true,
    journals: true,
    years: true,
    authors: true,
    keywords: false,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (category, value) => {
    const current = selectedFilters[category] || [];
    const isSelected = current.includes(value);
    let updated;

    // Single Select Logic for these categories
    if (category === 'year' || category === 'dateRange') {
        updated = isSelected ? null : value;
    } else {
        // Multi Select Logic
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
        className="flex justify-between items-center w-full text-left font-semibold text-gray-800 hover:text-indigo-600 mb-2"
      >
        {title}
        <span className="text-gray-400">{openSections[category] ? '−' : '+'}</span>
      </button>
      
      {openSections[category] && (
        <div className="max-h-48 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-300">
          {items.map((item) => {
             const isChecked = isSingleSelect 
                ? selectedFilters[category] === item.value || selectedFilters[category] === item
                : (selectedFilters[category] || []).includes(item);
             
             const label = item.label || item;
             const value = item.value || item;

             return (
              <label key={value} className="flex items-center text-sm text-gray-600 hover:bg-gray-50 p-1 rounded cursor-pointer transition-colors">
                <input
                  type={isSingleSelect ? "radio" : "checkbox"}
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(category, value)}
                  onClick={(e) => {
                      if(isSingleSelect && isChecked) {
                          e.preventDefault();
                          handleCheckboxChange(category, value);
                      }
                  }}
                  className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="truncate" title={label}>{label}</span>
              </label>
            );
          })}
          {items.length === 0 && <p className="text-xs text-gray-400 italic ml-1">No options available</p>}
        </div>
      )}
    </div>
  );

  const dateAddedOptions = [
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
    { label: 'This Year', value: 'thisYear' },
  ];

  return (
    <div className="w-full bg-white p-5 rounded-xl shadow-lg h-fit border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Refine Results</h3>
        <button 
            onClick={() => onFilterChange('reset')}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
        >
            Clear All
        </button>
      </div>

      {renderSection('Date Added', 'dateRange', dateAddedOptions, true)}
      {renderSection('Source / Journal', 'journal', filters.journals || [])}
      {renderSection('Publication Year', 'year', filters.years || [], true)}
      {renderSection('Authors', 'authors', filters.authors || [])}
      {renderSection('Keywords', 'keywords', filters.keywords || [])}
    </div>
  );
}