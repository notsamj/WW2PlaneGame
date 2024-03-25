// TODO: Comment class
// TODO: Extend RemoteClient (abstaract class?)
class RemoteMissionClient {
    constructor(missionTranslator){
        this.scene = scene;
        this.translator = missionTranslator;
        this.stats = new AfterMatchStats();
        this.tickInProgressLock = new Lock();
        this.stateLock = new Lock();
        this.numTicks = 0;
        this.lastServerState = null;
        this.newServerState = null;
        this.userEntity = null;
        this.deadCamera = null;
        this.planes = [];
        this.paused = false;
        this.inputLock = new Lock();
        this.startTime = Date.now();
        scene.enableTicks();
        this.running = false;
        this.gameOver = false;
        this.attackerSpawnLock = new TickLock(0, false);
        this.defenderSpawnLock = new TickLock(0, false);
        this.startUp();
    }

    correctTicks(){ return; }
    getNumTicks(){
        return this.numTicks;
    }

    getStartTime(){
        return this.startTime;
    }

    isPaused(){ return false; }
    runsLocally(){ return false; }

    /// Note: Used to make sure only 1 input per real tick (not per game tick)
    inputAllowed(){
        return this.inputLock.isUnlocked();
    }

    pause(){
        this.paused = true;
        this.translator.pause();
    }

    unpause(){
        this.paused = false;
        this.translator.unpause();
    }

    isRunning(){
        return this.running && !this.isGameOver();
    }

    end(){
        this.translator.end();
    }

    getExpectedTicks(){
        return Math.floor((Date.now() - this.startTime) / PROGRAM_DATA["settings"]["ms_between_ticks"]);
    }

    async tick(timeGapMS){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.numTicks >= this.getExpectedTicks()){ return; }
        await this.tickInProgressLock.awaitUnlock(true);
        this.inputLock.unlock(); // TODO: Remove inputlock

        // Load state from server
        await this.loadStateFromServer();

        // Update camera
        this.updateCamera();

        // Tick the scene
        await scene.tick(timeGapMS);
        this.inputLock.lock();
        this.numTicks++;

        // Send the current position
        await this.sendPlanePosition();

        // Request state from server
        this.requestStateFromServer();
        this.tickInProgressLock.unlock();
    }

    updateCamera(){
        if (this.userEntity == null){
            debugger;
        }
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

    async requestStateFromServer(){
        await this.stateLock.awaitUnlock(true);
        // Send a request and when received then update the last state from server
        this.newServerState = await this.translator.getState();
        this.stateLock.unlock();
    }

    async sendPlanePosition(){
        // Check if the client is a freecam or a plane, if a plane then send its current position JSON to server
        if (this.userEntity instanceof SpectatorCamera || this.userEntity.isDead()){
            return;
        }
        await this.translator.sendPlanePosition(this.userEntity.toJSON());
    }

    async loadStateFromServer(){
        // Update the scene based on the server's last state
        await this.stateLock.awaitUnlock(true);
        // Only update if the new state is really new
        if (this.newServerState == null){ return; }
        if (this.lastServerState == null || this.lastServerState["num_ticks"] < this.newServerState["num_ticks"]){
            this.loadState(this.newServerState);
            this.lastServerState = this.newServerState;
        }
        this.stateLock.unlock();
    }

    isGameOver(){
        return this.gameOver;
    }

    loadState(state){
        if (state == null){ return; }
        // Check game end
        this.gameOver = state["game_over"];
        
        // If not running then load the end
        if (this.isGameOver()){
            this.stats.fromJSON(state["stats"]);
            return;
        }
        
        // Load sounds
        SOUND_MANAGER.fromSoundRequestList(state["sound_list"]);

        // Update Spawn Lock Timers
        this.attackerSpawnLock.setTicksLeft(state["attacker_spawn_ticks_left"]);
        this.defenderSpawnLock.setTicksLeft(state["defender_spawn_ticks_left"])

        // TODO: If tickdifference is great enough then take from server!
        let tickDifference = state["num_ticks"] - this.numTicks;
        // TODO: Put this in settings
        if (tickDifference > 10){
            this.numTicks = state["num_ticks"];
        }

        // Update planes
        for (let planeObject of state["planes"]){
            let plane = scene.getPlane(planeObject["basic"]["id"]);
            // This is more for campaign (because no planes are added in dogfight) but whateverrrrr
            if (plane == null){
                this.addNewPlane(planeObject);
                continue;
            }
            plane.fromJSON(planeObject, state["num_ticks"] - this.numTicks, tickDifference > 10);
        }

        // Update bullets
        scene.getTeamCombatManager().fromBulletJSON(state["bullets"]);
        scene.getTeamCombatManager().fromBuildingJSON(state["buildings"]);
        scene.getTeamCombatManager().fromBombJSON(state["bombs"]);
    }

    addNewPlane(planeObject){
        let isFighter = planeModelToType(planeObject["basic"]["plane_class"]) == "Fighter";
        let attackerAlliance = this.missionObject["attackers"];
        let isHuman = planeObject["human"];
        let plane;
        // Hahahhaa remember attacker defender bullshit TODO
        if (isHuman && isFighter){
            plane = HumanFighterPlane.fromJSON(planeObject, scene, planeIsMe);
        }else if (isHuman){
            plane = HumanBomberPlane.fromJSON(planeObject, scene, planeIsMe);
        }else if (isFighter && planeModelToAlliance(planeObject["basic"]["plane_class"]) == attackerAlliance){
            plane = BiasedCampaignAttackerBotFighterPlane.fromJSON(planeObject, scene, false);
        }else if (isFighter){
            plane = BiasedCampaignDefenderBotFighterPlane.fromJSON(planeObject, scene, false);
        }else{
            plane = BiasedCampaignBotBomberPlane.fromJSON(planeObject, scene, false);
        }
        this.scene.addPlane(plane);
    }

    display(){
        if (this.isGameOver()){
            this.stats.display();
        }else if (this.isRunning()){
            this.updateHUD();
        }
    }

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
        for (let [building, bI] of this.scene.getTeamCombatManager().getBuildings()){
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

    async startUp(){
        // Get a state from the server and await it then set start time then set up based on the server state
        let state = await this.translator.getState();
        let missionObject = PROGRAM_DATA["missions"][state["mission_id"]];
        this.missionObject = missionObject;
        let attackerAlliance = missionObject["attackers"];
        let myID = USER_DATA["name"];
        //console.log(state["planes"])
        // Add planes
        for (let planeObject of state["planes"]){
            if (planeObject["basic"]["human"]){
                let planeIsMe = planeObject["basic"]["id"] == myID;
                let plane;
                if (planeModelToType([planeObject["basic"]["plane_class"]]) == "Fighter"){
                    plane = HumanFighterPlane.fromJSON(planeObject, scene, planeIsMe);
                    console.log("New human", planeIsMe)
                }else{
                    plane = HumanBomberPlane.fromJSON(planeObject, scene, planeIsMe);
                }
                if (planeIsMe){
                    this.userEntity = plane;
                    console.log("USER ENTITY SET", this.userEntity)
                }
                this.planes.push(plane);
            }else{
                let plane;
                let isFighter = planeModelToType([planeObject["basic"]["plane_class"]]) == "Fighter";
                if (isFighter && planeModelToAlliance(planeObject["basic"]["plane_class"]) == attackerAlliance){
                    console.log("Plane a")
                    plane = BiasedCampaignAttackerBotFighterPlane.fromJSON(planeObject, scene, false);
                }else if (isFighter){
                    console.log("Plane b")
                    plane = BiasedCampaignDefenderBotFighterPlane.fromJSON(planeObject, scene, false);
                }else{
                    console.log("Plane c")
                    plane = BiasedCampaignBotBomberPlane.fromJSON(planeObject, scene, false);
                }
                this.planes.push(plane);
            }
        }

        // Add planes to the scene
        scene.setEntities(this.planes);

        // If no user then add a freecam
        //console.log("Is user entity null?", this.userEntity)
        if (this.userEntity == null){
            this.userEntity = new SpectatorCamera(scene, (missionObject["start_zone"]["attackers"]["x"] + missionObject["start_zone"]["defenders"]["x"])/2, (missionObject["start_zone"]["attackers"]["y"] + missionObject["start_zone"]["defenders"]["y"])/2);
            scene.addEntity(this.userEntity);
        }
        scene.setFocusedEntity(this.userEntity);
        console.log("Set focused entity to", this.userEntity)
        this.startTime = state["start_time"];
        this.numTicks = state["num_ticks"];
        this.running = true;
        console.log("Start up done")
    }
}