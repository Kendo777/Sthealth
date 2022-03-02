//json
var json = {
	levelStructure : "11111111111111111111111\
					  100p10000000000r1000r01\
					  10011300000111111011211\
					  10011110111111000002001\
					  10012000000011000000001\
					  10020000000001000000001\
					  10000000000001000040000\
					  10000000040000000300000\
					  10010000000001000400001\
					  10010100000001000000001\
					  13010120000001000000001\
					  10013100000001000000001\
					  1001r100000001300011111\
					  10011111100111100000gg1\
					  13000000000000100001gg1\
					  11111111111111111111111",
	enemyPath: [{p:[2,10],f:[2,5]},
				{p:[7,21],f:[7,14]},
				{p:[5,1],f:[10,1]},
				{p:[5,4],f:[11,4]},
				{p:[12,17],f:[12,14]},
				{p:[14,13],f:[14,1]}],

	enemyFocusDir: [{p:1/16,f:-1/16,a:0},
					{p:(0.5+1/16),f:(0.5-1/16),a:1},
					{p:1+1/16,f:1-1/16,a:0},
					{p:(0.5+1/16),f:(0.5-1/16),a:1},
					{p:(0.5+1/16),f:(0.5-1/16),a:1},
					{p:0,f:-1/4,a:3},
					{p:0,f:-1/4,a:3},
					{p:1/16,f:-1/16,a:0},
					{p:1,f:1-1/4,a:3},
					{p:(1.5+1/16),f:(1.5-1/16),a:1},
					{p:1/16,f:-1/16,a:0},
					{p:(1.5+1/16),f:(1.5-1/16),a:1},
					{p:1/16,f:-1/16,a:0},
					{p:1/16,f:-1/16,a:0}],

	gate: [{x:7,y:13},{x:13,y:19},{x:3,y:7}],
};


var game;
var pause = false;
var win = false;
var gameOver = false;
var editorMode = false;
var rows=16;
var columns =23;
var mediumWindowW = 1278;
var mediumWindowH = 870;
var boxSize=56;
var enemySize = 20;
var spaceBetweenBox = 0;
var patrolTime=1.01;
var bulletSpeed = 50;
var patrolFocusRad = 300;
var patrolColor = "rgb(0,0,255)";
var patrolColorDesactivated = "rgb(0,0,150)";
var gameOvertimmer=0;
class GameObject
{
	constructor(x,y,sizeA,sizeB,color)
	{
		this.x=x;
		this.y=y;
		this.sizeA=sizeA;
		this.sizeB=sizeB;
		this.color=color;
		this.initPath();
	}
	update(deltaTime)
	{
	}
	initPath()
	{
	}
	render(ctx)
	{
	}
}
class Square extends GameObject
{
	constructor(x,y,width,height,color,color2,active=true)
	{
		super(x,y,width,height,color);
		this.color2=color2;
		this.active=active;
	}
	update(deltaTime)
	{
	}
	initPath()
	{
		this.path=new Path2D();
		this.path.rect(this.x,this.y,this.sizeA,this.sizeB);
		this.path.closePath();
	}
	render(ctx)
	{
		if(this.active)
		{
			ctx.fillStyle=this.color;
			ctx.strokeStyle=this.color2;
			ctx.fillRect(this.x,this.y,this.sizeA,this.sizeB);
			ctx.fill(this.path);
			ctx.stroke(this.path);
		}
	}
}
class Circle extends GameObject
{
	constructor(x,y,radius,startAngle,endAngle,color)
	{
		super(x,y,startAngle,endAngle,color);
		this.radius=radius;
		this.direction=1;
		this.initPath();
	}
	initPath()
	{
		this.path=new Path2D();
		this.path.arc(this.x,this.y,this.radius,Math.PI*this.sizeA,Math.PI*this.sizeB,false);
		this.path.closePath();
	}
	render(ctx)
	{
		ctx.fillStyle=this.color;
		ctx.fill(this.path);
	}
}
class Foco extends GameObject
{
	constructor(x,y,radius,startAngle,endAngle,color,mode,axis)
	{
		super(x,y,startAngle,endAngle,color);
		this.radius=radius;
		this.currentRadius = radius;
		this.mode=mode;
		this.canSeeThePlayer = true;
		this.playerDetected = false;
		this.direction=1;
		this.axis = axis;
	}
	update(deltaTime)
	{
		switch(this.mode)
		{
			case 0:
				//this.initPath();
				break;
			case 1: //Radar mode
				this.sizeA=(this.sizeA+this.direction*deltaTime)%2;
				this.sizeB=(this.sizeB+this.direction*deltaTime)%2;
				//this.initPath();
				break;
		}

		var dist = EnemyViewBox(this);
		if(dist)
		{
			this.boxDetection(dist);
		}
		else
		{
			this.currentRadius = this.radius;
			var dist = EnemyViewBox(this);
			if(dist)
			{

				this.boxDetection(dist);
			}

		}
		this.initPath();
	}
	boxDetection(dist)
	{
		if(this.axis==0)
		{
			if(dist.x<this.x)
			{
				var boxDistX = this.x - dist.x;
			}
			else
			{
				var boxDistX = dist.x- this.x;
			}
			this.currentRadius = boxDistX;
		}
		else if(this.axis==1)
		{
			if(dist.y<this.y)
			{
				var boxDistY = this.y-dist.y;
				this.currentRadius = boxDistY;
			}
			else
			{
				var boxDistY = dist.y-this.y;
				this.currentRadius = boxDistY;
			}
		}
		else if(this.axis==3)
		{
			if(dist.x<this.x)
			{
				var boxDistX = this.x - dist.x;
			}
			else
			{
				var boxDistX = dist.x- this.x;
			}
			this.currentRadius = boxDistX;

			if(this.currentRadius==0 && dist.y<this.y)
			{
				var boxDistY = this.y-dist.y;
				this.currentRadius = boxDistY;
			}
			else if(this.currentRadius==0)
			{
				var boxDistY = dist.y-this.y;
				this.currentRadius = boxDistY;
			}
		}
		if(this.currentRadius<0)
		{
			this.currentRadius=0;
		}
	}
	initPath()
	{
		this.path=new Path2D();
		this.path.arc(this.x,this.y,this.currentRadius,Math.PI*this.sizeA,Math.PI*this.sizeB,true);
		this.path.lineTo(this.x,this.y);
		this.path.closePath();
	}
	render(ctx)
	{
		if(SphereCollision(game.player,this.path))
		{
			if(game.player.box)
			{
				if(game.player.hideStamina>0)
				{
					game.player.hideStamina-=0.2;
					game.hideBar.setValue(game.player.hideStamina);
				}
				ctx.fillStyle=this.color;
			}
			else
			{
				ctx.fillStyle="rgba(100,100,0,0.5)";
				game.detectionBar.addValue(0.5);
			}
		}
		else
		{
			ctx.fillStyle=this.color;
		}
		//ctx.fillRect(this.x,this.y,this.width,this.height);
		ctx.fill(this.path);
	}
	moveFoucs(x,y)
	{
		this.x=x;
		this.y=y;
	}
}
class Player extends Circle
{
	constructor(x,y,speed,radius,collision,color)
	{
		super(x,y,radius,0,2,color);
		this.speed=speed;
		this.box=false;
		this.canHide=true;
		this.hideStamina=100;
		this.collision = new Circle(x,y,collision,0,2);
	}
	update(deltaTime)
	{
		var sizesCollisions = BoxCollisionWithCircle(game.player);
		if (keysDown[37] && !this.box && sizesCollisions.indexOf("left")==-1)
		{ 
			this.x -= this.speed * deltaTime; // Player holding left
		}
		if (keysDown[38] && !this.box && sizesCollisions.indexOf("top")==-1)
		{
			this.y -= this.speed * deltaTime; // Player holding up
		} 
		if (keysDown[39] && !this.box && sizesCollisions.indexOf("right")==-1)
		{
			this.x += this.speed * deltaTime; // Player holding right
		} 
		if (keysDown[40] && !this.box && sizesCollisions.indexOf("bottom")==-1)
		{
			this.y += this.speed * deltaTime; // Player holding down
		} 
		if (keysDown[32] && this.canHide)
		{
			this.switchHide();
		}
		if(keysDown[69] && !this.box)
		{
			for(var i=0; i<game.enemys.length; i++)
			{
				if(SphereCollision(game.enemys[i],this.collision.path))
				{
					game.enemys[i].desactivate();
				}
			}
		}
		if(this.hideStamina<=0)
		{
			this.box=false;
			this.hideStamina=0;
		}
		if(!this.box)
		{
			if(this.hideStamina<100)
			{
				this.hideStamina+=deltaTime*1.5;
				game.hideBar.setValue(this.hideStamina);
			}
			else
			{
				this.hideStamina=100;
			}
		}
		this.initPath();
		this.collision.x=this.x;
		this.collision.y=this.y;
		this.collision.initPath();
	}
	initPath()
	{
		if(!this.box)
		{
			this.path=new Path2D();
			this.path.arc(this.x,this.y,this.radius,Math.PI*this.sizeA,Math.PI*this.sizeB,false);
			this.path.closePath();
		}
		else
		{
			this.path=new Path2D();
			this.path.rect(this.x-this.radius,this.y-this.radius,this.radius*2,this.radius*2);
			this.path.closePath();
		}
	}
	render(ctx)
	{
		if(!this.box)
		{
			ctx.fillStyle=this.color;
		}
		else
		{
			ctx.fillStyle="rgb(202, 176, 139)";
		}

		ctx.fill(this.path);
		ctx.stroke(this.collision.path);
		if(this.box)
		{
			var rect=new Path2D();
			rect.rect(this.x-this.radius/3,this.y-this.radius*3/4,this.radius/1.5,this.radius/5);
			rect.closePath();
			ctx.fillStyle="black";
			ctx.fill(rect);
		}
	}
	switchHide()
	{
		this.box=!this.box;
		this.canHide=false;
	}
}

class Barr
{
	constructor(x,y,width,height,margin,value,insideColor,outsideColor,full)
	{
		this.backBarr = new Square(x,y,width+margin,height+margin,outsideColor);
		if(full)
		{
			this.inideBarr= new Square(x+margin,y+margin,width-margin,height-margin,insideColor);
			this.currentValue=value;
		}
		else
		{
			this.inideBarr= new Square(x+margin,y+margin,0,height-margin,insideColor);
			this.currentValue=0;
		}
		this.width = width;
		this.value = value;
		this.margin = margin;
		this.full = false;
	}
	setValue(value)
	{
		this.currentValue=value;
		if(this.currentValue<0)
		{
			this.currentValue=0;
		}
		this.inideBarr.sizeA=this.currentValue/this.value*(this.width-this.margin);
		this.inideBarr.initPath();
	}
	addValue(value)
	{
		this.currentValue+=value;
		if(this.currentValue>this.value)
		{
			this.currentValue=this.value;
			this.full = true;
		}
		this.inideBarr.sizeA=this.currentValue/this.value*(this.width-this.margin);
		this.inideBarr.initPath();
	}
	render(ctx)
	{
		this.backBarr.render(ctx);
		this.inideBarr.render(ctx);
	}

}
class Button extends Square
{
	constructor(x,y,width,height,radius,color,color2,active=false)
	{
		super(x,y,width,height,color);
		this.color2=color2;
		this.active=active;
		this.circle = new Circle(x+width/2,y+height/2,radius,0,2,color);
	}
	update(deltaTime)
	{
		if(!this.active)
		{
			for(var i=0;i<360;i+=90)
			{
				xCir=game.player.x+game.player.radius*Math.cos(i*Math.PI/180);
				yCir=game.player.y+game.player.radius*Math.sin(i*Math.PI/180);
				if(game.ctx.isPointInPath(this.path,xCir,yCir))
				{
					this.active=true;
					this.gate.active=false;
					this.circle.color=this.color2;
				}
			}
		}
	}
	render(ctx)
	{
		
		ctx.fillStyle="black";
		ctx.fillRect(this.x,this.y,this.sizeA,this.sizeB);
		ctx.fill(this.path);

		this.circle.render(ctx);
		
	}
	setGate(gate)
	{
		this.gate = gate;
		this.gate.active=true;
		this.gate.color=this.color;
		this.gate.color2="black";
	}
}
class Goal extends Square
{
	constructor(x,y,width,height,color,active=false)
	{
		super(x,y,width,height,color);
		this.active=active;
	}
	update(deltaTime)
	{
		if(!this.active)
		{
			if(game.ctx.isPointInPath(this.path,game.player.x,game.player.y))
			{
				win=true;
			}
		}
	}
	render(ctx)
	{
		
		ctx.fillStyle=this.color;
		ctx.strokeStyle="black";
		ctx.fillRect(this.x,this.y,this.sizeA,this.sizeB);
		ctx.fill(this.path);
		ctx.stroke(this.path);
		
	}
}
function createFullScreenCanvas(){
	//create the element
	var canvas = document.createElement("canvas");
	//make it fullscreen
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	canvas.style.position = "absolute";
	//add to the DOM
	document.body.appendChild(canvas);
	return canvas;
}

function simplePathFinding(originX, originY, endingX, endingY)
{
	var points = [];
	var currentX = originX;
	var currentY = originY;
	while(currentX!=endingX || currentY!=endingY)
	{
		if(currentY < endingY)
		{
			currentY++;
			points.push(game.go[currentX][currentY]);
		}
		else if(currentY > endingY)
		{
			currentY--;
			points.push(game.go[currentX][currentY]);
		}
		else if(currentX < endingX)
		{
			currentX++;
			points.push(game.go[currentX][currentY]);
		}
		else if(currentX > endingX)
		{
			currentX--;
			points.push(game.go[currentX][currentY]);
		}
	}
	return points;
}

function BoxCollisionWithCircle(circle)
{
	var array = [];
	for(var x=0; x<rows; x++)
	{
		for(var y=0; y<columns; y++)
		{
			if(game.go[x][y].active)
			{
				for(var i=0;i<360;i+=90)
				{
					xCir=circle.x+circle.radius*Math.cos(i*Math.PI/180);
					yCir=circle.y+circle.radius*Math.sin(i*Math.PI/180);
					if(game.ctx.isPointInPath(game.go[x][y].path,xCir,yCir))
					{
						
						if(i==0)
						{
							array.push("right");
						}
						else if(i==90)
						{
							array.push("bottom");
						}
						else if(i==180)
						{
							array.push("left");
						}
						else if(i==270)
						{
							array.push("top");
						}
					}
				}
			}
		}
	}
	return array;
}

function SphereCollision(objective,focus) //divide the circle in 8 and check
{
	var x;
	var y;
	for(var i=0;i<360;i+=45)
	{
		x=objective.x+objective.radius*Math.cos(i*Math.PI/180);
		y=objective.y+objective.radius*Math.sin(i*Math.PI/180);
		if(game.ctx.isPointInPath(focus,x,y))
		{
			return true;
		}
	}
	return false;
}
function EnemyViewBox(focus)
{
	var array = [];
	for(var x=0; x<rows; x++)
	{
		for(var y=0; y<columns; y++)
		{
			if(game.go[x][y].active)
			{
				var distance = lineRect(focus,game.go[x][y]);
				if(distance)
				{
					array.push(distance);
					//return distance;
				}
			}
		}
	}
	if(array.length!=0)
	{
		var dist;
		var modul= focus.radius;
		for(var i=0; i< array.length; i++)
		{
			if(modul > Math.sqrt(Math.pow(array[i].x-focus.x,2)+Math.pow(array[i].y-focus.y,2)))
			{
				modul = Math.sqrt(Math.pow(array[i].x-focus.x,2)+Math.pow(array[i].y-focus.y,2));
				dist=array[i];
			}
		}
		return dist;
	}
	return null;
}
// LINE/RECTANGLE
function lineRect(focus,box) {

  // check if the line has hit any of the rectangle's sides
  // uses the Line/Line function below
  var rad = (focus.sizeA+focus.sizeB)/2;
  var xVect = focus.x + focus.currentRadius*Math.cos(rad*Math.PI);
  var yVect = focus.y + focus.currentRadius*Math.sin(rad*Math.PI);
  //left
  if(xVect>focus.x)
  	var dist = lineLine(focus.x,focus.y,xVect,yVect,box.x,box.y,box.x, box.y+box.sizeB);
  if(!dist && xVect<focus.x)
  {
  	//right
  	dist = lineLine(focus.x,focus.y,xVect,yVect, box.x+box.sizeA,box.y, box.x+box.sizeA,box.y+box.sizeB);
  }
  if(!dist && yVect>focus.y)
  {
  	//top
  	dist = lineLine(focus.x,focus.y,xVect,yVect, box.x,box.y, box.x+box.sizeA,box.y);
  }
  if(!dist && yVect<focus.y)
  {
  	//bottom
  	dist = lineLine(focus.x,focus.y,xVect,yVect, box.x,box.y+box.sizeB, box.x+box.sizeA,box.y+box.sizeB);
  }

  if(dist)
  {
  	return dist;
  }

  return false;
}


// LINE/LINE
function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {

  // calculate the direction of the lines
  var uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  var uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {

    // optionally, draw a circle where the lines meet
    var intersectionX = x1 + (uA * (x2-x1));
    var intersectionY = y1 + (uA * (y2-y1));

	/*var path=new Path2D();
	path.arc(intersectionX,intersectionY,10,0,Math.PI*2,true);
	path.closePath();
	game.cir = path;*/
    return dist = {x: intersectionX, y: intersectionY};
  }
  return false;
}

var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	keysDown[e.keyCode] = false;
	if(e.keyCode==32)
	{
		game.player.canHide=true; 
	}
}, false);

var clickDown = {};

addEventListener('click', function(e){
	if(editorMode)
	{
		for(var x=0; x<rows; x++)
		{
			for(var y=0; y<columns; y++)
			{
				if(game.ctx.isPointInPath(game.go[x][y].path,e.x,e.y))
				{
					if(!game.go[x][y].active)
					{
						game.go[x][y].color = "gray";
						game.go[x][y].color2 = "black";
					}
						game.go[x][y].active=!game.go[x][y].active;
				}
			}
		}
	}
});
