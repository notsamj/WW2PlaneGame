// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    BomberTurret = require("./bomber_turret.js");
    helperFunctions = require("../general/helper_functions.js");
    displacementToDegrees = helperFunctions.displacementToDegrees;
}
/*
    Class Name: BotBomberTurret
    Description: Abstract Class representing a Turret attached to a Bomber plane that is operated by the computer
*/
class BotBomberTurret extends BomberTurret {
    /*
        Method Name: constructor
        Method Parameters:
            xOffset:
                The x offset of the turret from the center of the attached plane
            yOfset:
                The y offset of the turret from the center of the attached plane
            fov1:
                An angle (degrees) representing an edge of an angle which the turret can shoot within
            fov2:
                An angle (degrees) representing an edge of an angle which the turret can shoot within (second edge in a clockwise direction)
            rateOfFire:
                The number of milliseconds between shots that the turret can take
            scene:
                A Scene object related to the fighter plane
            plane:
                The bomber plane which the turret is attached to
            autonomous:
                Whether or not the turret may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(xOffset, yOffset,fov1, fov2, rateOfFire, scene, plane, autonomous=true){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, scene, plane);
        this.shootingAngle = 0;
        this.autonomous = autonomous;
    }

    /*
        Method Name: getShootingAngle
        Method Parameters: None
        Method Description: Determines the shooting angle of the turret.
        Method Return: int
    */
    getShootingAngle(){
        return this.shootingAngle;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(){
        this.shootCD.tick();
    }

    // TODO: Comments
    makeDecisions(enemyList){
        // If it can't make its own decisions then skip this
        if (!this.autonomous){ return; }
        this.resetDecisions();
        this.checkShoot(enemyList);
    }

    /*
        Method Name: checkShoot
        Method Parameters:
            enemyList:
                A list of enemy planes
        Method Description: Checks if the turret should shoot. If so, it makes the decision to shoot at the enemy.
        Method Return: void
    */
    checkShoot(enemyList){
        if (this.shootCD.notReady()){ return; }
        // Shoot if the enemy is in front
        let hasDecidedToFireShot = false;
        let myX = this.getX();
        let myY = this.getY();
        let enemyX = null;
        let enemyY = null;
        let enemyXDisplacement = null;
        let enemyYDisplacement = null;
        let angleDEG = null;
        let distanceToEnemy = null;
        // Look for other enemies that aren't the primary focus and if they are infront of the plane then shoot
        for (let enemy of enemyList){
            if (hasDecidedToFireShot){ break; }
            enemyX = enemy.getX();
            enemyY = enemy.getY();
            enemyXDisplacement = enemyX - myX;
            enemyYDisplacement = enemyY - myY;
            // TODO: Maybe use the ANGLE TO ENTITY function?
            angleDEG = displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
            distanceToEnemy = enemy.distanceToPoint(myX, myY);
            hasDecidedToFireShot = this.isEnemyClose(distanceToEnemy);
        }
        // If the decision has been made to shoot then record it
        if (hasDecidedToFireShot){
            this.decisions["angle"] = angleDEG;
            this.decisions["shooting"] = true;
        }
    }

    // TODO: Comments
    executeDecisions(){
        // If decided to shoot
        if (this.decisions["shooting"]){
            if (this.shootCD.isReady()){
                this.shoot(this.getShootingAngle());
            }
        }
    }

    /*
        Method Name: isEnemyClose
        Method Parameters:
            distanceToEnemy:
                The distance to the enemy
        Method Description: Turn the plane in a given direction.
        Method Return: boolean, true if shot, false if not.
    */
    isEnemyClose(distanceToEnemy){
        // If the distance is acceptable then the shot is good
        if (distanceToEnemy < this.plane.getMaxShootingDistance()){
            // Either physics bullets OR don't shoot past the limit of instant shot
            if (this.scene.areBulletPhysicsEnabled() || distanceToEnemy < PROGRAM_DATA["settings"]["instant_shot_max_distance"]){
                return true;
            }
        }
        return false;
    }

    /*
        Method Name: create
        Method Parameters:
            gunObject:
                A JSON object with details about the gun
            scene:
                A Scene object related to the fighter plane
            plane:
                The bomber plane which the turret is attached to
        Method Description: Create a bot bomber turret
        Method Return: BotBomberTurret
    */
    static create(gunObject, scene, plane){
        return new BotBomberTurret(gunObject["x_offset"], gunObject["y_offset"], gunObject["fov_1"], gunObject["fov_2"], gunObject["rate_of_fire"], scene, plane);
    }
}

// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = BotBomberTurret;
}