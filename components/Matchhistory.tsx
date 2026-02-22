import { storageService } from './storageService';

const history = storageService.getMatchHistory();

// Display match history list
return (
  <div className="match-history">
    {history.map(match => (
      <div key={match.id} className="match-item">
        <div>{match.date}</div>
        <div>{match.result.toUpperCase()}</div>
        <div>vs {match.opponent}</div>
        <div>{match.duration}s</div>
      </div>
    ))}
  </div>
);