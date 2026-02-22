import React from 'react';
import { storageService } from './storageService';
import { AdMob } from 'capacitor-admob';

// Function to show an interstitial ad
const showInterstitialAd = async () => {
  await AdMob.showInterstitial({
    adId: 'YOUR_INTERSTITIAL_AD_UNIT_ID', // <-- replace with your AdMob Interstitial ID
    isTesting: true, // set to false when publishing
  });
};

// Function to handle game end
export const handleGameEnd = (matchData) => {
  // Save match to history
  storageService.addMatch(matchData);

  // Get updated history
  const history = storageService.getMatchHistory();

  // Show ad every 3 matches
  if (history.length % 3 === 0) {
    showInterstitialAd();
  }

  // Continue with other game-end logic (reset board, scores, etc.)
  // Example: resetGame();
};

// Component to display match history
export const MatchHistory: React.FC = () => {
  const history = storageService.getMatchHistory();

  return (
    <div className="match-history">
      {history.map(match => (
        <div key={match.id} className="match-item">
          <div>{new Date(match.date).toLocaleDateString()}</div>
          <div>{match.result.toUpperCase()}</div>
          <div>vs {match.opponent}</div>
          <div>{match.duration}s</div>
        </div>
      ))}
    </div>
  );
};