// THE MIMIC PROTOCOL: CHAOS
// MakeCode Arcade JavaScript Platformer Version
// Paste this into MakeCode Arcade > JavaScript

namespace SpriteKind {
    export const Clone = SpriteKind.create()
    export const Servant = SpriteKind.create()
    export const Platform = SpriteKind.create()
}

let playerSprite: Sprite = null
let servant: Sprite = null
let clones: Sprite[] = []
let killer: Sprite = null
let selectedClone: Sprite = null
let platforms: Sprite[] = []
let gravityOn = true
let playerHealth = 100
let gameEnded = false
let servantReady = true
let attackLocked = false
let lastAPress = 0

function createPlatform(x: number, y: number, w: number) {
    let p = sprites.create(image.create(w, 8), SpriteKind.Platform)
    p.image.fill(11)
    p.setPosition(x, y)
    p.setFlag(SpriteFlag.Ghost, true)
    platforms.push(p)
}

function setupFloorMap() {
    scene.setBackgroundColor(15)

    // Built-in floor map made from platform sprites.
    // This avoids tilemap asset errors in MakeCode Arcade.
    createPlatform(80, 112, 160)    // main lower floor
    createPlatform(210, 112, 160)   // main lower floor
    createPlatform(70, 72, 80)      // upper platform 1
    createPlatform(170, 56, 90)     // upper platform 2
    createPlatform(250, 80, 70)     // upper platform 3
}

function createPlayer() {
    playerSprite = sprites.create(img`
        . . . f f f f . . .
        . . f e e e e f . .
        . f e e f e e e f .
        . f e e e e e e f .
        . f f 4 4 4 4 f f .
        . . f 4 4 4 4 f . .
        . . f 4 f f 4 f . .
        . . f f . . f f . .
    `, SpriteKind.Player)
    playerSprite.setPosition(20, 90)
    controller.moveSprite(playerSprite, 90, 0)
    playerSprite.ay = 450
    scene.cameraFollowSprite(playerSprite)
    info.setLife(100)
}

function createClone(x: number, y: number, isKiller: boolean) {
    let cloneImage = img`
        . . . f f f f . . .
        . . f 2 2 2 2 f . .
        . f 2 2 f 2 2 2 f .
        . f 2 2 2 2 2 2 f .
        . f f 1 1 1 1 f f .
        . . f 1 1 1 1 f . .
        . . f 1 f f 1 f . .
        . . f f . . f f . .
    `

    // Hidden killer: only a tiny shoe color difference.
    if (isKiller) {
        cloneImage = img`
            . . . f f f f . . .
            . . f 2 2 2 2 f . .
            . f 2 2 f 2 2 2 f .
            . f 2 2 2 2 2 2 f .
            . f f 1 1 1 1 f f .
            . . f 1 1 1 1 f . .
            . . f 1 f f 1 f . .
            . . f f . . 2 f . .
        `
    }

    let c = sprites.create(cloneImage, SpriteKind.Clone)
    c.setPosition(x, y)
    c.ay = 450
    c.vx = randint(5, 12)
    if (Math.percentChance(50)) {
        c.vx = c.vx * -1
    }
    c.setBounceOnWall(true)
    clones.push(c)
    if (isKiller) {
        killer = c
    }
}

function createClones() {
    clones = []
    let killerIndex = randint(0, 9)

    let cloneX = [35, 60, 90, 125, 165, 205, 235, 70, 170, 250]
    let cloneY = [90, 90, 90, 90, 90, 90, 90, 50, 35, 60]

    for (let i = 0; i < 10; i++) {
        createClone(cloneX[i], cloneY[i], i == killerIndex)
    }
}

function switchGravity(on: boolean) {
    gravityOn = on
    if (gravityOn) {
        playerSprite.ay = 450
        playerSprite.sayText("Gravity ON", 400, false)
    } else {
        playerSprite.ay = 0
        playerSprite.vy = -35
        playerSprite.sayText("No Gravity", 400, false)
    }
}

function findNearestClone(): Sprite {
    let nearest: Sprite = null
    let nearestDistance = 9999

    for (let c of clones) {
        if (c && c.kind() == SpriteKind.Clone) {
            let d = Math.abs(c.x - playerSprite.x) + Math.abs(c.y - playerSprite.y)
            if (d < nearestDistance) {
                nearestDistance = d
                nearest = c
            }
        }
    }
    return nearest
}

function summonServant() {
    if (gameEnded || !(servantReady)) {
        return
    }

    selectedClone = findNearestClone()
    if (!(selectedClone)) {
        return
    }

    servantReady = false
    attackLocked = false
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
    servant.follow(selectedClone, 130)

    pause(800)
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

function landOnPlatforms(sprite: Sprite) {
    for (let p of platforms) {
        if (sprite.vy >= 0 && sprite.bottom >= p.top && sprite.bottom <= p.top + 10 && sprite.right > p.left && sprite.left < p.right) {
            sprite.y = p.top - sprite.height / 2
            sprite.vy = 0
        }
    }
}

sprites.onOverlap(SpriteKind.Servant, SpriteKind.Clone, function (s: Sprite, c: Sprite) {
    if (gameEnded || attackLocked) {
        return
    }

    // Lock the attack so the same overlap cannot remove HP many times instantly.
    attackLocked = true
    s.destroy()
    slashAnimation(c)

    if (c == killer) {
        c.destroy()
        gameEnded = true
        game.over(true)
    } else {
        playerHealth += -50
        info.setLife(playerHealth)
        c.sayText("Wrong clone! -50 HP", 500, false)

        if (playerHealth <= 0) {
            gameEnded = true
            game.splash("GAME OVER")
            game.over(false)
        } else {
            // Allow the next servant attack after the first one fully finishes.
            pause(300)
            attackLocked = false
        }
    }
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    switchGravity(true)
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    switchGravity(false)
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    let now = game.runtime()

    // Double tap A = swap layer
    if (now - lastAPress < 250) {
        if (playerSprite.y > 75) {
            playerSprite.y = 45
            playerSprite.sayText("Upper layer", 300, false)
        } else {
            playerSprite.y = 95
            playerSprite.sayText("Lower layer", 300, false)
        }
    } else {
        // Single tap A = jump
        if (gravityOn && playerSprite.vy == 0) {
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
    if (!(gameEnded)) {
        gameEnded = true
        game.splash("GAME OVER")
        game.over(false)
    }
})

game.onUpdate(function () {
    landOnPlatforms(playerSprite)
    for (let c of clones) {
        landOnPlatforms(c)
        if (c.x < 10 || c.x > 310) {
            c.vx = c.vx * -1
        }
    }
})

function startGame() {
    setupFloorMap()
    createPlayer()
    createClones()
    game.splash("Mimic Protocol", "Find the odd clone in 15 seconds")
    info.startCountdown(15)
}

startGame()
