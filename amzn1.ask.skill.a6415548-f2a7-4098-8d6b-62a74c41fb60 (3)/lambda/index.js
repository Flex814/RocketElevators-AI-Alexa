/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require("ask-sdk-core");
const http = require("https");


// greating message hello there.
const GetLaunchHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText = "Hello there. How can i help you today?";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt()
      .getResponse();
  }
};

// find the elevator status of a specific elevator
const GetStatusHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.intent.name === "GetStatusIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    if (id > 200) {
      outputSpeech = "Please enter a valid number";
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }
    const elevatorStatus = await getRemoteElevatorData(
      "https://jakerocket.azurewebsites.net/elevator/" + id
    );

    const elevator = JSON.parse(elevatorStatus);

    outputSpeech = `The status of elevator ${id} is ${elevator} `;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// find the battery status of a specific battery
const GetBatteryHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.intent.name === "GetBatteryIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    if (id > 200) {
      outputSpeech = "Please enter a valid number";
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }
    const batteryStatus = await getRemoteBatteryData(
      "https://jakerocket.azurewebsites.net/battery/" + id
    );

    const battery = JSON.parse(batteryStatus);

    outputSpeech = `The status of battery ${id} is ${battery} `;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// find the column status of a specific column 
const GetColumnHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.intent.name === "GetColumnIntent"
    );
  },
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    if (id > 200) {
      outputSpeech = "Please enter a valid number";
      return handlerInput.responseBuilder
        .speak(outputSpeech)
        .reprompt()
        .getResponse();
    }
    const columnStatus = await getRemoteColumnData(
      "https://jakerocket.azurewebsites.net/column/" + id
    );

    const column = JSON.parse(columnStatus);

    outputSpeech = `The status of column ${id} is ${column} `;

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt()
      .getResponse();
  }
};

// make get for the big sentence 

const GetRemoteDataHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetRemoteDataIntent"
    );
  },

  // The information that's going on at Rocket Elevators.  Say something like "What's going on at Rocket Elevators"
  async handle(handlerInput) {
    let outputSpeech = "This is the default message.";

    await getRemoteData(
      "https://jakerocket.azurewebsites.net/greetings"
    )
      .then((response) => {
        outputSpeech = response;
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  },
};

// change elevator status with id and status 
const ChangeStatusHandler = {
    canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.intent.name === "ChangeStatusIntent"
    ); 
},

async handle(handlerInput) {
    const id = handlerInput.requestEnvelope.request.intent.slots.id.value;
    const status = handlerInput.requestEnvelope.request.intent.slots.status.value;
    const result = await httpPostElevatorStatus(id, status);
    var capitalizedStatus = uppercaseFirstCharacter(status);
    let outputSpeech = result;
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse();
  },
};

async function httpPostElevatorStatus(id, status) {
    return new Promise((resolve, reject) => {
    const postData = `{"id":"${id}","status":"${status}"}`;
    console.log(id, status);
    let options = {
        host: "https://jakerocket.azurewebsites.net/", // here is the end points
      path: `elevator/${id}`,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      },
      method: "POST"
    };
    var req = http.request(options, res => {
      var responseString = "";
      res.on("data", chunk => {
        responseString = responseString + chunk;
      });
      res.on("end", () => {
        console.log("Received: " + responseString);
        resolve(responseString);
      });
      res.on("error", e => {
        console.log("ERROR: " + e);
        reject();
      });
    });
    req.write(postData);
    req.end();
  });
    }
function uppercaseFirstCharacter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


// ----- help commands -----

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText =
      `Here is the list of all commands : what is the status of elevator x,Can you tell me the status of elevator x, what is the status of column x, Can you tell me the status of column x, how is rocket elevators going, what is happening at rocket elevators, what is going on, what is the status of battery x,  Can you tell me the status of battery x`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speechText = "Goodbye!";

    return handlerInput.responseBuilder.speak(speechText).getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${
        handlerInput.requestEnvelope.request.reason
      }`
    );

    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
      .getResponse();
  }
};
const getRemoteElevatorData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};
//Get battery status
const getRemoteBatteryData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};
//Get Column status
const getRemoteColumnData = function(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Failed with status code: " + response.statusCode));
      }
      const body = [];
      response.on("data", chunk => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", err => reject(err));
  });
};
// Services of Rocket Elevators
const getRemoteData = (url) =>
  new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? require("https") : require("http");
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error(`Failed with status code: ${response.statusCode}`));
      }
      const body = [];
      response.on("data", (chunk) => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", (err) => reject(err));
  });

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetLaunchHandler,
    GetRemoteDataHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    GetStatusHandler,
    GetBatteryHandler,
    GetColumnHandler,
    ChangeStatusHandler
    
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();