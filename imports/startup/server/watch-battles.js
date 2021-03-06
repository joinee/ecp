import fetchBattles from '/imports/api/battles/server/fetch-battles.js';
import fetchBattleResults from '/imports/api/battles/server/fetch-battle-results.js';
import { Tournaments } from '/imports/api/tournaments/tournaments.js';
import { Battles } from '/imports/api/battles/battles.js';
import createRanking from '/imports/utils/ranking.js';

Meteor.startup(() => {
  setInterval(() => {
    fetchBattles().then((battles) => {
      const allTournaments = Tournaments.find().fetch();
      const activeTournaments = allTournaments && allTournaments.filter(tournament => tournament.status !== 'finished');
      const tournamentBattlesIds = activeTournaments && activeTournaments.map((torunament => torunament.battles));
      const tournamentBattles = tournamentBattlesIds && [].concat.apply([], tournamentBattlesIds).map(battleId => Battles.findOne(battleId));

      if(tournamentBattles) {
        tournamentBattles.forEach(tournamentBattle => {
          if(!tournamentBattle.results || !!tournamentBattle.results.error) {
            battles.forEach(battle => {
              if(compareBattles(tournamentBattle, battle)) {
                fetchBattleResults(battle.index).then((results) => {
                  if(results) {
                    Meteor.call('battle.update', { battleId: tournamentBattle._id, battle, results })
                  }
                });
              }
            });
          }
        });
      };
    });
  }, 1000);
});

const compareBattles = (battle1, battle2) => {
  return (battle1.levelName && battle2.level && battle1.levelName == battle2.level) ||
         (battle2.levelname && battle2.levelname.toLowerCase && (battle1.levelName.toLowerCase() === battle2.levelname.toLowerCase()));
}
