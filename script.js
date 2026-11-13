(() => {
'use strict';
const $ = id => document.getElementById(id);
const on = (id, event, fn) => { const el=$(id); if(el) el.addEventListener(event,fn); };
const rounds = [
 {q:"What are the Hardest Subjects in Law School?",m:1,a:[["Civil Procedure",42],["Taxation",23],["Property",20],["Commercial Law",8],["StatCon",4],["Criminal Law",3]]},
 {q:"Arellano Law School Faculty",m:1,a:[["Dean Lazo",20],["Atty. Rabuya",18],["Prosec Salazar",16],["Atty Uribe",15],["Atty. Brondial",10],["Doc Yulo",8],["Atty Amen",8],["Dean Bong Lo",5]]},
 {q:"ALAS Projects or Activity this 2026",m:2,a:[["Legal BluePrint",35],["General Assembly",26],["Mock Bar",24],["Buddy System",15]]}
];
const KEY='familyFeudState_v4';
const defaults=()=>({version:3,phase:'setup',teams:['The Champs','The Challengers'],scores:[0,0],round:0,turn:0,strikes:0,stealMode:false,revealed:[],roundDone:false,bank:0,winner:null,gameOver:false,message:'Waiting for the host to start the game.'});
let state=defaults(), channel=null, lastSerialized='';
const storageOK=(()=>{try{localStorage.setItem('ff_test','1');localStorage.removeItem('ff_test');return true;}catch(e){return false;}})();
const isHost=document.body.dataset.page==='host';
function currentRound(){return rounds[state.round%rounds.length];}
function multiplier(){return currentRound().m||1;}
function baseBank(){return state.revealed.reduce((sum,i)=>sum+currentRound().a[i][1],0);}
function team(i){return state.teams[i]||`Team ${i+1}`;}
function safeName(s,fallback){return String(s||'').trim().slice(0,22)||fallback;}
function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return;const parsed=JSON.parse(raw);if(parsed&&parsed.version===3){state={...defaults(),...parsed};state.teams=Array.isArray(parsed.teams)?parsed.teams.slice(0,2):defaults().teams;state.scores=Array.isArray(parsed.scores)?parsed.scores.slice(0,2).map(n=>Math.max(0,Number(n)||0)):[0,0];state.revealed=Array.isArray(parsed.revealed)?parsed.revealed.filter(i=>Number.isInteger(i)&&i>=0&&i<currentRound().a.length):[];}}catch(e){}}
function save(){if(!isHost)return;try{const raw=JSON.stringify(state);if(raw!==lastSerialized){localStorage.setItem(KEY,raw);lastSerialized=raw;if(channel)channel.postMessage('update');}}catch(e){}}
function announce(message){state.message=message;}
function toast(message){const el=$('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2200);}
function pageMode(){if(isHost){$('setupPanel')?.classList.toggle('hidden',state.phase!=='setup');$('gameArea')?.classList.toggle('hidden',state.phase!=='game');}else{$('waitingPanel')?.classList.toggle('hidden',state.phase==='game');$('gameArea')?.classList.toggle('hidden',state.phase!=='game');}}
function render(){
 pageMode();
 ['team1Name','team2Name'].forEach((id,i)=>{if($(id))$(id).textContent=team(i).toUpperCase();});
 ['score1','score2'].forEach((id,i)=>{if($(id))$(id).textContent=String(state.scores[i]||0);});
 const r=currentRound(), mult=multiplier();
 if($('roundNumber'))$('roundNumber').textContent=String(state.round+1).padStart(2,'0');
 if($('questionNumber'))$('questionNumber').textContent=`QUESTION ${String(state.round+1).padStart(2,'0')}`;
 if($('roundMultiplier'))$('roundMultiplier').textContent=mult===3?'TRIPLE POINTS':mult===2?'DOUBLE POINTS':'SINGLE POINTS';
 if($('questionText'))$('questionText').textContent=r.q;
 if($('turnText'))$('turnText').textContent=state.gameOver?(state.scores[0]===state.scores[1]?'GAME OVER — IT’S A TIE!':`${team(state.scores[0]>state.scores[1]?0:1).toUpperCase()} WINS THE GAME!`):state.stealMode?`${team(1-state.turn).toUpperCase()} — STEAL CHANCE`:`${team(state.turn).toUpperCase()}’S TURN`;
 if($('answerBoard'))$('answerBoard').style.gridTemplateRows=`repeat(${Math.ceil(r.a.length/2)},minmax(0,auto))`;
 if($('answerBoard'))$('answerBoard').innerHTML=r.a.map((a,i)=>{const shown=state.revealed.includes(i);const peek=isHost&&!shown;return `<div class="answer-slot ${shown?'revealed':'empty'}${peek?' host-peek':''}"><span class="slot-number">${String(i+1).padStart(2,'0')}</span><span class="slot-answer">${shown||peek?escapeHTML(a[0]):'••••••••••'}</span><span class="slot-points">${shown||peek?a[1]:'—'}</span></div>`;}).join('');
 const count=`${state.revealed.length} OF ${r.a.length} ANSWERS REVEALED`;
 if($('revealedCount'))$('revealedCount').textContent=count;
 if($('roundBank'))$('roundBank').textContent=`ROUND BANK: ${baseBank()} PTS${mult>1?` · ×${mult} AT END = ${baseBank()*mult}`:''}`;
 [1,2,3].forEach(n=>$('strike'+n)?.classList.toggle('active',state.strikes>=n));
 if($('displayMessage'))$('displayMessage').textContent=state.message||'';
 if($('hostFeedback'))$('hostFeedback').textContent=state.message||'Choose a correct answer on the board above.';
 if($('turnHelp'))$('turnHelp').textContent=state.gameOver?'Game over. Click New Game to play again.':state.roundDone?'Round complete. Awarded points are locked in. Click Next Question when ready.':state.stealMode?`STEAL CHANCE: ${team(1-state.turn)} can name any remaining answer. A miss gives the bank to ${team(state.turn)}.`:'After three strikes, the opposing team gets one chance to steal.';
 if($('nextQuestionBtn')){$('nextQuestionBtn').disabled=!state.roundDone||state.gameOver;$('nextQuestionBtn').textContent=state.gameOver?'GAME OVER':state.round>=rounds.length-1?'FINISH GAME →':'NEXT QUESTION →';}
 if($('wrongBtn')){$('wrongBtn').disabled=state.roundDone;$('wrongBtn').textContent=state.stealMode?'✕ WRONG STEAL ANSWER':'✕ WRONG ANSWER / STRIKE';}
 if($('switchTeamBtn'))$('switchTeamBtn').disabled=state.roundDone;
 [['team1Input',0],['team2Input',1]].forEach(([id,i])=>{const el=$(id);if(el&&document.activeElement!==el)el.value=team(i);});
 save();
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function award(winner,reason){if(state.roundDone)return;const bank=baseBank()*multiplier();state.scores[winner]+=bank;state.bank=bank;state.winner=winner;state.roundDone=true;announce(`${team(winner)} earns ${bank} points${multiplier()>1?` (${baseBank()} doubled)`:''}! ${reason} Click NEXT QUESTION when ready.`);render();toast(`${team(winner)} +${bank} POINTS`);}
function reveal(index){if(!isHost||state.phase!=='game'||state.roundDone||state.revealed.includes(index))return;state.revealed.push(index);if(state.stealMode){const stealing=1-state.turn;state.turn=stealing;state.stealMode=false;award(stealing,`${team(stealing)} successfully stole the round.`);return;}announce(`${currentRound().a[index][0]} revealed — ${currentRound().a[index][1]} points.`);if(state.revealed.length===currentRound().a.length){award(state.turn,'All answers were revealed correctly.');return;}render();}
function wrong(){if(!isHost||state.phase!=='game'||state.roundDone)return;if(state.stealMode){award(state.turn,`${team(1-state.turn)} missed the steal. ${team(state.turn)} keeps the bank.`);return;}state.strikes=Math.min(3,state.strikes+1);if(state.strikes===3){state.stealMode=true;announce(`Three strikes! ${team(1-state.turn)} has one chance to steal.`);toast('STEAL CHANCE!');}else announce(`Strike ${state.strikes} of 3.`);render();}
function nextQuestion(){if(!isHost||!state.roundDone||state.gameOver)return;if(state.round>=rounds.length-1){state.gameOver=true;const[a,b]=state.scores;announce(a===b?`It’s a tie at ${a} points each!`:`${team(a>b?0:1)} wins the game, ${Math.max(a,b)} to ${Math.min(a,b)}!`);render();toast('GAME OVER');return;}state.round++;state.turn=state.round%2;state.strikes=0;state.stealMode=false;state.revealed=[];state.roundDone=false;state.bank=0;state.winner=null;announce('New question. Good luck!');render();}
function startGame(){state={...defaults(),phase:'game',teams:[safeName($('team1Input')?.value,'Team One'),safeName($('team2Input')?.value,'Team Two')]};announce('Game started. Good luck to both teams!');render();toast('Game started!');}
function newGame(){if(!isHost)return;state=defaults();announce('New game ready. Enter the team names and start.');if($('editModal'))$('editModal').classList.add('hidden');render();toast('New game reset.');}
function editTeams(){if(!$('editModal'))return;$('editTeam1').value=team(0);$('editTeam2').value=team(1);$('editModal').classList.remove('hidden');$('editTeam1').focus();}
function saveTeams(){state.teams=[safeName($('editTeam1').value,'Team One'),safeName($('editTeam2').value,'Team Two')];$('editModal').classList.add('hidden');announce('Team names updated.');render();toast('Team names updated.');}
function switchTeam(){if(!isHost||state.roundDone)return;state.turn=1-state.turn;state.strikes=0;state.stealMode=false;announce(`Turn switched to ${team(state.turn)}.`);render();}
function sync(){const raw=localStorage.getItem(KEY);if(!raw||raw===lastSerialized)return;load();lastSerialized=raw;render();}
if('BroadcastChannel' in window){channel=new BroadcastChannel('family-feud-live-v3');channel.onmessage=()=>sync();}
window.addEventListener('storage',e=>{if(e.key===KEY)sync();});
setInterval(sync,500);
if(isHost){
 on('startBtn','click',startGame);on('newGameBtn','click',newGame);on('wrongBtn','click',wrong);on('switchTeamBtn','click',switchTeam);on('nextQuestionBtn','click',nextQuestion);on('editTeamsBtn','click',editTeams);on('cancelEdit','click',()=>$('editModal').classList.add('hidden'));on('saveEdit','click',saveTeams);
 on('editModal','click',e=>{if(e.target.id==='editModal')$('editModal').classList.add('hidden');});
 on('answerBoard','click',e=>{const slot=e.target.closest('.answer-slot');if(slot&&!state.roundDone){const index=Array.from(slot.parentElement.children).indexOf(slot);reveal(index);}});
}
if(!storageOK){const msg='Browser storage is blocked, so the two pages cannot talk to each other. Run the game from a local server (python -m http.server 8000) and open http://localhost:8000 in the same browser.';const w=$('waitingPanel')?.querySelector('p');if(w)w.textContent=msg;setTimeout(()=>{const f=$('hostFeedback');if(f)f.textContent=msg;toast(msg);},300);}
load();try{lastSerialized=localStorage.getItem(KEY)||'';}catch(e){}render();
})();
