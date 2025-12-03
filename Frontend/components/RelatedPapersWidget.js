'use client';
import { useMemo } from 'react';

export default function RelatedPapersWidget({ currentDoc, allDocs = [], onSelectDoc }) {
  
  const relatedDocs = useMemo(() => {
    if (!currentDoc || !allDocs || allDocs.length === 0) return [];

    // Helper to safely get array of keywords from any format (string or array)
    const getKeywords = (doc) => {
      if (!doc || !doc.ai_keywords) return [];
      if (Array.isArray(doc.ai_keywords)) return doc.ai_keywords;
      if (typeof doc.ai_keywords === 'string') {
        try {
          // Try parsing if it's a JSON string
          const parsed = JSON.parse(doc.ai_keywords);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          // If not JSON, maybe comma-separated?
          return doc.ai_keywords.split(',').map(s => s.trim());
        }
      }
      return [];
    };

    const currentKeywords = getKeywords(currentDoc);
    if (currentKeywords.length === 0) return [];

    // Score other documents based on keyword overlap
    const scoredDocs = allDocs
      .filter(doc => doc.id !== currentDoc.id) // Exclude current doc
      .map(doc => {
        const docKeywords = getKeywords(doc);
        const intersection = docKeywords.filter(k => currentKeywords.includes(k));
        
        return {
          ...doc,
          matchScore: intersection.length,
          matchedKeywords: intersection
        };
      })
      .filter(doc => doc.matchScore > 0) // Only keep docs with at least 1 match
      .sort((a, b) => b.matchScore - a.matchScore); // Sort by highest score

    return scoredDocs.slice(0, 3); // Take top 3
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
              {doc.title || "Untitled Document"}
            </div>
            <div className="text-xs text-slate-500">
              Found {doc.matchScore} shared {doc.matchScore === 1 ? 'topic' : 'topics'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}