const _data = { /*variáveis do projeto*/
	gameOn: false,
	timeout: undefined,
	sounds: [],

	strict: false,
	playerCanPlay: false,
	score: 0,
	gameSequence: [],
	playerSequence: []
};

const _gui = {
	counter: document.querySelector(".gui__counter"),
	switch: document.querySelector(".gui__btn-switch"),
	led: document.querySelector(".gui__led"),
	strict: document.querySelector(".gui__btn--strict"),
	start: document.querySelector(".gui__btn--start"),
	pads: document.querySelectorAll(".game__pad")
}

const _soundUrls = [
	"audio/simonSound1.mp3",
	"audio/simonSound2.mp3",
	"audio/simonSound3.mp3",
	"audio/simonSound4.mp3"
];

_soundUrls.forEach(sndPath => {
	const audio = new Audio(sndPath);
	_data.sounds.push(audio);
});

_gui.switch.addEventListener("click", () => {  /*o addEventListener faz com que um evento seja ativado quando o usuário fizer alguma coisa, nesse caso, clicar no switch*/
	_data.gameOn = _gui.switch.classList.toggle("gui__btn-switch--on");

	_gui.counter.classList.toggle("gui__counter--on");
	_gui.counter.innerHTML = "--";

	_data.strict = false;
	_data.playerCanPlay = false;
	_data.score = 0;
	_data.gameSequence = [];
	_data.playerSequence = [];

	disablePads();
	changePadCursor("auto"); //o cursor do mouse começa como a setinha padrão

	_gui.led.classList.remove("gui__led--active");

});

_gui.strict.addEventListener("click", () => {
	if(!_data.gameOn)
		return;

	_data.scrict = _gui.led.classList.toggle("gui__led--active");
});

_gui.start.addEventListener("click", () => {
	startGame();
});

const padListener = (e) => { //chamada sempre que o jogador clica em um dos 4 pads
	if(!_data.playerCanPlay) //se o usuário não puder jogar
		return;

	let soundId;
	_gui.pads.forEach((pad, key) => {
		if(pad === e.target) //se o pad tocado for o mesmo que o usuário clicou
			soundId = key;
	});

	e.target.classList.add("game__pad--active");

	_data.sounds[soundId].play(); //tocando o som correspondente ao pad clicado
	_data.playerSequence.push(soundId);

	setTimeout(() => {
		e.target.classList.remove("game__pad--active");

		const currentMove = _data.playerSequence.length - 1; //verificando qual o movimento do jogador (primeiro, segundo...)
	
		if(_data.playerSequence[currentMove] !== _data.gameSequence[currentMove]){ //verificando se o jogador acertou ou errou o pad da sequencia
			//se ele errou
			_data.playerCanPlay = false;
			disablePads();
			resetOrPlayAgain();
		}
		else if(currentMove === _data.gameSequence.length - 1){ //se acertou
			newColor();
		}
	
		waitForPlayerClick();
	}, 250);
}

_gui.pads.forEach(pad => {
	pad.addEventListener("click", padListener); //sempre que um dos pads for clicado a função padListener será ativada
});

const startGame = () => {
	blink("--", () => {
		newColor();
		playSequence();
	});
}

const setScore = () => {
    const score = _data.score.toString(); // se um número for 9, seu tamanho será 1, se um número foi 30 seu tamanho será 2 (conta quantas "casas" o número tem)
	const display = "00".substring(0, 2 - score.length) + score;
	_gui.counter.innerHTML = display;
}

const newColor = () => {
	if(_data.score === 20){ //se a pontuação for 20 (pontuação máxima), reiniciar o jogo
		blink("**", startGame);
		return;
	}
	//o Math.random() retorna um valor 0 e 1; quando multiplicado por 4 ele retorna um valor entre 0 e 4 (os pads são numerados como 0,1,2 e 3)
	_data.gameSequence.push(Math.floor(Math.random() * 4)); //arredonda um valor para baixo (o Math.ceil arredonda para cima e o math.round arredonda para baixo se o decimal for menor que 50 e para cima se for maior)
	_data.score++;
	
	setScore();
	playSequence();
}

const playSequence = () => {
	let counter = 0,
		padOn = true;

	_data.playerSequence = [];
	_data.playerCanPlay = false;

	changePadCursor("auto"); //enquanto a sequencia estiver sendo executada o cursor do jogador será a setinha padrão

	const interval = setInterval(() => {
		if (!_data.gameOn) {
			clearInterval(interval);
			disablePads();
			return;
		}

		if (padOn) {
			if (counter === _data.gameSequence.length) {
				clearInterval(interval);
				disablePads();
				waitForPlayerClick();
				changePadCursor("pointer");
				_data.playerCanPlay = true;
				return;
			}

			const sndId = _data.gameSequence[counter];
			const pad = _gui.pads[sndId];

			_data.sounds[sndId].play();
			pad.classList.add("game__pad--active");
			counter++;
		}
		else {
			disablePads();
		}

		padOn = !padOn;
	}, 750);
}

const blink = (text, callback) => {
	let counter = 0,
		on = true;

	_gui.counter.innerText = text;

	const interval = setInterval(() => {
		if (!_data.gameOn) { //se o jogo estiver desligado
			clearInterval(interval);
			_gui.counter.classList.remove("gui__counter--on");
			return; //impedindo que o código abaixo seja executado
		}

		if (on) {
			_gui.counter.classList.remove("gui__counter--on");
		}
		else {
			_gui.counter.classList.add("gui__counter--on");

			if (++counter === 3) {
				clearInterval(interval);
				callback();
			}
		}

		on = !on;
	}, 250);
}


const waitForPlayerClick = () => {
	clearTimeout(_data.timeout);

	_data.timeout = setTimeout(() => {
		if (!_data.playerCanPlay) //se o jogador não puder jogar
			return;

		disablePads();
		resetOrPlayAgain();
	}, 5000); //5 segundos é o tempo que o jogador tem para fazer sua jogada
}

const resetOrPlayAgain = () => {
	_data.playerCanPlay = false;

	if (_data.strict) { //se o scrict estiver ativado
		blink("!!", () => {
			_data.score = 0;
			_data.gameSequence = [];
			startGame();
		});
	}
	else { //se o scrict estiver desativado
		blink("!!", () => {
			setScore();
			playSequence();
		});
	}
}

const changePadCursor = (cursorType) => {
	_gui.pads.forEach(pad => {
		pad.style.cursor = cursorType;
	});
}

const disablePads = () => {
	_gui.pads.forEach(pad => {
		pad.classList.remove("game__pad--active");
	});
}
