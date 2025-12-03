'use client';

const ChecklistItem = ({ isMet, text }) => (
  <li className={`flex items-center gap-2 text-xs font-medium transition-colors duration-300 ${isMet ? 'text-green-600' : 'text-gray-400'}`}>
    <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${isMet ? 'bg-green-100 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
        {isMet && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
    </span>
    {text}
  </li>
);

export default function PasswordChecklist({ validity }) {
  if (!validity) return null;

  return (
    <div className="mt-3 p-3 bg-white/50 rounded-xl border border-gray-100">
      <ul className="grid grid-cols-1 gap-2">
        <ChecklistItem isMet={validity.hasLength} text="Min 8 characters" />
        <ChecklistItem isMet={validity.hasUpper} text="Uppercase letter" />
        <ChecklistItem isMet={validity.hasLower} text="Lowercase letter" />
        <ChecklistItem isMet={validity.hasNumber} text="Number" />
        <ChecklistItem isMet={validity.hasSpecial} text="Special char (@$!%*?&)" />
      </ul>
    </div>
  );
}