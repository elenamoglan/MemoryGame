// Global Arrays
const startGameContainer = document.querySelector(".StartGame");
const startGameCards = document.querySelectorAll(".StartGame .card[level]");
const playerCards = document.querySelectorAll(".player-select .card");
const startGame = document.querySelector(".StartGame button");

// Access the .deck
const deck = document.querySelector(".deck");
// Create an empty array to store the opened cards
let opened = [];
// Create an empty array to store the matched cards
let matched = [];

let currentPlayer = 1;
let player1Score = 0;
let player2Score = 0;
let isMultiplayer = false;
let moves = 0;
let player1Name = "Player 1";
let player2Name = "Player 2";

// Access the modal
const modal = document.getElementById("modal");
const score = document.querySelector(".score-panel");

// Access the reset button
const reset = document.querySelector(".reset-btn");
// Access the play again button
const playAgain = document.querySelector(".play-again-btn");

let levels = 2,
  columns = 2,
  rows = 2,
  cardOne,
  CardTwo,
  IsPreventClick = true,
  totalCards = 0;

const tooltip = document.querySelector(".tooltip-container");

const turnIndicator = document.getElementById("turn-indicator");
const player1Display = document.getElementById("player1-score");
const player2Display = document.getElementById("player2-score");
const movesDisplay = document.getElementById("single-player-score");
const peekButton = document.querySelector(".peek-btn");
const peekCount = document.getElementById("peek-count");
let peekUsesLeft = 2;

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

// Leaderboard functionality
const difficultyMap = {
  2: "easy",
  6: "normal",
  8: "hard",
  0: "custom", // Add custom difficulty
};

function getLeaderboard(difficulty) {
  const leaderboard = localStorage.getItem(`leaderboard_${difficulty}`);
  return leaderboard ? JSON.parse(leaderboard) : [];
}

function saveScore(difficulty, moves, time, playerName) {
  const leaderboard = getLeaderboard(difficulty);
  const newScore = {
    playerName,
    moves,
    time,
    date: new Date().toISOString(),
  };

  leaderboard.push(newScore);
  leaderboard.sort((a, b) => {
    if (a.moves !== b.moves) {
      return a.moves - b.moves;
    }
    return a.time - b.time;
  });

  // Keep only top 10 scores
  const topScores = leaderboard.slice(0, 10);
  localStorage.setItem(`leaderboard_${difficulty}`, JSON.stringify(topScores));
  updateLeaderboardDisplay(difficulty);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function updateLeaderboardDisplay(difficulty) {
  const leaderboard = getLeaderboard(difficulty);
  const tbody = document.getElementById("leaderboard-body");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (leaderboard.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No scores yet. Be the first to play!</td>
      </tr>
    `;
    return;
  }

  leaderboard.forEach((score, index) => {
    const row = document.createElement("tr");
    const date = new Date(score.date);
    row.innerHTML = `
      <td class="rank">#${index + 1}</td>
      <td class="player-name">${score.playerName || "Anonymous"}</td>
      <td class="score">${score.moves} moves</td>
      <td class="score">${formatTime(score.time)}</td>
      <td class="date">${date.toLocaleDateString()}</td>
    `;
    tbody.appendChild(row);
  });
}

// Initialize leaderboard tabs
document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-button")
      .forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    updateLeaderboardDisplay(button.dataset.difficulty);
  });
});

// Initial leaderboard display
updateLeaderboardDisplay("easy");

// Handle difficulty selection
startGameCards.forEach((element) => {
  element.addEventListener("click", (e) => {
    startGameCards.forEach((el) => {
      el.classList.remove("active");
    });

    element.classList.add("active");

    if (element.classList.contains("custom-size")) {
      // For custom size, we'll get the values when starting the game
      levels = 0; // This will be calculated based on inputs
    } else {
      levels = parseInt(element.getAttribute("level"));
      columns = parseInt(element.getAttribute("column"));
      rows = parseInt(element.getAttribute("row"));
    }
  });
});

// Update the start game click handler
startGame.addEventListener("click", async (e) => {
  // Get the currently selected difficulty and player mode
  const selectedDifficulty = document.querySelector(
    ".StartGame .card[level].active"
  );
  const selectedPlayerMode = document.querySelector(
    ".player-select .card.active"
  );

  // Validate selections
  if (!selectedDifficulty || !selectedPlayerMode) {
    alert(
      "Please select both a difficulty level and player mode before starting!"
    );
    return;
  }

  // Handle custom size
  if (selectedDifficulty.classList.contains("custom-size")) {
    const customRows = parseInt(document.getElementById("custom-rows").value);
    const customCols = parseInt(document.getElementById("custom-cols").value);

    if (
      !customRows ||
      !customCols ||
      customRows < 2 ||
      customRows > 6 ||
      customCols < 2 ||
      customCols > 6
    ) {
      alert("Please enter valid dimensions (2-6 for both rows and columns)");
      return;
    }

    // Set the game dimensions
    rows = customRows;
    columns = customCols;
    totalCards = rows * columns;
    // Ensure totalCards is even
    if (totalCards % 2 !== 0) {
      columns += 1; // Increase columns by 1 to make totalCards even
      totalCards = rows * columns;
      alert(
        `Odd numbers are not allowed. Adjusting to ${rows}x${columns} (${totalCards} cards).`
      );
    }

    levels = Math.ceil(totalCards / 2);
    console.log(levels, rows, columns);
  } else {
    // Set the game dimensions for predefined difficulties
    levels = parseInt(selectedDifficulty.getAttribute("level"));
    columns = parseInt(selectedDifficulty.getAttribute("column"));
    rows = parseInt(selectedDifficulty.getAttribute("row"));
    totalCards = rows * columns;
  }

  // Get player names
  if (isMultiplayer) {
    player1Name =
      document.getElementById("player1-name").value.trim() || "Player 1";
    player2Name =
      document.getElementById("player2-name").value.trim() || "Player 2";
    document.querySelector("#player1 h4").textContent = player1Name;
    document.querySelector("#player2 h4").textContent = player2Name;
  } else {
    player1Name =
      document.getElementById("player1-name").value.trim() || "Player 1";
  }

  if (tooltip) {
    tooltip.style.display = "none";
  }
  startGameContainer.style.display = "none";
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
    await fetchAndPreloadImages(totalCards);
    createCards();
  }
});

// Handle player mode selection
playerCards.forEach((card) => {
  card.addEventListener("click", (e) => {
    playerCards.forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
    isMultiplayer = card.getAttribute("players") === "2";

    // Update game rules tooltip and UI
    if (isMultiplayer) {
      document.querySelector(".player-scores").style.display = "flex";
      document.getElementById("turn-indicator").style.display = "block";
      document.querySelector(".single-player-score").style.display = "none";
      document.getElementById("player1-name-input").style.display = "block";
      document.getElementById("player2-name-input").style.display = "block";
    } else {
      document.querySelector(".player-scores").style.display = "none";
      document.getElementById("turn-indicator").style.display = "none";
      document.querySelector(".single-player-score").style.display = "block";
      document.getElementById("player1-name-input").style.display = "block";
      document.getElementById("player2-name-input").style.display = "none";
    }
  });
});

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
      console.warn(`Retry ${i + 1}: API responded with ${response.status}`);
    } catch (error) {
      console.warn(`Retry ${i + 1}: ${error.message}`);
    }
    await new Promise((res) => setTimeout(res, 1000)); // Wait 1 sec before retry
  }
  throw new Error("Max retries reached, could not fetch images.");
}

async function fetchAndPreloadImages(totalCards) {
  try {
    const apiUrl = `https://api.unsplash.com/search/photos?query=game&per_page=${Math.min(
      totalCards / 2,
      18
    )}&client_id=J-x7DxCXWt471YtLQFEtQeboMfwwLNPnLKUfuJGON9g`;
    const data = await fetchWithRetry(apiUrl);

    console.log("API Response:", data);

    if (!data.results || data.results.length === 0) {
      throw new Error("No images received from API.");
    }

    // Generate shuffled image pairs
    const imageUrls = [
      ...data.results.map((img) => img.urls.small),
      ...data.results.map((img) => img.urls.small),
    ];
    imageUrls.sort(() => Math.random() - 0.5);

    // Preload images
    await Promise.all(
      imageUrls.map((url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = url;
        });
      })
    );

    preloadedImages = imageUrls;
  } catch (error) {
    console.error("Error fetching images:", error.message);
    alert("Failed to load images. Using default images instead.");

    // Fallback images stored locally
    const fallbackImages = ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"];
    preloadedImages = [...fallbackImages, ...fallbackImages].sort(
      () => Math.random() - 0.5
    );
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

    if (!isMultiplayer) {
      moves++;
      movesDisplay.textContent = moves;
    }

    match(cardOneValue, cardTwoValue);
  }
}

peekButton.addEventListener("click", () => {
  if (peekUsesLeft > 0) {
    document.querySelectorAll(".deck .card").forEach((card) => {
      card.classList.add("flip");
    });
    setTimeout(() => {
      document.querySelectorAll(".deck .card").forEach((card) => {
        card.classList.remove("flip");
      });
    }, 1000);
    peekUsesLeft--;
    peekCount.textContent = peekUsesLeft;
  }
  if (peekUsesLeft === 0) {
    peekButton.disabled = true;
  }
});

function timer() {
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

function resetEverything() {
  // Stop the timer and reset time variables
  stopTime();
  timeStart = false;
  seconds = 0;
  minutes = 0;

  // Reset timer display if element exists
  if (timeCounter) {
    timeCounter.innerHTML =
      "<i class='fa fa-hourglass-start'></i> Timer: 00:00";
  }

  // Clear game state
  matched = [];
  opened = [];
  player1Score = 0;
  player2Score = 0;
  moves = 0;
  currentPlayer = 1;
  peekUsesLeft = 2;
  // Reset displays if they exist
  if (player1Display) player1Display.textContent = "0";
  if (player2Display) player2Display.textContent = "0";
  if (movesDisplay) movesDisplay.textContent = "0";
  if (turnIndicator) turnIndicator.textContent = "Player 1's Turn";
  peekCount.textContent = "2";
  peekButton.disabled = false;

  // Reset player indicators if they exist
  const player1Element = document.getElementById("player1");
  const player2Element = document.getElementById("player2");
  if (player1Element) player1Element.classList.add("active");
  if (player2Element) player2Element.classList.remove("active");

  // Reset game container displays
  if (startGameContainer) startGameContainer.style.display = "grid";
  if (deck) {
    deck.style.display = "none";
    deck.innerHTML = "";
  }
  if (score) score.style.display = "none";
  if (tooltip) tooltip.style.display = "block";

  // Reset card state
  IsPreventClick = true;
  cardOne = null;
  CardTwo = null;

  // Clear preloaded images
  preloadedImages = [];
}

function updateScore() {
  if (isMultiplayer) {
    if (currentPlayer === 1) {
      player1Score++;
      player1Display.textContent = player1Score;
    } else {
      player2Score++;
      player2Display.textContent = player2Score;
    }
  }
}

function switchTurn() {
  if (!isMultiplayer) return;

  currentPlayer = currentPlayer === 1 ? 2 : 1;
  turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;

  document
    .getElementById("player1")
    .classList.toggle("active", currentPlayer === 1);
  document
    .getElementById("player2")
    .classList.toggle("active", currentPlayer === 2);
}

function match(cardOneValue, cardTwoValue) {
  if (cardOneValue === cardTwoValue) {
    matched.push(cardOneValue, cardTwoValue);

    playMatchSound();

    cardOne.classList.add("match");
    CardTwo.classList.add("match");

    cardOne.removeAttribute("onclick");
    CardTwo.removeAttribute("onclick");

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
      if (isMultiplayer) {
        switchTurn();
      }
    }, 1200);
  }
}

function winGame() {
  if (matched.length === levels * 2) {
    stopTime();

    // Save score for single player mode
    if (!isMultiplayer) {
      const totalTime = minutes * 60 + seconds;
      const difficulty = difficultyMap[levels] || "custom";
      saveScore(difficulty, moves, totalTime, player1Name);

      // Update the active tab button to the current difficulty
      document.querySelectorAll(".tab-button").forEach((button) => {
        button.classList.remove("active");
        if (button.dataset.difficulty === difficulty) {
          button.classList.add("active");
        }
      });
    }

    let winnerMessage;
    if (isMultiplayer) {
      if (player1Score > player2Score) {
        winnerMessage = `${player1Name} Wins!`;
      } else if (player2Score > player1Score) {
        winnerMessage = `${player2Name} Wins!`;
      } else {
        winnerMessage = "It's a Tie!";
      }
    } else {
      winnerMessage = `Congratulations ${player1Name}!`;
    }

    playWinSound();
    createConfetti();

    document.getElementById("winner-message").textContent = winnerMessage;

    AddStats();
    setTimeout(() => {
      displayModal();
    }, 1000);
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

// const navigateCards = (direction) => {
//   const cards = document.querySelectorAll(".deck .card");

//   if (!cards.length) return;

//   let oldSelectedCardIndex = selectedCardIndex;

//   if (selectedCardIndex === -1) {
//     selectedCardIndex = 0;
//   } else {
//     switch (direction) {
//       case "ArrowLeft":
//         selectedCardIndex = Math.max(0, selectedCardIndex - 1);
//         break;
//       case "ArrowRight":
//         selectedCardIndex = Math.min(cards.length - 1, selectedCardIndex + 1);
//         break;
//       case "ArrowUp":
//         selectedCardIndex = Math.max(0, selectedCardIndex - columns);
//         break;
//       case "ArrowDown":
//         selectedCardIndex = Math.min(
//           cards.length - 1,
//           selectedCardIndex + columns
//         );
//         break;
//     }

//     if (!cards[selectedCardIndex].classList.contains("match")) {
//       cards[oldSelectedCardIndex].classList.remove("keyboard-focus");
//       cards[selectedCardIndex].classList.add("keyboard-focus");
//     } else {
//       selectedCardIndex = oldSelectedCardIndex;
//     }
//   }
// };
const navigateCards = (direction) => {
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
        if (selectedCardIndex - columns >= 0) {
          selectedCardIndex -= columns;
        } else {
          // Move to last card in the previous column (if exists)
          let prevColumnIndex = (selectedCardIndex % columns) - 1;
          if (prevColumnIndex >= 0) {
            selectedCardIndex = prevColumnIndex + (Math.floor(cards.length / columns) * columns);
            if (selectedCardIndex >= cards.length) selectedCardIndex -= columns;
          }
        }
        break;
      case "ArrowDown":
        if (selectedCardIndex + columns < cards.length) {
          selectedCardIndex += columns;
        } else {
          // Move to first card in next column (if exists)
          let nextColumnIndex = (selectedCardIndex % columns) + 1;
          if (nextColumnIndex < columns) {
            selectedCardIndex = nextColumnIndex;
          }
        }
        break;
    }
  }

  if (!cards[selectedCardIndex].classList.contains("match")) {
    cards[oldSelectedCardIndex].classList.remove("keyboard-focus");
    cards[selectedCardIndex].classList.add("keyboard-focus");
  } else {
    selectedCardIndex = oldSelectedCardIndex;
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

function AddStats() {
  const stats = document.querySelector(".modal-content");
  if (!stats) return;

  // Remove any existing stats
  stats.querySelectorAll("p.stats").forEach((p) => p.remove());

  for (let i = 1; i <= 3; i++) {
    const statsElement = document.createElement("p");
    statsElement.classList.add("stats");
    stats.appendChild(statsElement);
  }
  let p = stats.querySelectorAll("p.stats");
  if (p.length > 0) {
    if (isMultiplayer) {
      p[0].innerHTML =
        "Time to complete: " + minutes + " Minutes and " + seconds + " Seconds";
    } else {
      p[0].innerHTML =
        "Completed in " +
        moves +
        " moves and " +
        minutes +
        " Minutes " +
        seconds +
        " Seconds";
    }
  }
}

function displayModal() {
  const modalClose = document.getElementsByClassName("close")[0];
  modal.style.display = "flex";

  modalClose.onclick = function () {
    modal.style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

reset.addEventListener("click", resetEverything);

playAgain.addEventListener("click", function () {
  modal.style.display = "none";
  resetEverything();
});
