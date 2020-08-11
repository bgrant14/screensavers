let scrSel = 0      //screensaver selection
let asleep = false  //sleep state

/*
 *  Main Screen - Snake Game
 */

let difficulty: number = 500 //snake movement timer
class snake {
    path: number[] = []
    tail: game.LedSprite[] = []
    food: game.LedSprite
    tailLength: number
    foodX: number
    foodY: number
    constructor() {
        //spawns the snake at a random location
        this.path[0, 0] = Math.randomRange(0, 4)
        this.path[0, 1] = Math.randomRange(0, 4)
        //creates the initial tail on the same x-axis
        this.path[1, 0] = this.path[0, 0] - 1
        this.path[1, 1] = this.path[0, 1]
        this.tailLength = 1
        //creates sprites at the snake locations
        this.tail[0] = game.createSprite(this.path[0, 0], this.path[0, 1])
        this.tail[1] = game.createSprite(this.path[1, 0], this.path[1, 1])
        //creates the first food sprite
        this.newFood()
    }
    newFood() {
        //places the food at a random location
        this.foodX = Math.randomRange(0, 4)
        this.foodY = Math.randomRange(0, 4)
        //calls the function again if the new food coordinates are on top of the snake
        for (let i: number = this.tailLength; i >= 0; i--) {
            if (this.foodX == this.path[i, 0] && this.foodY == this.path[i, 1]) this.newFood()
        }
        this.food = game.createSprite(this.foodX, this.foodY) //adds the sprite
    }
    edge(): boolean {
        //Checks if the snake is at the edge of the screen and which direction it's moving in
        //Moves the snake to the opposite side of the screen
        if (this.tail[0].get(LedSpriteProperty.X) == 4 && this.tail[0].get(LedSpriteProperty.Direction) == 90) {
            this.tail[0].setX(0)
            return true
        } else if (this.tail[0].get(LedSpriteProperty.X) == 0 && this.tail[0].get(LedSpriteProperty.Direction) == -90) {
            this.tail[0].setX(4)
            return true
        } else if (this.tail[0].get(LedSpriteProperty.Y) == 4 && this.tail[0].get(LedSpriteProperty.Direction) == 180) {
            this.tail[0].setY(0)
            return true
        } else if (this.tail[0].get(LedSpriteProperty.Y) == 0 && this.tail[0].get(LedSpriteProperty.Direction) == 0) {
            this.tail[0].setY(4)
            return true
        }
        return false
    }
    collision(): boolean {
        //checks whether the snake is eating itself
        for (let i: number = this.tailLength; i >= 2; i--) {
            if (this.tail[0].get(LedSpriteProperty.X) == this.tail[i].get(LedSpriteProperty.X) &&
                this.tail[0].get(LedSpriteProperty.Y) == this.tail[i].get(LedSpriteProperty.Y))
                return true
        }
        return false
    }
    slither() {
        //Checks for edge of screen
        if (this.edge()) {
            basic.pause(difficulty)
        } else {
            this.tail[0].move(1)
            basic.pause(difficulty)
        }
        //updates coordinates of player in array and moves the tail sprites
        for (let i: number = this.tailLength; i >= 1; i--) {
            this.path[i, 0] = this.tail[i - 1].get(LedSpriteProperty.X)
            this.path[i, 1] = this.tail[i - 1].get(LedSpriteProperty.Y)
            this.tail[i].goTo(this.path[i, 0], this.path[i, 1])
        }

        if (this.collision()) {
            game.gameOver()
        }

        //checks whether the snake eats the food
        if (this.path[0, 0] == this.foodX && this.path[0, 1] == this.foodY) {
            //adds to the tail
            this.tailLength++
            this.path[this.tailLength, 0] = this.path[this.tailLength - 1, 0]
            this.path[this.tailLength, 1] = this.path[this.tailLength - 1, 1]
            this.tail[this.tailLength] = game.createSprite(this.path[this.tailLength, 0], this.path[this.tailLength, 1])
            //deletes old food, iterates the score by 1, and creates new food
            this.food.delete()
            game.addScore(1)
            this.newFood()
        }
    }
    turnLeft() {
        this.tail[0].changeDirectionBy(-90)
    }
    turnRight() {
        this.tail[0].changeDirectionBy(90)
    }
}
let sGame = new snake()


/*
 *  Button Handling:
 */

//Turns the snake left on asynchronous event
input.onButtonPressed(Button.A, function () {
    sGame.turnLeft()
})

// Changes mode to working or turns the snake right
input.onButtonPressed(Button.B, function () {
    if (asleep) {
        asleep = false
    } else {
        sGame.turnRight()
    }

})

//On gesture, the screensaver changes
input.onGesture(Gesture.Shake, function () {
    scrSel = 0
})

input.onGesture(Gesture.TiltLeft, function () {
    scrSel = 1
})

input.onGesture(Gesture.TiltRight, function () {
    scrSel = 2
})

input.onGesture(Gesture.LogoUp, function () {
    scrSel = 3
})

input.onGesture(Gesture.LogoDown, function () {
    scrSel = 4
})

/*
 *  Rain Screensaver:
 */

// Nodes for linked list
class dropNode {
    dropX: number
    dropY: number
    dropB: number
    nextDrop: dropNode
    constructor() {
        //Create new drop location at random led on top of the screen
        this.dropX = Math.randomRange(0, 4)
        this.dropY = 0
        this.dropB = Math.randomRange(100, 255)
        //Reference to the next element
        this.nextDrop = null
    }
}

class droplets {
    head: dropNode
    constructor() {
        this.head = null
    }
    addDrop() {
        const newDrop = new dropNode()
        //Initialize the head of linked list on first run
        if (this.head == null) {
            this.head = newDrop
            led.plotBrightness(this.head.dropX, this.head.dropY, this.head.dropB)
        } else {
            //Iterate through list
            let current = this.head
            while (current.nextDrop) {
                current = current.nextDrop
            }
            //Add new element at the end
            current.nextDrop = newDrop
            led.plotBrightness(current.nextDrop.dropX, current.nextDrop.dropY, current.nextDrop.dropB)
        }
    }
    fall() {
        //When a drop reaches the end of screen, delete node and move head to next element
        while (this.head.dropY == 4) {
            led.unplot(this.head.dropX, this.head.dropY)
            this.head = this.head.nextDrop
        }
        //Iterate through linked list, moving drops down the screen
        let current = this.head
        while (current.nextDrop) {
            led.unplot(current.dropX, current.dropY)
            current.dropY++
            led.plotBrightness(current.dropX, current.dropY, current.dropB)
            current = current.nextDrop
        }
    }
    delDrops() {
        this.head = null
    }
}

function rain() {
    //creates the linked list object
    let rain = new droplets()
    let dropNum: number
    while (asleep && scrSel == 0) {
        //creates between 1 and 3 new drops at the top of the screen
        dropNum = Math.randomRange(1, 3)
        for (let index = 0; index < dropNum; index++) {
            rain.addDrop()
        }
        basic.pause(100)
        rain.fall() //moves drops down the screen
    }
    if (scrSel != 0) {
        rain.delDrops()
    }
}


/*
 *  Waves Screensaver:
 */

class wave {
    constructor() { }
    //creates shallow waves, moving them back and forth
    scroll() {
        for (let i: number = 0; i < 2; i++) {
            basic.clearScreen()
            for (let j: number = 0; j < 5; j++) {
                if (i % 2 == 0) {
                    if (j % 2 == 0) {
                        led.plot(j, 4)
                        led.plotBrightness(j, 3, 128)
                    } else {
                        led.plot(j, 4)
                    }
                } else {
                    if (j % 2 == 0) {
                        led.plot(j, 4)
                    } else {
                        led.plot(j, 4)
                        led.plotBrightness(j, 3, 128)
                    }
                }
            }
            basic.pause(250)
        }
    }
    makeWave(height: number) {
        for (let i = 0; i < 4; i++) {
            this.scroll()
        }
        //moves the shallow waves off the screen
        for (let i = 1; i < 5; i++) {
            led.unplot(i, 3)
            led.unplot(i + 2, 3)
            led.plotBrightness(i + 1, 3, 128)
            led.plotBrightness(i + 3, 3, 128)
            basic.pause(250)
        }
        //creates a larger waves and gradually moves it down and across the screen
        for (let i = 0; i < 8; i++) {
            if (i > 2) height--
            led.plot(i, 4 - height)
            led.plot(i - 1, 4 - height - 1)
            led.plot(i - 1, 4 - height)
            led.plot(i - 2, 4 - height)
            led.plot(i - 2, 4 - height + 1)
            led.plot(i - 2, 4 - height + 2)
            led.plot(i - 3, 4 - height + 1)
            basic.pause(250)
            led.unplot(i, 4 - height)
            led.unplot(i - 1, 4 - height - 1)
            led.unplot(i - 1, 4 - height)
            led.unplot(i - 2, 4 - height)
            led.unplot(i - 2, 4 - height + 1)
            led.unplot(i - 2, 4 - height + 2)
            led.unplot(i - 3, 4 - height + 1)
            for (let j = 0; j < 5; j++) led.plot(j, 4)
        }
    }
}


/*
 *  Fill-Unfill Screensaver:
 */

class fillOpts {
    fillStatus: boolean
    constructor() {
        this.fillStatus = false
    }
    //fills and unfills at random locations
    fillRand(fill: boolean) {
        if (fill) {
            while (!this.full()) {
                for (let i: number = 0; i < 4; i++)
                    led.plot(Math.randomRange(0, 4), Math.randomRange(0, 4))
                basic.pause(50)
            }
        } else {
            while (!this.empty()) {
                for (let i: number = 0; i < 4; i++)
                    led.unplot(Math.randomRange(0, 4), Math.randomRange(0, 4))
                basic.pause(50)
            }
        }
        basic.pause(200)
    }
    //fills and unfills moving lines in opposite directions across the screen
    fillLines(fill: boolean) {
        for (let i: number = 0; i < 5; i++) {
            for (let j: number = 0; j < 5; j++) {
                if (fill) {
                    if (j % 2 == 0) {
                        led.plot(i, j)
                    } else {
                        led.plot(4 - i, j)
                    }
                } else {
                    if (j % 2 == 0) {
                        led.unplot(i, j)
                    } else {
                        led.unplot(4 - i, j)
                    }
                }
            }
            basic.pause(250)
        }
    }
    //fills and unfills using concentric squares
    fillSquares(fill: boolean) {
        for (let i: number = 0; i < 5; i++) {
            for (let j: number = 0; j < 5 - i; j++) {
                if (fill) {
                    led.plot(i, j)
                    led.plot(j, i)
                    led.plot(4 - i, j)
                    led.plot(j, 4 - i)
                } else {
                    led.unplot(i, j)
                    led.unplot(j, i)
                    led.unplot(4 - i, j)
                    led.unplot(j, 4 - i)
                }
            }
            basic.pause(250)
        }
    }
    //fills and unfills "sweeping" leds across diagonal portions of the screen
    fillSweep(fill: boolean) {
        for (let i: number = 0; i < 5; i++) {
            if (fill) {
                led.plot(i, i)
            } else {
                led.unplot(i, i)
            }
        }
        for (let i: number = 1; i < 5; i++) {
            for (let j: number = 0; j < i; j++) {
                if (fill) {
                    led.plot(j, i)
                    led.plot(4 - j, 4 - i)
                } else {
                    led.unplot(j, i)
                    led.unplot(4 - j, 4 - i)
                }
            }
            basic.pause(250)
        }
    }
    //returns true if every led is on
    full(): boolean {
        for (let i: number = 0; i < 5; i++) {
            for (let j: number = 0; j < 5; j++) {
                if (!led.point(i, j)) return false
            }
        }
        return true
    }
    //returns true if every led is off
    empty(): boolean {
        for (let i: number = 0; i < 5; i++) {
            for (let j: number = 0; j < 5; j++) {
                if (led.point(i, j)) return false
            }
        }
        return true
    }
    //randomly selects one of the functions to fill or unfill the screen
    fillUnfill() {
        let selection: number = Math.randomRange(0, 3)
        if (!this.full() && !this.fillStatus) {
            switch (selection) {
                case 0:
                    this.fillRand(true)
                    break;
                case 1:
                    this.fillLines(true)
                    break;
                case 2:
                    this.fillSquares(true)
                    break;
                case 3:
                    this.fillSweep(true)
                    break;
            }
            if (this.full()) this.fillStatus = true
        } else {
            switch (selection) {
                case 0:
                    this.fillRand(false)
                    break;
                case 1:
                    this.fillLines(false)
                    break;
                case 2:
                    this.fillSquares(false)
                    break;
                case 3:
                    this.fillSweep(false)
                    break;
            }
            if (this.empty()) this.fillStatus = false
        }
    }
}


/*
 *  Nilakantha Pi Screensaver:
 */

class nilakanthaPi {
    constructor() { }
    dispPi(fraction: number) {
        basic.clearScreen()
        //Displays 3 on the top row
        led.plot(3, 0)
        led.plot(4, 0)
        //Displays the fractional portion of pi in binary, reads left-right
        for (let i = 1; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                fraction *= 2
                if (fraction > 1) {
                    fraction -= 1
                    led.plot(j, i)
                }
            }
        }
    }
    calculate() {
        let piFrac: number = 0, sign = 1
        //Calculates the fractional portion of pi using the Nilakantha series
        for (let i = 2; i < 200; i += 2) {
            piFrac = piFrac + sign * (4 / (i * (i + 1) * (i + 2)))
            sign = -sign
            //displays each iteration of the calculation
            this.dispPi(piFrac)
            basic.pause(100)
        }
        basic.pause(2000)
    }
}


class rocket {
    constructor() { }
    //creates the ship in the middle of the screen
    ship() {
        for (let i = 1; i < 4; i++) {
            led.plot(i, 3)
            led.plot(2, i)
        }
    }
    //creates a flame of varying brightness
    flame() {
        led.plotBrightness(2, 4, Math.randomRange(100, 200))
    }
    //shows or removes the bottom row of LEDs to represent the ground
    ground(show: boolean) {
        if (show) {
            for (let i = 0; i < 5; i++) led.plot(i, 4)
        } else {
            for (let i = 0; i < 5; i++) led.unplot(i, 4)
        }
    }
    animate() {
        //creates the ship and ground after clearing the screen
        basic.clearScreen()
        this.ship()
        this.ground(true)
        basic.pause(250)
        this.ground(false) //removes the ground
        //animates the flame during blast-off
        for (let i = 0; i < 4; i++) {
            this.flame()
            basic.pause(250)
        }
        let stars = new droplets //droplets to represent stars
        for (let i = 0; i < 32; i++) {
            if (i % 2 == 0) stars.addDrop() //creates a star every other cycle
            //animates the flame, ensures the ship persists
            this.flame()
            this.ship()
            basic.pause(250)
            if (i % 2 == 0) stars.fall() //moves the stars every other cycle
            //begins removing the stars from the bottom before landing
            if (i > 25) {
                led.unplot(stars.head.dropX, stars.head.dropY)
                stars.head = stars.head.nextDrop
            }
        }
        for (let i = 0; i < 5; i++) led.unplot(i, 0) //ensures no stars remain 
        stars.delDrops()
        //animates the flame prior to landing
        for (let i = 0; i < 4; i++) {
            this.flame()
            basic.pause(250)
        }
        //shows the ground 
        this.ground(true)
        basic.pause(1000)
    }
}


/*
 *  Forever Loop:
 */

//screensaver objects
let newWave = new wave
let fills = new fillOpts
let piScr = new nilakanthaPi
let spaceship = new rocket
//track timing for A-button press
let t0: number, t1: number, running: boolean = false
basic.forever(function () {
    if (!asleep) {
        //runs the snake game
        game.resume()
        sGame.slither()
        //checks whether the A-button is being held
        if (input.buttonIsPressed(Button.A) && !running) t0 = input.runningTimeMicros()
        if (!input.buttonIsPressed(Button.A)) t0 = -1
        if (input.buttonIsPressed(Button.A) && t0 > 0) {
            running = true
            t1 = input.runningTimeMicros()
            //if the button has been held for 2-seconds, changes to asleep mode
            if (t1 - t0 >= 2000) {
                asleep = true
                running = false
                t1 = 0
                t0 = -1
            }
        } else {
            running = false
        }
        if (asleep) game.pause()
    } else {
        switch (scrSel) {
            case 0:
                rain()
                break;
            case 1:
                spaceship.animate()
                break;
            case 2:
                fills.fillUnfill()
                break;
            case 3:
                piScr.calculate()
                break;
            case 4:
                newWave.makeWave(Math.randomRange(2, 3))
                break;
        }
    }
})