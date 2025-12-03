'use client';

export default function FilterSidebar({ filters, selectedFilters, onFilterChange }) {
  
  const handleCheckboxChange = (category, value) => {
    const current = selectedFilters[category] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    onFilterChange(category, updated);
  };

  const FilterSection = ({ title, category, items }) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">
          {title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => {
            const isSelected = selectedFilters[category]?.includes(item);
            return (
              <label 
                key={idx} 
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  isSelected 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isSelected}
                  onChange={() => handleCheckboxChange(category, item)}
                />
                {item}
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          Filters
        </h2>
        
        {/* Show reset if any filter is active */}
        {(selectedFilters.authors?.length > 0 || selectedFilters.keywords?.length > 0 || selectedFilters.year) && (
          <button 
            onClick={() => onFilterChange('reset')}
            className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Years - slightly different layout for years (grid) */}
        {filters.years?.length > 0 && (
           <div className="mb-6">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Publication Year</h3>
             <select 
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedFilters.year || ''}
                onChange={(e) => onFilterChange('year', e.target.value)}
             >
               <option value="">Any Year</option>
               {filters.years.map(y => <option key={y} value={y}>{y}</option>)}
             </select>
           </div>
        )}

        <FilterSection title="Authors" category="authors" items={filters.authors} />
        <FilterSection title="Keywords" category="keywords" items={filters.keywords} />
        <FilterSection title="Journals" category="journal" items={filters.journals} />
      </div>
    </div>
  );
}