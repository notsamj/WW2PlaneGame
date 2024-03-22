// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    BiasedBotFighterPlane = require("./biased_bot_fighter_plane.js");
    helperFunctions = require("../../general/helper_functions.js");
    calculateAngleDiffDEGCW = helperFunctions.calculateAngleDiffDEGCW;
    calculateAngleDiffDEGCCW = helperFunctions.calculateAngleDiffDEGCCW;
}
/*
    Class Name: BiasedCampaignAttackerBotFighterPlane
    Description: A bot fighter plane who is flying with a bomber to attack targets
*/
class BiasedCampaignAttackerBotFighterPlane extends BiasedBotFighterPlane {
/*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            scene:
                A Scene object related to the fighter plane
            biases:
                An object containing keys and bias values
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, biases, angle=0, facingRight=true, autonomous=true){
        super(planeClass, scene, biases, angle, facingRight, autonomous);
        this.startingThrottle = this.throttle;
    }

    // TODO: Comments
    static fromJSON(rep, scene){
        let planeClass = rep["basic"]["plane_class"];
        let fp = new BiasedCampaignAttackerBotFighterPlane(planeClass, scene, rep["biases"], rep["angle"], rep["facing_right"], false);
        fp.initFromJSON(rep)
        return fp;
    }

    // TODO: Comments
    makeDecisions(){
        // Only make decisions if autonomous
        if (!this.autonomous){ return; }

        let startingDecisions = copyObject(this.decisions);
        this.resetDecisions();
        
        if (this.updateEnemyLock.isReady()){
            this.updateEnemyLock.lock();
            // Check if the selected enemy should be changed
            this.updateEnemy();
        }
        // If there is an enemy then act accordingly
        if (this.hasCurrentEnemy()){
            this.handleEnemy(this.currentEnemy);
        }else{ // No enemy ->
            this.handleWhenNoEnemy();
        }

        // Always make sure throttle is at max if fighting 
        if (this.currentEnemy != null){
            this.decisions["throttle"] = 1;
        }

        // Check if decisions have been modified
        if (FighterPlane.areMovementDecisionsChanged(startingDecisions, this.decisions)){
            this.movementModCount++;
        }
    }

    /*
        Method Name: adjustThrottle
        Method Parameters:
            amt:
                Amount by which the throttle is changed (can be pos/neg)
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    adjustThrottle(amt){
        this.throttle = Math.min(Math.max(1, this.throttle + amt), this.startingThrottle);
    }

    // TODO: Comments
    initFromJSON(rep){
        this.id = rep["basic"]["id"];
        this.health = rep["basic"]["health"];
        this.dead = rep["basic"]["dead"];
        this.x = rep["basic"]["x"];
        this.y = rep["basic"]["y"];
        this.facingRight = rep["basic"]["facing_right"];
        this.angle = rep["basic"]["angle"];
        this.throttle = rep["basic"]["throttle"];
        this.speed = rep["basic"]["speed"];
        this.health = rep["basic"]["health"];
        this.startingHealth = rep["basic"]["starting_health"];
        this.startingThrottle = rep["basic"]["starting_throttle"];
        this.dead = rep["basic"]["dead"];
        this.decisions = rep["decisions"];
        this.shootLock.setTicksLeft(rep["locks"]["shoot_lock"]);
        this.rotationCD.setTicksLeft(rep["locks"]["rotation_cd"]);
    }

    // TODO: Comments
    toJSON(){
        let rep = {};
        rep["decisions"] = this.decisions;
        rep["locks"] = {
            "shoot_lock": this.shootLock.getTicksLeft(),
            "rotation_cd": this.rotationCD.getTicksLeft()
        }
        rep["biases"] = this.biases;
        rep["basic"] = {
            "id": this.id,
            "x": this.x,
            "y": this.y,
            "human": this.isHuman(),
            "plane_class": this.planeClass,
            "facing_right": this.facingRight,
            "angle": this.angle,
            "throttle": this.throttle,
            "speed": this.speed,
            "health": this.health,
            "starting_health": this.startingHealth,
            "starting_throttle": this.startingThrottle,
            "dead": this.isDead()
        }
        rep["movement_mod_count"] = this.movementModCount;
        return rep;
    }

    /*
        Method Name: handleWhenNoEnemy
        Method Parameters: None
        Method Description: Determine what to do when there is no enemy
        Method Return: void
    */
    handleWhenNoEnemy(){
        this.cruiseByBomber();
    }

    /*
        Method Name: findMyBomber
        Method Parameters: None
        Method Description: Finds the furthest (highest x value) living bomber
        Method Return: Bomber
    */
    findMyBomber(){
        let furthestBomber = null;
        let planes = this.scene.getPlanes();
        for (let plane of planes){
            if (!(plane instanceof BomberPlane) || plane.isDead()){ continue; }
            if (furthestBomber == null || plane.getX() > furthestBomber.getX()){
                furthestBomber = plane;
            }
        }
        // Bomber assumed not null because then game is broken
        return furthestBomber;
    }

    /*
        Method Name: cruiseByBomber
        Method Parameters: None
        Method Description: Makes decisions to cruise near a bomber
        Method Return: void
    */
    cruiseByBomber(){
        let bomber = this.findMyBomber();
        // Incase bomber just died
        if (bomber == null){ return; }
        let xDistance = Math.abs(bomber.getX() - this.getX());
        let yDistance = Math.abs(bomber.getY() - this.getY());
        // If too far from bomber in x then go to bomber
        if (xDistance > PROGRAM_DATA["ai"]["fighter_plane"]["max_x_distance_from_bomber_cruising_campaign"] || yDistance > PROGRAM_DATA["ai"]["fighter_plane"]["max_y_distance_from_bomber_cruising_campaign"]){
            // Make sure that you are facing the right way
            if (bomber.isFacingRight() != this.isFacingRight()){
                this.decisions["face"] = this.isFacingRight() ? 1 : -1;
            }
            let angleToBomberDEG = this.angleToOtherDEG(bomber);
            let dCW = calculateAngleDiffDEGCW(this.angle, angleToBomberDEG);
            let dCCW = calculateAngleDiffDEGCCW(this.angle, angleToBomberDEG);
            if (dCW < dCCW){
                this.decisions["angle"] = -1;
            }else if (dCCW < dCW){
                this.decisions["angle"] = 1;
            }
            // Make sure you're at top speed heading to the bomber!
            this.decisions["throttle"] = 1;
            // TODO: Commented code is bad I think because as above comment says...
            /*if ((this.getX() > bomber.getX() && bomber.isFacingRight()) || (this.getX() < bomber.getX() && !bomber.isFacingRight())){
                this.decisions["throttle"] = 1;
            }else{
                this.decisions["throttle"] = -1;
            }*/
            return;
        }
        // Else close to the bomber

        // Face in the proper direction
        if (bomber.isFacingRight() != this.isFacingRight()){
            this.decisions["face"] = this.isFacingRight() ? -1 : 1;
            return;
        }

        // Adjust angle to match bomber's angle
        let dCW = calculateAngleDiffDEGCW(this.angle, bomber.getAngle());
        let dCCW = calculateAngleDiffDEGCCW(this.angle, bomber.getAngle());
        if (dCW < dCCW){
            this.decisions["angle"] = -1;
        }else if (dCCW < dCW){
            this.decisions["angle"] = 1;
        }
        // Speed up or slow down depending on bomber's speed
        let desiredThrottle = Math.floor(this.calculateThrottleToMatchSpeed(bomber.getSpeed() + PROGRAM_DATA["ai"]["fighter_plane"]["bomber_cruise_speed_following_offset"]));
        if (this.throttle > desiredThrottle){
            this.decisions["throttle"] = -1;
        }else if (this.throttle < desiredThrottle){
            this.decisions["throttle"] = 1;
        }
    }

    // TODO: Comments
    calculateThrottleToMatchSpeed(bomberSpeed){
        let dragAtBomberSpeed = Math.sqrt(Math.abs(bomberSpeed));
        return dragAtBomberSpeed / this.throttleConstant;
    }

    /*
        Method Name: updateEnemy
        Method Parameters: None
        Method Description: Determine the id of the current enemy
        Method Return: void
    */
    updateEnemy(){
        // If we have an enemy already and its close then don't update
        if (this.currentEnemy != null && this.currentEnemy.isAlive() && this.distance(this.currentEnemy) <= (PROGRAM_DATA["settings"]["enemy_disregard_distance_time_constant"] + this.biases["enemy_disregard_distance_time_constant"]) * this.speed){
            return;
        }
        let enemies = this.getEnemyList();
        let bestRecord = null;

        // Loop through all enemies and determine a score for being good to attack
        
        for (let enemy of enemies){
            let distance = this.distance(enemy);
            if (distance > PROGRAM_DATA["ai"]["fighter_plane"]["max_enemy_distance_campaign"]){ continue; }
            let score = BiasedBotFighterPlane.calculateEnemyScore(distance, BiasedBotFighterPlane.focusedCount(this.scene, enemy.getID(), this.getID()) * this.biases["enemy_taken_distance_multiplier"]);
            if (bestRecord == null || score < bestRecord["score"]){
                bestRecord = {
                    "enemy": enemy,
                    "score": score
                }
            }
        }
        
        // If none found then do nothing
        if (bestRecord == null){ return; }
        this.currentEnemy = bestRecord["enemy"];
    }

    /*
        Method Name: createBiasedPlane
        Method Parameters: 
            planeClass:
                A string representing the type of the plane
            scene:
                A scene objet related to the plane
            difficulty:
                The current difficulty setting
        Method Description: Return a new biased campaign attacker plane
        Method Return: BiasedCampaignAttackerBotFighterPlane
    */
    static createBiasedPlane(planeClass, scene, difficulty){
        let biases = BiasedBotFighterPlane.createBiases(difficulty);
        return new BiasedCampaignAttackerBotFighterPlane(planeClass, scene, biases);
    }
}
// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = BiasedCampaignAttackerBotFighterPlane;
}