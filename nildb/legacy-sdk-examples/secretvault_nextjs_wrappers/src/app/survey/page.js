'use client';

import { useState, useEffect } from 'react';

export default function SurveyPage() {
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState(0);
  const [schemaId, setSchemaId] = useState(null);
  const [surveyData, setSurveyData] = useState([]);
  const [ratings, setRatings] = useState([
    { rating: 1, question_number: 1 },
    { rating: 1, question_number: 2 },
  ]);

  const fetchSurveyData = async (id) => {
    try {
      const response = await fetch(`/api/survey/data?schemaId=${id}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      setSurveyData(result.data);
    } catch (error) {
      console.error('Failed to fetch survey data:', error);
    }
  };

  const createSchema = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/survey/schema', {
        method: 'POST',
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      setSchemaId(result.schemaId);
      alert('Schema created successfully! Schema ID: ' + result.schemaId);
      // Fetch initial data after schema creation
      await fetchSurveyData(result.schemaId);
    } catch (error) {
      console.error('Failed to create schema:', error);
      alert('Failed to create schema: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitSurvey = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/survey/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schemaId,
          data: [
            {
              years_in_web3: { '%allot': parseInt(years) },
              responses: ratings,
            },
          ],
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      alert('Survey submitted successfully!');
      setYears(0);
      setRatings([
        { rating: 1, question_number: 1 },
        { rating: 1, question_number: 2 },
      ]);

      // Refresh data after submission
      await fetchSurveyData(schemaId);
    } catch (error) {
      console.error('Failed to submit survey:', error);
      alert('Failed to submit survey: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRating = (index, value) => {
    const newRatings = [...ratings];
    newRatings[index] = { ...newRatings[index], rating: parseInt(value) };
    setRatings(newRatings);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Web3 Experience Survey</h1>

      {!schemaId ? (
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            First, create a schema to store the survey responses
          </p>
          <button
            onClick={createSchema}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Creating Schema...' : 'Create Schema'}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 p-2 bg-gray-100 rounded">
            <p className="text-sm">Schema ID: {schemaId}</p>
          </div>

          <form onSubmit={submitSurvey} className="space-y-4 mb-8">
            <div>
              <label className="block mb-2">
                Years in Web3:
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="border p-2 w-full mt-1"
                  required
                />
              </label>
            </div>

            <div className="space-y-2">
              <h2 className="font-semibold">Rate your experience (1-5):</h2>
              {ratings.map((rating, index) => (
                <div key={index}>
                  <label className="block mb-2">
                    Question {rating.question_number}:
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={rating.rating}
                      onChange={(e) => updateRating(index, e.target.value)}
                      className="border p-2 w-full mt-1"
                      required
                    />
                  </label>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {loading ? 'Submitting...' : 'Submit Survey'}
            </button>
          </form>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Survey Responses</h2>
            {surveyData.length === 0 ? (
              <p className="text-gray-600">No responses yet</p>
            ) : (
              <div className="space-y-4">
                {surveyData.map((survey, index) => (
                  <div key={index} className="border p-4 rounded">
                    <p className="font-semibold">
                      Years in Web3:{' '}
                      {typeof survey.years_in_web3 === 'object'
                        ? survey.years_in_web3['%share'] ||
                          survey.years_in_web3['%allot']
                        : survey.years_in_web3.toString()}
                    </p>
                    <div className="mt-2">
                      <p className="font-medium">Ratings:</p>
                      <ul className="list-disc list-inside">
                        {survey.responses.map((response, rIndex) => (
                          <li key={rIndex}>
                            Question {response.question_number}:{' '}
                            {response.rating}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
