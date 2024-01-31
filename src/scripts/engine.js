document.addEventListener('DOMContentLoaded', async (event) => {
    const state = {
        score: {
            playerScore: 0,
            computerScore: 0,
            scoreBox: document.getElementById("score_points")
        },
        cardSprite: {
            avatar: document.getElementById("card-image"),
            name: document.getElementById("card-name"),
            type: document.getElementById("card-type")
        },
        fieldCards: {
            player: document.getElementById("player-field-card"),
            computer: document.getElementById("computer-field-card")
        },
        button: document.getElementById("next-duel")
    };

    const player = {
        player1: "player-cards",
        computer: "computer-cards"
    };

    const cardData = [
        {
            id: 0,
            name: "Blue Eyes White Dragon",
            type: "Paper",
            img: "./src/assets/icons/dragon.png",
            WinOf: [1],
            LoseOf: [2]
        }, {
            id: 1,
            name: "Dark Magician",
            type: "Rock",
            img: "./src/assets/icons/magician.png",
            WinOf: [2],
            LoseOf: [0]
        }, {
            id: 2,
            name: "Exodia",
            type: "Scissors",
            img: "./src/assets/icons/exodia.png",
            WinOf: [0],
            LoseOf: [1]
        },
    ];

    let isCardSelected = false;

    function getRandomCardId() {
        return Math.floor(Math.random() * cardData.length);
    }

    function setCardsField(cardId) {
        const computerCardId = getRandomCardId();
        const computerCardImage = document.querySelector(`#computer-cards img[data-id='${computerCardId}']`);

        if (computerCardImage) {
            const cardImageRect = computerCardImage.getBoundingClientRect();
            const ComputerFieldCardRect = document.getElementsByClassName('card-infield')[1].getBoundingClientRect();

            const scaleX = 140 / cardImageRect.width;
            const scaleY = 196 / cardImageRect.height;

            computerCardImage.style.transform = `translate(${
                ComputerFieldCardRect.left + 36 - cardImageRect.left
            }px, ${
                ComputerFieldCardRect.top + 50 - cardImageRect.top
            }px) scale(${scaleX}, ${scaleY})`;
            computerCardImage.style.transition = 'transform 0.5s';
        }


        setTimeout(() => {
            state.fieldCards.computer.style.display = "block";
            document.getElementById('flip-box-front-img').src = "./src/assets/icons/card-back.png";
            document.querySelector('.flip-box .flip-box-inner').style.transform = "rotateY(180deg)";
        }, 500);

        setTimeout(async () => {
            await removeAllCardImages();
            state.fieldCards.player.style.display = "block";
            state.fieldCards.player.src = cardData[cardId].img;
            state.fieldCards.computer.src = cardData[computerCardId].img;
        }, 500);

        setTimeout(async () => {
            const duelResults = await checkDuelResults(cardId, computerCardId);
            await updateScore();
            await drawButton(duelResults);
        }, 1000);
    }

    async function checkDuelResults(playerCardId, computerCardId) {
        const playerCard = cardData[playerCardId];
        let duelResults = "Empate";

        if (playerCard.WinOf.includes(computerCardId)) {
            duelResults = "Ganhou";
            await playAudio("win");
            state.score.playerScore ++;
        } else if (playerCard.LoseOf.includes(computerCardId)) {
            duelResults = "Perdeu";
            await playAudio("lose");
            state.score.computerScore ++;
        }

        return duelResults;
    }

    function createCardImage(randomIdCard, fieldSide) {
        const cardDiv = document.createElement("div");
        const cardImage = document.createElement("img");
        cardImage.setAttribute("height", "100px");
        cardImage.setAttribute("src", "./src/assets/icons/card-back.png");
        cardImage.setAttribute("data-id", randomIdCard);

        cardDiv.appendChild(cardImage);

        if (fieldSide === player.player1) {
            cardDiv.classList.add("card", "card-animationPlayer");
            setTimeout(() => {
                cardDiv.classList.remove("card-animationPlayer"); // Remove the animation class here
            }, 500);
            cardDiv.addEventListener("mouseover", () => drawSelectCard(randomIdCard));
            cardDiv.addEventListener("click", async () => {
                if (! isCardSelected) {
                    isCardSelected = true;
                    const playerFieldCardRect = document.getElementsByClassName('card-infield')[0].getBoundingClientRect();
                    const cardImageRect = cardDiv.getBoundingClientRect();
                    const scaleX = 140 / (cardImageRect.width / 1.2);
                    const scaleY = 196 / (cardImageRect.height / 1.2);

                    cardDiv.style.transform = `translate(${
                        playerFieldCardRect.left + 29 - cardImageRect.left
                    }px, ${
                        playerFieldCardRect.top + 39 - cardImageRect.top
                    }px) scale(${scaleX}, ${scaleY})`;
                    cardDiv.style.transition = 'transform 0.7s';
                    setTimeout(() => setCardsField(cardImage.getAttribute("data-id")), 700);
                }
            });
            cardImage.setAttribute("src", cardData[randomIdCard].img);
        } else {
            cardDiv.classList.add("card", "card-animationCPU");
            setTimeout(() => {
                cardDiv.classList.remove("card-animationCPU"); // Remove the animation class here
            }, 500);
        }

        return cardDiv;
    }

    function removeAllCardImages() {
        const cards = document.querySelectorAll(".card-box.framed div");
        cards.forEach((card) => card.classList.add("card-animationCPU"));
        setTimeout(() => {
            cards.forEach((card) => card.remove());
        }, 500);
    }

    function drawCards(cardNumbers, fieldSide) {
        for (let i = 0; i < cardNumbers; i++) {
            const randomIdCard = getRandomCardId();
            const cardImage = createCardImage(randomIdCard, fieldSide);
            document.getElementById(fieldSide).appendChild(cardImage);
        }
    }

    function drawSelectCard(index) {
        state.cardSprite.avatar.src = cardData[index].img;
        state.cardSprite.name.innerText = cardData[index].name;
        state.cardSprite.type.innerText = "Attribute: " + cardData[index].type;
    }

    function drawButton(text) {
        state.button.innerText = text;
        state.button.style.display = "block";
    }

    function resetDuel() {
        isCardSelected = false;
        state.cardSprite.avatar.src = "";
        state.button.style.display = "none";
        state.fieldCards.player.style.display = "none";
        state.fieldCards.computer.style.display = "none";
        document.querySelector('.flip-box .flip-box-inner').style.transform = '';
        document.getElementById('flip-box-front-img').src = "";
        drawCards(5, player.player1);
        drawCards(5, player.computer);
    }

    window.resetDuel = resetDuel;

    function playAudio(status) {
        const audio = new Audio(`./src/assets/audios/${status}.wav`);
        audio.play();
    }

    function updateScore() {
        state.score.scoreBox.innerText = `Win: ${
            state.score.playerScore
        } | Lose: ${
            state.score.computerScore
        }`;
    }

    function init() {
        drawCards(5, player.player1);
        drawCards(5, player.computer);
        const bgm = document.getElementById("bgm");
        bgm.play();
    }

    init();
});
