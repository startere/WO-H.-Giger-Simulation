var APP = {
    LOADQUEUE: null
}

var stage = new createjs.Stage("demoCanvas");

var explosionCounter = 0;

createjs.Sound.registerSound({id:"boom", src:"assets/EXPLOSION.mp3"})
createjs.Sound.registerSound({id:"siren", src:"assets/Siren.mp3"})
createjs.Sound.registerSound({id:"engine", src:"assets/Engine Noise.mp3"})
createjs.Sound.registerSound({id:"alien1", src:"assets/Xenomorph1.mp3"})
createjs.Sound.registerSound({id:"alien2", src:"assets/Xenomorph2.mp3"})
createjs.Sound.registerSound({id:"alienFinal", src:"assets/XenomorphFinal.mp3"})
createjs.Sound.registerSound({id:"killingStrangers", src:"assets/Killing Strangers.mp3"})

var initSequence = $('<video width="1500" height="750" autoplay><source src="assets/Initial Sequence.mp4" type="video/mp4"></video>').appendTo(document.body)[0];
var cjsVideo = new createjs.DOMElement(initSequence);
cjsVideo.x = 0
cjsVideo.y = -750

stage.addChild(cjsVideo);

initSequence.addEventListener("click", function(){
    document.body.removeChild(initSequence);
    
    function engine(){
        createjs.Sound.play("engine", {loop:1000})
            .volume = 0.4
    }
    engine();
    window.setTimeout(engine,1000);
})

function tick() {
    stage.update()
}

function spritesLoaded() {
    startScreen = new StartScreen(stage), 
    stage.addChild(startScreen)
}

var manifest = [{
    src: "sniper.png",
    id: "sprite_sniper"
}, {
    src: "rocket.png",
    id: "sprite_rocket"
},{
    src: "explosion.png",
    id: "sprite_explosion"
}];

APP.LOADQUEUE = new createjs.LoadQueue(!0),

APP.LOADQUEUE.loadManifest(manifest, !0, "assets/"), 

APP.LOADQUEUE.addEventListener("complete", spritesLoaded),

createjs.Touch.enable(stage),

$("body").on("contextmenu", "canvas", function(){
    return !1
})

createjs.Ticker.addEventListener("tick", tick), createjs.Ticker.setFPS(60);

var Config = {
    outputDataJSON: !0
}

class Game extends createjs.Container{
    constructor(stage, hero){
        super();
        this.chosen_hero = hero
        this.initializeGame()
    }

    initializeGame(){
        this.addHero()
    }

    addHero(){
        var hero = new Sniper(200, 200);
        this.addChild(hero), 
        stage.addChild(this), 
        this.bindGameEvents(hero)
    }

    bindGameEvents(hero){
        this.stage.on("stagemousedown", this.heroAction, null, !1, [hero, this.stage]),
        this.stage.on("stagemousemove", this.heroRotate, null, !1, hero)
    }

    heroAction(container, containerB){
        var containerC = containerB[0]
        var containerD = containerB[1]
        if(2 == container.nativeEvent.button) {
            containerC.move(container.stageX, container.stageY, containerC);
            var loc = new Location(container.stageX, container.stageY);
            containerD.addChild(loc),
            loc.on("REMOVE_MOVETO", function(){
                containerD.removeChild(loc);
            })
        } else if (0 == container.nativeEvent.button) {
            var shoot = containerC.shoot(containerC.x, containerC.y, containerD.mouseX, containerD.mouseY);
            containerD.addChild(shoot),
            shoot.on("BULLET_EXPLODE", function(){
                            
                containerD.removeChild(shoot)
            })
        }
    }

    heroRotate(container, containerB){
        var rotationAngle = Math.atan2(container.rawY - containerB.y, container.rawX - containerB.x);
        rotationAngle *= 180 / Math.PI,
        containerB.rotation = 90 + rotationAngle;
    }

    mainSequence(explosionCounter){
        var consoleText = new createjs.Text(
            "Simulation MALFUNCTION: Please wait for suit unlock...",
            "16px Courier",
            "#fff" 
        );

        function unlockSuit(){
            consoleText.text = "Suit unlocked. You may remove your headset. Please note: engine MALFUNCTION. ETA: 26 yrs."
            stage.removeAllEventListeners();
        }

        if(explosionCounter == 1){

            consoleText.x = 0
            consoleText.y = 0
        
            stage.addChild(consoleText)
            window.setTimeout(unlockSuit, 120000);
        }

        if(explosionCounter == 10){
            var soundInstance = createjs.Sound.play("alien1");
        }

        if(explosionCounter == 25){
            var soundInstance = createjs.Sound.play("alien2");
            var soundInstance = createjs.Sound.play("siren", {loop:7})
                .volume = 0.4;
        }

        if(explosionCounter == 45){
            var soundInstance = createjs.Sound.play("alienFinal");
            
            function final(){
                consoleText.text = "Host disconnected. Please reattach headset to continue..."
                consoleText.y = 12
                stage.addChild(consoleText)
                stage.removeAllEventListeners();
                function hiddenSong(){
                    var soundInstance = createjs.Sound.play("killingStrangers");
                }
                window.setTimeout(hiddenSong, 15000);
            }
            
            window.setTimeout(final, 14000);
        }
    }
}   

class StartScreen extends createjs.Container{
    constructor(stage){
        super()
        this.initializeStartScreen()
    }

    initializeStartScreen(){
        var outerShape = new createjs.Shape;
        outerShape.graphics
            .beginFill("#3e414440")
            .setStrokeStyle(10)
            .beginStroke("#333638")
            .drawRoundRect(70, 130.5, 820, 460, 10);
        var innerContainer = new createjs.Container;
        innerContainer.name = "screenContainer";
        var innerContainerShape = new createjs.Shape;
        innerContainerShape.graphics
            .beginFill("#f0000099")
            .drawRect(0, -80, 810, 450),
        innerContainerShape.set({
            x: 75,
            y: 215
        }),
        innerContainer.mask = innerContainerShape,
        this.addChild(outerShape, innerContainer),
        this.setChildIndex(outerShape, 0);
        var screen1 = new Screen1()
        this.getChildByName("screenContainer")
            .addChild(screen1),
        this.bindStartScreenEvents()
    }

    bindStartScreenEvents(){
        var containerBindEvents = this;
        this.on("click", function(clickedBtn){  
            if(clickedBtn.target.text == "Start Simulation") {
                clickedBtn.target.name == "chooseHeroBtn" 
                && 
                containerBindEvents.gotoScreen2(),
                clickedBtn.target.name == "startGameBtn"
                &&
                containerBindEvents.gotoScreen2()
                containerBindEvents.startGame(containerBindEvents.chosenHero)
            } 
        })
    }

    gotoScreen2(){
        var container = this.getChildByName("screenContainer")
                            .getChildByName("screen1")
        var containerB = this.getChildByName("screenContainer")
                             .getChildByName("screen2")
        
        createjs.Tween.get(container).to(
            { x: -820 },
            300,
            createjs.Ease.backIn
        ).call(function() {
            createjs.Tween.get(containerB).to(
                { x: 0 },
                1e3,
                createjs.Ease.elasticOut
            )
        })
    }

    startGame(chosenHero){
        var containerStartGame = this;
        this.hide(function() {
            new Game(containerStartGame.getStage(), chosenHero)
        })
    }

    hide(container){
        createjs.Tween.get(this).to(
            { y: -800 },
            400,
            createjs.Ease.backIn
        )
        .call(container)
    }
}

class Screen1 extends createjs.Container{
    constructor(){
        super()
        this.initializeScreen1()
    }

    initializeScreen1(){
        this.name = "screen1";
        var button = new Button({
            name: "startGameBtn",
            x: 160,
            y: 300,
            text: "Start Simulation",
            color: "#C8C8C880"
        });

        var logo = new createjs.Bitmap("assets/Weyland_Yutani_Corporation.jpg")
        logo.x = -155
        logo.y = -160

        var idText = new createjs.Text(
            "Warrant Officer Hamlet Giger, Serial/ID number: ID# T7OBE5O9RNOT/2T-0OBE2, welcome. ",
            "16px Courier",
            "#fff" 
        );

        idText.x = 85
        idText.y = 550
        
        this.addChild(logo)
        this.addChild(idText)
        this.addChild(button)
    }
}

class Button extends createjs.Container{
    constructor(button){
        super()
        this.x = button.x,
        this.y = button.y,
        this.text = button.text,
        this.color = button.color,
        this.name = button.name,
        createjs.Container.call(this),
        this.initializeButton()
    }

    initializeButton(){
        var height, width,
        container = this;
        this.width ? width = this.width : height = 340,
        this.mouseChildren = !1,
        width = this.height ? this.height : 60;
        var shape = new createjs.Shape;
        var graphicsBtn = (new createjs.Graphics)
            .beginFill(container.color)
            .drawRoundRect(310, 315, height, width, 4)
        var buttonText = new createjs.Text(
                this.text,
                "32px Courier",
                "#fff" 
            );
        buttonText.set({
            x: 480,
            y: 330,
            textAlign: "center"
        }),
        shape.set({
            graphics: graphicsBtn,
            x: container.x,
            y: container.y,
            cursor: "pointer"
        }),
        this.addChild(shape),
        this.addChild(buttonText)
        this.setChildIndex(shape, 1)
        this.setChildIndex(buttonText, 1)
    }
}

class Bullet extends createjs.Container{
    constructor(x, y, targetX, targetY, rotation) {

        super();
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.rotation = rotation; 
        
        this.initializeBullet()
    }

    initializeBullet(){
        this.createBullet()
    }

    createBullet(){
        var container = {
                images: [APP.LOADQUEUE.getResult("sprite_rocket")],
                frames: {
                    width: 26,
                    height: 49,
                    count: 4,
                    regX: 0,
                    regY: 0
                },
                animations: {
                    fly: {
                        frames: [0, 1, 2, 3],
                        speed: .5,
                        loop: !1
                    }
                }
            }
            var spriteSheet = new createjs.SpriteSheet(container)
          
            var sprite = new createjs.Sprite(spriteSheet, "fly");  
            this.addChild(sprite);
            var destination = Math.abs(this.targetX - this.x)
                              +
                              Math.abs(this.targetY - this.y)

            createjs.Tween.get(this).to(
                    {
                        x: this.targetX,
                        y: this.targetY
                    },
                    destination
                )
                .call(this.explodeOnArrival)
    }

    explodeOnArrival(){
        var container = this;
        this.removeChild(this.children[0]);
        var animation = {
            images: [APP.LOADQUEUE.getResult("sprite_explosion")],
            frames: {
                width: 128,
                height: 128,
                count: 40,
                regX: 0,
                regY: 0
            },
            animations: {
                explode: {
                    frames: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
                    speed: .5,
                    loop: !1
                }
            }
        }
        var spriteSheet = new createjs.SpriteSheet(animation)
        var sprite = new createjs.Sprite(spriteSheet, "explode")
        sprite.set({
            x: -64,
            y: -64
        }),
        sprite.on("animationend", function(){
            container.dispatchEvent("BULLET_EXPLODE")
        }),
        this.addChild(sprite) 

        explosionCounter++
        createjs.Sound.play("boom");

        Game.prototype.mainSequence(explosionCounter);
    }
}

class Hero extends createjs.Container {
    constructor(){
        super();
        this.moveTween = null
        this.regX = 0
        this.regY = 0
    }

    shoot(x, y, targetX, targetY){
        var bullet = new Bullet(x, y, targetX, targetY, this.rotation);
        return bullet
    }

    move(destX, destY, origin){
        var move = this;
        this.moveTween && this.moveTween.setPaused(!0)
        var toX = destX + 1
        var toY = destY + 1
        
        origin.x < destX
        &&
        (toX = destX - 1),
        
        origin.y < destY
        &&
        (toY = destY - 1)
        var delta = 4 * (Math.abs(destX - origin.x)
                         +
                         Math.abs(destY - origin.y));
        move.character.gotoAndPlay("walk")
        this.moveTween = createjs.Tween.get(origin).to({
            x: toX,
            y: toY
        },
        delta).call(function() {
            move.character.gotoAndPlay("stand")
        })
    }
}

class Location extends createjs.Container{
    constructor(targetX, targetY){
        super();
        this.targetX = targetX;
        this.targetY = targetY;
        this.initializeLoc()
    }

    initializeLoc(){
        this.createLocation()
    }

    createLocation(){
        var shape = new createjs.Shape;
        shape.graphics.s("#F00")
            .ss(5)
            .beginFill("#252729")
            .drawCircle(0, 0, 20)
        shape.x = this.targetX
        shape.y = this.targetY
        shape.scaleX = 0
        shape.scaleY = 0
        shape.alpha = 1
        this.addChild(shape)
        
        var createLocation = this
        createjs.Tween.get(shape).to({
            scaleX: 1,
            scaleY: 1,
            alpha: 0
        }, 500).call(this.removeLocation, [createLocation])
    }

    removeLocation(){
        var removeMovetoEvent = new createjs.Event("REMOVE_MOVETO");
        this.dispatchEvent(removeMovetoEvent)
    }
}

class Sniper extends Hero{
    constructor(x, y){
        super();
        this.x = x;
        this.y = y;
        this.initializeSniper()
    }

    initializeSniper(){
        var container = {
            images: [APP.LOADQUEUE.getResult("sprite_sniper")],
            frames: {
                width: 53,
                height: 63,
                count: 7,
                regX: 0,
                regY: 0
            },
            animations: {
                walk: {
                    frames:[0, 1, 2, 3, 4, 5, 6],
                    speed: .5
                },
                stand: [0]
            }
        };
        var spriteSheet = new createjs.SpriteSheet(container)
        this.character = new createjs.Sprite(spriteSheet, "stand"),
        this.character.set({
            x: -13
        }),
        this.aim = new createjs.Shape,
        this.aim.graphics.beginLinearGradientFill(
            ["#252729", "red"],
            [0, 1],
            0,
            -550,
            1,
            500
        ).drawRect(0, -500, 1, 500),
        this.addChild(this.character, this.aim)
    }
}

var Debug = function(){
    function debug() {}
        $(function() {
        })
}();
