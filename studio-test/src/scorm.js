import { isClient } from "./dependencies/utils/misc";

export class LMSAPI {
    constructor() {
      this.initialized = false;
      this.data = {}; // to store data values
    }
    
    addLMSInfo(info) {
      console.log(info)
    }
    // Initialize communication with the LMS
    LMSInitialize() {
      // if (this.initialized) {
      //   this.addLMSInfo("LMS is already initialized.");
      //   return "false";
      // }
      this.initialized = true;
      this.addLMSInfo("LMS Initialized.");
      return "true";
    }
  
    // Finish communication with the LMS
    LMSFinish() {
      if (!this.initialized) {
        this.addLMSInfo("LMS is not initialized.");
        return "false";
      }
      this.initialized = false;
      this.addLMSInfo("LMS Finished.");
      return "true";
    }

    // Get value for a given data model element
    LMSGetValue(key) {
      if (!this.initialized) {
        console.log("LMS is not initialized.");
        return "false";
      }
      let value
      value=this.data[key] || "";
      this.addLMSInfo(`**** GetValue ${key}, got ${value}`)
      return value
    }
  
    // Set value for a given data model element
    LMSSetValue(key, value) {
      if (!this.initialized) {
        console.log("LMS is not initialized.");
        return "false";
      }
      if (this.data[key]!=value) {
        this.data[key] = value;
        this.addLMSInfo(`SetValue ${key}:${value}`)
      }
      return "true";
    }
  
    // Commit data to the LMS
    LMSCommit() {
      if (!this.initialized) {
        console.log("LMS is not initialized.");
        return "false";
      }
      this.addLMSInfo(`Commit ${JSON.stringify(this.data)}`)
      console.log("Data committed:", this.data);
      return "true";
    }
  
    // Get last error code
    LMSGetLastError() {
      this.addLMSInfo(`getLastError`)
      return "0"; // No error
    }
  
    // Get error string for a given error code
    LMSGetErrorString(errorCode) {
      const errorStrings = {
        "0": "No error",
        "101": "General exception",
        "201": "Invalid argument error",
        "202": "Element cannot have children",
        "203": "Element not an array - cannot have count",
      };
      const value=errorStrings[errorCode] || "Unknown error";
      this.addLMSInfo(`getErrorString ${errorCode}:${value}`)
      return value
    }
  
    // Get diagnostic information
    LMSGetDiagnostic(errorCode) {
      this.addLMSInfo(`getDiagnostic`)
      return `Diagnostic information for error code: ${errorCode}`;
    }

    // Other version
    Initialize(data){
      this.initialized = true;
      this.addLMSInfo(`Initialize`)
      return "true"
    }

    GetValue(key) {
      return this.LMSGetValue(key)
    }

    SetValue(key, value) {
      return this.LMSSetValue(key, value)
    }

    Commit(p) {
      return this.LMSCommit()
    }

  }

export function SCORM2004_GrabAPI() {
    const api=new LMSAPI()
    console.log(api.LMSInitialize());
    // console.log(api.LMSSetValue("learner_name", "John Doe"));
    // console.log(api.LMSSetValue("course_progress", "50%"));
    return api
  }

export function getAPI() {
    var theAPI = SCORM2004_GrabAPI();
    return theAPI;
}


if (isClient()) {
  // alert('creating API')
  const API=getAPI()
  window.API=API
  window.API_1484_11=API
  console.log(window.API)
}


