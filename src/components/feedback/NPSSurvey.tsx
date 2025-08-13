// src/components/feedback/NPSSurvey.tsx
'use client'

import React, { useState, useEffect } from 'react'

export default function NPSSurvey() {
  const [isVisible, setIsVisible] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // 初回訪問から30秒後に表示（実際は条件を調整）
    const timer = setTimeout(() => {
      const hasSeenSurvey = localStorage.getItem('nps-survey-seen')
      if (!hasSeenSurvey) {
        setIsVisible(true)
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = () => {
    if (score !== null) {
      // ここでスコアを送信する処理
      console.log('NPS Score:', score)
      localStorage.setItem('nps-survey-seen', 'true')
      setSubmitted(true)
      setTimeout(() => {
        setIsVisible(false)
      }, 2000)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-xl p-6 max-w-sm z-40 border">
      {!submitted ? (
        <>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          
          <h4 className="font-semibold mb-2">How likely are you to recommend Gap Finder?</h4>
          <p className="text-sm text-gray-600 mb-4">0 = Not likely, 10 = Very likely</p>
          
          <div className="grid grid-cols-11 gap-1 mb-4">
            {[...Array(11)].map((_, i) => (
              <button
                key={i}
                onClick={() => setScore(i)}
                className={`p-2 text-xs rounded ${
                  score === i 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={score === null}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="text-3xl mb-2">🙏</div>
          <p className="text-green-600">Thank you for your feedback!</p>
        </div>
      )}
    </div>
  )
}
