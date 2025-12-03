'use client';
import { useMemo } from 'react';

export default function RelatedPapersWidget({ currentDoc, allDocs = [], onSelectDoc }) {
  
  const relatedDocs = useMemo(() => {
    if (!currentDoc || !allDocs || allDocs.length === 0) return [];

    const getKeywords = (doc) => {
      if (!doc || !doc.ai_keywords) return [];
      if (Array.isArray(doc.ai_keywords)) return doc.ai_keywords;
      if (typeof doc.ai_keywords === 'string') {
        try { return JSON.parse(doc.ai_keywords); } catch (e) { return doc.ai_keywords.split(',').map(s => s.trim()); }
      }
      return [];
    };

    const currentKeywords = getKeywords(currentDoc);
    if (currentKeywords.length === 0) return [];

    const scoredDocs = allDocs
      .filter(doc => doc.id !== currentDoc.id)
      .map(doc => {
        const docKeywords = getKeywords(doc);
        const intersection = docKeywords.filter(k => currentKeywords.includes(k));
        return { ...doc, matchScore: intersection.length };
      })
      .filter(doc => doc.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    return scoredDocs.slice(0, 3); 
  }, [currentDoc, allDocs]);

  if (relatedDocs.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        You Might Also Like
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedDocs.map(doc => (
          <div 
            key={doc.id} 
            onClick={() => onSelectDoc(doc)}
            className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl hover:bg-white hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
          >
            <div className="text-sm font-bold text-indigo-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
              {doc.title || "Untitled Document"}
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-400/80">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                {doc.matchScore} shared {doc.matchScore === 1 ? 'topic' : 'topics'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}