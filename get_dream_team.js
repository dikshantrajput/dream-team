const fs = require('fs').promises;

// TODO: playing xi
const main = (variables) => {
    const fixture = variables[0];
    const head2head = variables[1];
    const pitchReport = variables[2];
    const weatherReport = variables[3];
    const teamASquad = variables[4];
    const teamAStat = variables[5];
    const teamBSquad = variables[6];
    const teamBStat = variables[7];
    const liveCommentary = variables[8];

    const prompt =
`You are a fantasy cricket expert. Now can you help me build a data driven fantasy team that will be best from most of the average teams. Tell me what all data do you need for that
Okay if I supply you all these data. can you give me a team that will perform more than average teams
These are some rules: The captain and vice-captain you choose to lead your team are awarded 2x and 1.5x points of the original total they score. However, in case of the deductions, the points of your captain are deducted as 2x only. The same is applicable in case of vice-captain.
In case a substitute replaces any on-field player in any circumstance, then the substitute will not be awarded any points for his/her part on the field. However, in case a player is announced as a Concussion Substitute, then the player shall be awarded (2) points for making an appearance on the field along with the points awarded on the basis of his/her on-field performance.

Fantasy terms and conditions: A user is allowed to choose 7 players in LIVE FANTASY and 2nd Innings. Out of these seven players, a maximum of 6 players can be selected from one team. There is no restriction on mandatory selection of all-rounders, batters, bowlers or wicket keepers. A user will be allocated a total of 65 credit points to create a team.
Users will be asked to choose four players from their team who will fetch 4x,3x,2x and 1.5x points, respectively. Rest of the three players will fetch 1x points. Unlike normal fantasy where a user gets to choose Captain and Vice-Captain for 2x and 1.5x points respectively, it is little different in LIVE fantasy.
Please note that users have to create separate teams for each LIVE fantasy slot and 2nd Innings.
The stats (runs, wicket, strike rate, economy rate etc.) of the players will vary for each category. For example, a batsman who is batting from 1st over and plays till the 10th over and if a user plays LIVE fantasy in 5.1 to 9.6 over, the stats will be considered only for the chosen slot, which is 5.1-9.6 over.

Playing teams: ${fixture}
This is head 2 head between these teams: ${head2head}
THis is pitch report: ${pitchReport}
This is weather report: ${weatherReport}
This is teamA squad: ${teamASquad}
This is teamA player stats${teamAStat}
This is teamB squad: ${teamBSquad}
This is teamB player stats ${teamBStat}
This is extra commentary if any: ${liveCommentary}

Just give me 13 players(11 top best players that have most chances to win + 2 extra players). I need exactly 13 players
Give me in this json format {"fixture":,"players":[{"name":,"reason":, "team":, "role":}], "captain":, "vice_captain":}`
    return prompt
}

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const questions = [
    'What is todays fixture? Give in proper name. add vs text in between of teams name ',
    'What is both team head 2 head scores. Be more expressive ',
    'What is pitch report for todays match? ',
    'What is weather report for todays match? ',
    'What is teamA squad? ',
    'What is teamA stat? ',
    'What is teamB squad? ',
    'What is teamB stat? ',
    'What is some extra things like injuries or something else? ',
];

const answers = [];

function askQuestion(index) {
    if (index === questions.length) {
        rl.close();
        return;
    }

    rl.question(questions[index], (answer) => {
        answers.push(answer); 
        askQuestion(index + 1); 
    });
}

askQuestion(0);

rl.on('close', async () => {
    const result = main(answers)
    const fileName = `final_prompt.md`;
    await fs.writeFile(fileName, JSON.stringify(result, null, 2));
    console.log("Copy the prompt from final_prompt.md file and paste in AI engine");

    const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    let name = ""
    rl2.question("Paste the team id here ", (teamId) => {
        name = teamId;

        rl2.question("Paste the team json here ", async (json) => {
            const fileName = `team/${name}.json`;
            await fs.writeFile(fileName, JSON.stringify(JSON.parse(json), null, 2));
            console.log("Everything done. push the code now");
        });
    });
});