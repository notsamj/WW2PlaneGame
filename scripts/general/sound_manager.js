// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    helperFunctions = require("../general/helper_functions.js");
    getLocalStorage = helperFunctions.getLocalStorage;
    setLocalStorage = helperFunctions.setLocalStorage;
}
/*
    Class Name: SoundManager
    Description: A class for managing the playing of sounds.
*/
class SoundManager {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.soundQueue = new NotSamLinkedList();
        this.sounds = [];
        this.mainVolume = getLocalStorage("main volume", 0);
        this.loadSounds();
    }

    /*
        Method Name: loadSounds
        Method Parameters: None
        Method Description: Loads all the sounds that are identified in the file data
        Method Return: void
    */
    loadSounds(){
        for (let soundData of PROGRAM_DATA["sound_data"]["sounds"]){
            this.sounds.push(new Sound(soundData["name"], soundData["type"], this.mainVolume));
        }
    }

    /*
        Method Name: loadSounds
        Method Parameters:
            soundName:
                The name of the sound to play
            x:
                The x location at which the sound occurs
            y:
                The y location at which the sound occurs
        Method Description: Prepares to play a sound when playAll is next called
        Method Return: void
    */
    play(soundName, x, y){
        if (!this.hasSound(soundName)){
            return;
        }
        this.soundQueue.push(new SoundRequest(this.findSound(soundName), x, y));
    }

    /*
        Method Name: loadSounds
        Method Parameters:
            soundName:
                The name of the sound to find
        Method Description: Finds a sound and returns it
        Method Return: Sound
    */
    findSound(soundName){
        for (let sound of this.sounds){
            if (sound.getName() == soundName){
                return sound;
            }
        }
        return null;
    }

    /*
        Method Name: hasSound
        Method Parameters:
            soundName:
                The name of the sound to find
        Method Description: Determines if a sound is present
        Method Return: Boolean, true -> sound is present, false -> sound is not present.
    */
    hasSound(soundName){
        return this.findSound(soundName) != null;
    }

    /*
        Method Name: playAll
        Method Parameters:
            lX:
                Left x game coordinate of the screen
            rX:
                Right x game coordinate of the screen
            bY:
                Bottom y game coordinate of the screen
            tY:
                Top y game coordinate of the screen
        Method Description: Plays all the sounds within a specified game coordinate area. It first prepares to pause all sounds then determines which need not be paused and then pauses all that are not needed to be playing.
        Method Return: void
    */
    playAll(lX, rX, bY, tY){
        this.prepareToPauseAll();
        // Play all sounds that take place on the screen
        while (this.soundQueue.getLength() > 0){
            let soundRequest = this.soundQueue.get(0);
            soundRequest.tryToPlay(lX, rX, bY, tY);
            this.soundQueue.pop(0);
        }
        this.pauseAllIfPrepared();
    }

    /*
        Method Name: prepareToPauseAll
        Method Parameters: None
        Method Description: Prepares to pause all active sounds
        Method Return: void
    */
    prepareToPauseAll(){
        for (let sound of this.sounds){
            sound.prepareToPause();
        }
    }

    /*
        Method Name: pauseAllIfPrepared
        Method Parameters: None
        Method Description: Pauses all active sounds that are prepared
        Method Return: void
    */
    pauseAllIfPrepared(){
        for (let sound of this.sounds){
            sound.pauseIfPrepared();
        }
    }

    /*
        Method Name: pauseAll
        Method Parameters: None
        Method Description: Pauses all active sounds
        Method Return: void
    */
    pauseAll(){
        for (let sound of this.sounds){
            sound.pause();
        }
    }

    /*
        Method Name: updateVolume
        Method Parameters:
            soundName:
                Name of sound whose volume is being updated
            newVolume:
                The new volume for the sound
        Method Description: Updates the volume of a sound
        Method Return: void
    */
    updateVolume(soundName, newVolume){
        setLocalStorage(soundName, newVolume);
        if (soundName == "main volume"){
            this.mainVolume = newVolume;
            for (let sound of this.sounds){
                sound.adjustByMainVolume(this.mainVolume);
            }
            return;
        }
        if (!this.hasSound(soundName)){ return; }
        let sound = this.findSound(soundName);
        sound.updateVolume(newVolume, this.mainVolume);
    }

    /*
        Method Name: getVolume
        Method Parameters:
            soundName:
                Name of sound whose volume is being updated
        Method Description: Determines the volume of a sound
        Method Return: int
    */
    getVolume(soundName){
        if (soundName == "main volume"){
            return this.mainVolume;
        }
        if (!this.hasSound(soundName)){ return 0; }
        let sound = this.findSound(soundName);
        return sound.getVolume();
    }

    /*
        Method Name: getSoundRequestList
        Method Parameters: None
        Method Description: Creates a list of JSON representations of sound requests
        Method Return: List of JSON Objects
    */
    getSoundRequestList(){
        let soundRequestList = [];
        for (let [soundRequest, sRI] of this.soundQueue){
            soundRequestList.push(soundRequest.toJSON());
        }
        return soundRequestList;
    }

    /*
        Method Name: clearRequests
        Method Parameters: None
        Method Description: Removes all queued sound requests
        Method Return: void
    */
    clearRequests(){
        this.soundQueue.clear();
    }

    /*
        Method Name: fromSoundRequestList
        Method Parameters:
            soundRequestList:
                A list of JSON representions of sound requests
        Method Description: Creates many sound requests from a list of JSON representations
        Method Return: void
    */
    fromSoundRequestList(soundRequestList){
        for (let requestObject of soundRequestList){
            this.soundQueue.push(SoundRequest.fromJSON(this, requestObject));
        }
    }
}

/*
    Class Name: SoundRequest
    Description: A class to store a sound request
*/
class SoundRequest {
     /*
        Method Name: constructor
        Method Parameters:
            sound:
                A sound object
            x:
                The x location where the sound is played
            y:
                The y location where the sound is played
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(sound, x, y){
        this.sound = sound;
        this.x = x;
        this.y = y;
    }

    /*
        Method Name: tryToPlay
        Method Parameters:
            lX:
                Left x game coordinate of the screen
            rX:
                Right x game coordinate of the screen
            bY:
                Bottom y game coordinate of the screen
            tY:
                Top y game coordinate of the screen
        Method Description: Plays the sound IF it is within the specified game region.
        Method Return: void
    */
    tryToPlay(lX, rX, bY, tY){
        if (this.x >= lX && this.x <= rX && this.y >= bY && this.y <= tY){
            this.sound.play();
        }
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Creates a json representation of a sound request
        Method Return: JSON Object
    */
    toJSON(){
        return {"x": this.x, "y": this.y, "sound": this.sound.getName()}
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            soundManager:
                A SoundManager instance
            jsonObject:
                A JSON representation of a sound request
        Method Description: Creates a JSON representation 
        Method Return: SoundRequest
    */
    static fromJSON(soundManager, jsonObject){
        return new SoundRequest(soundManager.findSound(jsonObject["sound"]), jsonObject["x"], jsonObject["y"]);
    }
}

/*
    Class Name: Sound
    Description: A class to handle a sound.
*/
class Sound {
    /*
        Method Name: constructor
        Method Parameters: 
            soundName:
                The name of the sound
            soundType:
                A string specifying if the sound is ongoing or discrete
            mainVolume:
                The main volume of program
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(soundName, soundType, mainVolume){
        this.name = soundName;
        this.ongoing = soundType == "ongoing";
        this.lastPlayed = 0;
        // Audio will be {} if opened in NodeJS
        this.audio = (typeof window != "undefined") ? new Audio(PROGRAM_DATA["sound_data"]["url"] + "/" + this.name + PROGRAM_DATA["sound_data"]["file_type"]) : {};
        this.running = false;
        this.volume = getLocalStorage(soundName, 0);
        this.adjustByMainVolume(mainVolume);
        this.preparedToPause = true;
    }

    /*
        Method Name: getName
        Method Parameters: None
        Method Description: Getter
        Method Return: void
    */
    getName(){
        return this.name;
    }

    /*
        Method Name: play
        Method Parameters: None
        Method Description: Plays the sound
        Method Return: void
    */
    play(){
        // Already playing....
        this.lastPlayed = Date.now();
        this.preparedToPause = false;
        if (this.isRunning() || this.volume == 0){ return; }
        this.audio.play();
        this.running = true;
    }

    /*
        Method Name: isRunning
        Method Parameters: None
        Method Description: Determines if the sound is currently running
        Method Return: Boolean, true -> is running, false -> is not running
    */
    isRunning(){
        return this.audio.currentTime < this.audio.duration && this.running;
    }

    /*
        Method Name: pause
        Method Parameters: None
        Method Description: Pauses a sound (if it is running)
        Method Return: void
    */
    pause(){
        // Ongoing sounds can be paused but not discrete sounds
        if (!this.ongoing){ return; }
        if (this.isRunning()){
            this.running = false;
            this.audio.pause();
        }
    }

    /*
        Method Name: adjustByMainVolume
        Method Parameters:
            mainVolume:
                The main volume of the program
        Method Description: Adjusts the volume of a sound based on the main program volume
        Method Return: void
    */
    adjustByMainVolume(mainVolume){
        this.updateVolume(this.volume, mainVolume);
    }

    /*
        Method Name: updateVolume
        Method Parameters:
            newVolume:
                The new volume value of a sound
            mainVolume:
                The main volume of the program
        Method Description: Adjusts the volume of a sound based on the main program volume and its own volume value.
        Method Return: void
    */
    updateVolume(newVolume, mainVolume){
        this.volume = newVolume;
        this.audio.volume = (newVolume / 100) * (mainVolume / 100);
    }

    /*
        Method Name: getVolume
        Method Parameters: None
        Method Description: Getter
        Method Return: void
    */
    getVolume(){
        return this.volume;
    }

    /*
        Method Name: prepareToPause
        Method Parameters: None
        Method Description: Prepares the sound to pause unless otherwise told not to pause. This is so that continous sounds can be played without pause but stopped when they are no longer needed.
        Method Return: void
    */
    prepareToPause(){
        if (!this.ongoing){ return; }
        // Check if its been 1s since last played then ready to dismiss
        if (Date.now() < this.lastPlayed + 100){ // Just using 100ms as the standard TODO: Save this in a data file
            return;
        }
        this.preparedToPause = true;
    }

    /*
        Method Name: pauseIfPrepared
        Method Parameters: None
        Method Description: Pauses a sound if it is not needed at the moment
        Method Return: void
    */
    pauseIfPrepared(){
        if (!this.ongoing){ return; }
        // Pause if prepared to
        if (this.preparedToPause){
            this.pause();
        }
    }
}

// If using NodeJS then export the lock class
if (typeof window === "undefined"){
    module.exports = SoundManager;
}