const suitsMap = {
  H: "hearts",
  S: "spades",
  D: "diamonds",
  C: "clubs"
};

const valuesMap = {
  "A": "ace",
  "K": "king",
  "Q": "queen",
  "J": "jack",
  "10": "10",
  "9": "9",
  "8": "8",
  "7": "7",
  "6": "6",
  "5": "5",
  "4": "4",
  "3": "3",
  "2": "2"
};

const suits = ["H","S","D","C"];
const values = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

let playerHand = [];
let dealerHand = [];

// =========================
// GAME SETTINGS (for chatbox /set commands)
// =========================
let gameSettings = {
  dealerHitsSoft17: false,
  decks: 1,
  animations: true,
  difficulty: "normal"
};

// =========================
// MULTIPLAYER STATE
// =========================
let isMultiplayer = false;
let players = [];
let currentPlayerIndex = 0;
let dealerObj = { name: "Dealer", hand: [] };

// =========================
// RANDOM CARD
// =========================
function getRandomCard() {
  const value = values[Math.floor(Math.random() * values.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  return value + suit;
}

// =========================
 // CARD VALUE
// =========================
function getCardValue(card) {
  let val = card.slice(0, -1);
  if (["J","Q","K"].includes(val)) return 10;
  if (val === "A") return 11;
  return parseInt(val);
}

// Convert to correct SVG filename (matches AC.svg, 10D.svg, QS.svg, etc.)
function getCardFileName(card) {
  return `${card}.svg`;
}

// =========================
// CALCULATE HAND
// =========================
function calculateHand(hand) {
  let total = hand.reduce((sum, c) => sum + getCardValue(c), 0);
  let aces = hand.filter(c => c.startsWith("A")).length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

// =========================
// CREATE CARD ELEMENT
// =========================
function createCardElement(card, hidden = false) {

  // OUTER CONTAINER
  const container = document.createElement("div");
  container.classList.add("card-container", "slide-in");

  // MAIN CARD
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  // =====================
  // CARD BACK
  // =====================
  const back = document.createElement("div");
  back.classList.add("card-face", "card-back");

  // =====================
  // CARD FRONT
  // =====================
  const front = document.createElement("div");
  front.classList.add("card-face", "card-front");

  // CARD IMAGE
  const img = document.createElement("img");
  img.src = `assets/cards/${getCardFileName(card)}`;
  img.alt = card;

  // IMAGE STYLING
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "cover";
  img.style.borderRadius = "10px";

  // PUT IMAGE INSIDE FRONT
  front.appendChild(img);

  // IMPORTANT:
  // BACK FIRST, FRONT SECOND
  cardDiv.appendChild(back);
  cardDiv.appendChild(front);

  // =====================
  // FLIP LOGIC
  // =====================
  if (!hidden) {
    setTimeout(() => {
      cardDiv.classList.add("flip");
    }, 100);
  }

  // ADD CARD TO CONTAINER
  container.appendChild(cardDiv);

  return container;
}

// =========================
// RENDER CARDS
// =========================
function renderCards(revealDealer = false) {
  const playerDiv = document.getElementById("player-cards");
  const dealerDiv = document.getElementById("dealer-cards");

  playerDiv.innerHTML = "";
  dealerDiv.innerHTML = "";

  playerHand.forEach(card => {
    playerDiv.appendChild(createCardElement(card));
  });

  dealerHand.forEach((card, i) => {
    const hidden = (i === 1 && !revealDealer && !isMultiplayer);
    dealerDiv.appendChild(createCardElement(card, hidden));
  });
}

// =========================
// CAMERA DIVE + MUSIC
// =========================
function startGameAnimationAndMusic() {
  document.body.classList.add("start-animation");

  const music = document.getElementById("bg-music");
  if (music && music.paused) {
    music.volume = 0;
    music.play().catch(() => {});
    const fade = setInterval(() => {
      if (music.volume < 1) {
        music.volume = Math.min(1, music.volume + 0.02);
      } else {
        clearInterval(fade);
      }
    }, 120);
  }
}

// =========================
// SINGLE-PLAYER GAME FLOW
// =========================
function startGame() {
  isMultiplayer = false;
  playerHand = [getRandomCard(), getRandomCard()];
  dealerHand = [getRandomCard(), getRandomCard()];
  document.getElementById("result").innerText = "";
  renderCards();
  startGameAnimationAndMusic();
}

function hit() {
  if (isMultiplayer) {
    multiplayerHit();
    return;
  }

  playerHand.push(getRandomCard());
  renderCards();

  if (calculateHand(playerHand) > 21) {
    document.getElementById("result").innerText = "💥 Bust!";
  }
}

function stand() {
  if (isMultiplayer) {
    multiplayerStand();
    return;
  }

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

// =========================
// MULTIPLAYER LOGIC (Option A)
// =========================
function startMultiplayer() {
  const numStr = prompt("Enter number of players (2–6):");
  const num = parseInt(numStr);
  if (isNaN(num) || num < 2 || num > 6) {
    alert("Invalid number of players.");
    return;
  }

  players = [];
  for (let i = 0; i < num; i++) {
    let name = prompt(`Enter name for Player ${i + 1}:`);
    if (!name) name = `Player ${i + 1}`;
    players.push({ name, hand: [], busted: false });
  }

  dealerObj = { name: "Dealer", hand: [] };

  players.forEach(p => {
    p.hand = [getRandomCard(), getRandomCard()];
  });
  dealerObj.hand = [getRandomCard(), getRandomCard()];

  isMultiplayer = true;
  currentPlayerIndex = 0;

  startPlayerTurn(players[0]);
  startGameAnimationAndMusic();
}

function startPlayerTurn(player) {
  document.getElementById("result").innerText = `${player.name}'s turn`;
  playerHand = player.hand;
  dealerHand = dealerObj.hand;
  renderCards();
}

function multiplayerHit() {
  const player = players[currentPlayerIndex];
  player.hand.push(getRandomCard());
  playerHand = player.hand;
  renderCards();

  if (calculateHand(player.hand) > 21) {
    player.busted = true;
    alert(`${player.name} busted!`);
    nextPlayer();
  }
}

function multiplayerStand() {
  nextPlayer();
}

function nextPlayer() {
  currentPlayerIndex++;
  if (currentPlayerIndex >= players.length) {
    dealerTurnMulti();
  } else {
    startPlayerTurn(players[currentPlayerIndex]);
  }
}

function dealerTurnMulti() {
  dealerHand = dealerObj.hand;
  while (calculateHand(dealerHand) < 17) {
    dealerHand.push(getRandomCard());
  }
  dealerObj.hand = dealerHand;
  renderCards(true);
  showResultsMulti();
}

function showResultsMulti() {
  const dealerTotal = calculateHand(dealerObj.hand);
  let resultText = `Dealer: ${dealerTotal}\n\n`;

  players.forEach(p => {
    const total = calculateHand(p.hand);
    resultText += `${p.name} (${total}) → `;

    if (p.busted) resultText += "Busted\n";
    else if (dealerTotal > 21) resultText += "Win (Dealer bust)\n";
    else if (total > dealerTotal) resultText += "Win\n";
    else if (total < dealerTotal) resultText += "Lose\n";
    else resultText += "Tie\n";
  });

  alert(resultText);
  document.getElementById("result").innerText = "Multiplayer round finished.";
}

// =========================
// CHATBOT SYSTEM
// =========================
const helpTopics = {
  "hit": "Hit means you take another card.",
  "stand": "Stand means you stop taking cards.",
  "bust": "Bust means your total is over 21 and you lose.",
  "ace": "An Ace counts as 11 unless that would bust you, then it counts as 1.",
  "dealer": "The dealer must hit until they reach 17 in this version."
};

function getSuggestion(player, dealer) {
  if (player <= 11) return "You should hit.";
  if (player >= 17) return "You should stand.";
  if (player === 16 && dealer >= 7) return "You should hit.";
  if (player === 12 && dealer >= 4 && dealer <= 6) return "You should stand.";
  return "This is close — hit if you feel risky, stand if you want to play safe.";
}

function handleChatMessage(msg) {
  msg = msg.toLowerCase();

  for (let key in helpTopics) {
    if (msg.includes(key)) {
      return helpTopics[key];
    }
  }

  if (msg.includes("suggest") || msg.includes("help me decide") || msg.includes("what should i do")) {
    let p = calculateHand(playerHand);
    let d = calculateHand(dealerHand);
    return `Your total is ${p}, dealer shows ${d}. ${getSuggestion(p, d)}`;
  }

  if (msg.startsWith("/set")) {
    let parts = msg.split(" ");
    let setting = parts[1];
    let value = parts[2];

    if (gameSettings.hasOwnProperty(setting)) {
      if (value === "true") value = true;
      if (value === "false") value = false;
      gameSettings[setting] = value;
      return `Setting '${setting}' updated to ${value}.`;
    }

    return "Unknown setting. Try: dealerHitsSoft17, decks, animations, difficulty.";
  }

  return "Ask me about rules (hit, stand, bust, ace, dealer) or type 'suggest' for a move. Use /set to change settings.";
}

function sendChat() {
  const input = document.getElementById("chat-input");
  const body = document.getElementById("chat-body");
  if (!input || !body) return;

  const msg = input.value.trim();
  if (!msg) return;

  body.innerHTML += `<div><b>You:</b> ${msg}</div>`;
  const reply = handleChatMessage(msg);
  body.innerHTML += `<div><b>Bot:</b> ${reply}</div>`;

  input.value = "";
  body.scrollTop = body.scrollHeight;
}

// =========================
// INITIAL START
// =========================
startGame();

