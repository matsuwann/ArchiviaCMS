'use client';
import { useMemo } from 'react';

export default function RelatedPapersWidget({ currentDoc, allDocs = [], onSelectDoc }) {
  
  const relatedDocs = useMemo(() => {
    if (!currentDoc || !allDocs || allDocs.length === 0) return [];

    // Helper to safely get array of keywords
    const getKeywords = (doc) => {
      if (!doc || !doc.ai_keywords) return [];
      if (Array.isArray(doc.ai_keywords)) return doc.ai_keywords;
      if (typeof doc.ai_keywords === 'string') {
        try {
          const parsed = JSON.parse(doc.ai_keywords);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          // Fallback if not valid JSON
          return [];
        }
      }
      return [];
    };

    const currentKeywords = getKeywords(currentDoc);
    if (currentKeywords.length === 0) return [];

    // Score other documents
    const scoredDocs = allDocs
      .filter(doc => doc.id !== currentDoc.id)
      .map(doc => {
        const docKeywords = getKeywords(doc);
        
        // Calculate overlap
        const intersection = docKeywords.filter(k => currentKeywords.includes(k));
        
        return {
          ...doc,
          matchScore: intersection.length,
          matchedKeywords: intersection
        };
      })
      .filter(doc => doc.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore); 

    return scoredDocs.slice(0, 3);
  }, [currentDoc, allDocs]);

  if (relatedDocs.length === 0) return null;

  return (
    <div className="w-full max-w-[700px] mt-8 pt-6 border-t border-slate-300">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
        Related Papers
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relatedDocs.map(doc => (
          <div 
            key={doc.id} 
            onClick={() => onSelectDoc(doc)}
            className="p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:shadow-md transition cursor-pointer group text-left"
          >
            <div className="text-sm font-bold text-indigo-700 group-hover:underline line-clamp-2 mb-1">
              {/* Ensure title is a string */}
              {String(doc.title || "Untitled Document")}
            </div>
            <div className="text-xs text-slate-500">
              {/* Ensure matchScore is a number/string */}
              {doc.matchScore} shared {doc.matchScore === 1 ? 'keyword' : 'keywords'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}