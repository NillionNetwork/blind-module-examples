'use client';

import { useState } from 'react';

export default function AIJournal() {
  const [journalEntry, setJournalEntry] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [entries, setEntries] = useState([]);
  const analyzeEntry = async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `For this journal entry: "${journalEntry}", respond with ONE sentence starting with " followed by either "You" or "Your". Focus on stoic virtues (resilience, gratitude, growth, self-control, wisdom). Must be similar in length to: "Analysis: You demonstrated resilience and a stoic mindset by focusing on what's within your control."`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze entry');
      }

      const data = await response.json();
      console.log('data', data);
      const analysis = data.choices[0].message.content;
      console.log('analysis', analysis);

      // Check if the response contains an error message
      if (data.error) {
        throw new Error(data.error);
      }

      const newEntry = {
        id: entries.length + 1,
        date: new Date(),
        content: journalEntry,
        analysis: analysis,
      };
      setEntries([newEntry, ...entries]);
      setAnalysis(data.text);
      setJournalEntry('');
    } catch (error) {
      console.error('Error analyzing journal entry:', error);
      setAnalysis(
        'An error occurred while analyzing your journal entry. Please try again.'
      );
    }
    setIsAnalyzing(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='container mx-auto p-4 max-w-3xl'>
        <h1 className='text-3xl font-bold text-center text-gray-900'>
          Private AI Journal
        </h1>
        <p className='italic text-center mt-2 mb-6'>
          <span>You can tell me anything. I won&apos;t leak it ;)</span>
        </p>
        <div className='mb-6 bg-white border-2 border-gray-800 rounded-lg shadow-md'>
          <div className='p-4 border-b border-gray-800'>
            <h2 className='text-xl font-semibold text-gray-900'>New Entry</h2>
          </div>
          <div className='p-4'>
            <textarea
              placeholder='Write your journal entry here...'
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              rows={6}
              className='w-full p-2 mb-4 border border-gray-800 rounded focus:outline-none text-black'
            />
            <button
              onClick={analyzeEntry}
              disabled={isAnalyzing || !journalEntry.trim()}
              className='w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Entry'}
            </button>
          </div>
        </div>
        <h2 className='text-2xl font-semibold mb-4 text-left text-gray-900'>
          Past Entries
        </h2>
        {entries.map((entry, id) => (
          <div
            key={id}
            className='mb-4 bg-white border border-gray-800 rounded-lg shadow-md'
          >
            <div className='p-4 border-b border-gray-300'>
            </div>
            <div className='p-4'>
              <p className='mb-2 text-gray-900'>{entry.content}</p>
              <p className='text-sm italic border-t pt-2 border-gray-300 text-gray-700'>
                Analysis: {entry.analysis}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
