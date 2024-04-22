/*
    Class Name: Menu
    Description: An abstract class for making menus
*/
class Menu {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.visible = false;
        this.components = [];
    }

    /*
        Method Name: getWidth
        Method Parameters: None
        Method Description: Finds the width of the screen and returns it
        Method Return: int
    */
    getWidth(){
        return getScreenWidth();
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Finds the height of the screen and returns it
        Method Return: int
    */
    getHeight(){
        return getScreenHeight();
    }

    /*
        Method Name: makeRectangleWithText
        Method Parameters:
        textStr:
            String of text inside the rectangle
        colour:
            The colour of the rectangle
        textColour:
            The colour of the text insid the rectangle
        x:
            The x location of the top left of the rectangle
        y:
            The y location of the top left of the rectangle
        width:
            The width of the rectangle
        height:
            The height of the rectangle

        Method Description: Create a rectangle with text inside
        Method Return: void
    */
    static makeRectangleWithText(textStr, colour, textColour, x, y, width, height){
        let screenX = x;
        let screenY = MENU_MANAGER.changeToScreenY(y);

        // Make the rectangle
        rectMode(CORNER);
        fill(colour);
        rect(screenX, screenY, width, height);
        // Here I'm testing what would happen if I removed p5
        /*drawingContext.beginPath();
        drawingContext.rect(screenX, screenY, width, height);
        drawingContext.strokeRect(screenX, screenY, width, height);
        drawingContext.fillStyle = colour;
        drawingContext.fill();*/

        // Make the text
        Menu.makeText(textStr, textColour, x, y, width, height, CENTER, CENTER);
    }

    /*
        Method Name: determineMaxTextSizeByWidth
        Method Parameters:
        textLines:
            Array of strings, lines of text
        boxWidth:
            The width of the text box
        Method Description: Determines the maximum text size based on the width of the text
        Method Return: int
    */
    static determineMaxTextSizeByWidth(textLines, boxWidth){
        let currentTextSize = 10; // Using as a standard
        textSize(currentTextSize)
        let longestLine = textLines[0];
        let longestLineWidth = textWidth(longestLine);
        
        // Find the longest line
        for (let i = 0; i < textLines.length; i++){
            let currentLineWidth = textWidth(textLines[i])
            if (currentLineWidth > longestLineWidth){
                longestLine = textLines[i];
                longestLineWidth = currentLineWidth;
            }
        }

        // Loop until the text is too big
        while (textWidth(longestLine) + PROGRAM_DATA["settings"]["text_box_padding_percent"] * boxWidth < boxWidth){
            textSize(++currentTextSize);
        }
        return currentTextSize - 1; // -1 because we've established that this is 1 size too big for the width
    }

    /*
        Method Name: makeText
        Method Parameters:
        textStr:
            String of text inside the rectangle
        textColour:
            The colour of the text insid the rectangle
        x:
            The x location of the top left of the text box
        y:
            The y location of the top left of the text box
        boxWidth:
            The width of the text box
        boxHeight:
            The height of the text box

        Method Description: Create text box filled with text
        Method Return: void
    */
    static makeText(textStr, textColour, x, y, boxWidth, boxHeight, alignLR=LEFT, alignTB=TOP){
        if (textStr == ""){ return; }
        let splitByLine = textStr.split("\n");
        let numLines = splitByLine.length;
        let screenX = x;
        let screenY = MENU_MANAGER.changeToScreenY(y);
        let maxTextSizeW = Menu.determineMaxTextSizeByWidth(splitByLine, boxWidth);
        let maxTextSizeH = Math.floor((boxHeight - PROGRAM_DATA["settings"]["text_box_padding_percent"] * boxHeight) / numLines);
        let calculatedTextSize = Math.min(maxTextSizeW, maxTextSizeH);
        calculatedTextSize = Math.max(calculatedTextSize, 1);
        textSize(calculatedTextSize);
        textFont("Arial")
        fill(textColour);
        textAlign(alignLR, alignTB);
        text(textStr, screenX, screenY, boxWidth, boxHeight);
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Display all components
        Method Return: void
    */
    display(){
        for (let component of this.components){
            if (!component.isDisplayEnabled()){ continue; }
            component.display();
        }
    }

    /*
        Method Name: click
        Method Parameters:
        x:
            The x location of the click
        y:
            The y location of the click

        Method Description: Determine if any component was clicked (from most recently added to least)
        Method Return: void
    */
    click(x, y){
        for (let i = this.components.length - 1; i >= 0; i--){
            let component = this.components[i];
            //console.log("Checking", component, component.covers(x, y))
            if (component.covers(x, y) && !component.isDisabled()){
                component.clicked(this);
                break;
            }
        }
    }

    /*
        Method Name: addComponent
        Method Parameters: None
        Method Description: Adds a component to the menu
        Method Return: void
    */
    addComponent(component){
        this.components.push(component);
    }
}