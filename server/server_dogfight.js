const PlaneGameScene = require("../scripts/plane_game_scene.js");
const SoundManager = require("../scripts/general/sound_manager.js");
const AfterMatchStats = require("../scripts/after_match_stats.js");
const TickScheduler = require("../scripts/tick_scheduler.js");
const Lock = require("../scripts/general/lock.js");
const NotSamLinkedList = require("../scripts/general/notsam_linked_list.js");
const helperFunctions = require("../scripts/general/helper_functions.js");

const HumanFighterPlane = require("../scripts/plane/fighter_plane/human_fighter_plane.js");
const HumanBomberPlane = require("../scripts/plane/bomber_plane/human_bomber_plane.js");
const BiasedBotBomberPlane = require("../scripts/plane/bomber_plane/biased_bot_bomber_plane.js");
const BiasedBotFighterPlane = require("../scripts/plane/fighter_plane/biased_bot_fighter_plane.js");

/*
    Class Name: ServerDogfight
    Description: A dogfight that is run by a server with connected clients.
*/
class ServerDogfight {
    /*
        Method Name: constructor
        Method Parameters:
            dogfightJSON:
                A json object with information on the settings of a dogfight
            TODO
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(dogfightJSON, gameHandler){
        this.gameHandler = gameHandler;
        this.winner = null;
        this.bulletPhysicsEnabled = dogfightJSON["bullet_physics_enabled"];
        this.numTicks = 0;

        this.soundManager = new SoundManager();
        this.stats = new AfterMatchStats();

        this.scene = new PlaneGameScene(this.soundManager);
        this.scene.setGamemode(this);
        this.scene.enableTicks();
        this.scene.setBulletPhysicsEnabled(this.bulletPhysicsEnabled);
        this.scene.setStatsManager(this.stats);

        this.planes = [];
        this.createPlanes(dogfightJSON);
        this.scene.setEntities(this.planes);

        this.tickScheduler = new TickScheduler(async () => { await this.tick(); await this.tick(); }, PROGRAM_DATA["settings"]["ms_between_ticks"] / 2, Date.now());
        this.tickInProgressLock = new Lock();
        this.userInputLock = new Lock();
        this.userInputQueue = new NotSamLinkedList();
        this.isATestSession = this.isThisATestSession(dogfightJSON);
        this.running = true;
        this.paused = false;
        this.gameOver = false;
        this.lastState = this.generateState();
    }

    getNumTicks(){
        return this.numTicks;
    }

    isPaused(){
        return false;
    }

    /*
        Method Name: playerDisconnected
        Method Parameters:
            username:
                The username of the player that has disconnected
        Method Description: Kills off a player who has disconnected
        Method Return: void
    */
    playerDisconnected(username){
        for (let plane of this.planes){
            if (plane.getID() == username){
                plane.die();
            }
        }
    }

    /*
        Method Name: pause
        Method Parameters: None
        Method Description: Pauses the game
        Method Return: void
    */
    pause(){
        this.paused = true;
    }

    /*
        Method Name: unpause
        Method Parameters: None
        Method Description: Resumes the game
        Method Return: void
    */
    unpause(){
        this.paused = false;
    }

    /*
        Method Name: isRunning
        Method Parameters: None
        Method Description: Determines if the game is running
        Method Return: Boolean, true -> running, false -> not running
    */
    isRunning(){
        return this.running && !this.isGameOver();
    }

    /*
        Method Name: end
        Method Parameters: None
        Method Description: Ends a game
        Method Return: void
    */
    end(){
        this.running = false;
        this.gameOver = true;
        this.tickScheduler.end();
        this.gameHandler.gameOver(this.generateState());
    }

    /*
        Method Name: areBulletPhysicsEnabled
        Method Parameters: None
        Method Description: Provides information about whether bullet physics are enabled in the game
        Method Return: Boolean, true -> bullet physics enabled, false -> bullet physics not enabled
    */
    areBulletPhysicsEnabled(){
        return this.bulletPhysicsEnabled;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Run the actions that take place during a tick
        Method Return: void
    */
    async tick(){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.numTicks >= this.tickScheduler.getExpectedTicks()){ return; }
        await this.tickInProgressLock.awaitUnlock(true);

        // Tick the scene
        await this.scene.tick(PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.checkForEnd();
        this.numTicks++;

        // Save current state and update from user input
        this.lastState = this.generateState();
        await this.updateFromUserInput();
        this.tickInProgressLock.unlock();
    }

    /*
        Method Name: checkForEnd
        Method Parameters: None
        Method Description: Checks if the game is ready to end
        Method Return: void
    */
    checkForEnd(){
        let allyCount = 0;
        let axisCount = 0;
        // Loop through all the planes, count how many are alive
        for (let entity of this.planes){
            if (entity instanceof Plane && !entity.isDead()){
                let plane = entity;
                if (planeModelToAlliance(plane.getPlaneClass()) == "Axis"){
                    axisCount++;
                }else{
                    allyCount++;
                }
            }
        }
        // Check if the game is over and act accordingly
        if ((axisCount == 0 || allyCount == 0) && !this.isATestSession){
            this.winner = axisCount != 0 ? "Axis" : "Allies";
            this.stats.setWinner(this.winner);
            this.end();
        }
    }

    /*
        Method Name: isThisATestSession
        Method Parameters:
            dogfightJSON:
                Details about the dog fight
        Method Description: Determine if this is a test session (not a real fight so no end condition)
        Method Return: boolean, true -> this is determined to be a test session, false -> this isn't detewrmined to be a test session
    */
    isThisATestSession(dogfightJSON){
        let noAllies = true;
        let noAxis = true;
        // Check humans
        for (let userObject of dogfightJSON["users"]){
            let planeModel = userObject["model"];
            if (planeModel == "freecam"){ return; }
            if (planeModelToAlliance(planeModel) == "Axis"){
                noAxis = false;
            }else if (planeModelToAlliance(planeModel) == "Allies"){
                noAllies = false;
            }
            // If determines its not a test session stop checking
            if (!(noAxis || noAllies)){
                break;
            }
        }
        // If there are both allies and axis then return false
        if (!(noAxis || noAllies)){
            return false;
        }
        // Check bots
        for (let [planeModel, planeCount] of Object.entries(dogfightJSON["plane_counts"])){
            if (planeModelToAlliance(planeModel) == "Axis" && planeCount > 0){
                noAxis = false;
            }else if (planeModelToAlliance(planeModel) == "Allies" && planeCount > 0){
                noAllies = false;
            }
            // If determines its not a test session stop checking
            if (!noAxis && !noAllies){
                break;
            }
        }
        return noAxis || noAllies;
    }

    /*
        Method Name: getLastState
        Method Parameters: None
        Method Description: Getter
        Method Return: JSON object representing the last state of the game produced
    */
    getLastState(){
        return this.lastState;
    }

    /*
        Method Name: isGameOver
        Method Parameters: None
        Method Description: Checks if the game is over
        Method Return: boolean, true -> the game is over, false -> the game is not over
    */
    isGameOver(){
        return this.gameOver;
    }

    /*
        Method Name: generateState
        Method Parameters: None
        Method Description: Generates a representation of the current game state
        Method Return: A JSON Object representing the current game state
    */
    generateState(){
        let stateRep = {};
        stateRep["paused"] = this.isPaused();
        stateRep["num_ticks"] = this.numTicks;
        stateRep["start_time"] = this.tickScheduler.getStartTime();
        stateRep["game_over"] = this.isGameOver()
        // Send different things if running
        if (this.isRunning()){
            // Add sound
            stateRep["sound_list"] = this.soundManager.getSoundRequestList();
            this.soundManager.clearRequests();
            // Add planes
            stateRep["planes"] = this.scene.getTeamCombatManager().getPlaneJSON();
            // Add bullets
            stateRep["bullets"] = this.scene.getBulletJSON();
        }else{
            // Add after match stats
            stateRep["stats"] = this.stats.toJSON();
        }
        return stateRep;
    }

    /*
        Method Name: createPlanes
        Method Parameters:
            dogfightJSON:
                A JSON object containing the settings for a dog fight
        Method Description: Creates a list of planes (this.planes) that are part of the dogfight
        Method Return: void
    */
    createPlanes(dogfightJSON){
        let allyX = PROGRAM_DATA["dogfight_settings"]["ally_spawn_x"];
        let allyY = PROGRAM_DATA["dogfight_settings"]["ally_spawn_y"];
        let axisX = PROGRAM_DATA["dogfight_settings"]["axis_spawn_x"];
        let axisY = PROGRAM_DATA["dogfight_settings"]["axis_spawn_y"];
        let allyFacingRight = allyX < axisX;

        // Add users
        for (let user of dogfightJSON["users"]){
            let userEntityModel = user["model"]; // Note: Expected NOT freecam
            let userPlane = helperFunctions.planeModelToType(userEntityModel) == "Fighter" ? new HumanFighterPlane(userEntityModel, this.scene, 0, true, false) : new HumanBomberPlane(userEntityModel, this.scene, 0, true, false);
            userPlane.setCenterX(helperFunctions.planeModelToAlliance(userEntityModel) == "Allies" ? allyX : axisX);
            userPlane.setCenterY(helperFunctions.planeModelToAlliance(userEntityModel) == "Allies" ? allyY : axisY);
            userPlane.setFacingRight((helperFunctions.planeModelToAlliance(userEntityModel) == "Allies") ? allyFacingRight : !allyFacingRight);
            userPlane.setID(user["id"]);
            this.planes.push(userPlane);
        }

        // Add bots
        for (let [planeName, planeCount] of Object.entries(dogfightJSON["plane_counts"])){
            let allied = (helperFunctions.planeModelToAlliance(planeName) == "Allies");
            let x = allied ? allyX : axisX; 
            let y = allied ? allyY : axisY;
            let facingRight = (helperFunctions.planeModelToAlliance(planeName) == "Allies") ? allyFacingRight : !allyFacingRight;
            for (let i = 0; i < planeCount; i++){
                let aX = x + helperFunctions.randomFloatBetween(-1 * PROGRAM_DATA["dogfight_settings"]["spawn_offset"], PROGRAM_DATA["dogfight_settings"]["spawn_offset"]);
                let aY = y + helperFunctions.randomFloatBetween(-1 * PROGRAM_DATA["dogfight_settings"]["spawn_offset"], PROGRAM_DATA["dogfight_settings"]["spawn_offset"]);
                let botPlane;
                if (helperFunctions.planeModelToType(planeName) == "Fighter"){
                    botPlane = BiasedBotFighterPlane.createBiasedPlane(planeName, this.scene, allied ? dogfightJSON["ally_difficulty"] : dogfightJSON["axis_difficulty"], true);
                }else{
                    botPlane = BiasedBotBomberPlane.createBiasedPlane(planeName, this.scene, allied ? dogfightJSON["ally_difficulty"] : dogfightJSON["axis_difficulty"], true);
                }
                botPlane.setCenterX(aX);
                botPlane.setCenterY(aY);
                botPlane.setFacingRight(facingRight);
                this.planes.push(botPlane);
            }
        }
    }

    /*
        Method Name: updateFromUserInput
        Method Parameters: None
        Method Description: Updates a plane from the user input received from a client
        Method Return: void
    */
    async updateFromUserInput(){
        if (this.isPaused()){ return; }
        await this.userInputLock.awaitUnlock(true);
        // Update all planes based on user input
        for (let [planeObject, planeIndex] of this.userInputQueue){
            for (let plane of this.scene.getPlanes()){
                if (plane.getID() == planeObject["basic"]["id"]){
                    plane.fromJSON(planeObject);
                    break;
                }
            }
        }
        this.userInputLock.unlock();
    }

    /*
        Method Name: newPlaneJSON
        Method Parameters: None
        Method Description: Handles a JSON object of plane information received from a client
        Method Return: void
    */
    async newPlaneJSON(planeJSON){
        await this.userInputLock.awaitUnlock(true);
        // Remove a previous instance if present (assume only 1)
        let previousInput = null;
        for (let [planeObject, planeIndex] of this.userInputQueue){
            if (planeJSON["id"] == planeObject["id"]){
                previousInput = this.userInputQueue.pop(planeIndex);
                break;
            }
        }

        // If a previous input exists, merge it
        if (previousInput != null){
            for (let key of Object.keys(planeJSON)){
                // Merge all 0 values with non-zero values of previous input so that changes aren't overridden
                if (planeJSON[key] == 0 && previousInput[key] != 0){
                    planeJSON[key] = previousInput[key];
                }
            }
        }

        // Add new instance to the queue
        this.userInputQueue.add(planeJSON);
        this.userInputLock.unlock();
    }
}
module.exports=ServerDogfight;