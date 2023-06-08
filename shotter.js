const canvas = document.querySelector('canvas');



canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let c = canvas.getContext('2d');


//Score In The Left Top
const scoreEl = document.querySelector('#scoreEl') 

//Start Game Button
const startGameBtn = document.querySelector('#startGameBtn') 

//Element Modal(Restart Pop Up)
const modalEl = document.querySelector('#modal-El') 

//Score Inside A Modal
const bigScoreEl = document.querySelector('#bigScoreEl') 

/*
*
* When The Browser Screen Is Resize, The canvas.height or width Is Rezise Too
*/
addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

});



/*
*
* Class For Player(the circle in the middle)
*/
class Player{
    constructor(x, y, radius, color){
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    }

    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, Math.PI*0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }
}



/*
*
* Class For Projectile(the particle that show up from player)
*/
class Projectile{
    constructor(x, y, radius,  color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;

    }

    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, Math.PI*0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();

    }

    update() {
        this.draw();
        this.x +=  this.velocity.x;
        this.y +=   this.velocity.y;
    }

}



/*
*
* Class For Enemy(this is for enemy element )
*/
class Enemy{
    constructor(x, y, radius,  color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;

    }

    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, Math.PI*0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();

    }

    update() {
        this.draw();
        this.x +=  this.velocity.x;
        this.y +=   this.velocity.y;
    }

}



/*
*
* Class For Particle(explosion element when projectiles hit the enemy)
*/

//friction for particle to slow down when projectiles hit the enemy
const friction = 0.99;
class Particle{
    constructor(x, y, radius,  color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;

    }

    draw(){
        c.save();

        //This is what makes the particles fade out
        c.globalAlpha = this.alpha
        c.beginPath();
        c.arc(this.x, this.y, this.radius, Math.PI*0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();

    }

    update() {
        this.draw();
        this.velocity.x *=  friction;
        this.velocity.y *=  friction;
        this.x +=  this.velocity.x ;
        this.y +=   this.velocity.y * friction;
        this.alpha -= 0.01
    }

}




/*
*
* Helper For Randomize
*/

function random(length){
    return Math.floor(Math.random() * length);
}


/*
*
* Helper To Get The Values From Min to Max
*/
function minMax(min, max){
    return Math.floor(Math.random() * (max - min) + min);
}




// let x = canvas.width/2;
// let y = canvas.height/2;

// let player = new Player(x,y , 20, 'white');
// let projectiles = [];
// let enemies = [];
// let particles = [];






/*
*
* Initial Game (When Start Button Clicked)
*/
function init(){
     let x = canvas.width/2;
     let y = canvas.height/2;
     player = new Player(x,y , 20, 'white');
     projectiles = [];
     enemies = [];
     particles = [];
     score= 0;
     scoreEl.innerHTML = score;
     bigScoreEl.innerHTML = score;
}



/*
*
* Spawn Enemies
*/
function spawnEnemies()
{
    setInterval(() =>{

        const radius  = minMax(10, 30);
        
        let x;
        let y;

        //Make the enemies come out from outside the screen.
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y =  Math.random() * canvas.height;
        }else{
            x =  Math.random() * canvas.width;
            y =  Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }


        //For randomize the color of enemies 
        const color = `hsl(${random(360)}, 50%, 50%)`;

        //Get value of the angle(it's the slash or 'z' value in the triangle of trigonometry). Btw, it's tangen
        const angle = Math.atan2( canvas.height/2 - y,  canvas.width/2 - x);
        const velocity =  {

            //Calculate the cos
            x: Math.cos(angle),
            //Calculate the sin
            y: Math.sin(angle),
        };


        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000);

}


let animationId;
let score = 0;
let frames = 0;
function animate(){
    animationId = requestAnimationFrame(animate);
    
    frames++;
    
    //This is what makes the screen canvas get black, and the blur things in the ball particle  
    c.fillStyle = 'rgba(0,0,0,0.1)'; 
    
    //Same as clearRect(in this case) but different color
    c.fillRect(0,0, canvas.width, canvas.height);
    
    
    player.draw();

    particles.forEach((particle, index) =>{
        //If the particle fade out(alpha decrease) and if the alpha below 0, it's get remove from particles array
        if(particle.alpha <= 0){
            particles.splice(index, 1);
        }else{
            particle.update();
        }
    });


    projectiles.forEach((projectile, index) =>{
        projectile.update();
        if( projectile.x + projectile.radius > canvas.width || 
            projectile.x - projectile.radius < 0 || 
            projectile.y + projectile.radius > canvas.height ||
            projectile.y - projectile.radius < 0){
            setTimeout(() =>{    
                projectiles.splice(index, 1);
            }, 0);
        }

        
    })



    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();


        //For get the value of distance between player and enemy(it's value from the slash of triangle)
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);


        //When the enemy hit the player, the game is over
        if(dist - enemy.radius - player.radius  < 1){
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            bigScoreEl.innerHTML = score;
        }
        

        projectiles.forEach((projectile, projectileIndex) =>
        {
            //For get the value of distance between projectile and enemy
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            
            //When Projectiles Touch With Enemies
            if(dist - enemy.radius - projectile.radius  < 1)
            {
                


                //create explosion
                for (let i = 0; i < 10; i++) {
                    particles.push(new Particle(
                        projectile.x, 
                        projectile.y, 
                        random(3), 
                        enemy.color, 
                        {x: (Math.random() - 0.5) * (random(6)), y: (Math.random() - 0.5) * (random(6))}
                    ))
                    
                }


                //
                if(enemy.radius - 10 > 5){
                    
                    //Increase score
                    score += 100;
                    scoreEl.innerHTML = score;
                    

                    //To make animation for enemy when enemy get hit(it's get shrink). It's use gsap library
                    gsap.to(enemy, {
                        radius: enemy.radius -10
                    });
                    
                    //And projectile gone from projectiles array when enemy get hit by projectile
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);

                
                //if the size of the enemy is below 20 radius, it's not get shrink. Instead, it's get explode
                }else{
                    //increase score
                    score += 250;
                    scoreEl.innerHTML = score;
                    
                    setTimeout(() =>{    
                        enemies.splice(enemyIndex, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);


                }
            }

        });
    });

}




/*
*
* When We Click The Screen, The Projectiles Come Out From Player
*/
addEventListener('click', (event) =>
{

    //Get value from angle of the projectile. So, we get angle value from calculate the distance between where you click and the height or width of canvas. After you get the value of y and x, the Math.atan2() will calculate the it(and get value for the slash or 'z' of triangle). Btw, it's tangen. 
    
    const angle = Math.atan2(event.clientY - canvas.height/2, event.clientX - canvas.width/2);


    const velocity =  {
        //Calculate the cos, the x side of triangle
        x: Math.cos(angle) * 4,
        //Calculate the sin, the y side of triangle
        y: Math.sin(angle) * 4,
    };
    projectiles.push(new Projectile(
        canvas.width/2, 
        canvas.height/2, 
        7, 
        'red',
        velocity
        )
    );
});


/*
*
* Start the Game When We Click The Restart Button
*/
startGameBtn.addEventListener('click', () =>{
    init();
    animate();
    modalEl.style.display = 'none';
});

if(frames % 60 == 0){
    spawnEnemies();
}