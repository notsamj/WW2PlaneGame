/*
    Class Name: LocalMission
    Description: A game mode with attackers and defenders. Attackers must destroy all buildings, defenders destroy the attacker bomber plane.
*/
class LocalMission extends Mission {
    /*
        Method Name: constructor
        Method Parameters:
            missionObject:
                A JSON object with information about the mission
            missionSetupJSON:
                Information about the setup of the mission. Difficulty, users
            scene:
                TODO
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(missionObject, missionSetupJSON, scene){
        super(missionObject, missionSetupJSON, scene);
        this.deadCamera = null;
        if (missionSetupJSON["users"].length == 0){
            let cam = new SpectatorCamera(scene, (missionObject["start_zone"]["attackers"]["x"] + missionObject["start_zone"]["defenders"]["x"])/2, (missionObject["start_zone"]["attackers"]["y"] + missionObject["start_zone"]["defenders"]["y"])/2);
            this.userEntity = cam;
            scene.addEntity(cam);
            scene.setFocusedEntity(cam);
        }else{
            this.userEntity = scene.getEntity(USER_DATA["name"]);
            scene.setFocusedEntity(this.userEntity);
            this.userEntity.setAutonomous(true);
        }
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Run the actions that take place during a tick
        Method Return: void
    */
    async tick(){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.numTicks >= this.getExpectedTicks() || this.isPaused()){ return; }
        this.updateCamera();
        await super.tick(); // TODO: If don't await then non-focused planes shake, why!?
    }

    // TODO: Comments
    updateCamera(){
        // No need to update if user is meant to be a camera
        if (this.userEntity instanceof SpectatorCamera){
            return;
        }else if (this.userEntity.isAlive() && this.deadCamera == null){ // No need to do anything if following user
            return;
        }

        // if the user is dead then switch to dead camera
        if (this.userEntity.isDead() && this.deadCamera == null){
            this.deadCamera = new SpectatorCamera(scene, this.userEntity.getX(), this.userEntity.getY());
            scene.addEntity(this.deadCamera);
            scene.setFocusedEntity(this.deadCamera);
        }else if (this.userEntity.isAlive() && this.deadCamera != null){ // More appropriate for campaign (resurrection) but whatever
            this.deadCamera.die(); // Kill so automatically deleted by scene
            this.deadCamera = null;
            scene.setFocusedEntity(this.userEntity);
        }
    }

    // TODO: Comments
    runsLocally(){
        return true;
    }

    // TODO: Bring this to local client
    /*
        Method Name: updateHUD
        Method Parameters: None
        Method Description: Updates the HUD with information from the game
        Method Return: void
    */
    updateHUD(){
        let allyLock = this.attackerSpawnLock;
        let axisLock = this.defenderSpawnLock;
        if (this.missionObject["attackers"] != "Allies"){
            axisLock = this.attackerSpawnLock;
            allyLock = this.defenderSpawnLock;
        }
        HEADS_UP_DISPLAY.updateElement("Next Ally Respawn", ((allyLock.getTicksLeft() * PROGRAM_DATA["settings"]["ms_between_ticks"]) / 1000).toFixed(0));
        HEADS_UP_DISPLAY.updateElement("Next Axis Respawn", ((axisLock.getTicksLeft() * PROGRAM_DATA["settings"]["ms_between_ticks"]) / 1000).toFixed(0));


        let livingBuildings = 0;
        for (let building of this.buildings){
            if (building.isAlive()){
                livingBuildings++;
            }
        }

        let livingBombers = 0;
        for (let plane of this.planes){
            if (plane instanceof BomberPlane && plane.isAlive()){
                livingBombers++;
            }
        }
        HEADS_UP_DISPLAY.updateElement("Remaining Buildings", livingBuildings);
        HEADS_UP_DISPLAY.updateElement("Remaining Bombers", livingBombers);
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays information about the game on the screen.
        Method Return: void
    */
    display(){
        this.updateHUD();
        if (!this.isRunning()){
            this.stats.display();
        }
    }
}