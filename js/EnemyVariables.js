class Enemy extends Circle
{
	constructor(x,y,radius,fieldOfView,mode,color,desactivateColor)
	{
		super(x,y,radius,0,2,color);
		this.desactivateColor = desactivateColor;
		this.fieldOfView=fieldOfView;
		this.focus = new Foco(this.x,this.y,this.fieldOfView,0,0,"rgba(0,255,0,0.5)",mode);
		this.active=true;
	}
	update(deltaTime)
	{
		if(this.active)
		{
			this.initPath();
			this.focus.moveFoucs(this.x,this.y);
			this.focus.update(deltaTime);
		}
	}
	render(ctx)
	{
		if(this.active)
		{
			this.focus.render(ctx);
			ctx.fillStyle=this.color;
		}
		else
		{
			ctx.fillStyle=this.desactivateColor;
		}
		ctx.fill(this.path);
	}
	setFocusAngle(sizeA,sizeB,axis)
	{
		this.startAngleOfView = sizeA;
		this.endAngleOfView = sizeB;
		this.focus.sizeA =sizeA;
		this.focus.sizeB =sizeB;
		this.focus.axis = axis;
	}
	desactivate()
	{
		this.active=false;
	}
}
class Turret extends Enemy
{
	constructor(x,y,radius,fieldOfView,color,desactivateColor)
	{
		super(x,y,radius,fieldOfView,1,color,desactivateColor);
		this.bullet = null;
	}
	update(deltaTime)
	{
		if(this.active && !game.player.box && SphereCollision(game.player,this.focus.path))
		{
			if(this.bullet==null)
				this.bullet = new Bullet(this.x,this.y,bulletSpeed,10,"black","red");
		}
		this.initPath();
		this.focus.moveFoucs(this.x,this.y);
		this.focus.update(deltaTime);
		if(this.bullet!=null)
		{
			this.bullet.update(deltaTime);
			if(this.bullet.delete)
			{
				this.bullet=null;
			}
		}
	}
	render(ctx)
	{
		if(this.active)
		{
			this.focus.render(ctx);
			ctx.fillStyle=this.color;
		}
		else
		{
			ctx.fillStyle=this.desactivateColor;
		}
		ctx.fill(this.path);

		if(this.bullet!=null)
		{
			this.bullet.render(ctx);
		}
	}
}
class Patrol extends Enemy
{
	constructor(x,y,speed,radius,fieldOfView,mode)
	{
		super(x,y,radius,fieldOfView,mode,patrolColor,patrolColorDesactivated);
		this.speed = speed;
		this.spots=[];
		this.noisePosition={};
		this.noise=false;
		this.pointer = 0;
		this.direction = 1;
		this.timmer=0;
		this.collision=false;
		this.canMove = true;
		this.moveY = false;
		this.moveX = false;
	}
	update(deltaTime)
	{
		if(this.active)
		{		
			if(this.noise)
			{
				this.noiseMovment(deltaTime)
			}
			else if(this.speed!=0)
			{
				this.move(deltaTime);
			}
			this.initPath();
			this.focus.moveFoucs(this.x,this.y);
			this.focus.update(deltaTime);
		}
	}

	move(deltaTime)
	{
		if(this.spots.length!=0)
			{
				if(this.canMove && this.moveX && ((this.direction<0 && this.x>this.spots[this.pointer].x+this.spots[this.pointer].sizeA/2) || (this.direction>0 && this.x<this.spots[this.pointer].x+this.spots[this.pointer].sizeA/2)))
				{
					this.x+=this.direction*deltaTime*this.speed;
				}
				else if(this.canMove && this.moveY && ((this.direction<0 && this.y>this.spots[this.pointer].y+this.spots[this.pointer].sizeB/2) || (this.direction>0 && this.y<this.spots[this.pointer].y+this.spots[this.pointer].sizeB/2)))
				{
					this.y+=this.direction*deltaTime*this.speed;
				}
				else
				{
					this.changePath();
				}
			}
			else if(!this.collision)
			{
				if(this.moveX)
					this.x+=this.direction*deltaTime*this.speed;
				else if(this.moveY)
					this.y+=this.direction*deltaTime*this.speed;
			}
			if(!this.collision && ((game.player.box &&SphereCollision(game.player,this.path)) || BoxCollisionWithCircle(this).length!=0))
			{
				this.changePath();
				this.canMove=false;
				this.collision=true;
			}
			if(this.collision && !SphereCollision(game.player,this.path) && BoxCollisionWithCircle(this)==0)
			{
				this.collision=false;
			}
	}

	noiseMovment(deltaTime)
	{
		if(this.y>this.noisePosition.y+1 || this.y<this.noisePosition.y-1)
		{
			if(this.y>this.noisePosition.y)
			{
				this.y-=deltaTime*this.speed;
			}
			else if(this.y<this.noisePosition.y)
			{
				this.y+=deltaTime*this.speed;
			}
		}

		if(this.x>this.noisePosition.x+1 || this.x<this.noisePosition.x-1)
		{
			if(this.x>this.noisePosition.x)
			{
				this.x-=deltaTime*this.speed;
			}
			else if(this.x<this.noisePosition.x)
			{
				this.x+=deltaTime*this.speed;
			}
		}
	}
	changePath()
	{
		if(this.focus.mode==0)
		{
			this.focus.mode=1;
		}
		else if(this.moveX && ((this.direction>0 && this.focus.sizeA > (1+this.startAngleOfView)%2) || (this.direction<0 && this.focus.sizeA < this.startAngleOfView)))
		{
			this.pointer++;
			this.pointer = this.pointer%this.spots.length;
			this.direction*=-1;
			this.focus.direction*=-1;
			this.timmer=0;
			this.focus.mode=0;
			this.canMove=true;
		}
		else if(this.moveY && ((this.focus.direction>0 && this.focus.sizeA > (this.startAngleOfView)%2) || (this.focus.direction<0 && this.focus.sizeA < (this.startAngleOfView-1)%2)))
		{
			this.pointer++;
			this.pointer = this.pointer%this.spots.length;
			this.direction*=-1;
			this.focus.direction*=-1;
			this.timmer=0;
			this.focus.mode=0;
			this.canMove=true;
		}

	}
	setSpot(square)
	{
		if(this.spots.length==0)
		{
			if(this.y==(square.y+square.sizeB/2))
			{
				this.moveX = true;
				if(this.x>square.x)
				{
					this.direction = -1;
				}
			}
			else if(this.x==(square.x+square.sizeA/2))
			{
				this.moveY = true;
				if(this.y>square.y)
				{
					this.direction = -1;
					this.focus.direction=-1;
				}
			}

		}
		this.spots.push(square);
	}
	noiseDetection(x,y)
	{
		this.noise=true;
		this.noisePosition={x:x,y:y};
	}
}
class Bullet extends Circle
{
	constructor(x,y,speed,radius,color,color2)
	{
		super(x,y,radius,0,2,color);
		this.speed = speed;
		this.colorInside = color2;
		this.insideCircle = new Circle(x,y,0,0,2,color2);
		this.delete = false;
	}
	update(deltaTime)
	{
		this.x+= Math.sign(game.player.x - this.x) * this.speed * deltaTime;
		this.y+= Math.sign(game.player.y - this.y) * this.speed * deltaTime;
		this.insideCircle.x=this.x;
		this.insideCircle.y=this.y;
		if(SphereCollision(game.player,this.path))
		{
			game.detectionBar.addValue(10);
			this.delete=true;
		}
		this.insideCircle.radius+=deltaTime;
		//this.insideCircle.color = "rgb("+(deltaTime*10)+","+(deltaTime*2)+",0)";
		if(this.insideCircle.radius>=this.radius)
		{
			this.insideCircle.radius=0;
		//	this.insideCircle.color=this.colorInside;
		}
		this.collision();
		this.initPath();
		this.insideCircle.initPath();
	}
	initPath()
	{
		this.path=new Path2D();
		this.path.arc(this.x,this.y,this.radius,Math.PI*this.sizeA,Math.PI*this.sizeB,false);
		this.path.closePath();
	}
	render(ctx)
	{
		ctx.strokeStyle=this.color;
		ctx.stroke(this.path);
		this.insideCircle.render(ctx);
	}
	collision()
	{
		for(var x=0; x<rows; x++)
		{
			for(var y=0; y<columns; y++)
			{
				if(game.go[x][y].active)
				{
						if(game.ctx.isPointInPath(game.go[x][y].path,this.x,this.y))
						{
							this.delete=true;
						}
					}
			}
		}
	}
}