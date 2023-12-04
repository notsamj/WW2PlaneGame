class HumanFighterPlane extends FighterPlane{
    constructor(planeClass, angle=0, facingRight=true){
        super(planeClass, angle, facingRight);
        this.lrCDLock = new CooldownLock(10);
        this.lrLock = new Lock();
        this.udLock = new CooldownLock(10);
        this.tLock = new CooldownLock(10);
        this.sLock = new CooldownLock(10);
        this.radarLock = new CooldownLock(1000);
        this.radar = new Radar(this);
    }

    getRadar(){
        return this.radar;
    }

    damage(amount){
        this.health -= amount;
        //document.getElementById("hitSound").play();
        if (this.health <= 0){
            //document.getElementById("explodeSound").play();
            this.delete();
        }
    }

    tick(timeDiffMS){
        super.tick(timeDiffMS);
        this.checkMoveLeftRight();
        this.checkUpDown();
        this.checkShoot();
        this.checkThrottle();
        this.updateRadar();
    }

    updateRadar(){
        if (this.radarLock.isReady()){
            this.radar.update();
            this.radarLock.lock();
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
    }


    checkUpDown(){
        if (!this.udLock.isReady()){ return; }
        this.udLock.lock();
        let wKey = keyIsDown(87);
        let sKey = keyIsDown(83);
        let numKeysDown = 0;
        numKeysDown += wKey ? 1 : 0;
        numKeysDown += sKey ? 1 : 0;

        // Only ready to switch direction again once you've stopped holding for at least 1 cd
        if (numKeysDown === 0){
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            return;
        }
        if (wKey){
            this.adjustAngle(-1);
        }else if (sKey){
            this.adjustAngle(1);
        }
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
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            return;
        }
        if (rKey){
            this.adjustThrottle(1);
        }else if (fKey){
            this.adjustThrottle(-1);
        }
    }

    checkShoot(){
        if (!this.sLock.isReady()){ return; }
        this.sLock.lock();
        let spaceKey = keyIsDown(32);
        if (!this.shootLock.isReady() || !spaceKey){
            return;
        }
        this.shootLock.lock();
        this.shoot();
    }
}