const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

[cvs.width, cvs.height] = [window.innerWidth, window.innerHeight];

let tileSize = 40;
const world = [
    "##############",
    "#...........##",
    "#..##.....#..#",
    "#...##....#..#",
    "#.........#..#",
    "#....#.......#",
    "#.#..#..###..#",
    "#.........#..#",
    "##############"
];
const player = {
    x: tileSize + tileSize / 2,
    y: tileSize + tileSize / 2,
    radius: 10,
    speed: 1,
    // Yangle: 0,
    Zangle: 0,
    arrowRight: false,
    arrowLeft: false,
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false
};
let rayAmount = 500
const ray = {
    fov: Math.PI / 3,
    amount: rayAmount,
    depth: 700,
    deltaAngle: (Math.PI / 3) / rayAmount,
    distance: rayAmount / (2 * Math.tan(Math.PI / 6)), // fov / 2 = Math.PI / 6
    coeff: (rayAmount / (2 * Math.tan(Math.PI / 6))) * tileSize, // tileSize = 64
    scale: cvs.width / rayAmount
};

function isWall(x, y) {
    let gridX = Math.floor(x / tileSize);
    let gridY = Math.floor(y / tileSize);
    return world[gridY]?.[gridX] === "#";
}

document.addEventListener("keydown", function (e) {
    if (e.keyCode === 87) player.moveUp = true;
    if (e.keyCode === 83) player.moveDown = true;
    if (e.keyCode === 65) player.moveLeft = true;
    if (e.keyCode === 68) player.moveRight = true;
    if (e.key === "ArrowLeft") player.arrowLeft = true;
    if (e.key === "ArrowRight") player.arrowRight = true;
});
document.addEventListener("keyup", function (e) {
    if (e.keyCode === 87) player.moveUp = false;
    if (e.keyCode === 83) player.moveDown = false;
    if (e.keyCode === 65) player.moveLeft = false;
    if (e.keyCode === 68) player.moveRight = false;
    if (e.key === "ArrowLeft") player.arrowLeft = false;
    if (e.key === "ArrowRight") player.arrowRight = false;
});


const cursor = {
    x: 0,
    y: 0,
    newX: 0,
    newY: 0
}

canvas.addEventListener("click", () => {
    canvas.requestPointerLock();
});

document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === canvas) {
        cursor.x += event.movementX * 0.5;
        cursor.y += event.movementY * 0.5;
    }
});

// ray.depth = tileSize * 8
function castRays() {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    const startAngle = player.Zangle - ray.fov / 2;

    for (let i = 0; i < ray.amount; i++) {
        let curAngle = startAngle + i * ray.deltaAngle;
        let rayX = player.x;
        let rayY = player.y;
        let hit = false;
        let depth = 0;

        while (!hit && depth < ray.depth) {
            rayX += Math.cos(curAngle);
            rayY += Math.sin(curAngle);
            depth++;

            if (isWall(rayX, rayY)) {
                depth *= Math.cos(player.Zangle - curAngle)
                const projHeight = (ray.coeff / depth)
                ctx.fillStyle = `rgba(255, 255, 255, ${0.005 * projHeight / 1.5})`;
                // ctx.fillRect((i * ray.scale), (cvs.height / 2 - projHeight / 2) * Math.cos(-player.Yangle * 2), ray.scale , projHeight * 2);
                ctx.fillRect((i * ray.scale), (cvs.height / 2 - projHeight / 2), ray.scale , projHeight * 2);
                hit = true;
            }
        }
    }
    ctx.restore();
}

function draw() {
    [cvs.width, cvs.height] = [window.innerWidth, window.innerHeight];
    ray.amount = cvs.width / 2;
    player.newX = player.x;
    ray.amount = cvs.width / 3
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    
    let nextX = player.x;
    let nextY = player.y;
    if (player.moveUp) { nextX += Math.cos(player.Zangle) * player.speed; nextY += Math.sin(player.Zangle) * player.speed }; 
    if (player.moveDown) { nextX += -Math.cos(player.Zangle) * player.speed; nextY += -Math.sin(player.Zangle) * player.speed }; 
    if (player.moveLeft) { nextX += Math.sin(player.Zangle) * player.speed; nextY += -Math.cos(player.Zangle) * player.speed }; 
    if (player.moveRight) { nextX += -Math.sin(player.Zangle) * player.speed; nextY += Math.cos(player.Zangle) * player.speed }; 

    if (!isWall(nextX, player.y)) player.x = nextX;
    if (!isWall(player.x, nextY)) player.y = nextY;

    if (player.arrowRight) player.Zangle += 0.02;
    if (player.arrowLeft) player.Zangle -= 0.02;

    if(cursor.x != cursor.newX) player.Zangle = cursor.x / 500;
    // if(cursor.y > cursor.newY) player.Yangle = cursor.y / 500;
    // console.log(player.Yangle)
    castRays();

    requestAnimationFrame(draw);
}

draw();