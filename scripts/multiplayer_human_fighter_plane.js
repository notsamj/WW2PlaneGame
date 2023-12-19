class MultiplayerHumanFighterPlane extends HumanFighterPlane {
    constructor(planeClass, scene, angle=0, facingRight=true){
        super(planeClass, scene, angle, facingRight);
        this.lastActions = {
            "throttle": 0,
            "face": facingRight,
            "turn": 0,
            "shooting": false
        }
    }

    tick(timeMS, forced=false){
        if (forced){
            actions = this.getActionAtTick(this.getID());
        }
        this.adjustByActions();
        super.tick(timeMS);
    }

    adjustByActions(actions){
        if (actions["shooting"] && this.shootLock.isReady()){
            this.shootLock.lock();
            this.shoot();
        }
        this.adjustAngle(actions["turn"]);
        console.log(this.facingRight, action["face"])
        if (this.facingRight != action["face"]){
            this.face(this.action["face"])
        }
        this.throttle += action["throttle"];
    }

    action(actionPair){
        let key = actionPair["action"];
        let value = actionPair["value"];
        if (lastActions[key] != value){
            lastActions[key] = value;
        }
    }

    checkMoveLeftRight(){
        if (!this.lrCDLock.isReady()){ return; }
        this.lrCDLock.lock();
        let aKey = keyIsDown(65);
        let dKey = keyIsDown(68);
        let numKeysDown = 0;
        numKeysDown += aKey ? 1 : 0;
        numKeysDown += dKey ? 1 : 0;

        // Only ready to switch direction again once you've stopped holding for at least 1 cd
        if (numKeysDown === 0){
            if (!this.lrLock.isReady()){
                this.lrLock.unlock();
            }
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            return;
        }
        if (!this.lrLock.isReady()){ return; }
        this.lrLock.lock();
        if (aKey){
            this.face(false);
        }else if (dKey){
            this.face(true);
        }
        this.action({"action": "face", "value": !aKey});
    }


    checkUpDown(){
        let wKey = keyIsDown(87);
        let sKey = keyIsDown(83);
        let numKeysDown = 0;
        numKeysDown += wKey ? 1 : 0;
        numKeysDown += sKey ? 1 : 0;

        // Only ready to switch direction again once you've stopped holding for at least 1 cd
        if (numKeysDown === 0){
            this.action({"action": "turn", "value": 0});
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            this.action({"action": "turn", "value": 0});
            return;
        }
        if (wKey){
            this.adjustAngle(-1);
        }else if (sKey){
            this.adjustAngle(1);
        }
        this.action({"action": "turn", "value": wKey ? -1 : 1});
    }

    checkThrottle(){
        if (!this.tLock.isReady()){ return; }
        this.tLock.lock();
        let rKey = keyIsDown(82);
        let fKey = keyIsDown(70);
        let numKeysDown = 0;
        numKeysDown += rKey ? 1 : 0;
        numKeysDown += fKey ? 1 : 0;

        // Only ready to switch direction again once you've stopped holding for at least 1 cd
        if (numKeysDown === 0){
            this.action({"action": "throttle", "value": 0});
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            this.action({"action": "throttle", "value": 0});
            return;
        }
        if (rKey){
            this.adjustThrottle(1);
        }else if (fKey){
            this.adjustThrottle(-1);
        }
        this.action({"action": "throttle", "value": wKey ? -1 : 1});
    }

    checkShoot(){
        if (!this.sLock.isReady()){ return; }
        this.sLock.lock();
        let spaceKey = keyIsDown(32);
        if (!spaceKey){
            this.action({"action": "shooting", "value": false});
        }
        if (!this.shootLock.isReady() || !spaceKey){
            return;
        }
        this.shootLock.lock();
        this.action({"action": "shooting", "value": true});
        this.shoot();
    }

    fromPreviousState(previousState){
        this.dead = previousState["isDead"];
        this.x = previousState["x"];
        this.y = previousState["y"];
        this.facingRight = previousState["facing"];
        this.angle = previousState["angle"];
        this.speed = previousState["speed"];
        this.throttle = previousState["throttle"];
        this.health = previousState["health"];
        this.lastActions = previousState["lastActions"];
    }

    update(newStats){
        this.dead = newStats["isDead"];
        this.health = newStats["health"];
    }

    getStatsToSend(){
        let newStats = {};
        newStats["x"] = this.x;
        newStats["y"] = this.y;
        newStats["facing"] = this.facingRight;
        newStats["angle"] = this.angle;
        newStats["speed"] = this.speed;
        newStats["throttle"] = this.throttle;
        newStats["lastActions"] = this.lastActions;
    }
}