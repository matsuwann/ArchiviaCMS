'use client';


const ChecklistItem = ({ isMet, text }) => (
  <li className={`text-sm ${isMet ? 'text-green-600' : 'text-gray-500'}`}>
    {isMet ? '✓' : '✗'} {text}
  </li>
);

export default function PasswordChecklist({ validity }) {
  
  if (!validity) return null;

  return (
    <div className="p-3 mt-2 bg-slate-200 rounded-md">
      <ul className="space-y-1">
        <ChecklistItem isMet={validity.hasLength} text="At least 8 characters long" />
        <ChecklistItem isMet={validity.hasUpper} text="Contains an uppercase letter (A-Z)" />
        <ChecklistItem isMet={validity.hasLower} text="Contains a lowercase letter (a-z)" />
        <ChecklistItem isMet={validity.hasNumber} text="Contains a number (0-9)" />
        <ChecklistItem isMet={validity.hasSpecial} text="Contains a special character (@, $, !, etc.)" />
      </ul>
    </div>
  );
}