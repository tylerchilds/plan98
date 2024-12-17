const Constants = {
  BAYUN_APP_ID: "5954f86756504833a02d2effe55fb3abb", //Provided when an app is registered with Bayun on Developer Portal
  BAYUN_APP_SALT: "HkA3aF9wu/cT9g76ROgjAp3LqP7zo+/3gn5surnEbEI==", //Provided when an app is registered with Bayun on Developer Portal
  BAYUN_APP_SECRET: "27d341cf5250472294c1cc2eb5a19db75", //Provided when an app is registered with Bayun on Developer Portal

  BAYUN_SERVER_PUBLIC_KEY:
    "-----BEGIN PUBLIC KEY-----,MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEyoXShn1ZiRaRXPW4b+tVsA76+5ykCf6R,Hy17+mpQYgLrsJL1h4rKBUHwhvWEQ24YuLKToQEbpCkuj0YSLNiE5C36tq+lvnp3,N93DtCYx+HTVxy9wJOLQDtOmfOMS2/2g,-----END PUBLIC KEY-----,", //Provided when an app is registered with Bayun on Developer Portal

  ENABLE_FACE_RECOGNITION: false,

  BASE_URL: "https://sandbox.digilockbox.com/", //Provided when an app is registered with Bayun on Developer Portal
};

var localStorageMode = BayunCore.LocalDataEncryptionMode.SESSION_MODE;
let bayunCore;
function initBayunCore() {
  bayunCore = BayunCore.init(
    Constants.BAYUN_APP_ID,
    Constants.BAYUN_APP_SECRET,
    Constants.BAYUN_APP_SALT,
    localStorageMode,
    Constants.ENABLE_FACE_RECOGNITION,
    Constants.BASE_URL,
    Constants.BAYUN_SERVER_PUBLIC_KEY
  );
  console.log("Instanciated BayunCore Object");
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function clearSessionData() {
  setCookie("sessionId", "", 30); // window.sessionId = "";
  setCookie("localStorageMode", "", 30);
}

let sessionId = "";
let roomId = "";
const registerSuccessCallback = (data) => {
  console.log("onRegisterSuccess");
  if (data.employeeAlreadyExists) {
    console.error(ErrorConstants.EMPLOYEE_ALREADY_EXISTS);
    alert(ErrorConstants.EMPLOYEE_ALREADY_EXISTS);
    return;
  }
  if (data.sessionId) {
    alert("Registered Successfully. Please login to continue.");
    sessionId = data.sessionId;
    console.log("SessionId : ", sessionId);
    clearSessionData();
  }
};

const newUserCredentialsCallback = (data) => {
  if (data.sessionId) {
    const authorizeEmployeeCallback = (data) => {
      if (data.sessionId) {
        if (
          data.authenticationResponse ==
          BayunCore.AuthenticateResponse.AUTHORIZATION_PENDING
        ) {
          // You can get employeePublicKey in data.employeePublicKey for it's authorization
        }
      }
    };

    const successCallback = (data) => {
      //Employee Registered Successfully
      //Login to continue.
      console.log("yes");
    };

    const failureCallback = (error) => {
      console.error(error);
    };

    //Take User Input for Security Questions and Answers
    //Here securityQuestionsAnswers object is created just for reference
    var securityQuestionsAnswers = [];
    securityQuestionsAnswers.push({ question: "q", answer: "a" });
    securityQuestionsAnswers.push({ question: "q", answer: "a" });
    securityQuestionsAnswers.push({ question: "q", answer: "a" });
    securityQuestionsAnswers.push({ question: "q", answer: "a" });
    securityQuestionsAnswers.push({ question: "q", answer: "a" });

    // Take User Input for optional passphrase
    const passphrase = "1234";

    // Take user Input for optional registerFaceId
    const registerFaceId = false;

    bayunCore.setNewUserCredentials(
      data.sessionId,
      securityQuestionsAnswers,
      passphrase,
      registerFaceId,
      authorizeEmployeeCallback,
      successCallback,
      failureCallback
    );
  }
};

const registerFailureCallback = (error) => {
  console.log("onRegisterFailure");
  clearSessionData();
  console.error(error);
};

const changePasswordSuccess = (data) => {
  if (data.sessionId) {
    console.log("Password changed");
  }
};

const changePasswordFailure = (error) => {
  console.error(error);
  console.log("Password can not be changed");
};

const onLoginSuccessCallback = async (data) => {
  console.log("data = ", data);
  if (data.sessionId) {
    //window.sessionId = data.sessionId;
    sessionId = data.sessionId;
    setCookie("sessionId", data.sessionId, 30);
    setCookie("localStorageMode", localStorageMode, 30);
    console.log("sessionId: " + getCookie("sessionId"));
    console.log("login success");
  }
};

const onLoginFailureCallback = (error) => {
  console.error(error);
  console.log("login fail");
};

const empPublicKeySuccessCallback = (data) => {
  console.log("data = ", data);
};

const empPublicKeyFailureCallback = (error) => {
  console.error(error);
  console.log("No key");
};

const authorizeEmployeeCallback = (data) => {
  console.log("In authorizeEmployeeCallback");
  if (data.sessionId) {
    if (
      data.authenticationResponse ==
      BayunCore.AuthenticateResponse.AUTHORIZATION_PENDING
    ) {
      // You will get employeePublicKey on data.employeePublicKey
      console.log(data);
      // bayunCore.authorizeEmployee(
      //   data.sessionId,
      //   data.employeePublicKey,
      //   // companyName,
      //   // companyEmployeeId,
      //   onLoginSuccessCallback,
      //   onLoginFailureCallback
      // );
      console.log("after call");
    }
  }
};

function changePassword(
  sessionId,
  currentPassword,
  newPassword,
  changePasswordSuccess,
  changePasswordFailure
) {
  bayunCore.changePassword(
    sessionId,
    currentPassword,
    newPassword,
    changePasswordSuccess,
    changePasswordFailure
  );
}

setCookie("sessionId", "", 30);
initBayunCore();

async function registerWithPassword() {
  await bayunCore.registerEmployeeWithPassword(
    getCookie("sessionId"), //window.sessionId,
    companyName,
    companyEmployeeId,
    password,
    authorizeEmployeeCallback,
    registerSuccessCallback,
    registerFailureCallback
  );
}

function loginWithPassword() {
  bayunCore.loginWithPassword(
    getCookie("sessionId"), //window.sessionId
    companyName,
    companyEmployeeId,
    password,
    true, //autoCreateEmployee,
    null,
    null, //securityQuestionsCallback,
    null, //passphraseCallback,
    onLoginSuccessCallback,
    onLoginFailureCallback
  );
}

function registerWithoutPassword() {
  bayunCore.registerEmployeeWithoutPassword(
    getCookie("sessionId"), //window.sessionId,
    companyName,
    companyEmployeeId,
    email,
    true,
    authorizeEmployeeCallback,
    newUserCredentialsCallback,
    null,
    null,
    registerSuccessCallback,
    registerFailureCallback
  );
}

function loginWithoutPassword() {
  bayunCore.loginWithoutPassword(
    getCookie("sessionId"), //window.sessionId,
    companyName,
    companyEmployeeId,
    null,
    null,
    onLoginSuccessCallback,
    onLoginFailureCallback
  );
}

async function createGroup(sessionId, groupName, groupType) {
  const group = await bayunCore.createGroup(sessionId, groupName, groupType);
  roomId = group.groupId;
  console.log("GroupId: ", roomId);
}

async function deleteGroup(sessionId, roomId) {
  await bayunCore.deleteGroup(sessionId, roomId);
}

async function getMyGroups(sessionId) {
  const myGroups = await bayunCore.getMyGroups(sessionId);
  console.log("myGroups = ", myGroups);
}

async function getGroupById(sessionId, groupId) {
  var getGroupById = await bayunCore.getGroupById(sessionId, groupId);
  console.log("getGroupById = ", getGroupById);
}

async function getUnjoinedPublicGroups(sessionId) {
  const myGroups = await bayunCore.getUnjoinedPublicGroups(sessionId);
  console.log("myGroups = ", myGroups);
}

async function joinPublicGroup(sessionId, groupId) {
  await bayunCore.joinPublicGroup(sessionId, groupId);
}

async function addMemberToGroup(
  sessionId,
  groupId,
  companyEmployeeId,
  companyName
) {
  await bayunCore.addMemberToGroup(
    sessionId,
    groupId,
    companyEmployeeId,
    companyName
  );
}

async function addMembersToGroup(sessionId, groupId, groupMembers) {
  let finalOutputTestJS = await bayunCore.addMembersToGroup(
    sessionId,
    groupId,
    groupMembers
  );
  console.log("finalOutputTestJS", finalOutputTestJS);
  printAddMembersErrorResponse(finalOutputTestJS);
}

//Use this code snippet to iterate over the possible errors from addMembersToGroup
async function printAddMembersErrorResponse(errorObject) {
  if (errorObject["addMemberErrObject"].length != 0) {
    let errorList = errorObject.addMemberErrObject;

    for (let i = 0; i < errorList.length; i++) {
      let errorMessage = errorList[i].errorMessage;
      console.log("ERROR MESSAGE: ", errorMessage);

      for (let j = 0; j < errorList[i].membersList.length; j++) {
        let memberDetails = errorList[i].membersList[j];
        console.log("Details for " + (j + 1) + " employee");
        console.log("company employee ID: ", memberDetails.companyEmployeeId);
        console.log("company name: ", memberDetails.companyName);
      }
    }
  }
}

async function removeMemberFromGroup(
  sessionId,
  groupId,
  companyEmployeeId,
  companyName
) {
  await bayunCore.removeMemberFromGroup(
    sessionId,
    groupId,
    companyEmployeeId,
    companyName
  );
}

async function removeMembersFromGroup(sessionId, groupId, membersInfo) {
  await bayunCore.removeMembersFromGroup(sessionId, groupId, membersInfo);
}

async function removeMembersExceptList(
  sessionId,
  groupId,
  membersInfo,
  removeCallingMember
) {
  await bayunCore.removeMembersExceptList(
    sessionId,
    groupId,
    membersInfo,
    removeCallingMember
  );
}

async function leaveGroup(sessionId, roomId) {
  await bayunCore.leaveGroup(sessionId, roomId);
}

async function lockText(
  sessionId,
  text,
  encryptionPolicy,
  keyGenerationPolicy,
  groupId
) {
  var lockedText = await bayunCore.lockText(
    sessionId,
    text,
    encryptionPolicy,
    keyGenerationPolicy,
    groupId
  );
  console.log(lockedText);
  return lockedText;
}

async function unlockText(sessionId, text) {
  var unlockedText = await bayunCore.unlockText(sessionId, text);
  console.log(unlockedText);
  return unlockedText;
}

async function lockAndUnlockData(
  sessionId,
  text,
  encryptionPolicy,
  keyGenerationPolicy
) {
  const utf8Encode = new TextEncoder();
  const byteArr = utf8Encode.encode(text);
  var lockedData = await bayunCore.lockData(
    sessionId,
    byteArr,
    encryptionPolicy,
    keyGenerationPolicy
  );
  console.log("lockedData = ", lockedData);
  var lockedData = await bin2String(lockedData);
  console.log("lockedData to string= ", lockedData);

  lockedData = await string2Bin(lockedData);
  var unlockedData = await bayunCore.unlockData(sessionId, lockedData);
  console.log("unlockedData = ", unlockedData);
}

async function bin2String(array) {
  return String.fromCharCode.apply(String, array);
}

async function string2Bin(str) {
  var result = [];
  for (var i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i));
  }
  return result;
}

async function getLockingKey(
  sessionId,
  encryptionPolicy,
  keyGenerationPolicy,
  groupId
) {
  var getLockingKey = await bayunCore.getLockingKey(
    sessionId,
    encryptionPolicy,
    keyGenerationPolicy,
    groupId
  );
  console.log(getLockingKey);
}

async function basicApplicationFlow() {
  await registerWithPassword();
  console.log("session :: ", sessionId);
  await createGroup(sessionId, "GroupFirst", BayunCore.GroupType.PRIVATE);
  await getMyGroups(sessionId);
  let testToBeLocked = "Hellow World!";
  await console.log("Locking Text => ", testToBeLocked);
  let lockedText = await lockText(
    sessionId,
    testToBeLocked,
    BayunCore.EncryptionPolicy.COMPANY,
    BayunCore.KeyGenerationPolicy.STATIC,
    roomId
  );
  await console.log("Locked Text => ", lockedText);
  let unlockedText = await unlockText(sessionId, lockedText);
  await console.log("Unlocked Text => ", unlockedText);
  await leaveGroup(sessionId, roomId);
}

var companyName = "domain.com";
var companyEmployeeId = "emp1@domain.com";
var email = "emp1@domain.com";
var password = "1234";

// TEST FUNCTION CALLS :

// registerWithPassword();
// registerWithoutPassword();
// loginWithPassword();
// loginWithoutPassword();

// NOTE : WE WILL GET SESSION ID ON SUCCESSFUL LOGIN FOR BELOW METHODS :

// changePassword("39dd82660ca7", "12345", "1234", changePasswordSuccess, changePasswordFailure);

// GROUP METHODS :

// createGroup("39dd82660ca7" ,"Private Group 1", BayunCore.GroupType.PRIVATE); // BayunCore.GroupType.PRIVATE for private and BayunCore.GroupType.PUBLIC for public

// getMyGroups("39dd82660ca7");

// getGroupById("39dd82660ca7","1");

// getUnjoinedPublicGroups("39dd82660ca7");

// joinPublicGroup("39dd82660ca7", "213");

// addMemberToGroup("39dd82660ca7","1","test3@17Mar01.com","17Mar01.com");

// addMembersToGroup("39dd82660ca7" ,"8",[{companyName:"com_9feb1",companyEmployeeId:"e2"},{companyName:"com_9feb1",companyEmployeeId:"e3"},{companyName:"com_9feb1",companyEmployeeId:"e4"},{companyName:"com_9feb1",companyEmployeeId:"e1"}] );

// removeMemberFromGroup("39dd82660ca7","1","test3@17Mar01.com","17Mar01.com");

// removeMembersFromGroup("39dd82660ca7","8",[{companyName:"com_9feb1",companyEmployeeId:"e2"},{companyName:"com_9feb1",companyEmployeeId:"e3"},{companyName:"com_9feb1",companyEmployeeId:"e4"},{companyName:"com_9feb1",companyEmployeeId:"e1"}] );

// removeMembersExceptList("39dd82660ca7","636",[{companyName:"Y.COm",companyEmployeeId:"hI81@Y.Com"}],true );

// leaveGroup("39dd82660ca7","1");

// deleteGroup("39dd82660ca7","6"); //We will get group id in getMyGroups and createGroup

// Lock and Unlock Methods:

// lockText("39dd82660ca7","text");

// unlockText("39dd82660ca7","CwABAAAABUhlbGxvCAACAAAAAggAAwAAAAAIAAQAAAAACwAFAAAAAAsABwAAAAAIAAgAAAABCwAJAAAAA57pZQsADwAAANQtLS0tLUJFR0lOIFBVQkxJQyBLRVktLS0tLQpNSFl3RUFZSEtvWkl6ajBDQVFZRks0RUVBQ0lEWWdBRTFla04rVEZaS2hvTzNGRzg5R1JUWEFyYXZMN3krYm81ZS9jazB5VGE3b0NoZ3UySkExMjNVNnlaZnJGMWxiYUhYN0lJclpwamhQM3JLY2ZUQ3hRSSt3alNxYlltTEsxSloyQzZicVpkZWNNUys3cmRxM3k2akFPOTRSMlU4MDNMCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQA=");

// lockText("39dd82660ca7","Hello",BayunCore.EncryptionPolicy.NONE,BayunCore.KeyGenerationPolicy.DEFAULT,"");

// unlockText("39dd82660ca7","CwABAAAABUhlbGxvCAACAAAAAggAAwAAAAAIAAQAAAAACwAFAAAAAAsABwAAAAAIAAgAAAABCwAJAAAAA57pZQsADwAAANQtLS0tLUJFR0lOIFBVQkxJQyBLRVktLS0tLQpNSFl3RUFZSEtvWkl6ajBDQVFZRks0RUVBQ0lEWWdBRWtrYWk1NE1PNG4zQjZIN0s5SHdiTHRlRDZCOFlaRzdwOXpaQmowNnV0cTVURUw2RzdkUzJTVXl4d3ZUMFM5UE16WStvS2U1bHY3a2lkampkOVJoYWRHL0EvdjQ1OEhJTkFBYTR4QStVS21TWk5NU0FHMWh4bjRnWGdmV1hBMkwwCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQA=");

// lockAndUnlockData("39dd82660ca7","hiii",BayunCore.EncryptionPolicy.COMPANY,BayunCore.KeyGenerationPolicy.STATIC,"groupId");

// getLockingKey("39dd82660ca7",BayunCore.EncryptionPolicy.COMPANY,BayunCore.KeyGenerationPolicy.STATIC,"groupId");
