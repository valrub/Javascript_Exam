function main(re, ie, oe, executor) {
    try {
        setGlobalLogger(re, ie, oe, executor);
        re.url = "https://www.facebook.com/profile.php?id=" + ie.targetId + "&sk=friends";
        re.placeholder1 = "https://www.facebook.com/support/";
        executor.reportError("200", "INFO", "ie.restApiUrl " + ie.restApiUrl, false);
        if (/\+info/.test(ie.flagOptions)) {
            re.placeholder4 = "true";
            
            var currentFriendsCount = re.placeholder10;
            if (ie.flagOptions.indexOf(" +delta ") > -1) {

                // request READ
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("POST", ie.restApiUrl + "cachingcollectionresult/read", false);
                xmlhttp.setRequestHeader('Content-type', 'application/json;charset=utf-8');
                xmlhttp.send(JSON.stringify({
                    "cycleId": ie.crawlerCycleId,
                    "keyName": "Friends",
                    "jobContext": false
                }));
                var lastCollectedFriends = JSON.parse(xmlhttp.responseText);
                Logger.production("All friends according to FB UI: " + currentFriendsCount);
                Logger.production("Collected media count initial: " + lastCollectedFriends.data.keyValue);
                
                if (lastCollectedFriends.data.keyValue === "No Data Found"){
                    Logger.production("No previously collected media " + lastCollectedFriends.data.keyValue);
                    re.placeholder4 = "true";
                    
                    //request WRITE
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", ie.restApiUrl + "cachingcollectionresult/save", false);
                    xhr.setRequestHeader('Content-type', 'application/json;charset=utf-8');
                    xhr.send(JSON.stringify({
                        "cycleId": ie.crawlerCycleId,
                        "keyName": "Friends",
                        "keyValue": currentFriendsCount
                    }));
                    Logger.production("First time collection. Collected media count: " + currentFriendsCount);
                } else if (lastCollectedFriends.data.keyValue < currentFriendsCount) {
                    re.placeholder4 = "true";
        
                    //request WRITE
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", ie.restApiUrl + "cachingcollectionresult/save", false);
                    xhr.setRequestHeader('Content-type', 'application/json;charset=utf-8');
                    xhr.send(JSON.stringify({
                        "cycleId": ie.crawlerCycleId,
                        "keyName": "Friends",
                        "keyValue": currentFriendsCount
                    }));
                    Logger.production("Collected media count updated: " + currentFriendsCount);
                } else {
                    Logger.production("This data is indicated as collected before.");
                    re.placeholder4 = "false";
                }
            } else {
                re.placeholder4 = "true";
                Logger.production("Delta collection is not set.");
                //request WRITE
                var xhr = new XMLHttpRequest();
                xhr.open("POST", ie.restApiUrl + "cachingcollectionresult/save", false);
                xhr.setRequestHeader('Content-type', 'application/json;charset=utf-8');
                xhr.send(JSON.stringify({
                    "cycleId": ie.crawlerCycleId,
                    "keyName": "Friends",
                    "keyValue": currentFriendsCount
                }));
            } 
        } else {
            re.placeholder4 = "false";
        }  

        var friendsOfFriendsObject = {};
        if (/\+friendsOfFriends/.test(ie.flagOptions)) {
            friendsOfFriendsObject.coordinateX_1 = "https://www.facebook.com/";
            friendsOfFriendsObject.coordinateY_1 = "http://www.facebook.com/search/" + ie.targetId + "/friends/friends/intersect";
            friendsOfFriendsObject.description = "false";
            friendsOfFriendsObject.title = "false";
            friendsOfFriendsObject.body = "true";
            friendsOfFriendsObject.Content_Body = "true";
            friendsOfFriendsObject.gender = ie.targetId;
            executor.addEntity(friendsOfFriendsObject);
            executor.reportError("200", "INFO", "re.placeholder4 " + re.placeholder4, false);
        }
        executor.ready();
    } catch (e) {
        executor.reportError("500", "ERROR", "fb_friends_prepare_url :: " + e.message + " at line " + e.lineNumber, true);
    }
}
