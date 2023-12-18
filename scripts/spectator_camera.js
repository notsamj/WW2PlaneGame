class SpectatorCamera extends Entity{
    constructor(scene){
        super(scene);
        this.followingEntityID = -1;
        this.followToggleLock = new Lock();
        this.leftRightLock = new CooldownLock(250);
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.xLock = new CooldownLock(0);
        this.yLock = new CooldownLock(0);
        this.radar = new SpectatorRadar(this);
        this.radarLock = new CooldownLock(250);
    }

    getDisplayID(){
        return this.followingEntityID != -1 ? this.followingEntityID : this.getID();
    }

    isFollowing(){
        // Check if the entity is still around
        if (this.followingEntityID != -1 && !scene.hasEntity(this.followingEntityID)){
            this.followingEntityID = -1;
        }
        return this.followingEntityID != -1;
    }

    getPreviousEntity(){
        if (this.followingEntityID == -1){ this.getFirstEntity(); return; }
        let followableEntities = this.scene.getGoodToFollowEntities();
        let found = false;
        let i = followableEntities.length - 1;
        while (i >= 0){
            let entity = followableEntities[i];
            // If we found the current entity, ignore it of course. !found is so that if its 1 single element you don't get stuck looping
            if (entity.getID() == this.followingEntityID && !found){
                found = true;
                if (i == 0){
                    i = followableEntities.length - 1;
                }
            }else if (found){
                this.followingEntityID = entity.getID();
                break;
            }
            i--;
        }
    }

    getSpeed(){
        if (!this.isFollowing()){ return 0; }
        let entity = this.scene.getEntity(this.followingEntityID);
        return entity.getSpeed();
    }

    getThrottle(){
        if (!this.isFollowing()){ return 0; }
        let entity = this.scene.getEntity(this.followingEntityID);
        return entity.getThrottle();
    }

    getHealth(){
        if (!this.isFollowing()){ return 0; }
        let entity = this.scene.getEntity(this.followingEntityID);
        return entity.getHealth();
    }

    getRadar(){ return this.radar; }

    hasRadar(){ return true; }

    getNextEntity(){
        if (this.followingEntityID == -1){ this.getFirstEntity(); return; }
        let followableEntities = this.scene.getGoodToFollowEntities();
        let found = false;
        let i = 0;
        while (i < followableEntities.length){
            let entity = followableEntities[i];
            // If we found the current entity, ignore it of course. !found is so that if its 1 single element you don't get stuck looping
            if (entity.getID() == this.followingEntityID && !found){
                found = true;
                if (i == followableEntities.length -1){
                    i = 0;
                }
            }else if (found){
                this.followingEntityID = entity.getID();
                break;
            }
            i++;
        }
    }

    getFirstEntity(){
        let followableEntities = this.scene.getGoodToFollowEntities();
        if (followableEntities.length > 0){ this.followingEntityID = followableEntities[0].getID(); }
    }

    checkFollowToggle(){
        if (keyIsDown(70) && this.followToggleLock.isReady()){
            this.followToggleLock.lock();
            if (this.followingEntityID == -1){
                this.getNextEntity();
            }else{
                this.followingEntityID = -1;
            }
        }else if (!keyIsDown(70) && !this.followToggleLock.isReady()){
            this.followToggleLock.unlock();
        }
    }

    checkLeftRight(){
        let leftKey = keyIsDown(37);
        let rightKey = keyIsDown(39);
        let numKeysDown = 0;
        numKeysDown += leftKey ? 1 : 0;
        numKeysDown += rightKey ? 1 : 0;
        if (numKeysDown != 1 || !this.leftRightLock.isReady()){
            return;
        }

        this.leftRightLock.lock();
        if (leftKey){
            this.getPreviousEntity();
        }else{
            this.getNextEntity();
        }

    }

    checkMoveX(){
        let leftKey = keyIsDown(37);
        let rightKey = keyIsDown(39);
        let numKeysDown = 0;
        numKeysDown += leftKey ? 1 : 0;
        numKeysDown += rightKey ? 1 : 0;
        if (numKeysDown == 0 || numKeysDown == 2){
            this.xVelocity = 0;
            return;
        }else if (!this.xLock.isReady()){ return; }
        this.xLock.lock();

        // Else 1 key down and ready to move
        this.xVelocity = 10;
        this.xVelocity *= leftKey ? -1 : 1; 
        this.x += this.xVelocity;
    }

    checkMoveY(){
        let upKey = keyIsDown(38);
        let downKey = keyIsDown(40);
        let numKeysDown = 0;
        numKeysDown += upKey ? 1 : 0;
        numKeysDown += downKey ? 1 : 0;
        if (numKeysDown == 0 || numKeysDown == 2){
            this.yVelocity = 0;
            return;
        }else if (!this.yLock.isReady()){ return; }
        this.yLock.lock();

        // Else 1 key down and ready to move
        this.yVelocity = 10;
        this.yVelocity *= downKey ? -1 : 1; 
        this.y += this.yVelocity;
    }

    updateRadar(){
        if (!this.radarLock.isReady()){ return; }
        this.radarLock.lock();
        this.radar.update();
    }

    tick(){
        this.updateRadar();
        this.checkFollowToggle();
        if (this.isFollowing()){
            this.checkLeftRight();
            this.x = this.scene.getEntity(this.followingEntityID).getX();
            this.y = this.scene.getEntity(this.followingEntityID).getY();
            return;
        }
        // else
        this.checkMoveX();
        this.checkMoveY();
    }
}