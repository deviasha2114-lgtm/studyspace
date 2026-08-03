'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

export default function FlashcardSetPage({ params }: { params: { setId: string } }) {
  const router = useRouter();
  const [set, setSet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [studyMode, setStudyMode] = useState<boolean>(false);
  // For adding new flashcards
  const [addingCard, setAddingCard] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const fetchSet = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/flashcards/${params.setId}`);
      setSet(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load flashcard set');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSet();
  }, [params.setId]);

  const goToNextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < (set?.flashcards?.length || 0) - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // End of set, show completion
      setStudyMode(false);
    }
  };

  const goToPreviousCard = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const markCorrect = () => {
    setCorrectCount(prev => prev + 1);
    goToNextCard();
  };

  const markIncorrect = () => {
    setIncorrectCount(prev => prev + 1);
    goToNextCard();
  };

  const handleAddCard = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      alert('Please enter both question and answer');
      return;
    }
    try {
      await axios.post(`/api/flashcards/${params.setId}/cards`, {
        question: newQuestion.trim(),
        answer: newAnswer.trim()
      });
      // Reset form
      setNewQuestion('');
      setNewAnswer('');
      setAddingCard(false);
      // Refetch the set to include the new card
      await fetchSet();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add flashcard');
    }
  };

  const handleFinishStudy = async () => {
    try {
      await axios.post(`/api/flashcards/${params.setId}/study`, {
        correctCount,
        incorrectCount,
        timeSpent: 0
      });
      router.push('/dashboard/flashcards?studied=1');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save study session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-500">Loading flashcard set...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-500">
        <p className="text-red-700">{error}</p>
        <Link href="/dashboard/flashcards" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
          ← Back to Flashcards
        </Link>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Flashcard set not found.</p>
        <Link href="/dashboard/flashcards" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
          ← Back to Flashcards
        </Link>
      </div>
    );
  }

  const totalCards = set.flashcards?.length || 0;
  const currentCard = set.flashcards?.[currentCardIndex];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{set.title}</h1>
          {set.description && (
            <p className="mt-1 text-sm text-gray-600">{set.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <span className="text-sm text-gray-500">
            {currentCardIndex + 1} of {totalCards} cards
          </span>
          {studyMode && (
            <>
              <span className="text-sm text-green-600">✓ {correctCount}</span>
              <span className="mx-2">|</span>
              <span className="text-sm text-red-600">✗ {incorrectCount}</span>
            </>
          )}
        </div>
      </div>

      {set.description && (
        <div className="mb-4 text-sm text-gray-600">
          {set.description}
        </div>
      )}

      {!studyMode && (
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard/flashcards"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Back to List
          </Link>
          <button
            onClick={() => setStudyMode(true)}
            disabled={totalCards === 0}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ${totalCards === 0 ? 'opacity-50' : ''}`}
          >
            Start Studying
          </button>
          {!addingCard && (
            <button
              onClick={() => setAddingCard(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Add Flashcard
            </button>
          )}
          {addingCard && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Question"
                className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Answer"
                className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddCard}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 ml-2"
              >
                Add
              </button>
              <button
                onClick={() => setAddingCard(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 ml-2"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {studyMode && totalCards > 0 && currentCard ? (
        <>
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="aspect-[3/4] w-full">
              <div
                className={`relative h-full w-full cursor-pointer transition-transform duration-300 ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="absolute inset-0 backface-hidden">
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-white rounded-lg shadow-xl">
                    <h2 className="text-xl font-semibold mb-4">Question</h2>
                    <p className="text-lg text-gray-800">{currentCard.question}</p>
                  </div>
                </div>
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gray-50 rounded-lg shadow-xl">
                    <h2 className="text-xl font-semibold mb-4">Answer</h2>
                    <p className="text-lg text-gray-800">{currentCard.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={markIncorrect}
              disabled={!currentCard}
              className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700`}
            >
              ❌ Incorrect
            </button>
            <button
              onClick={markCorrect}
              disabled={!currentCard}
              className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ml-2`}
            >
              ✓ Correct
            </button>
          </div>

          {currentCardIndex === totalCards - 1 && !isFlipped && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                This is the last card. Flip to see the answer, then mark your response.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          {totalCards === 0 ? (
            <>
              <p className="text-gray-500">This flashcard set is empty.</p>
              <div className="mt-4">
                <button
                  onClick={() => setAddingCard(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Add First Flashcard
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">
              You've finished reviewing all {totalCards} flashcards!
            </p>
            <div className="mt-6">
              <button
                onClick={handleFinishStudy}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Finish Study Session
              </button>
              <Link
                href="/dashboard/flashcards"
                className="ml-4 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                ← Back to List
              </Link>
            </div>
          )}
        </div>
      )}

      {!studyMode && totalCards > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">All Flashcards</h2>
          <div className="space-y-2">
            {set.flashcards?.map((card: any, index: number) => (
              <div key={card.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{card.question}</p>
                    <p className="mt-1 text-sm text-gray-500">{card.answer}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Card {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}