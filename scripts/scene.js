var images = {};

async function loadRotatedImages(name){
    for (let i = 0; i < 360; i++){
        images[name + "_left_" + i.toString()] = await loadLocalImage("images/" + name + "/left/" + i.toString() + ".png");
        images[name + "_right_" + i.toString()] = await loadLocalImage("images/" + name + "/right/" + i.toString() + ".png");
    }
}

async function loadLocalImage(url){
    let newImage = null;
    let wait = new Promise(function(resolve, reject){
        newImage = new Image();
        newImage.onload = function(){
            resolve();
        }
        newImage.onerror = function(){
            reject();
        }
        newImage.src = url;
    });
    await wait;
    return newImage;
}

class Scene{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.nextEntityID = 0;
        this.entities = [];
        this.focusedEntityIndex = -1;
        this.backgroundImage = new Image();
        this.backgroundImage.src = "";
    }

    setBackground(imageName){
        this.backgroundImage.src = "images/" + imageName + ".png";
    }

    getEntities(){
        return this.entities;
    }

    display(){
        let lX = 0; // Bottom left x
        let bY = 0; // Bottom left y
        let focusedEntity = null;
        // If 
        if (this.hasEntityFocused()){
            focusedEntity = this.getFocusedEntity();
            lX = focusedEntity.getCenterX() - (this.width) / 2;
            bY = focusedEntity.getCenterY() - (this.height) / 2;
        }
        this.displayBackground(lX, bY);
        for (let entity of this.entities){
            if (this.hasEntityFocused() && entity.getID() == focusedEntity.getID()){ continue; }
            this.displayEntity(entity, lX, bY);
        }

        if (this.hasEntityFocused()){
            this.displayEntity(focusedEntity, lX, bY);
        }
    }

    setFocusedEntity(entityID){
        return this.focusedEntityIndex = this.getEntityIndex(entityID);
    }

    displayBackground(lX, bY){
        let x2 = 0;
        let y2 = 0;
        while (x2 < lX){
            x2 += this.backgroundImage.width;
        }
        while (y2 < bY){
            y2 += this.backgroundImage.height;
        }

        let x1 = x2 - this.backgroundImage.width;
        let y1 = y2 - this.backgroundImage.height;
        // Bottom-Left
        let displayX = this.getDisplayX(x1 + this.backgroundImage.width / 2, this.backgroundImage.width, lX);
        let displayY = this.getDisplayY(y1 + this.backgroundImage.height / 2, this.backgroundImage.height, bY);
        drawingContext.drawImage(this.backgroundImage, displayX, displayY);

        // Bottom_Right
        displayX = this.getDisplayX(x2 + this.backgroundImage.width / 2, this.backgroundImage.width, lX);
        displayY = this.getDisplayY(y1 + this.backgroundImage.height / 2, this.backgroundImage.height, bY);
        drawingContext.drawImage(this.backgroundImage, displayX, displayY);

        // Top Left
        displayX = this.getDisplayX(x1 + this.backgroundImage.width / 2, this.backgroundImage.width, lX);
        displayY = this.getDisplayY(y2 + this.backgroundImage.height / 2, this.backgroundImage.height, bY);
        drawingContext.drawImage(this.backgroundImage, displayX, displayY);
        
        // Top Right
        displayX = this.getDisplayX(x2 + this.backgroundImage.width / 2, this.backgroundImage.width, lX);
        displayY = this.getDisplayY(y2 + this.backgroundImage.height / 2, this.backgroundImage.height, bY);
        drawingContext.drawImage(this.backgroundImage, displayX, displayY);
    }

    changeToScreenX(x){
        return x; // Doesn't need to be changed ATM
    }

    changeToScreenY(y){
        return this.height - y;
    }

    addEntity(entity){
        entity.setID(this.nextEntityID++);
        this.entities.push(entity);
        if (!this.hasEntityFocused()){
            this.focusedEntityIndex = 0;
            // TODO: Find a better one
            if (this.entities.length == 0){
                this.focusedEntityIndex = -1;
            }
        }
    } 
    
    delete(entityID){
        let newArray = copyArray(this.entities);
        let index = -1;

        // Find element with ID
        for (let i = 0; i < newArray.length; i++){
            if (newArray[i].getID() == entityID){
                index = i;
                break;
            }
        }
        // Not found
        if (index == -1){
            return;
        }

        // No focused entity anmore 
        if (index == this.focusedEntityIndex){
            this.focusedEntityIndex = -1;
        }

        // shift down to deleting 
        for (let i = index; i < newArray.length - 1; i++){
            newArray[i] = newArray[i+1];
        }

        newArray.pop();
        this.entities = newArray;
    }

    displayEntity(entity, lX, bY){
        let rX = lX + this.width - 1;
        let tY = bY + this.height - 1;
        // Is on screen
        if (!entity.touchesRegion(lX, rX, bY, tY)){ return; }
        let displayX = this.getDisplayX(entity.getCenterX(), entity.getWidth(), lX);
        let displayY = this.getDisplayY(entity.getCenterY(), entity.getHeight(), bY);
        drawingContext.drawImage(entity.getImage(), displayX, displayY); 
    }

    getDisplayX(centerX, width, lX){
        // Change coordinate system
        let displayX = this.changeToScreenX(centerX);

        // Find relative to bottom left corner
        displayX = displayX - lX;

        // Find top left corner
        displayX = displayX - width / 2;

        // Round to nearest pixel
        displayX = Math.round(displayX);
        return displayX;
    }

    getDisplayY(centerY, height, bY){
        // Change coordinate system
        let displayY = this.changeToScreenY(centerY);

        // Find relative to bottom left corner
        displayY = displayY + bY;

        // Find top left corner
        displayY = displayY - height / 2;

        // Round to nearest pixel
        displayY = Math.round(displayY);
        return displayY;
    }

    hasEntityFocused(){
        return this.focusedEntityIndex != -1;
    }

    getEntity(id){
        for (let entity of this.entities){
            if (entity.getID() == id){ return entity; }
        }
        return null;
    }

    hasEntity(id){
        return this.getEntity(id) != null;
    }

    getFocusedEntity(){
        return this.entities[this.focusedEntityIndex];
    }

    getEntityIndex(entityID){
        for (let i = 0; i < this.entities.length; i++){
            if (entityID == this.entities[i].getID()){
                return i;
            }
        }
        return -1;
    }

    tick(timeDiff){
        for (let entity of this.entities){
            entity.tick(timeDiff);
        }

        this.checkCollisions();
    }

    checkCollisions(){
        let bullets = [];
        let destructableEntities = [];

        for (let entity of this.entities){
            if (entity instanceof Bullet){
                bullets.push(entity);
            }else if (entity instanceof FighterPlane){
                destructableEntities.push(entity);
            }
        }

        for (let bullet of bullets){
            for (let destructableEntity of destructableEntities){
                if (destructableEntity.getID() == bullet.getShooterID()){ continue; }
                if (destructableEntity.collidesWith(bullet.getHitbox())){
                    destructableEntity.damage(1);
                    bullet.delete();
                    //document.getElementById("hitSound").play();
                    break;
                }
            }
        }
    }
}