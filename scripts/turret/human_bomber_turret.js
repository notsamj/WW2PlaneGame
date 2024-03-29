/*
    Class Name: HumanBomberTurret
    Description: Class representing a Turret attached to a Bomber plane that is operated by a human
*/
class HumanBomberTurret extends BomberTurret {
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
        Method Description: Constructor
        Method Return: Constructor
    */

    constructor(xOffset, yOffset,fov1, fov2, rateOfFire, scene, plane){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, scene, plane);
    }

    /*
        Method Name: getShootingAngle
        Method Parameters: None
        Method Description: Determines the shooting angle of the turret by looking at the position of the user's mouse.
        Method Return: int
    */
    getShootingAngle(){
        let x = window.mouseX - getScreenWidth() / 2;
        let y = this.scene.changeFromScreenY(window.mouseY) - getScreenHeight() / 2;
        let x0 = 0;
        let y0 = 0;
        return getDegreesFromDisplacement(x - x0, y - y0);
    }

    /*
        Method Name: checkShoot
        Method Parameters: None
        Method Description: Check if the user wishes to shoot and if so, shoots
        Method Return: void
    */
    checkShoot(){
        if (USER_INPUT_MANAGER.isActivated("bomber_shoot_input")){
            this.shoot();
        }
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
        Method Return: HumanBomberTurret
    */
    static create(gunObject, scene, plane){
        return new HumanBomberTurret(gunObject["x_offset"], gunObject["y_offset"], gunObject["fov_1"], gunObject["fov_2"], gunObject["rate_of_fire"], scene, plane);
    }
}