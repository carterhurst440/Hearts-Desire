const suits = ["hearts", "diamonds", "clubs", "spades"];
const ranks = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

const suitSymbols = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const payTable = {
  1: 1,
  2: 3,
  3: 10,
  4: 25,
  5: 100,
};

const state = {
  deck: [],
  drawnCards: [],
  heartCards: [],
  balance: 500,
  bet: 25,
  roundActive: false,
  awaitingDecision: false,
  heartsCount: 0,
  neutralCount: 0,
  message: "Welcome to Heart's Desire.",
};

const balanceEl = document.getElementById("balance");
const currentBetEl = document.getElementById("current-bet");
const heartsDrawnEl = document.getElementById("hearts-drawn");
const neutralCountEl = document.getElementById("neutral-count");
const heartMeterEl = document.getElementById("heart-meter");
const runCountEl = document.getElementById("run-count");
const heartCountEl = document.getElementById("heart-count");
const messageEl = document.getElementById("message");
const meterFillEl = document.getElementById("meter-fill");
const dealerHandEl = document.getElementById("dealer-hand");
const playerHandEl = document.getElementById("player-hand");

const dealBtn = document.getElementById("deal");
const pressBtn = document.getElementById("press");
const withdrawBtn = document.getElementById("withdraw");
const resetBtn = document.getElementById("reset-game");
const clearBetBtn = document.getElementById("clear-bet");
const chipButtons = document.querySelectorAll(".chip[data-chip]");

function formatCurrency(amount) {
  return `$${amount.toLocaleString()}`;
}

function createDeck() {
  const deck = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({
        suit,
        rank,
        symbol: suitSymbols[suit],
      });
    });
  });
  return shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function drawCard() {
  if (state.deck.length === 0) {
    state.deck = createDeck();
  }
  return state.deck.pop();
}

function renderCard(card, index) {
  const cardEl = document.createElement("div");
  cardEl.className = `card ${card.suit}`;

  const topCorner = document.createElement("span");
  topCorner.className = "corner top-left";
  topCorner.innerText = `${card.rank}\n${card.symbol}`;

  const bottomCorner = document.createElement("span");
  bottomCorner.className = "corner bottom-right";
  bottomCorner.innerText = `${card.rank}\n${card.symbol}`;

  const symbol = document.createElement("span");
  symbol.className = "symbol";
  symbol.innerText = card.symbol;

  cardEl.appendChild(topCorner);
  cardEl.appendChild(symbol);
  cardEl.appendChild(bottomCorner);

  requestAnimationFrame(() => {
    setTimeout(() => cardEl.classList.add("animate"), index * 60);
  });

  return cardEl;
}

function renderHands() {
  dealerHandEl.innerHTML = "";
  state.drawnCards.forEach((card, index) => {
    const cardEl = renderCard(card, index);
    dealerHandEl.appendChild(cardEl);
  });

  playerHandEl.innerHTML = "";
  state.heartCards.forEach((card, index) => {
    const cardEl = renderCard(card, index);
    playerHandEl.appendChild(cardEl);
  });
}

function updateHud() {
  balanceEl.innerText = formatCurrency(state.balance);
  currentBetEl.innerText = formatCurrency(state.bet);
  heartsDrawnEl.innerText = `${state.heartsCount}`;
  neutralCountEl.innerText = `${state.neutralCount} / 4`;
  heartMeterEl.innerText = `${state.heartsCount} / 5 hearts`;
  runCountEl.innerText = `${state.drawnCards.length} card${state.drawnCards.length === 1 ? "" : "s"}`;
  heartCountEl.innerText = `${state.heartsCount}`;
  messageEl.innerText = state.message;

  const fillPercent = Math.min(100, Math.round((state.heartsCount / 5) * 100));
  meterFillEl.style.width = `${fillPercent}%`;

  chipButtons.forEach((chip) => {
    chip.disabled = state.roundActive || state.bet + Number(chip.dataset.chip) > state.balance;
  });
  clearBetBtn.disabled = state.roundActive || state.bet === 0;

  dealBtn.disabled = state.roundActive || state.bet === 0 || state.bet > state.balance;
  pressBtn.disabled = !state.roundActive || !state.awaitingDecision;
  withdrawBtn.disabled = !state.roundActive || !state.awaitingDecision;
}

function resetRoundState() {
  state.drawnCards = [];
  state.heartCards = [];
  state.heartsCount = 0;
  state.neutralCount = 0;
  state.awaitingDecision = false;
}

function startHand() {
  if (state.roundActive) return;
  if (state.bet === 0) {
    state.message = "Set a wager to begin.";
    updateHud();
    return;
  }
  if (state.bet > state.balance) {
    state.message = "Insufficient balance for that bet.";
    updateHud();
    return;
  }

  state.roundActive = true;
  resetRoundState();
  state.balance -= state.bet;
  state.deck = createDeck();
  state.message = "The dealer reveals your fate...";

  renderHands();
  updateHud();
  setTimeout(dealNextCard, 400);
}

function scheduleNextCard() {
  if (!state.roundActive || state.awaitingDecision) return;
  setTimeout(dealNextCard, 700);
}

function dealNextCard() {
  if (!state.roundActive || state.awaitingDecision) return;

  const card = drawCard();
  state.drawnCards.push(card);
  renderHands();

  if (card.suit === "spades") {
    const cardFace = `${card.rank}${card.symbol}`;
    state.message = `${cardFace} ends the hand. The bet is lost.`;
    concludeRound();
    return;
  }

  if (card.suit === "hearts") {
    state.heartCards.push(card);
    state.heartsCount += 1;
    renderHands();

    if (card.rank === "Q") {
      state.message = `Queen of hearts! Instant 2:1 payout (${formatCurrency(state.bet * 2)}).`;
      concludeRound({ multiplier: 2 });
      return;
    }

    if (state.heartsCount >= 5) {
      state.message = `Fifth heart claimed! Max payout 100:1 (${formatCurrency(state.bet * 100)}).`;
      concludeRound({ multiplier: 100 });
      return;
    }

    const payout = payTable[state.heartsCount];
    state.awaitingDecision = true;
    state.message = `Heart ${state.heartsCount}! Ladder pays ${payout}:1. Withdraw or press?`;
    updateHud();
    return;
  }

  state.neutralCount += 1;
  if (state.neutralCount >= 4) {
    state.message = "Fourth neutral card. The bet is lost.";
    concludeRound();
    return;
  }

  const neutralName = card.suit === "clubs" ? "Club" : "Diamond";
  state.message = `Neutral ${neutralName}. ${state.neutralCount}/4 drawn.`;
  updateHud();
  scheduleNextCard();
}

function pressHand() {
  if (!state.roundActive || !state.awaitingDecision) return;
  state.awaitingDecision = false;
  state.message = "Pressing on for another heart...";
  updateHud();
  scheduleNextCard();
}

function withdrawHand() {
  if (!state.roundActive || !state.awaitingDecision) return;
  const multiplier = payTable[state.heartsCount] ?? 0;
  const winnings = state.bet * multiplier;
  const totalReturn = state.bet + winnings;
  state.message = `Withdrawn with ${state.heartsCount} heart${state.heartsCount === 1 ? "" : "s"}. Paid ${multiplier}:1 (${formatCurrency(winnings)}), total return ${formatCurrency(totalReturn)}.`;
  concludeRound({ multiplier });
}

function concludeRound({ multiplier = null } = {}) {
  let payout = 0;
  if (multiplier !== null && multiplier > 0) {
    payout = state.bet * (multiplier + 1);
  }

  state.balance += payout;
  state.roundActive = false;
  state.awaitingDecision = false;

  updateHud();
}

function resetGame() {
  state.balance = 500;
  state.bet = 25;
  state.message = "Bank reset. Fresh fortune awaits.";
  state.roundActive = false;
  resetRoundState();
  renderHands();
  updateHud();
}

function clearBet() {
  if (state.roundActive) return;
  state.bet = 0;
  state.message = "Bet cleared. Choose your stake.";
  updateHud();
}

function adjustBet(amount) {
  if (state.roundActive) return;
  const maxBet = state.balance;
  state.bet = Math.min(state.bet + amount, maxBet);
  state.message = `Bet set to ${formatCurrency(state.bet)}.`;
  updateHud();
}

function bindEvents() {
  dealBtn.addEventListener("click", startHand);
  pressBtn.addEventListener("click", pressHand);
  withdrawBtn.addEventListener("click", withdrawHand);
  resetBtn.addEventListener("click", resetGame);
  clearBetBtn.addEventListener("click", clearBet);
  chipButtons.forEach((chip) =>
    chip.addEventListener("click", () => adjustBet(Number(chip.dataset.chip)))
  );
}

function init() {
  state.deck = createDeck();
  bindEvents();
  renderHands();
  updateHud();
}

document.addEventListener("DOMContentLoaded", init);
