/*
    Class Name: Building
    Description: A simple grey building that exists to be displayed and destroyed
*/
class Building extends Entity {
    /*
        Method Name: constructor
        Method Parameters: 
            x:
                The x location of the left side of the building
            width:
                The width of the buidling
            height:
                The height of the building
            health:
                The health of the building
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, width, height, health){
        super(scene);
        this.x = x;
        this.width = width;
        this.height = height;
        this.hitBox = new RectangleHitbox(width, height, x + width/2, height/2);
        this.health = health;
    }

    /*
        Method Name: damage
        Method Parameters: 
            amount:
                Amount of damage taken by this buidling
        Method Description: Damages a building
        Method Return: void
    */
    damage(amount){
        this.health -= amount;
        if (this.health <= 0){
            this.die();
        }
    }

    /*
        Method Name: getCenterX
        Method Parameters: None
        Method Description: Determines the x coordinate of the building center
        Method Return: float
    */
    getCenterX(){
        return this.x + this.width / 2;
    }

    /*
        Method Name: getCenterY
        Method Parameters: None
        Method Description: Determines the y coordinate of the building center
        Method Return: float
    */
    getCenterY(){
        return this.height / 2;
    }

    /*
        Method Name: getWidth
        Method Parameters: None
        Method Description: Getter
        Method Return: Number
    */
    getWidth(){
        return this.width;
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Getter
        Method Return: Number
    */
    getHeight(){
        return this.height;
    }

    /*
        Method Name: getHitbox
        Method Parameters: None
        Method Description: Getter
        Method Return: Hitbox
    */
    getHitbox(){
        return this.hitBox;
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays the building on the canvas
        Method Return: void
    */
    display(lX, bY){
        // Do not display if dead
        if (this.isDead()){ return; }
        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;

        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Determine the location it will be displayed at
        let displayX = this.scene.getDisplayX(this.x, 0, lX);
        let displayY = this.scene.getDisplayY(this.height, 0, bY);
        // The building is grey
        fill("#c2c2c4");
        rect(displayX, displayY, this.width, this.height);
    }
}