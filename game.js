const suits = ["H", "S", "D", "C"];
const values = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

let playerHand = [];
let dealerHand = [];

function getRandomCard() {
  const value = values[Math.floor(Math.random() * values.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  return value + suit;
}

function getCardValue(card) {
  let val = card.slice(0, -1);
  if (["J","Q","K"].includes(val)) return 10;
  if (val === "A") return 11;
  return parseInt(val);
}

function calculateHand(hand) {
  let total = hand.reduce((sum, c) => sum + getCardValue(c), 0);
  let aces = hand.filter(c => c.startsWith("A")).length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

/* CREATE CARD WITH FLIP + SLIDE */
function createCardElement(card, hidden = false) {
  const container = document.createElement("div");
  container.classList.add("card-container", "slide-in");

  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  const front = document.createElement("img");
  front.src = `assets/cards/${card}.png`;
  front.classList.add("card-face", "card-front");

  const back = document.createElement("div");
  back.classList.add("card-face", "card-back");

  cardDiv.appendChild(front);
  cardDiv.appendChild(back);

  if (!hidden) {
    setTimeout(() => {
      cardDiv.classList.add("flip");
    }, 100);
  }

  container.appendChild(cardDiv);
  return container;
}

/* RENDER */
function renderCards(revealDealer = false) {
  const playerDiv = document.getElementById("player-cards");
  const dealerDiv = document.getElementById("dealer-cards");

  playerDiv.innerHTML = "";
  dealerDiv.innerHTML = "";

  playerHand.forEach(card => {
    playerDiv.appendChild(createCardElement(card));
  });

  dealerHand.forEach((card, i) => {
    const hidden = (i === 1 && !revealDealer);
    dealerDiv.appendChild(createCardElement(card, hidden));
  });
}

/* GAME FLOW */
function startGame() {
  playerHand = [getRandomCard(), getRandomCard()];
  dealerHand = [getRandomCard(), getRandomCard()];
  document.getElementById("result").innerText = "";
  renderCards();
}

function hit() {
  playerHand.push(getRandomCard());
  renderCards();

  if (calculateHand(playerHand) > 21) {
    document.getElementById("result").innerText = "💥 Bust!";
  }
}

function stand() {
  while (calculateHand(dealerHand) < 17) {
    dealerHand.push(getRandomCard());
  }

  renderCards(true);

  let p = calculateHand(playerHand);
  let d = calculateHand(dealerHand);

  let result;
  if (d > 21 || p > d) result = "🎉 You Win!";
  else if (d > p) result = "😞 Dealer Wins";
  else result = "🤝 Tie";

  document.getElementById("result").innerText = result;
}

startGame();
