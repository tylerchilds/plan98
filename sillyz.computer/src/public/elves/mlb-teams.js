import module from "@silly/tag";
import { PGlite } from "@electric-sql/pglite";

init()

const $ = module('mlb-teams', { teams: {rows:[]} })

$.draw(() => {
  const { teams } = $.learn()

  return teams.rows.length === 0 ? 'Loading Database...' : teams.rows.map((team) => `
    <div class="team" style="--team-color: ${team.color}">
      ${team.name}
    </div>
  `).join('')
})

$.style(`
  & .team {
    border-left: 1rem solid var(--team-color);
    padding: .5rem;
  }
`)

async function init() {
  try {
    const db = new PGlite()
    console.log(await db.query(`
      create table if not exists mlb_teams (
        id serial not null primary key,
        name text not null,
        color text not null
      );
    `))

    const mlbTeams = [
      { name: "Arizona Diamondbacks", color: "#A71930" },
      { name: "Atlanta Braves", color: "#13274F" },
      { name: "Baltimore Orioles", color: "#DF4601" },
      { name: "Boston Red Sox", color: "#BD3039" },
      { name: "Chicago White Sox", color: "#000000" },
      { name: "Chicago Cubs", color: "#0E3386" },
      { name: "Cincinnati Reds", color: "#C6011F" },
      { name: "Cleveland Guardians", color: "#0C2340" },
      { name: "Colorado Rockies", color: "#33006F" },
      { name: "Detroit Tigers", color: "#0C2C56" },
      { name: "Houston Astros", color: "#EB6E1F" },
      { name: "Kansas City Royals", color: "#004687" },
      { name: "Los Angeles Angels", color: "#BA0021" },
      { name: "Los Angeles Dodgers", color: "#005A9C" },
      { name: "Miami Marlins", color: "#00A3E0" },
      { name: "Milwaukee Brewers", color: "#0A2351" },
      { name: "Minnesota Twins", color: "#002B5C" },
      { name: "New York Yankees", color: "#003087" },
      { name: "New York Mets", color: "#FF5910" },
      { name: "Oakland Athletics", color: "#003831" },
      { name: "Philadelphia Phillies", color: "#E81828" },
      { name: "Pittsburgh Pirates", color: "#FFB81C" },
      { name: "San Diego Padres", color: "#2F241D" },
      { name: "San Francisco Giants", color: "#FD5A1E" },
      { name: "Seattle Mariners", color: "#005C5C" },
      { name: "St. Louis Cardinals", color: "#C41E3A" },
      { name: "Tampa Bay Rays", color: "#092C5C" },
      { name: "Texas Rangers", color: "#003278" },
      { name: "Toronto Blue Jays", color: "#134A8E" },
      { name: "Washington Nationals", color: "#AB0003" }
    ];

    for (const team of mlbTeams) {
      await db.query(`
        INSERT INTO mlb_teams (name, color) VALUES ('${team.name}', '${team.color}');
      `)
    }

    const teams = await db.query(`SELECT name, color FROM mlb_teams`)
    console.log("All MLB Teams:", teams);

    $.teach({ teams })
  } catch(e) {
    console.error(e)
  }
}
