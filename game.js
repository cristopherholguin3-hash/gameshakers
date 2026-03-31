const cards = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6,
  "7": 7, "8": 8, "9": 9, "10": 10,
  "J": 10, "Q": 10, "K": 10, "A": 11
};

let playerHand = [];
let dealerHand = [];

function dealCard() {
  const keys = Object.keys(cards);
  return keys[Math.floor(Math.random() * keys.length)];
}

function calculateHand(hand) {
  let total = hand.reduce((sum, card) => sum + cards[card], 0);
  let aces = hand.filter(card => card === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function updateUI() {
  document.getElementById("player").innerText =
    `Player: ${playerHand.join(", ")} (Total: ${calculateHand(playerHand)})`;

  document.getElementById("dealer").innerText =
    `Dealer: ${dealerHand[0]}, ?`;

  if (calculateHand(playerHand) > 21) {
    document.getElementById("result").innerText = "💥 You busted!";
  }
}

function startGame() {
  playerHand = [dealCard(), dealCard()];
  dealerHand = [dealCard(), dealCard()];
  document.getElementById("result").innerText = "";
  updateUI();
}

function hit() {
  playerHand.push(dealCard());
  updateUI();
}

function stand() {
  while (calculateHand(dealerHand) < 17) {
    dealerHand.push(dealCard());
  }

  const playerTotal = calculateHand(playerHand);
  const dealerTotal = calculateHand(dealerHand);

  document.getElementById("dealer").innerText =
    `Dealer: ${dealerHand.join(", ")} (Total: ${dealerTotal})`;

  if (dealerTotal > 21) {
    result = "🎉 Dealer busted! You win!";
  } else if (dealerTotal > playerTotal) {
    result = "😞 Dealer wins.";
  } else if (dealerTotal < playerTotal) {
    result = "🎉 You win!";
  } else {
    result = "🤝 It's a tie!";
  }

  document.getElementById("result").innerText = result;
}

startGame();
