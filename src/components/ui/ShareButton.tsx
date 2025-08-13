'use client';

import { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Link,
  QrCode,
  Download,
  X
} from 'lucide-react';

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  hashtags?: string[];
  via?: string;
  imageUrl?: string;
  variant?: 'button' | 'icon' | 'floating';
  position?: 'fixed' | 'relative';
}

export function ShareButton({
  title = 'Gap Finder - Smart Competitor Analysis',
  text = 'Found amazing market opportunities with Gap Finder! Check out this competitor analysis tool for indie hackers.',
  url = typeof window !== 'undefined' ? window.location.href : '',
  hashtags = ['GapFinder', 'IndieHackers', 'MarketAnalysis', 'StartupTools'],
  via = 'gapfinder',
  imageUrl,
  variant = 'button',
  position = 'relative'
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  // Use Web Share API (for supported browsers)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        
        // Record successful share
        trackShare('native');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
          setShowModal(true); // Fallback
        }
      }
    } else {
      setShowModal(true); // Web Share API not supported
    }
  };

  // Share to each platform
  const shareOptions = [
    {
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags.join(',')}&via=${via}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
        trackShare('twitter');
      }
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="h-5 w-5" />,
      color: 'hover:bg-blue-50 hover:text-blue-700',
      action: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedinUrl, '_blank', 'width=550,height=420');
        trackShare('linkedin');
      }
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'hover:bg-green-50 hover:text-green-600',
      action: () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        window.open(whatsappUrl, '_blank');
        trackShare('whatsapp');
      }
    },
    {
      name: 'Email',
      icon: <Mail className="h-5 w-5" />,
      color: 'hover:bg-gray-50 hover:text-gray-700',
      action: () => {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(`${text}\n\n${url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        trackShare('email');
      }
    },
    {
      name: 'Copy Link',
      icon: copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />,
      color: copied ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 hover:text-gray-700',
      action: async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        trackShare('copy');
      }
    },
    {
      name: 'QR Code',
      icon: <QrCode className="h-5 w-5" />,
      color: 'hover:bg-purple-50 hover:text-purple-600',
      action: () => {
        generateQRCode();
        trackShare('qrcode');
      }
    }
  ];

  // Generate QR Code
  const generateQRCode = () => {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    setQrCode(qrApiUrl);
  };

  // Track share events
  const trackShare = (platform: string) => {
    // Send analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform,
        content_type: 'tool',
        item_id: url
      });
    }
    
    // In-app notification
    window.dispatchEvent(new CustomEvent('app-notification', {
      detail: {
        type: 'success',
        message: `Shared via ${platform}!`
      }
    }));
  };

  // Floating button style
  if (variant === 'floating' && position === 'fixed') {
    return (
      <>
        <button
          onClick={handleNativeShare}
          className="fixed bottom-24 right-6 p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 hover:scale-110 transition-all z-30"
          title="Share this page"
        >
          <Share2 className="h-5 w-5" />
        </button>
        {showModal && <ShareModal options={shareOptions} onClose={() => setShowModal(false)} qrCode={qrCode} />}
      </>
    );
  }

  // Icon only
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleNativeShare}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          title="Share"
        >
          <Share2 className="h-5 w-5" />
        </button>
        {showModal && <ShareModal options={shareOptions} onClose={() => setShowModal(false)} qrCode={qrCode} />}
      </>
    );
  }

  // Normal button
  return (
    <>
      <button
        onClick={handleNativeShare}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
      {showModal && <ShareModal options={shareOptions} onClose={() => setShowModal(false)} qrCode={qrCode} />}
    </>
  );
}

// Share Modal Component
function ShareModal({ 
  options, 
  onClose, 
  qrCode 
}: { 
  options: any[]; 
  onClose: () => void; 
  qrCode: string | null;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Share this page</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Share Options */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-3">
            {options.map((option) => (
              <button
                key={option.name}
                onClick={() => {
                  option.action();
                  if (option.name !== 'Copy Link' && option.name !== 'QR Code') {
                    onClose();
                  }
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${option.color}`}
              >
                <div className="p-2 bg-gray-100 rounded-lg">
                  {option.icon}
                </div>
                <span className="text-xs font-medium">{option.name}</span>
              </button>
            ))}
          </div>
          
          {/* QR Code Display */}
          {qrCode && (
            <div className="mt-6 text-center">
              <img src={qrCode} alt="QR Code" className="mx-auto mb-3" />
              <p className="text-sm text-gray-600">Scan to share on mobile</p>
              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = qrCode;
                  a.download = 'gap-finder-qr.png';
                  a.click();
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download QR Code
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-600 text-center">
            Share Gap Finder with your network and help others find market opportunities!
          </p>
        </div>
      </div>
    </div>
  );
}
export default ShareButton;