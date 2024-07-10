import module from '@silly/tag'

export const footballTeams = [
  "Denver Broncos",
  "New York Jets",
  "Washington Commanders",
  "Atlanta Falcons",
  "San Francisco 49ers",
  "New Orleans Saints",
  "Miami Dolphins",
  "Kansas City Chiefs",
  "Buffalo Bills",
  "Tampa Bay Buccaneers",
  "New England Patriots",
  "Baltimore Ravens",
  "Jacksonville Jaguars",
  "Tennessee Titans",
  "Pittsburgh Steelers",
  "Cincinnati Bengals",
  "Las Vegas Raiders",
  "Green Bay Packers",
  "Los Angeles Chargers",
  "Dallas Cowboys",
  "Detroit Lions",
  "Seattle Seahawks",
  "Chicago Bears",
  "Cleveland Browns",
  "Philadelphia Eagles",
  "New York Giants",
  "Minnesota Vikings",
  "Carolina Panthers",
  "Indianapolis Colts",
  "Houston Texans",
  "Arizona Cardinals",
  "Los Angeles Rams",
]

const $ = module('sillonious-sports')

$.draw(() => {
  return `
    <football-history></football-history>
    <football-projections></football-projections>
  `
})
