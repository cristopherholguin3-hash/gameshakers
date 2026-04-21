const suitsMap = { H:"hearts", S:"spades", D:"diamonds", C:"clubs" };

const valuesMap = {
  A:"ace", K:"king", Q:"queen", J:"jack",
  "10":"10","9":"9","8":"8","7":"7","6":"6","5":"5","4":"4","3":"3","2":"2"
};

const suits = ["H","S","D","C"];
const values = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

let playerHand = [];
let dealerHand = [];

function getRandomCard() {
  return values[Math.floor(Math.random()*values.length)] +
         suits[Math.floor(Math.random()*suits.length)];
}

function getCardValue(card) {
  let v = card.slice(0,-1);
  if(["J","Q","K"].includes(v)) return 10;
  if(v==="A") return 11;
  return parseInt(v);
}

function getCardFileName(card) {
  let v = card.slice(0,-1);
  let s = card.slice(-1);
  return `${valuesMap[v]}_of_${suitsMap[s]}.svg`;
}

function calculateHand(hand){
  let total = hand.reduce((sum,c)=>sum+getCardValue(c),0);
  let aces = hand.filter(c=>c.startsWith("A")).length;

  while(total>21 && aces){
    total-=10;
    aces--;
  }
  return total;
}

function createCardElement(card, hidden=false){
  const container = document.createElement("div");
  container.classList.add("card-container","slide-in");

  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  const front = document.createElement("img");
  front.src = `assets/cards/${getCardFileName(card)}`;
  front.classList.add("card-face","card-front");

  const back = document.createElement("div");
  back.classList.add("card-face","card-back");

  cardDiv.appendChild(front);
  cardDiv.appendChild(back);

  if(!hidden){
    setTimeout(()=>cardDiv.classList.add("flip"),100);
  }

  container.appendChild(cardDiv);
  return container;
}

function renderCards(revealDealer=false){
  const p = document.getElementById("player-cards");
  const d = document.getElementById("dealer-cards");

  p.innerHTML="";
  d.innerHTML="";

  playerHand.forEach(c=>p.appendChild(createCardElement(c)));

  dealerHand.forEach((c,i)=>{
    const hidden = (i===1 && !revealDealer);
    d.appendChild(createCardElement(c,hidden));
  });
}

function startGame(){
  playerHand=[getRandomCard(),getRandomCard()];
  dealerHand=[getRandomCard(),getRandomCard()];
  document.getElementById("result").innerText="";
  renderCards();
}

function hit(){
  playerHand.push(getRandomCard());
  renderCards();

  if(calculateHand(playerHand)>21){
    document.getElementById("result").innerText="💥 Bust!";
  }
}

function stand(){
  while(calculateHand(dealerHand)<17){
    dealerHand.push(getRandomCard());
  }

  renderCards(true);

  let p=calculateHand(playerHand);
  let d=calculateHand(dealerHand);

  let result;
  if(d>21 || p>d) result="🎉 You Win!";
  else if(d>p) result="😞 Dealer Wins";
  else result="🤝 Tie";

  document.getElementById("result").innerText=result;
}

startGame();
