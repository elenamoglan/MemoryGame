// Global Arrays
const startGameContainer = document.querySelector(".StartGame");
const startGamePlayers = document.querySelector(".player-number");
const startGameCards = document.querySelectorAll(".StartGame .card");
const startGame = document.querySelector(".StartGame button");

// Access the .deck
const deck = document.querySelector(".deck");
// Create an empty array to store the opened cards
let opened = [];
// Create an empty array to store the matched cards
let matched = [];

let currentPlayer = 1; // Player 1 starts
let player1Score = 0;
let player2Score = 0;

// Access the modal
const modal = document.getElementById("modal");
const score = document.querySelector(".score-panel");

// Access the reset button
const reset = document.querySelector(".reset-btn");
// Access the play again button
const playAgain = document.querySelector(".play-again-btn");

// Select the class moves-counter and change it's HTML
// const movesCount = document.querySelector(".moves-counter");

let levels = 2,
  columns = 2,
  rows = 2,
  cardOne,
  CardTwo,
  IsPreventClick = true;

const tooltip = document.querySelector(".tooltip-container");

// Create variable for moves counter, start the count at zero
//let moves = 0;

// Access the <ul> element for the star rating section and then the <li> elements within it
//const star = document.getElementById("star-rating").querySelectorAll(".star");
// Variable to keep track of how many stars are left
//let starCount = 3;

const turnIndicator = document.getElementById("turn-indicator");
const player1Display = document.getElementById("player1-score");
const player2Display = document.getElementById("player2-score");

// Get the span tag for the timer.
const timeCounter = document.querySelector(".timer");
// To use this variable to stop the time started in timer
let time;
// Create variables for time count, start all at zero
let minutes = 0;
let seconds = 0;
// For use in the click card event listener
let timeStart = false;
let preloadedImages = [];

/*
Start Game: Shuffle the deck, create <img> 
tags and append to the deck with the new shuffled content
*/
startGameCards.forEach((element) => {
  // Invoke shuffle function and store in variable
  element.addEventListener("click", (e) => {
    startGameCards.forEach((el) => {
      el.classList.remove("active");
    });

    e.target.parentElement.classList.add("active");
    levels = parseInt(e.target.parentElement.getAttribute("level"));
    columns = parseInt(e.target.parentElement.getAttribute("column"));
    rows = parseInt(e.target.parentElement.getAttribute("row"));
  });
});

startGame.addEventListener("click", async (e) => {
  if (tooltip) {
    tooltip.style.display = "none";
  }
  startGameContainer.style.display = "none";
  // startGamePlayers.style.display = "none";
  deck.style.display = "grid";
  deck.style.gridTemplateColumns = `repeat(${columns}, 100px)`;
  deck.style.gridTemplateRows = `repeat(${rows}, 100px)`;

  // Create cards immediately with preloaded images if available
  if (preloadedImages.length >= levels * 2) {
    createCards();
  } else {
    // Show loading state only if images aren't preloaded
    deck.innerHTML = Array(levels * 2)
      .fill(
        `
      <div class="card">
        <div class="front">
          <i class="fa-solid fa-question"></i>
        </div>
        <div class="back">
          <div class="placeholder" style="width: 100%; height: 100%; background: #f0f0f0; border-radius: 10px;"></div>
        </div>
      </div>
    `
      )
      .join("");
    score.style.display = "block";

    // Fetch and create cards
    await fetchAndPreloadImages(levels);
    createCards();
  }
});

async function fetchAndPreloadImages(count) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?count=${count}&client_id=J-x7DxCXWt471YtLQFEtQeboMfwwLNPnLKUfuJGON9g`
    );
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();

    // Create the image array
    const imageUrls = [
      ...data.map((img) => img.urls.small),
      ...data.map((img) => img.urls.small),
    ].sort(() => Math.random() - 0.5);

    // Preload all images before returning
    await Promise.all(
      imageUrls.map((url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
      })
    );

    preloadedImages = imageUrls;
  } catch (error) {
    console.error("Error fetching images:", error.message);
    alert("Failed to load images.");
  }
}

async function createCards() {
  deck.innerHTML = "";
  if (preloadedImages.length === 0) {
    alert("Images are still loading. Please wait...");
    return;
  }
  deck.innerHTML = preloadedImages
    .map(
      (src) => `
      <div class="card" onclick="flipCard(this)">
        <div class="front">
          <i class="fa-solid fa-question"></i>
        </div>
        <div class="back">
          <img src="${src}" alt="Card Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">
        </div>
      </div>
    `
    )
    .join("");

  score.style.display = "block";

  document.querySelectorAll(".deck .card").forEach((card, index) => {
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Memory card " + (index + 1));
    card.setAttribute("tabindex", "0");
  });
}

//Flip the card and display cards img
function flipCard(card) {
  if (!IsPreventClick) return;
  if (timeStart === false) {
    timeStart = true;
    timer();
  }

  if (cardOne != card && IsPreventClick) {
    playFlipSound();
    card.classList.add("flip");

    if (!cardOne) {
      cardOne = card;
      return;
    }

    CardTwo = card;
    IsPreventClick = false;

    let cardOneValue = cardOne.querySelector(".back img").src;
    let cardTwoValue = CardTwo.querySelector(".back img").src;

    match(cardOneValue, cardTwoValue);
  }
}

/*
Update the timer in the HTML for minutes and seconds
This timer() function is invoked in the event listener
on the first card click
*/
function timer() {
  // Update the count every 1 second
  time = setInterval(function () {
    seconds++;
    if (seconds === 60) {
      minutes++;
      seconds = 0;
    }
    timeCounter.innerHTML =
      "<i class='fa fa-hourglass-start'></i>" +
      " Timer: " +
      minutes +
      " Mins " +
      seconds +
      " Secs";
  }, 1000);
}

function stopTime() {
  clearInterval(time);
}

/*
Reset all global variables and the content of HTML elements
timer, moves, and the moves and timer inner HTML
*/
function resetEverything() {
  deck.innerHTML = "";
  preloadedImages = [];
  stopTime();
  timeStart = false;
  seconds = 0;
  minutes = 0;
  timeCounter.innerHTML =
    "<i class='fa fa-hourglass-start'></i>" + " Timer: 00:00";
  // // Reset moves count and reset its inner HTML
  // moves = 0;
  // movesCount.innerHTML = 0;
  // Clear both arrays that hold the opened and matched cards
  matched = [];
  opened = [];
  player1Score = 0;
  player2Score = 0;
  currentPlayer = 1;
  player1Display.textContent = 0;
  player2Display.textContent = 0;
  turnIndicator.textContent = "Player 1's Turn";
  document.getElementById("player1").classList.add("active");
  document.getElementById("player2").classList.remove("active");
  startGameContainer.style.display = "grid";
  deck.style.display = "none";
  score.style.display = "none";
  tooltip.style.display = "block";
  IsPreventClick = true;
  cardOne = "";
  CardTwo = "";
}

/*
Increment the moves counter.  To be called at each
comparison for every two cards compared add one to the count
*/
// function movesCounter() {
//   // Update the html for the moves counter
//   movesCount.innerHTML++;
//   // Keep track of the number of moves for every pair checked
//   moves++;
// }

function updateScore() {
  if (currentPlayer === 1) {
    player1Score++;
    player1Display.textContent = player1Score;
  } else {
    player2Score++;
    player2Display.textContent = player2Score;
  }
}

function switchTurn() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;

  document
    .getElementById("player1")
    .classList.toggle("active", currentPlayer === 1);
  document
    .getElementById("player2")
    .classList.toggle("active", currentPlayer === 2);
}

/*
If the two cards match, keep the cards open and
apply class of match
*/
function match(cardOneValue, cardTwoValue) {
  if (cardOneValue === cardTwoValue) {
    matched.push(cardOneValue, cardTwoValue);

    playMatchSound();

    // Add match class for disappearing animation
    cardOne.classList.add("match");
    CardTwo.classList.add("match");

    // Remove click handlers
    cardOne.removeAttribute("onclick");
    CardTwo.removeAttribute("onclick");

    // Update score after the animation
    setTimeout(() => {
      updateScore();
    }, 500);

    cardOne = "";
    CardTwo = "";
    IsPreventClick = true;
    winGame();
    return;
  } else {
    setTimeout(function () {
      cardOne.classList.add("shake");
      CardTwo.classList.add("shake");
      document.body.style.pointerEvents = "auto";
    }, 500);

    setTimeout(function () {
      cardOne.classList.remove("shake", "flip");
      CardTwo.classList.remove("shake", "flip");
      cardOne = "";
      CardTwo = "";
      IsPreventClick = true;
      switchTurn();
    }, 1200);
  }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown"
  ) {
    e.preventDefault();
    navigateCards(e.key);
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    selectCard();
  }
});

let selectedCardIndex = -1;

const navigateCards = (direction) => {
  //const cards = document.querySelectorAll(".deck .card:not(.match)");
  const cards = document.querySelectorAll(".deck .card");

  if (!cards.length) return;

  let oldSelectedCardIndex = selectedCardIndex;

  if (selectedCardIndex === -1) {
    selectedCardIndex = 0;
  } else {
    switch (direction) {
      case "ArrowLeft":
        selectedCardIndex = Math.max(0, selectedCardIndex - 1);
        break;
      case "ArrowRight":
        selectedCardIndex = Math.min(cards.length - 1, selectedCardIndex + 1);
        break;
      case "ArrowUp":
        selectedCardIndex = Math.max(0, selectedCardIndex - columns);
        break;
      case "ArrowDown":
        selectedCardIndex = Math.min(
          cards.length - 1,
          selectedCardIndex + columns
        );
        break;
    }

    if (!cards[selectedCardIndex].classList.contains("match")) {
      cards[oldSelectedCardIndex].classList.remove("keyboard-focus");
      cards[selectedCardIndex].classList.add("keyboard-focus");
    } else {
      selectedCardIndex = oldSelectedCardIndex;
    }
  }
};

const selectCard = () => {
  const cards = document.querySelectorAll(".deck .card");

  if (selectedCardIndex >= 0 && selectedCardIndex < cards.length) {
    flipCard(cards[selectedCardIndex]);
  }
};

// Sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const playSound = (frequency, duration) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
  }, duration);
};

const playMatchSound = () => playSound(800, 200);
const playFlipSound = () => playSound(400, 100);
const playWinSound = () => {
  playSound(523.25, 200); // C5
  setTimeout(() => playSound(659.25, 200), 200); // E5
  setTimeout(() => playSound(783.99, 400), 400); // G5
};

// Confetti effect
const createConfetti = () => {
  const colors = ["#02ccba", "#aa7ecd", "#ffffff"];

  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.animationDelay = Math.random() * 3 + "s";
    confetti.style.opacity = Math.random();
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 3000);
  }
};

/*
Get stats on the time, how many moves, and star rating
for the end game and update the modal with these stats
*/
function AddStats() {
  // Access the modal content div
  const stats = document.querySelector(".modal-content");
  // Create three different paragraphs
  for (let i = 1; i <= 3; i++) {
    // Create a new Paragraph
    const statsElement = document.createElement("p");
    // Add a class to the new Paragraph
    statsElement.classList.add("stats");
    // Add the new created <p> tag to the modal content
    stats.appendChild(statsElement);
  }
  // Select all p tags with the class of stats and update the content
  let p = stats.querySelectorAll("p.stats");
  // Set the new <p> to have the content of stats (time, moves and star rating)
  p[0].innerHTML =
    "Time to complete: " + minutes + " Minutes and " + seconds + " Seconds";
  // p[1].innerHTML = "Moves Taken: " + moves;
  // p[2].innerHTML = "Your Star Rating is: " + starCount + " out of 3";
}

/*
Display the modal on winning the game
*/
function displayModal() {
  // Access the modal <span> element (x) that closes the modal
  const modalClose = document.getElementsByClassName("close")[0];
  // When the game is won set modal to display block to show it
  modal.style.display = "flex";

  // When the user clicks on <span> (x), close the modal
  modalClose.onclick = function () {
    modal.style.display = "none";
  };
  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

/*
Check the length of the matched array and if there
are 8 pairs 16 cards all together then the game is won.
Stop the timer update the modal with stats and show the modal
*/
function winGame() {
  if (matched.length === levels * 2) {
    stopTime();

    let winner;
    if (player1Score > player2Score) {
      winner = "Player 1 Wins!";
    } else if (player2Score > player1Score) {
      winner = "Player 2 Wins!";
    } else {
      winner = "It's a Tie!";
    }

    playWinSound();
    createConfetti();

    const winnerMessage = document.getElementById("winner-message");
    winnerMessage.textContent = `Congratulations! ${winner}`;

    AddStats();
    setTimeout(() => {
      displayModal();
    }, 1000);
  }
}

/*----------------------------------  
Restart Buttons
------------------------------------*/
/*
Event Listener to listen for a click on the reset
button, once clicked call resetEverything()
*/
reset.addEventListener("click", resetEverything);

/*
Event Listener to listen for a click on the play
again button, once clicked call resetEverything()
*/
playAgain.addEventListener("click", function () {
  modal.style.display = "none";
  resetEverything();
});
