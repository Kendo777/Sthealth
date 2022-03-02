
//we expose the game variable to the global scope
//so we can access it from everywhere
//executed when the DOM is fully loaded
function setObjects()
{
	var level = json.levelStructure.replace(/(\r\n|\n|\r|\t)/g,'');
	level = level.replace(/ /g,'');
	var enemyPathPointer =0;
	var enemyFocusDirPointer = 0;

	for (var i = 0; i < rows; i++) {
		for(var j=0; j<columns; j++)
		{
			if(level.charAt(i*columns+j)=='2')
			{
				var enemy = new Patrol(j*(boxSize+spaceBetweenBox)+4+boxSize/2,i*(boxSize+spaceBetweenBox)+40+boxSize/2,0,enemySize,patrolFocusRad,0)
				enemy.setFocusAngle(json.enemyFocusDir[enemyFocusDirPointer].p,json.enemyFocusDir[enemyFocusDirPointer].f,json.enemyFocusDir[enemyFocusDirPointer].a);
				enemyFocusDirPointer++;
				game.enemys.push(enemy);
			}
			else if(level.charAt(i*columns+j)=='3')
			{
				var enemy = new Patrol(j*(boxSize+spaceBetweenBox)+4+boxSize/2,i*(boxSize+spaceBetweenBox)+40+boxSize/2,100,enemySize,patrolFocusRad,0);
				enemy.setFocusAngle(json.enemyFocusDir[enemyFocusDirPointer].p,json.enemyFocusDir[enemyFocusDirPointer].f,json.enemyFocusDir[enemyFocusDirPointer].a);
				enemy.setSpot(game.go[json.enemyPath[enemyPathPointer].p[0]][json.enemyPath[enemyPathPointer].p[1]]);
				enemy.setSpot(game.go[json.enemyPath[enemyPathPointer].f[0]][json.enemyPath[enemyPathPointer].f[1]]);
				enemyPathPointer++;
				enemyFocusDirPointer++;
				game.enemys.push(enemy);
			}
			else if(level.charAt(i*columns+j)=='4')
			{
				var enemy = new Turret(j*(boxSize+spaceBetweenBox)+4+boxSize/2,i*(boxSize+spaceBetweenBox)+40+boxSize/2,enemySize,190,"grey");
				enemy.setFocusAngle(json.enemyFocusDir[enemyFocusDirPointer].p,json.enemyFocusDir[enemyFocusDirPointer].f,json.enemyFocusDir[enemyFocusDirPointer].a);
				enemyFocusDirPointer++;
				game.enemys.push(enemy);
			}
			else if(level.charAt(i*columns+j)=='r')
			{
				game.buttons.push(new Button(j*(boxSize+spaceBetweenBox)+4+boxSize/2-15,i*(boxSize+spaceBetweenBox)+40+boxSize/2-15,30,30,10,"red","green"));
			}
			else if(level.charAt(i*columns+j)=='p')
			{
				game.player = new Player(j*(boxSize+spaceBetweenBox)+4+boxSize/2,i*(boxSize+spaceBetweenBox)+40+boxSize/2,150,enemySize,40,"black");
			}
			else if(level.charAt(i*columns+j)=='g')
			{
				game.goals.push(new Goal(j*(boxSize+spaceBetweenBox)+4,i*(boxSize+spaceBetweenBox)+40,boxSize,boxSize,"rgb(144, 255, 96)"));
			}
		}
	}

	for (var i = 0; i<json.gate.length; i++) 
	{
		game.buttons[i].setGate(game.go[json.gate[i].x][json.gate[i].y]);
	}

	game.hideBar = new Barr(4,0,boxSize*4-10,30,10,game.player.hideStamina,"yellow","grey",true);
	game.detectionBar = new Barr(game.go[0][columns-4].x,0,boxSize*4-10,30,10,100,"red","grey",false);
}
function destroyObjects()
{
	game.player=null;
	game.hideBar =null;
	game.detectionBar=null;
	game.enemys = [];
	game.bullets = [];
	game.buttons= [];
	game.goals = [];
}
function init(){
	//variable that will hold all the variables for our game
	game = {
		canvas : undefined,
		ctx : undefined,
		lastTick : Date.now(),
		player: undefined,
		hideBar: undefined,
		detectionBar: undefined,
		enemys: [],
		go: [],
		buttons: [],
		goals:[]
	}

	// Create canvas and get the context
	game.canvas = createFullScreenCanvas();
	game.ctx = game.canvas.getContext("2d");
	var level = json.levelStructure.replace(/(\r\n|\n|\r|\t)/g,'');
	level = level.replace(/ /g,'');
	for (var i = 0; i < rows; i++) {
		var array = [];
		for(var j=0; j<columns; j++)
		{
			if(level.charAt(i*columns+j)=='1')
			{
				array.push(new Square(j*(boxSize+spaceBetweenBox)+4,i*(boxSize+spaceBetweenBox)+40,boxSize,boxSize,"gray","black"));
			}
			else
			{
				array.push(new Square(j*(boxSize+spaceBetweenBox)+4,i*(boxSize+spaceBetweenBox)+40,boxSize,boxSize,"white","white",false));
			}	
		}
		game.go.push(array);
	}
	setObjects();
	window.requestAnimationFrame(loop);
}

function loop(timestamp) {
	//delta from last execution of loop in ms
	var now = Date.now();
	var delta = now - game.lastTick;

	if(!pause && !win && !gameOver)
	{
		update(delta/1000);
		if(game.detectionBar.full)
		{
			gameOver=true;
		}
	}
	render();
	if (keysDown[80])
	{
		pause=!pause;
	}
	if (keysDown[81])
	{
		editorMode=!editorMode;
	}
	if (keysDown[82])
	{
		destroyObjects();
		setObjects();
		win=false;
	}
	if(win)
	{
		game.ctx.fillStyle="rgba(0, 0, 0, 0.7)";
		game.ctx.fillRect(0,0,game.canvas.width,game.canvas.height);
		game.ctx.font = "100px Georgia";
		game.ctx.fillStyle = "white";
		game.ctx.fillText("YOU'VE ESCAPED!", game.canvas.width/6, game.canvas.height/2);
		game.ctx.font = "50px Georgia";
		game.ctx.fillStyle = "white";
		game.ctx.fillText("Press R ro restart", game.canvas.width/6, game.canvas.height/2+100);
	}
	else if(gameOver)
	{
		game.ctx.fillStyle="rgba(0, 0, 0, 0.7)";
		game.ctx.fillRect(0,0,game.canvas.width,game.canvas.height);
		game.ctx.font = "100px Georgia";
		game.ctx.fillStyle = "red";
		game.ctx.fillText("YOU'VE BEEN SPOTTED!", 50, game.canvas.height/2);
		gameOvertimmer+=delta/1000;
		if(gameOvertimmer>5)
		{
			gameOvertimmer=0;
			gameOver=false;
			destroyObjects();
			setObjects();
		}
	}


	game.lastTick = now;
	// Request to do this again ASAP
	window.requestAnimationFrame(loop);
}

//update everything
function update(delta){
	game.player.update(delta);
	for (var i = 0; i < game.enemys.length; i++) {
		game.enemys[i].update(delta);
	}
	for (var i = 0; i < game.buttons.length; i++) {
		game.buttons[i].update(delta);
	}
	for (var i = 0; i < game.goals.length; i++) {
		game.goals[i].update(delta);
	}

}

// Draw everything
function render(){

	game.ctx.fillStyle="white";
	game.ctx.fillRect(0,0,game.canvas.width,game.canvas.height);
	for (var i = 0; i <game.go.length; i++) {
		for(var j=0; j<columns; j++)
		{
			if(game.go[i][j]!=null)
			game.go[i][j].render(game.ctx);
		}
	}
	for (var i = 0; i <game.buttons.length; i++) {
		game.buttons[i].render(game.ctx);
	}
	for (var i = 0; i <game.goals.length; i++) {
		game.goals[i].render(game.ctx);
	}
	game.player.render(game.ctx);
	for (var i = 0; i <game.enemys.length; i++) {
		game.enemys[i].render(game.ctx);
	}
	game.hideBar.render(game.ctx);
	game.detectionBar.render(game.ctx);
	
}

