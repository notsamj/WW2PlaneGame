class LocalDogfight extends DogFight {
    constructor(startingEntities){
        super();
        scene.setEntities(startingEntities);
        scene.setFocusedEntity(startingEntities[0].getID());
        scene.enable();
    }

    display(){
        if (!this.isRunning()){
            Menu.makeText("Winner: " + this.winner, "green", 500, 800, 1000, 300)
        }
    }
}