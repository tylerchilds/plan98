import module from "@silly/tag"
import client from "fantasydata-node-client"

const $ = module('green-monster')

$.draw((target) => {
  if(!target.client) {
    contract(target)
  }

  return `
    Dataaalsdnflas
  `
})

// this function is named contract so that when we need to audit the codebase for any function call that wires up billable functionality, we'll be able to easily locate with:
//
// :Ag function contract
async function contract(target) {
  const keys = {
    'MLBv3StatsClient':target.getAttribute('YOUR-MLBV3STATS-KEY'),
    'MLBv3ProjectionsClient':target.getAttribute('YOUR-MLBV3PROJECTIONS-KEY')
  };

  target.client = new client(keys);

  target.client.MLBv3StatsClient.getStandingsPromise('2018')
    .then((resp) => {
        // data here
    })
    .catch((err) => {
        // handle errors
    });
}
