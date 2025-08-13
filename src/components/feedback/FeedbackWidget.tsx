'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Bug,
  Lightbulb,
  Heart,
  Send,
  X,
  Star,
  CheckCircle,
  AlertCircle,
  Zap,
  Sparkles
} from 'lucide-react';

interface FeedbackWidgetProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-right';
  variant?: 'floating' | 'embedded';
}

export function FeedbackWidget({ 
  position = 'bottom-left',
  variant = 'floating'
}: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature' | 'rating'>('general');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState<'love' | 'improve' | null>(null);

  const feedbackTypes = [
    { 
      id: 'general', 
      label: 'General Feedback', 
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'blue',
      placeholder: 'Share your thoughts about Gap Finder...'
    },
    { 
      id: 'bug', 
      label: 'Report Bug', 
      icon: <Bug className="h-4 w-4" />,
      color: 'red',
      placeholder: 'Describe the issue you encountered...'
    },
    { 
      id: 'feature', 
      label: 'Feature Request', 
      icon: <Lightbulb className="h-4 w-4" />,
      color: 'yellow',
      placeholder: 'What feature would you like to see?'
    },
    { 
      id: 'rating', 
      label: 'Rate Us', 
      icon: <Star className="h-4 w-4" />,
      color: 'purple',
      placeholder: 'Tell us why you gave this rating...'
    }
  ];

  const quickResponses = {
    love: [
      "The UI is amazing!",
      "Super fast and responsive",
      "Love the offline feature",
      "Great market insights",
      "Very helpful for research"
    ],
    improve: [
      "Add more tools",
      "Need better filters",
      "Want export to Excel",
      "More detailed analytics",
      "Team collaboration features"
    ]
  };

  const handleSubmit = async () => {
    if (!message.trim() && feedbackType !== 'rating') return;
    
    setIsSubmitting(true);
    
    // フィードバックデータ
    const feedbackData = {
      type: feedbackType,
      rating: feedbackType === 'rating' ? rating : null,
      message,
      email: email || null,
      quickFeedback,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // LocalStorageに保存（実際はAPIに送信）
    const existingFeedback = JSON.parse(localStorage.getItem('gapFinderFeedback') || '[]');
    existingFeedback.push(feedbackData);
    localStorage.setItem('gapFinderFeedback', JSON.stringify(existingFeedback));
    
    // アナリティクスイベント
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'feedback', {
        feedback_type: feedbackType,
        rating: rating,
        has_message: message.length > 0
      });
    }
    
    // 成功通知
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // 通知
      window.dispatchEvent(new CustomEvent('app-notification', {
        detail: {
          type: 'success',
          message: 'Thank you for your feedback! 🎉'
        }
      }));
      
      // 3秒後にリセット
      setTimeout(() => {
        setIsSubmitted(false);
        setMessage('');
        setEmail('');
        setRating(0);
        setQuickFeedback(null);
        setIsOpen(false);
      }, 3000);
    }, 1000);
  };

  const handleQuickResponse = (response: string) => {
    setMessage(response);
  };

  // フローティングボタン
  const floatingButton = (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className={`fixed ${
        position === 'bottom-left' ? 'bottom-6 left-6' : 
        position === 'bottom-right' ? 'bottom-6 right-20' :
        'top-20 right-6'
      } p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-all z-30 group`}
      title="Send Feedback"
    >
      <MessageSquare className="h-5 w-5" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        We'd love your feedback!
      </span>
    </button>
  );

  // フィードバックフォーム
  const feedbackForm = (
    <div className={`${
      variant === 'floating' 
        ? `fixed ${
            position === 'bottom-left' ? 'bottom-20 left-6' : 
            position === 'bottom-right' ? 'bottom-20 right-6' :
            'top-32 right-6'
          } z-40` 
        : 'relative'
    } ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-xl shadow-2xl w-96 max-w-[calc(100vw-3rem)] animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {isSubmitted ? '✨ Thank You!' : '💬 Send Feedback'}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {!isSubmitted && (
            <p className="text-sm text-gray-600 mt-1">
              Help us improve Gap Finder
            </p>
          )}
        </div>
        
        {isSubmitted ? (
          // Success State
          <div className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Your feedback has been received!</p>
            <p className="text-sm text-gray-500 mt-2">We really appreciate it 💙</p>
          </div>
        ) : (
          <>
            {/* Quick Feedback */}
            <div className="p-4 border-b">
              <p className="text-sm text-gray-700 mb-3">How's your experience?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setQuickFeedback('love')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    quickFeedback === 'love' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ThumbsUp className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">Love it!</span>
                </button>
                <button
                  onClick={() => setQuickFeedback('improve')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    quickFeedback === 'improve' 
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ThumbsDown className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-xs">Needs work</span>
                </button>
              </div>
            </div>
            
            {/* Feedback Type */}
            <div className="p-4 border-b">
              <div className="flex gap-2">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFeedbackType(type.id as any)}
                    className={`flex-1 p-2 rounded-lg text-xs font-medium transition-all ${
                      feedbackType === type.id
                        ? `bg-${type.color}-100 text-${type.color}-700 border-${type.color}-300 border`
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {type.icon}
                      <span>{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Rating (if rating type) */}
            {feedbackType === 'rating' && (
              <div className="p-4 border-b">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star className={`h-8 w-8 ${
                        rating >= star 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300'
                      }`} />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-center text-gray-600 mt-2">
                  {rating === 0 ? 'Tap to rate' :
                   rating === 1 ? 'Poor' :
                   rating === 2 ? 'Fair' :
                   rating === 3 ? 'Good' :
                   rating === 4 ? 'Great' :
                   'Excellent!'}
                </p>
              </div>
            )}
            
            {/* Message */}
            <div className="p-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={feedbackTypes.find(t => t.id === feedbackType)?.placeholder}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              
              {/* Quick Responses */}
              {quickFeedback && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Quick responses:</p>
                  <div className="flex flex-wrap gap-1">
                    {quickResponses[quickFeedback].map((response) => (
                      <button
                        key={response}
                        onClick={() => handleQuickResponse(response)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {response}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Email (optional) */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional, for follow-up)"
                className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Actions */}
            <div className="p-4 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (!message.trim() && feedbackType !== 'rating')}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Feedback
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                Your feedback helps us improve! 🚀
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {variant === 'floating' && floatingButton}
      {feedbackForm}
    </>
  );
}

// NPSスコア調査（定期的に表示）
export function NPSSurvey() {
  const [score, setScore] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);

  // 30日ごとに表示
  useState(() => {
    const lastNPS = localStorage.getItem('lastNPSSurvey');
    if (!lastNPS || Date.now() - parseInt(lastNPS) > 30 * 24 * 60 * 60 * 1000) {
      setTimeout(() => setShowSurvey(true), 60000); // 1分後に表示
    }
  });

  const handleSubmit = () => {
    if (score === null) return;
    
    // 保存
    localStorage.setItem('lastNPSSurvey', Date.now().toString());
    localStorage.setItem('npsScore', score.toString());
    
    setIsSubmitted(true);
    setTimeout(() => setShowSurvey(false), 2000);
  };

  if (!showSurvey) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl p-6 max-w-md z-40 animate-slide-up">
      {isSubmitted ? (
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <p className="font-medium">Thank you!</p>
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowSurvey(false)}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          
          <p className="text-sm font-medium text-gray-900 mb-3">
            How likely are you to recommend Gap Finder to a friend?
          </p>
          
          <div className="flex gap-1 mb-4">
            {[...Array(11)].map((_, i) => (
              <button
                key={i}
                onClick={() => setScore(i)}
                className={`flex-1 p-2 text-xs rounded transition-all ${
                  score === i 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mb-4">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={score === null}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
}
export default FeedbackWidget;