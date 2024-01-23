// If using NodeJS then do required imports
if (typeof window === "undefined"){
    FILE_DATA = require("../data/data_json.js");
}
/*
    Method Name: getScreenWidth
    Method Parameters: None
    Method Description: Determines the screen width in real pixels
    Method Return: void
*/
function getScreenWidth(){
    return window.innerWidth;
}
/*
    Method Name: getScreenHeight
    Method Parameters: None
    Method Description: Determines the screen height in real pixels
    Method Return: void
*/
function getScreenHeight(){
    return window.innerHeight;
}
/*
    Method Name: copyArray
    Method Parameters:
        array:
            An array to copy
    Method Description: Creates a copy of an array
    Method Return: void
*/
function copyArray(array){
    let newArray = [];
    for (let i = 0; i < array.length; i++){
        newArray.push(array[i]);
    }
    return newArray;
}

/*
    Method Name: listMean
    Method Parameters:
        list:
            An list to to find the mean of
    Method Description: Finds the mean value of a list of numbers
    Method Return: Number
*/
function listMean(list){
    if (list.length == 0){ return -1; }
    let total = 0;
    for (let i = 0; i < list.length; i++){
        total += list[i];
    }
    return total / list.length;
}

/*
    Method Name: listMin
    Method Parameters:
        list:
            An list to find the minimum number in
    Method Description: Finds the min value of a list of numbers
    Method Return: Number
*/
function listMin(list){
    let min = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < list.length; i++){
        if (list[i] < min){
            min = list[i];
        }
    }
    return min;
}

/*
    Method Name: listMax
    Method Parameters:
        list:
            An list to find the max of
    Method Description: Finds the max value of a list of numbers
    Method Return: Number
*/
function listMax(list){
    let max = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < list.length; i++){
        if (list[i] > max){
            max = list[i];
        }
    }
    return max;
}

/*
    Method Name: listMedian
    Method Parameters:
        list:
            An list to find the median of
    Method Description: Finds the median number in a list
    Method Return: Number
*/
function listMedian(list){
    if (list.length == 0){ return -1; }
    let newList = copyArray(list);
    newList.sort();
    return newList[Math.floor(newList.length/2)];
}

/*
    Method Name: toRadians
    Method Parameters:
        degrees:
            The number of degrees to convert to radians
    Method Description: Converts degrees to radians
    Method Return: float
*/
function toRadians(degrees){
    return degrees * Math.PI / 180;
}

/*
    Method Name: toDegrees
    Method Parameters:
        radians:
            An amount of radians to convert to degrees
    Method Description: Converts an amount of radians to degrees
    Method Return: int
*/
function toDegrees(radians){
    return radians / (2 * Math.PI) * 360;
}

/*
    Method Name: fixDegrees
    Method Parameters:
        angle:
            An angle to "fix"
    Method Description: Fixes an angle to the range [0,359]
    Method Return: int
*/
function fixDegrees(angle){
    while (angle < 0){
        angle += 360;
    }
    while(angle >= 360){
        angle -= 360;
    }
    return angle;
}

/*
    Method Name: fixRadians
    Method Parameters:
        angle:
            An angle to "fix"
    Method Description: Fixes an angle to the range [0,2*PI)
    Method Return: float
*/
function fixRadians(angle){
    while (angle < 0){
        angle += 2 * Math.PI;
    }
    while (angle >= 2 * Math.PI){
        angle -= Math.PI;
    }
    return angle;
}

/*
    Method Name: displacementToDegrees
    Method Parameters:
        dX:
            The displacement in x
        dY:
            The displacement in y
    Method Description: Creates a copy of an array
    Method Return: int
*/
function displacementToDegrees(dX, dY){
    return fixDegrees(toDegrees(displacmentToRadians(dX, dY)));
}

/*
    Method Name: displacmentToRadians
    Method Parameters:
        dX:
            The displacement in x
        dY:
            The displacement in y
    Method Description: Converts displacement in x, y to an angle in radians
    Method Return: float
*/
function displacmentToRadians(dX, dY){
    // Handle incredibly small displacements
    if (Math.abs(dY) < 1){
        return (dX >= 0) ? toRadians(0) : toRadians(180);
    }else if (Math.abs(dX) < 1){
        return (dY >= 0) ? toRadians(90) : toRadians(270);
    }

    // Convert angle to positive positive
    let angleRAD = Math.atan(Math.abs(dY) / Math.abs(dX));

    // If -,- (x,y)
    if (dX < 0 && dY < 0){
        angleRAD = Math.PI + angleRAD;
    // If -,+ (x,y)
    }else if (dX < 0 && dY > 0){
        angleRAD = Math.PI - angleRAD;
    // If +,- (x,y)
    }else if (dX > 0 && dY < 0){
        angleRAD = 2 * Math.PI - angleRAD;
    }
    // +,+ Needs no modification
    return angleRAD;
}

/*
    Method Name: randomNumberInclusive
    Method Parameters:
        min:
            Minimum value (inclusive)
        maxInclusive:
            Maximum value (inclusive)
    Method Description: Come up with a number in a given range [min, maxInclusive]
    Method Return: int
*/
function randomNumberInclusive(min, maxInclusive){
    return Math.floor(Math.random() * (maxInclusive - min + 1)) + min; 
}

/*
    Method Name: randomNumberInclusive
    Method Parameters:
        maxExclusive:
            Minimum value (exclusive)
    Method Return: int
*/
function randomNumber(maxExclusive){
    return randomNumberInclusive(0, maxExclusive-1);
}

/*
    Method Name: onSameTeam
    Method Parameters:
        class1:
            Plane type of the first plane
        class2:
            Plane type of the second plane
    Method Description: Determines if two planes are on the same team
    Method Return: boolean, True -> On same team, False -> Not on the same team
*/
function onSameTeam(class1, class2){
    return countryToAlliance(FILE_DATA["plane_data"][class1]["country"]) == countryToAlliance(FILE_DATA["plane_data"][class2]["country"]);
}

/*
    Method Name: calculateAngleDiffDEG
    Method Parameters:
        angle1:
            An angle in degrees
        angle2:
            An angle in degrees
    Method Description: Calculates the difference between two angles in degrees
    Method Return: int
*/
function calculateAngleDiffDEG(angle1, angle2){
    let diff = Math.max(angle1, angle2) - Math.min(angle1, angle2);
    if (diff > 180){
        diff = 360 - diff;
    }
    return diff;
}

/*
    Method Name: calculateAngleDiffDEGCW
    Method Parameters:
        angle1:
            An angle in degrees
        angle2:
            An angle in degrees
    Method Description: Calculates the difference between two angles in degrees (in the clockwise direction)
    Method Return: int
*/
function calculateAngleDiffDEGCW(angle1, angle2){
    angle1 = Math.floor(angle1);
    angle2 = Math.floor(angle2);
    let diff = 0;
    while (angle1 != Math.floor(angle2)){
        angle1 += 1;
        diff += 1;
        while (angle1 >= 360){
            angle1 -= 360;
        }
    }

    return diff;
}

/*
    Method Name: calculateAngleDiffDEGCCW
    Method Parameters:
        angle1:
            An angle in degrees
        angle2:
            An angle in degrees
    Method Description: Calculates the difference between two angles in degrees (in the counter clockwise direction)
    Method Return: int
*/
function calculateAngleDiffDEGCCW(angle1, angle2){
    angle1 = Math.floor(angle1);
    angle2 = Math.floor(angle2);
    let diff = 0;
    while (angle1 != Math.floor(angle2)){
        angle1 -= 1;
        diff += 1;
        while (angle1 < 0){
            angle1 += 360;
        }
    }

    return diff;
}

/*
    Method Name: rotateCWDEG
    Method Parameters:
        angle:
            Angle to rotate
        amount:
            Amount to rotate by
    Method Description: Rotates an angle clockwise by an amount
    Method Return: int
*/
function rotateCWDEG(angle, amount){
    return fixDegrees(angle + amount);
}

/*
    Method Name: rotateCCWDEG
    Method Parameters:
        angle:
            Angle to rotate
        amount:
            Amount to rotate by
    Method Description: Rotates an angle counter clockwise by an amount
    Method Return: int
*/
function rotateCCWDEG(angle, amount){
    return fixDegrees(angle - amount);
}

/*
    Method Name: angleBetweenCWDEG
    Method Parameters:
        angle:
            An angle in degrees
        eAngle1:
            An angle on one edge of a range
        eAngle2:
            An angle on the other edge of a range
    Method Description: Determines if angle is between eAngle1 and eAngle2 in the clockwise direction
    Method Return: boolean, true -> angle is between, false -> angle is not between
*/
function angleBetweenCWDEG(angle, eAngle1, eAngle2){
    return calculateAngleDiffDEGCW(eAngle1, angle) <= calculateAngleDiffDEGCCW(eAngle1, angle) && calculateAngleDiffDEGCW(angle, eAngle2) <= calculateAngleDiffDEGCCW(angle, eAngle2);
}

/*
    Method Name: angleBetweenCCWDEG
    Method Parameters:
        angle:
            An angle in degrees
        eAngle1:
            An angle on one edge of a range
        eAngle2:
            An angle on the other edge of a range
    Method Description: Determines if angle is between eAngle1 and eAngle2 in the counter clockwise direction
    Method Return: boolean, true -> angle is between, false -> angle is not between
*/
function angleBetweenCCWDEG(angle, eAngle1, eAngle2){
    return calculateAngleDiffDEGCCW(eAngle1, angle) <= calculateAngleDiffDEGCW(eAngle1, angle) && calculateAngleDiffDEGCCW(angle, eAngle2) <= calculateAngleDiffDEGCW(angle, eAngle2);
}

/*
    Method Name: lessThanDir
    Method Parameters:
        p1:
            A point in a 1d space
        p2:
            Another point in a 1d space
        velocity:
            Velocity of an object
    Method Description: Whether p1 is less than p2 while travelling in a direction
    Method Return: Boolean, true -> p1 < p2 in the direction of velocity, false -> otherwise
*/
function lessThanDir(p1, p2, velocity){
    return (velocity >= 0) ? (p1 < p2) : (p1 > p2);
}

/*
    Method Name: lessThanEQDir
    Method Parameters:
        p1:
            A point in a 1d space
        p2:
            Another point in a 1d space
        velocity:
            Velocity of an object
    Method Description: Whether p1 is less than p2 while travelling in a direction
    Method Return: Boolean, true -> p1 <= p2 in the direction of velocity, false -> otherwise
*/
function lessThanEQDir(p1, p2, velocity){
    return (velocity >= 0) ? (p1 <= p2) : (p1 >= p2);
}

/*
    Method Name: nextIntInDir
    Method Parameters:
        floatValue:
            A float value
        velocity:
            Direction in which an object is moving
    Method Description: Finds the ceiling or floor of a float depending on the direction it is moving
    Method Return: int
*/
function nextIntInDir(floatValue, velocity){
    let newValue = Math.ceil(floatValue);
    if (velocity < 0){
        newValue = Math.floor(floatValue);
    }

    // If floatValue is an int then go by 1 in the next direction
    if (newValue == floatValue){
        newValue += (velocity < 0) ? -1 : 1;
    }

    return newValue;
}

/*
    Method Name: randomFloatBetween
    Method Parameters:
        lowerBound:
            Lower bound float value
        upperBound:
            Upper bound float value
    Method Description: Finds a random float between two ends
    Method Return: float
*/
function randomFloatBetween(lowerBound, upperBound){
    return Math.random() * (upperBound - lowerBound) + lowerBound;
}

/*
    Method Name: countryToAlliance
    Method Parameters:
        country:
            A string representing a country name
    Method Description: Find the alliance for a given country
    Method Return: String
*/
function countryToAlliance(country){
    return FILE_DATA["country_to_alliance"][country];
}

/*
    Method Name: planeModelToCountry
    Method Parameters:
        planeModel:
            A string representing a plane type
    Method Description: Find the country for a given plane model
    Method Return: String
*/
function planeModelToCountry(planeModel){
    return FILE_DATA["plane_data"][planeModel]["country"];
}

/*
    Method Name: planeModelToAlliance
    Method Parameters:
        planeModel:
            A string representing a plane type
    Method Description: Find the alliance for a given plane model
    Method Return: String
*/
function planeModelToAlliance(planeModel){
    return countryToAlliance(planeModelToCountry(planeModel));
}

/*
    Method Name: sleep
    Method Parameters:
        ms:
            A number of ms to sleep for
    Method Description: Sleeps for a given amount of time
    Method Return: Promise
*/
async function sleep(ms){
    return new Promise((resolve, reject) => { setTimeout(resolve, ms); })
}

// If using NodeJS then export all the functions
if (typeof window === "undefined"){
    module.exports = {
        copyArray,
        toRadians,
        toDegrees,
        fixDegrees,
        fixRadians,
        displacementToDegrees,
        displacmentToRadians,
        randomNumberInclusive,
        randomNumber,
        onSameTeam,
        calculateAngleDiffDEG,
        calculateAngleDiffDEGCW,
        calculateAngleDiffDEGCCW,
        rotateCWDEG,
        rotateCCWDEG,
        angleBetweenCWDEG,
        angleBetweenCCWDEG,
        lessThanDir,
        lessThanEQDir,
        nextIntInDir,
        randomFloatBetween,
        countryToAlliance,
        planeModelToCountry,
        planeModelToAlliance,
        sleep,
        listMean,
        listMedian,
        listMin,
        listMax
    }
}