namespace SpriteKind {
    export const Killer = SpriteKind.create()
    export const Clone = SpriteKind.create()
    export const Servant = SpriteKind.create()
    export const Platform = SpriteKind.create()
    export const Wall = SpriteKind.create()
}

let playerSprite: Sprite = null
let killer: Sprite = null
let servant: Sprite = null
let platforms: Sprite[] = []
let walls: Sprite[] = []
let clones: Sprite[] = []
let cloneMinX: number[] = []
let cloneMaxX: number[] = []
let cloneSpeed: number[] = []

let currentLevel = 1
let playerHealth = 100
let gravityOn = true
let gameEnded = false
let servantReady = true
let attackLocked = false
let lastAPress = 0
let checkpointX = 65
let checkpointY = 95
let levelHasTimer = false

let gravityCooldown = false
let gravityActive = false
let gravityOffEndTime = 0
let gravityCooldownEndTime = 0

function createPlatform(x: number, y: number, w: number) {
    let p = sprites.create(image.create(w, 8), SpriteKind.Platform)
    p.image.fill(11)
    p.setPosition(x, y)
    p.setFlag(SpriteFlag.Ghost, true)
    platforms.push(p)
}

function createWall(x: number, y: number, w: number, h: number) {
    if (w < 24) {
        w = 24
    }

    let wall = sprites.create(image.create(w, h), SpriteKind.Wall)
    wall.image.fill(15)
    wall.setPosition(x, y)
    wall.setFlag(SpriteFlag.Ghost, true)
    walls.push(wall)
}

function clearLevel() {
    for (let p of platforms) {
        p.destroy()
    }

    for (let w of walls) {
        w.destroy()
    }

    for (let c of clones) {
        c.destroy()
    }

    if (killer) {
        killer.destroy()
    }

    if (servant) {
        servant.destroy()
    }

    platforms = []
    walls = []
    clones = []
    cloneMinX = []
    cloneMaxX = []
    cloneSpeed = []

    killer = null
    servant = null
    servantReady = true
    attackLocked = false
    gravityCooldown = false
    gravityActive = false
    gravityOffEndTime = 0
    gravityCooldownEndTime = 0
}

function createPlayer() {
    playerSprite = sprites.create(assets.image`Player`, SpriteKind.Player)

    controller.moveSprite(playerSprite, 90, 0)
    playerSprite.ay = 450
    scene.cameraFollowSprite(playerSprite)
}

function setPlayerStart(x: number, y: number) {
    checkpointX = x
    checkpointY = y
    playerSprite.setPosition(x, y)
    playerSprite.vx = 0
    playerSprite.vy = 0
    gravityOn = true
    gravityActive = false
    gravityCooldown = false
    playerSprite.ay = 450
}

function createKiller(x: number, y: number, clearLook: boolean) {
    let imgKiller =assets.image`killer`

    if (clearLook) {
        imgKiller =assets.image`killer`
    }

    killer = sprites.create(imgKiller, SpriteKind.Killer)
    killer.setPosition(x, y)
    killer.ay = 450
}

function createClone(x: number, y: number, speed: number, minX: number, maxX: number) {
    let c = sprites.create(assets.image`clone`, SpriteKind.Clone)

    c.setPosition(x, y)
    c.ay = 450
    c.vx = speed

    clones.push(c)
    cloneMinX.push(minX)
    cloneMaxX.push(maxX)
    cloneSpeed.push(speed)
}

function loadLevel(level: number) {
    clearLevel()
    currentLevel = level
    scene.setBackgroundColor(13)
    levelHasTimer = false

    if (currentLevel == 1) {
        playerHealth = 100
        info.setLife(playerHealth)

        createPlatform(80, 112, 160)
        createPlatform(210, 112, 160)

        setPlayerStart(65, 95)
        createKiller(210, 92, true)

        game.splash("LEVEL 1")

    } else if (currentLevel == 2) {
        info.setLife(playerHealth)

        createPlatform(75, 112, 150)
        createPlatform(170, 105, 55)
        createPlatform(255, 92, 55)

        createPlatform(115, 68, 55)
        createPlatform(220, 40, 55)
        createPlatform(320, 72, 55)
        createPlatform(390, 22, 70)
        createPlatform(470, 8, 90)

        createWall(145, 82, 24, 55)
        createWall(285, 62, 24, 85)
        createWall(360, 35, 24, 115)
        createWall(435, 20, 24, 130)

        setPlayerStart(65, 95)
        createKiller(475, -10, true)

        game.splash("LEVEL 2")

    } else if (currentLevel == 3) {
        playerHealth = 100
        info.setLife(playerHealth)

        createPlatform(85, 112, 170)
        createPlatform(230, 112, 90)
        createPlatform(350, 98, 85)

        createPlatform(130, 78, 55)
        createPlatform(250, 62, 60)

        createPlatform(80, 45, 55)
        createPlatform(185, 25, 60)
        createPlatform(310, 38, 65)
        createPlatform(430, 15, 70)

        createWall(160, 88, 24, 60)
        createWall(285, 70, 24, 85)
        createWall(375, 45, 24, 110)

        setPlayerStart(80, 95)
        createKiller(430, -5, false)

        createClone(75, 92, 8, 45, 125)
        createClone(220, 92, 8, 195, 260)
        createClone(350, 78, 8, 320, 380)
        createClone(130, 58, 8, 105, 150)
        createClone(250, 42, 8, 225, 275)
        createClone(185, 5, 8, 160, 210)
        createClone(310, 18, 8, 280, 335)

        game.splash("LEVEL 3")

    } else {
        playerHealth = 100
        info.setLife(playerHealth)

        createPlatform(85, 112, 170)
        createPlatform(230, 105, 75)
        createPlatform(350, 112, 100)
        createPlatform(470, 95, 70)

        createPlatform(95, 75, 55)
        createPlatform(190, 48, 55)
        createPlatform(300, 70, 60)
        createPlatform(395, 30, 65)
        createPlatform(510, 12, 90)

        createWall(145, 85, 24, 65)
        createWall(260, 58, 24, 95)
        createWall(330, 40, 24, 115)
        createWall(450, 18, 24, 140)

        setPlayerStart(80, 95)

        let killerXOptions = [180, 260, 340, 430, 520]
        let killerYOptions = [92, 52, 20, -5, 70]
        let randomSpot = randint(0, killerXOptions.length - 1)
        createKiller(killerXOptions[randomSpot], killerYOptions[randomSpot], false)

        createClone(70, 92, 14, 45, 125)
        createClone(120, 92, 14, 90, 150)
        createClone(220, 85, 14, 195, 250)
        createClone(280, 92, 14, 250, 320)
        createClone(350, 92, 14, 315, 390)
        createClone(470, 75, 14, 445, 495)
        createClone(95, 55, 14, 75, 115)
        createClone(140, 42, 14, 120, 165)
        createClone(190, 28, 14, 165, 215)
        createClone(245, 48, 14, 225, 275)
        createClone(300, 50, 14, 275, 325)
        createClone(395, 10, 14, 370, 420)
        createClone(510, -8, 14, 485, 540)

        levelHasTimer = true
        game.splash("LEVEL 4")
        info.startCountdown(15)
    }
}

function switchGravity(on: boolean) {
    if (on) {
        gravityOn = true
        gravityActive = false
        playerSprite.ay = 450
        playerSprite.sayText("Gravity ON", 600, false)
        music.thump.play()
        return
    }

    if (gravityCooldown || gravityActive) {
        playerSprite.sayText("Cooldown", 500, false)
        return
    }

    gravityOn = false
    gravityActive = true
    gravityCooldown = true
    gravityOffEndTime = game.runtime() + 1500
    gravityCooldownEndTime = game.runtime() + 4500

    playerSprite.ay = 0
    playerSprite.vy = -35
    playerSprite.sayText("Gravity OFF", 600, false)
    music.magicWand.play()
}

function updateGravityAbility() {
    if (gravityActive && game.runtime() >= gravityOffEndTime) {
        gravityActive = false
        gravityOn = true
        playerSprite.ay = 450
        playerSprite.vy = 0
        playerSprite.sayText("Gravity ON", 500, false)
        music.thump.play()
    }

    if (gravityCooldown && !gravityActive && game.runtime() >= gravityCooldownEndTime) {
        gravityCooldown = false
        playerSprite.sayText("Gravity Ready", 500, false)
        music.baDing.play()
    }
}

function swapLayer() {
    music.baDing.play()

    if (playerSprite.y > 75) {
        playerSprite.y = 45
    } else {
        playerSprite.y = 95
    }
}

function nearestTarget(): Sprite {
    let nearest = killer
    let nearestDistance = 9999

    if (killer) {
        nearestDistance = Math.abs(killer.x - playerSprite.x) + Math.abs(killer.y - playerSprite.y)
    }

    for (let c of clones) {
        let d = Math.abs(c.x - playerSprite.x) + Math.abs(c.y - playerSprite.y)

        if (d < nearestDistance) {
            nearest = c
            nearestDistance = d
        }
    }

    return nearest
}

function summonServant() {
    if (gameEnded || !servantReady) return

    let target = nearestTarget()
    if (!target) return

    servantReady = false
    attackLocked = false

    music.spooky.play()

    servant = sprites.create(img`
        . . . . 8 8 8 . . . .
        . . . 8 9 9 9 8 . . .
        . . 8 9 f 9 f 9 8 . .
        . 8 9 9 9 9 9 9 8 .
        . . 8 9 9 9 9 8 . .
        . . . 8 9 9 8 . . .
        . . 8 8 8 8 8 8 . .
        . 8 . . 8 8 . . 8 .
    `, SpriteKind.Servant)

    servant.setPosition(playerSprite.x, playerSprite.y)
    servant.follow(target, 130)

    pause(700)
    servantReady = true
}

function slashAnimation(target: Sprite) {
    let slash = sprites.create(img`
        . . . . . . . 1
        . . . . . . 1 .
        . . . . . 1 . .
        . . . . 1 . . .
        . . . 1 . . . .
        . . 1 . . . . .
        . 1 . . . . . .
        1 . . . . . . .
    `, SpriteKind.Projectile)

    slash.setPosition(target.x, target.y)
    pause(130)
    slash.destroy()
}

function completeLevel() {
    if (currentLevel < 4) {
        music.powerUp.play()
        loadLevel(currentLevel + 1)
    } else {
        gameEnded = true
        game.splash("YOU WIN!")
        music.baDing.play()
        game.over(true)
    }
}

function handleCorrectHit(s: Sprite, target: Sprite) {
    if (gameEnded || attackLocked) return

    attackLocked = true
    s.destroy()
    slashAnimation(target)
    music.bigCrash.play()
    target.destroy()
    completeLevel()
}

function handleWrongHit(s: Sprite, target: Sprite) {
    if (gameEnded || attackLocked) return

    attackLocked = true
    s.destroy()
    slashAnimation(target)

    music.zapped.play()

    playerHealth = playerHealth - 50
    info.setLife(playerHealth)
    playerSprite.sayText("-50 HP", 700, false)

    if (playerHealth <= 0) {
        playerHealth = 0
        info.setLife(playerHealth)
        pause(500)
        music.wawawawaa.play()
        game.splash("GAME OVER")
        loadLevel(currentLevel)
    } else {
        pause(300)
        attackLocked = false
    }
}

sprites.onOverlap(SpriteKind.Servant, SpriteKind.Killer, function (s: Sprite, k: Sprite) {
    handleCorrectHit(s, k)
})

sprites.onOverlap(SpriteKind.Servant, SpriteKind.Clone, function (s: Sprite, c: Sprite) {
    handleWrongHit(s, c)
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    switchGravity(true)
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    switchGravity(false)
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    let now = game.runtime()

    if (now - lastAPress < 250) {
        swapLayer()
    } else {
        if (gravityOn && playerSprite.vy == 0) {
            music.pewPew.play()
            playerSprite.vy = -160
        }
    }

    lastAPress = now
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    summonServant()
})

controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    summonServant()
})

info.onCountdownEnd(function () {
    if (levelHasTimer && !gameEnded) {
        music.wawawawaa.play()
        game.splash("GAME OVER")
        loadLevel(currentLevel)
    }
})

function landOnPlatforms(sprite: Sprite) {
    for (let p of platforms) {
        if (
            sprite.vy >= 0 &&
            sprite.bottom >= p.top &&
            sprite.bottom <= p.top + 10 &&
            sprite.right > p.left &&
            sprite.left < p.right
        ) {
            sprite.y = p.top - sprite.height / 2
            sprite.vy = 0
        }
    }
}

function blockWalls(sprite: Sprite) {
    for (let w of walls) {
        if (
            sprite.right > w.left &&
            sprite.left < w.right &&
            sprite.bottom > w.top &&
            sprite.top < w.bottom
        ) {
            let overlapTop = sprite.bottom - w.top

            if (sprite.vy >= 0 && overlapTop < 12) {
                sprite.bottom = w.top
                sprite.vy = 0
            } else if (sprite.x < w.x) {
                sprite.right = w.left
                sprite.vx = 0
            } else {
                sprite.left = w.right
                sprite.vx = 0
            }
        }
    }
}

function patrolClone(c: Sprite, i: number) {
    c.vx = cloneSpeed[i]

    if (c.x <= cloneMinX[i]) {
        c.x = cloneMinX[i]
        cloneSpeed[i] = Math.abs(cloneSpeed[i])
    }

    if (c.x >= cloneMaxX[i]) {
        c.x = cloneMaxX[i]
        cloneSpeed[i] = 0 - Math.abs(cloneSpeed[i])
    }
}

function playerFallCheck() {
    if (playerSprite.y > 130) {
        music.wawawawaa.play()
        game.splash("GAME OVER")
        loadLevel(currentLevel)
    }
}

game.onUpdate(function () {
    updateGravityAbility()

    landOnPlatforms(playerSprite)
    blockWalls(playerSprite)
    playerFallCheck()

    if (killer) {
        landOnPlatforms(killer)
        blockWalls(killer)
    }

    for (let i = 0; i < clones.length; i++) {
        landOnPlatforms(clones[i])
        blockWalls(clones[i])
        patrolClone(clones[i], i)
    }
})

createPlayer()
loadLevel(1)