import axios from "axios";
import { API_ROOT } from "./consts"
import { isClient } from "./misc"

const SCORM_URL = `${API_ROOT}/scorm`
export class LMSAPI {

    constructor() {
      this.initialized = false;
      this.data = {}; // to store data values
      if (!isClient()) {
        return console.warn(`Not in browser`)
      }
      const url=new URL(globalThis.window.location.toString())
      const resourceId=url.searchParams.get('id')
      if (!resourceId) {
        return console.warn(`No resource id found in URL ${window.location}`)
      }
      axios.get(`${API_ROOT}/scorm/`+resourceId)
        .then(res => {
          this.data=res.data
        })
    }

    _postData() {
      console.log('here')
      if (!isClient()) {
        return console.warn(`Not in browser`)
      }
      const url=new URL(globalThis.window.location.toString())
      const resourceId=url.searchParams.get('id')
      if (!resourceId) {
        return console.warn(`No resource id found in URL ${window.location}`)
      }
      const postData = {
        resourceId,
        scormData: this.data,
      }
      const headers={'Content-Type': 'application/json'}
      console.log('POSTing',postData, 'to', SCORM_URL)
      axios.post(SCORM_URL, postData, {headers})
       .then(console.log)
       .catch(console.error)
    }
    
    addLMSInfo(info) {
      console.log(info)
    }
    // Initialize communication with the LMS
    LMSInitialize() {
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
      try {
        this._postData()
      }
      catch(err) {
        console.error(err)
      }
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
    Initialize(){
      this.initialized = true
      console.trace('Initialize called')
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

    Terminate(p) {
      return this.LMSFinish()
    }

    GetLastError() {
      return this.LMSGetLastError()
    }

    GetErrorString(errorCode) {
      return this.LMSGetErrorString(errorCode)
    }
    
    GetDiagnostic(errorCode) {
      return this.LMSGetDiagnostic(errorCode)
    }
    
  }

export function SCORM2004_GrabAPI() {
  console.log('Calling SCORM2004_GrabAPI')
  const api=new LMSAPI()
  return api
}

let api=null
export function getAPI() {
  console.log('Calling getAPI')
  if (api==null) {
    console.log('Building API instance')
    api= new LMSAPI()
  }
  return api
}


if (isClient()) {
  const API=getAPI()
  window.API=API
  window.API_1484_11=API
  console.log(`Scorm API created`)
}


