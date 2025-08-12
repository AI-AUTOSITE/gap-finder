// src/components/Disclaimer.tsx
export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="disclaimer-text">
        * Analysis for educational purposes only
      </p>
    );
  }

  return (
    <div className="disclaimer-box">
      <h4 className="font-semibold mb-2">Important Notice</h4>
      <ul className="space-y-1 text-sm">
        <li>• This tool provides market analysis for educational purposes</li>
        <li>• Not intended to criticize or demean any products</li>
        <li>• Results are suggestions, not guarantees</li>
        <li>• All trademarks belong to their respective owners</li>
        <li>• Use this information as inspiration for your own innovation</li>
      </ul>
    </div>
  );
}