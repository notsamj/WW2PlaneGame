/*
    Class Name: UserInputManager
    Description: A class for managing the user's inputs.
*/
class UserInputManager {
     /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.handlerNodes = [];
    }

    /*
        Method Name: register
        Method Parameters:
            alias:
                The name of the listener
            eventName:
                The name of the event to await
            checker:
                The function that checks if the event meets requirements
            onOff:
                Whether or not the event activates or deactivates the node
        Method Description: Sets up a listener for an event and potentially creates a node
        Method Return: void
    */
    register(alias, eventName, checker, onOff=true){
        let node = this.get(alias);
        document.addEventListener(eventName, (event) => {
            if (checker(event)){
                node.setActivated(onOff);
            }
        });
    }

    /*
        Method Name: has
        Method Parameters:
            alias:
                The name of the listener
        Method Description: Determines if a listener exists with a given name
        Method Return: boolean, true -> exists, false -> does not exist
    */
    has(alias){
        return this.get(alias) != null;
    }

    /*
        Method Name: get
        Method Parameters:
            alias:
                The name of the listener
        Method Description: Finds a listener if it exists, otherwise, creates it. Returns it.
        Method Return: UserInputNode
    */
    get(alias){
        // Check if we have this node
        for (let handlerNode of this.handlerNodes){
            if (handlerNode.getAlias() == alias){
                return handlerNode;
            }
        }
        // Else doesn't exist -> create it
        let newNode = new UserInputNode(alias);
        this.handlerNodes.push(newNode);
        return newNode;
    }
    
    /*
        Method Name: has
        Method Parameters:
            alias:
                The name of the listener
        Method Description: Determines if a listener node has been activated by an event
        Method Return: boolean, true -> activated, false -> not activated
    */
    isActivated(alias){
        return this.has(alias) ? this.get(alias).isActivated() : false;
    }
}

/*
    Class Name: UserInputManager
    Description: A class for managing the user's inputs.
*/
class UserInputNode {
    /*
        Method Name: constructor
        Method Parameters:
            alias:
                Alias/name of the node
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(alias){
        this.alias = alias;
        this.activated = false;
    }

    /*
        Method Name: getAlias
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getAlias(){
        return this.alias;
    }

    /*
        Method Name: setActivated
        Method Parameters:
            onOff:
                Whether to activate or deactivate the node
        Method Description: Getter
        Method Return: void
    */
    setActivated(onOff){
        this.activated = onOff;
    }

    /*
        Method Name: isActivated
        Method Parameters: None
        Method Description: Getter
        Method Return: boolean, true -> activated, false -> not activated
    */
    isActivated(){
        return this.activated;
    }
}