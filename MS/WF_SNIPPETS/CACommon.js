//-----------------------------------------------------------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// (#) STANDARD LIBRARY  (002.002.013) ///////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------// 
/*
var _executor;
var _re;
var _ie;
change this in CA if you need other values for "flushAt" for example 
persistDataSettings.flushAt = 300 ~~ */
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var persistDataSettings = {
	flushAt: 250,
	useSaveBinaryForVideos: false,
};
//---------------------------------------------- LOGGER -----------------------------------------------//
var Logger = {
	_debugLevel: 2,
	//-------------------------------------------------------------------------------------------------//
	//KNOWN CUSTOM ERRORS
	_customErrors: {
		'801': 'Configuration Not Found',
		'600': 'Wrong Input Params',
		'666': 'FATAL ERROR! PROCESS ENDED.',
		'400011': 'XPATH NOT FOUND',
		'204': 'No content for this part'
	},
	//-------------------------------------------------------------------------------------------------//
	_statisticsMessage: ""
		//-------------------------------------------------------------------------------------------------//
		,
	production: function (pMessage, pErrCode) {
			this._log(pMessage, pErrCode, 'INFO', '777', 1, false);
		}
		//-------------------------------------------------------------------------------------------------//
		,
	error: function (pMessage, pErrCode) {
			this._log(pMessage, pErrCode, 'ERROR', '13', 1, false);
		}
		//-------------------------------------------------------------------------------------------------//
		,
	failure: function (pMessage, pErrCode) {
			this._log(pMessage, pErrCode, 'ERROR', '666', 1, true);
		}
		//-------------------------------------------------------------------------------------------------//
		,
	warning: function (pMessage, pErrCode) {
			this._log(pMessage, pErrCode, 'WARNING', '101', 2, false);
		}
		//-------------------------------------------------------------------------------------------------//
		,
	debug: function (pMessage, pErrCode) {
			this._log(pMessage, pErrCode, 'INFO', '11', 4, false);
		}
		//-------------------------------------------------------------------------------------------------//
		,
	statistic: function (pMessage, pErrCode) {
			var _self = this,
				_msg = pMessage;
			_self._readStatistics();
			_msg += "\n" + _self._statisticsMessage;
			_self.production(_msg, '778');
		}
		//-------------------------------------------------------------------------------------------------//
		,
	_readStatistics: function () {
			var _self = this,
				txt = "Data collection statistic";
			if (_re._statistics) {
				try {
					var tmp = JSON.parse(_re._statistics),
						sum = 0;
					txt += ":\n";
					for (var key in tmp) {
						if (tmp.hasOwnProperty(key)) {
							txt += "  " + key + ": " + tmp[key] + ",\n";
							sum += tmp[key];
						}
					}
					txt += "Total recodrs: " + sum;
					_self._statisticsMessage = txt;
				} catch (e) {
					_self.error("readStatistics() :: " + e + " at line " + e.lineNumber);
				}
			} else {
				_self.production(txt + " was not applied.");
			}
		}
		//-------------------------------------------------------------------------------------------------//
		,
	_log: function (pMsg, pErr, pSeverity, pDefaultError, pLevel, pFail) {
			var _self = this;
			if (pLevel <= _self._debugLevel) {
				if (pMsg === undefined)
					console.log('ERROR: Message not passed to Logger function');
				else {
					var _msg = '';
					var _code = '';
					if (pErr === undefined) {
						_msg += pMsg;
						_code = pDefaultError;
					} else {
						try {
							var _errMsg = _self._customErrors[pErr];
							if (_errMsg !== undefined) {
								_msg = _errMsg + ' : ' + pMsg;
								_code = pErr;
							} else {
								_msg = pMsg;
								_code = pErr;
							}
						} catch (e) {
							_msg = pMsg;
							_code = pErr;
						}
					}
					_executor.reportError(_code, pSeverity, _msg, pFail);
				}
			}
		}
		//-------------------------------------------------------------------------------------------------//
};

function validateInput(inputJson) {
	try {
		var validatedMSG = "Input values to be used by WF: \n";
		var validatedInput = {};
		for (var param in inputJson) {
			var result = validateParam(inputJson[param], param);
			if (result.returnCode === "200") {
				validatedMSG += param + ": " + result.value + "\n";
				validatedInput[param] = result.value;
			} else if (result.returnCode === "100340") {
				Logger.failure("The input parameter was not valid: " + result.description, "100340");
			} else if (result.returnCode === "100310") {
				validatedMSG += param + ": " + result.value + "\n";
				validatedInput[param] = result.value;
				Logger.warning("The input parameter was not valid: " + result.description, "100310");
			} else if (result.returnCode === "100320") {
				validatedMSG += param + ": " + result.value + "\n";
				validatedInput[param] = result.value;
				Logger.warning(result.description, "100320");
			} else if (result.returnCode === "100330") {
				Logger.warning("The input parameter was not valid: " + result.description, "100330");
			}
		}

		Logger.production(validatedMSG);
		return validatedInput;
	} catch (e) {
		Logger.failure("Error while validating input :: " + e.message);
	}
}

function validateParam(paramObj, inputName) {
	try {
		var res = {
			value: "",
			returnCode: "",
			description: ""
		}
		var isValid = true;
		var failedChecks = "The input parameter did not pass the ";
		res.description = "Validation check for input parameter '" + inputName + "':\n ";

		if (paramObj.default_value && !paramObj.user_input_value) {
			res.description += "Input parameter not set. Will use the preset default value of: " + paramObj.default_value;
			res.value = paramObj.default_value;
			res.returnCode = "100320";
			return res;
		}
		if (paramObj.validate === "false") {
			res.returnCode = "200";
			res.description += "The parameter did not require validation!";
			res.value = paramObj.user_input_value;
			return res;
		}
		if (paramObj.regex) {
			var reg = new RegExp(paramObj.regex);
			if (reg.test(paramObj.user_input_value)) {
				res.description += "Passed the regex check!\n";
				res.value = paramObj.user_input_value;
			} else {
				isValid = false;
				failedChecks += "regex, ";
			}
		}
		if (paramObj.min_value) {
			if (isNumeric(paramObj.user_input_value)) {
				if (parseFloat(paramObj.min_value) <= parseFloat(paramObj.user_input_value)) {
					res.description += "Passed the minimum value check!\n";
					res.value = paramObj.user_input_value;
				} else {
					isValid = false;
					failedChecks += "min value, ";
				}
			} else {
				isValid = false;
				failedChecks += "min value, ";
			}
		}
		if (paramObj.max_value) {
			if (isNumeric(paramObj.user_input_value)) {
				if (parseFloat(paramObj.max_value) >= parseFloat(paramObj.user_input_value)) {
					res.description += "Passed the maximum value check!\n";
					res.value = paramObj.user_input_value;
				} else {
					isValid = false;
					failedChecks += "max value, ";
				}
			} else {
				isValid = false;
				failedChecks += "max value, ";
			}
		}
		if (paramObj.lookupTable) {
			if (paramObj.user_input_value) {
				paramObj.user_input_value = paramObj.user_input_value.toLowerCase();
				if (paramObj.lookupTable.hasOwnProperty(paramObj.user_input_value)) {
					res.value = paramObj.lookupTable[paramObj.user_input_value];
				} else {
					isValid = false;
					failedChecks += "valid option name, ";
				}
			} else {
				isValid = false;
				failedChecks += "valid option name, ";
			}
		}
		if (!isValid) {
			if (paramObj.default_value) {
				res.description += failedChecks.slice(0, -2) + " validation and will use the preset default value of: " + paramObj.default_value;
				res.value = paramObj.default_value;
				res.returnCode = "100310";
			} else if (paramObj.mandatory === "true") {
				res.description += failedChecks.slice(0, -2) + " This is a mandatory parameter. The flow will fail!";
				res.returnCode = "100340";
			} else {
				res.description += failedChecks.slice(0, -2) + " This is an optional parameter with no default value. The flow will continue without this parameter!";
				res.returnCode = "100330";
			}
		} else {
			res.returnCode = "200";
			res.description += " Passed!";
		}

		return res;
	} catch (e) {
		Logger.failure("Error while validating specific parameter :: " + e.message + " :: " + JSON.stringify(paramObj));
	}
}

function setGlobalLogger(pRTE, pIE, pOE, pExecutor, debugLevel = 2) {
    //Prompt only in DEBUG
    var validDebugLevels = [1, 2, 4];
    if (validDebugLevels.indexOf(debugLevel) > -1) {
        pExecutor.reportError('200', 'INFO', 'You used a debug level of ' + debugLevel + ' which is a valid debug level.', false);
        Logger._debugLevel = debugLevel;
    } else {
        pExecutor.reportError('200', 'INFO', 'You used a debug level of ' + debugLevel + ' which is not a valid debug level. Defaulting ot debug level of 2', false);
        Logger._debugLevel = 2;
    }

    if (Logger._debugLevel == 4) pExecutor.reportError('200', 'INFO', 'setGlobalLogger STARTED with debugLevel = ' + Logger._debugLevel, false);
    _executor = pExecutor;
    _re = pRTE;
    _ie = pIE;
    var _tmpData = Object.create(PersistObject);
    _tmpData._persistSettings.flushAt = persistDataSettings.flushAt;
    _tmpData._persistSettings.useSaveBinaryForVideos = persistDataSettings.useSaveBinaryForVideos;
    _tmpData._persistSettings.downloadVideoFiles = (_ie.downloadVideoFiles == "true");
    if (_re._statistics) {
        _tmpData._statistics = JSON.parse(_re._statistics);
    } else {
        console.log("We wait for statistics calculation.");
    }
    window.addEntity = _tmpData.addEntity.bind(_tmpData);
    window.addImage = _tmpData.addImage.bind(_tmpData);
    window.onSuccess = _tmpData.onSuccess.bind(_tmpData);
    window.onError = _tmpData.onError.bind(_tmpData);
    window.finalize = _tmpData.finalize.bind(_tmpData);
    window.callStackAdd = _tmpData.callStackAdd.bind(_tmpData);
    window.callStackRemove = _tmpData.callStackRemove.bind(_tmpData);

}
//---------------------------------------------- PROCESS ----------------------------------------------//
function Process() {
	this.Run = function (pFunctionName, pIsMandatory, pExecutionContext) {
		var runStatus = {};
		var msgForceStop;
		runStatus = pFunctionName(pExecutionContext.pMarker, pExecutionContext);
		if (runStatus.returnCode === "200")
			Logger.production("[" + pExecutionContext.pMarker + "] " + pFunctionName.name + " Done. Total " + runStatus.totalCollected + " items saved", runStatus.returnCode.toString());
		else {
			if (pIsMandatory === true) {
				msgForceStop = "WF is forced to end execution";
			} else {
				msgForceStop = " ";
			}
			if ((pIsMandatory === true))
				Logger.failure("[" + pExecutionContext.pMarker + "] " + pFunctionName.name + " FAILED." + msgForceStop, runStatus.returnCode.toString());
			else
				Logger.error("[" + pExecutionContext.pMarker + "] " + pFunctionName.name + " FAILED." + msgForceStop, runStatus.returnCode.toString());
		}
	}
	this.GetStatistics = function () {}
}

//---------------------------------------------- EXTRACT ----------------------------------------------//
function Extract(pExecutionContext) {
	this.globalLogExtracted = pExecutionContext.globalLogExtracted;
	this.globalWPXP = pExecutionContext.globalWPXP;

	//-------------------------------------------------------------------------------------------------//
	this.GetXPATH = function (pXP) {
			var _ans = NaN;
			WPXP = this.globalWPXP;
			if ((pXP.indexOf("/") > 0) || (pXP.indexOf("[") > 0) || (pXP.indexOf("*") > 0) || (pXP.indexOf(".") > 0)) //That's not abstract name, but a real XPATH notation
			{
				_ans = pXP;
			} else {
				try {
					_ans = WPXP[pXP];
				} catch (enumex) {
					Logger.error("XPATH ENUM NOT DEFINED");
					Logger.error(pXP);
					_ans = "403";
				}
			}
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//
	this.LoadPage = function (pURL, Marker) {
			Marker = Marker === undefined ? '*' : Marker;
			var _ans = {
				Value: NaN,
				returnCode: NaN,
				Description: NaN
			}
			var _xhr = new XMLHttpRequest();
			try {
				_xhr.open("GET", pURL, false);
				_xhr.send();
				var _result = _xhr.responseText;
				var _parser = new DOMParser();
				_ans.Value = _parser.parseFromString(_result, "text/html");
				_ans.returnCode = "200";
			} catch (er) {
				_ans.Description = "EXCEPTION2: After attempt to open " + pURL + " -> " + er.message;
				_ans.returnCode = "404";
				Logger.error(_ans.Description, "404");
			}
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//
	this.GetAttribute = function (pInpParams, Marker) {
			//This function tries to process DOM structure on given XPATH (pInpParams.xpathName) - logical name or real XPATH
			//And returns attribute value found in pInpParams.attributeName.
			// Marker is an optional parameter used for adding [Line Number] to log entries
			// pInpParams.mandatory - specify either in case of not found value error code should be 400011 (XPATH NOT Found)
			// pInpParams.context - specifies search context for XPATH Evaluation (by default - "document" will be used)
			//In case the value is found it will be returned
			//Return codes:
			//200 - OK
			//204 - Empty Value
			//404 -  Value was not found and this XPATH considered by caller as NOT mandatory
			//400011 -  Value was not found and this XPATH considered by caller as mandatory
			//---------------------------------------------------------------------------------------------------//
			var TheContext = pInpParams.context === undefined ? document : pInpParams.context;
			var ThePage = pInpParams.page === undefined ? document : pInpParams.page;
			Marker = Marker === undefined ? '*' : Marker;
			_flagLogExtracted = this.globalLogExtracted;
			// ... check parameters .............
			var _xpathName = pInpParams.xpathName;
			var _attributeName = pInpParams.attributeName;
			var _errCode;
			var Mandatory;
			if ((typeof pInpParams.mandatory == 'undefined') || (isNaN(pInpParams.mandatory))) {
				Mandatory = false;
			} else {
				if (pInpParams.mandatory > 0)
					Mandatory = true;
				else
					Mandatory = false;
			}
			if (Mandatory) {
				_errCode = "400011";
			} else {
				_errCode = "404";
			}
			var xp = this.GetXPATH(_xpathName);
			var _ans = {
				Value: null,
				returnCode: _errCode,
				Description: 'NotFound'
			}
			try {
				_ans.Value = ThePage.evaluate(xp, TheContext, null, 9, null).singleNodeValue.getAttribute(_attributeName);
				if (_ans.Value.length > 0) //There is value
				{
					_errCode = "200";
				} else //empty string
				{
					_errCode = "204"; // No content
					_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "[" + _attributeName + "]} is empty";
					_ans.returnCode = parseInt(_errCode, 10);
					Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
				}
				if (_flagLogExtracted) {
					Logger.debug("[" + Marker + "] " + _xpathName + " = " + _ans.Value);
				}
			} catch (extext) {
				_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "[" + _attributeName + "]} is empty";
				_ans.returnCode = parseInt(_errCode, 10);
				Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
			}
			_ans.returnCode = _errCode;
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//
	this.GetText = function (pInpParams, Marker) {
			//This function tries to process DOM structure on given XPATH (pInpParams.xpathName) - logical name or real XPATH
			//And returns textContent found over there.
			// Marker is an optional parameter used for adding [Line Number] to log entries
			// pInpParams.mandatory - specify either in case of not found value error code should be 400011 (XPATH NOT Found)
			// pInpParams.context - specifies search context for XPATH Evaluation (by default - "document" will be used)
			//In case the value is found it will be returned
			//Return codes:
			//200 - OK
			//204 - Empty Value
			//404 -  Value was not found and this XPATH considered by caller as NOT mandatory
			//400011 -  Value was not found and this XPATH considered by caller as mandatory
			//--------------------------------------------------------------------------------------------------//
			Marker = Marker === undefined ? '*' : Marker;
			var TheContext = pInpParams.context === undefined ? document : pInpParams.context;
			var ThePage = pInpParams.page === undefined ? document : pInpParams.page;
			_flagLogExtracted = this.globalLogExtracted;
			// ... check parameters .............
			var _xpathName = pInpParams.xpathName;
			var _errCode;
			var Mandatory;
			if ((typeof pInpParams.mandatory == 'undefined') || (isNaN(pInpParams.mandatory))) {
				Mandatory = false;
			} else {
				if (pInpParams.mandatory > 0)
					Mandatory = true;
				else
					Mandatory = false;
			}
			if (Mandatory) {
				_errCode = "400011";
			} else {
				_errCode = "404";
			}
			var xp = this.GetXPATH(_xpathName);
			var _ans = {
				Value: null,
				returnCode: _errCode,
				Description: 'NotFound'
			}
			try {
				_ans.Value = ThePage.evaluate(xp, TheContext, null, 9, null).singleNodeValue.textContent.trim();
				if (_ans.Value.length > 0) //There is value
				{
					_errCode = "200";
				} else //empty string
				{
					_errCode = "204" // No content
					_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "} is empty";
					_ans.returnCode = parseInt(_errCode, 10);
					Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
				}
				if (_flagLogExtracted) {
					Logger.debug("[" + Marker + "] " + _xpathName + " = " + _ans.Value);
				}
			} catch (extext) {
				_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "} not found";
				_ans.returnCode = parseInt(_errCode, 10);
				Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
			}
			_ans.returnCode = _errCode;
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//
	this.GetCollection = function (pInpParams, Marker) {
			//This function tries to process DOM structure on given XPATH (pInpParams.xpathName) - logical name or real XPATH
			//And returns collection of elements found over there.
			// Marker is an optional parameter used for adding [Line Number] to log entries
			// pInpParams.mandatory - specify either in case of not found value error code should be 400011 (XPATH NOT Found)
			// pInpParams.context - specifies search context for XPATH Evaluation (by default - "document" will be used)
			//In case the value is found it will be returned
			//Return codes:
			//200 - OK
			//204 - Empty Collection
			//404 -  Value was not found and this XPATH considered by caller as NOT mandatory
			//400011 -  Value was not found and this XPATH considered by caller as mandatory
			//---------------------------------------------------------------------------------------------------//
			var TheContext = pInpParams.context === undefined ? document : pInpParams.context;
			var ThePage = pInpParams.page === undefined ? document : pInpParams.page;
			Marker = Marker === undefined ? '*' : Marker;
			_flagLogExtracted = this.globalLogExtracted;
			// ... check parameters .............
			var _xpathName = pInpParams.xpathName;
			var _errCode;
			var Mandatory;
			if ((typeof pInpParams.mandatory == 'undefined') || (isNaN(pInpParams.mandatory))) {
				Mandatory = false;
			} else {
				if (pInpParams.mandatory > 0)
					Mandatory = true;
				else
					Mandatory = false;
			}
			if (Mandatory) {
				_errCode = "400011";
			} else {
				_errCode = "404";
			}
			var xp = this.GetXPATH(_xpathName);
			var _ans = {
				Value: NaN,
				returnCode: _errCode,
				Description: NaN
			}
			try {
				var _col = ThePage.evaluate(xp, TheContext, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
				_ans.Length = parseInt(_col.snapshotLength, 10);
				if (_ans.Length > 0) {
					_errCode = "200";
					var _col = ThePage.evaluate(xp, TheContext, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
					_ans.Value = _col;
					var _snapshotColl = ThePage.evaluate(xp, TheContext, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
					_ans.SnapshotValue = _snapshotColl;
					if (_flagLogExtracted) {
						Logger.debug("[" + Marker + "] " + _xpathName + " #" + _ans.Length + " elements found");
					}
				} else {
					_ans.Length = 0;
					_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "} not found";
					_ans.returnCode = parseInt(_errCode, 10);
					Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
				}
			} catch (extext) {
				_ans.Length = 0;
				_ans.Description = "[" + Marker + "] <" + _errCode + ">  Element located at XPATH {" + _xpathName + "} not found";
				_ans.returnCode = parseInt(_errCode, 10);
				Mandatory ? Logger.error(_ans.Description, _errCode) : Logger.debug(_ans.Description, _errCode);
			}
			_ans.returnCode = _errCode;
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//
	this.GetPageText = function (pURL, pLeft, pRight, Marker) {
			_flagLogExtracted = false;
			Marker = Marker === undefined ? '*' : Marker;
			var RG = pLeft + "(.*)" + pRight;
			var _ans = {
				Value: NaN,
				returnCode: NaN,
				Description: NaN
			}
			var _xhr = new XMLHttpRequest();
			try {
				_xhr.open("GET", pURL, false);
				_xhr.send();
				var _result = _xhr.responseText;
				_ans.Value = _result.match(RG);
				if (_flagLogExtracted) {
					Logger.debug("[" + Marker + "]  = " + _ans.Value);
				}
				_ans.returnCode = "200";
			} catch (er) {
				_ans.Description = "EXCEPTION1: After attempt to open " + pURL + " -> " + er.message;
				_ans.returnCode = "404";
				Logger.error(_ans.Description, "404");
			}
			return _ans;
		}
		//-------------------------------------------------------------------------------------------------//

	this.ClickButtons = function (pXpathName, pMarker, pMaxIterations, pCallbackFunction, pProcess) {

			var _maxIterations = pMaxIterations === undefined ? 10 : pMaxIterations;

			window.scrollBy(0, 2000); // scroll a bit first

			var _res = {
				totalCollected: 0,
				returnCode: ""
			};

			var _xp = this.GetXPATH(pXpathName);

			var keepClicking = true;
			var cntClick = 0;

			var keepClickingInterval = setInterval(function () {
				if (keepClicking && (cntClick++ <= _maxIterations)) {
					Logger.debug("------------------------- Start Click Btn ---------------------------------");
					window.scrollBy(0, 500); // scroll a bit first
					// ------------ CHECK THAT THERE IS STILL WHAT TO EXPAND ----------------------------------

					var resultPosts = document.evaluate(_xp, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

					var len = resultPosts.snapshotLength;

					keepClicking = (len > 0);

					Logger.debug("[LEN = " + len + "] -- [Cnt = " + cntClick + "]");

					if (keepClicking) {
						try {
							var el = resultPosts.snapshotItem(0); //First element to be processed

							if (el.fireEvent) {
								el.fireEvent('onclick');

							} else {
								var evObj = document.createEvent('Events');

								evObj.initEvent("click", true, false);

								el.dispatchEvent(evObj);
							}
						} catch (e) {
							console.log("500", "ERROR", "eventFire() :: " + e + " at line " + e.lineNumber, false);
						}
					}
					Logger.debug("------------------------- Stop Click Btn -----------------------------------");
				} else {
					Logger.debug("-------------------------- Enough clicking. Execute function");
					clearInterval(keepClickingInterval);
					pCallbackFunction(pProcess);
				}
			}, 3000)

			return _res;
		}
		
	this.getUrls = function (pInpParams, pMarker) {
		//-------------------------------------------------------------------------------------------------//
		// This is the getUrls function. It takes two arguments.
		// 1) an object consisiting of the following fields:
		//     - collectionXpath (the name of the xpath (from your Xpath library) which finds the collection of elements that have the URLS in them).
		//     - attributeXpath (the name of the xpath (from your Xpath library) which finds the specific element taht has the attribute that contains the URL).
		//     - attributeName (name of the attribute which contains the URL ("href")).
		//     - bulkSize (the size of the bulks that you are going to resieve as an output).
		// 2) a Marker for logging.
		//
		// The result of this function is an array containing bulks of urls (delimited by ",") depending on "bulkSize".
		var _res = {
			totalCollected: 0,
		};
		try {
			var collectionXpath = pInpParams.collectionXpath;
			var attributeXpath = pInpParams.attributeXpath;
			var attributeName = pInpParams.attributeName;
			var bulkSize = pInpParams.bulkSize;

			var errorCode = "400011";
			var cntItems = 0;
			var cntBulk = 0;
			var bulkHolder = '';

			var elementsCollection = this.GetCollection({
					xpathName: collectionXpath,
					mandatory: "0"
				},
				pMarker
			);

			if (elementsCollection.returnCode === "200") {

				var iterator = elementsCollection.Value;
				var thisNode = iterator.iterateNext();
				var urls = [];

				while (thisNode) {

					var vAttribute = this.GetAttribute({
						context: thisNode,
						attributeName: attributeName,
						xpathName: attributeXpath,
						mandatory: "0"
					}, attributeXpath).Value;

					if (elementsCollection.Length <= bulkSize) {
						bulkHolder = bulkHolder + vAttribute + ',';
						cntBulk++;
						console.log(vAttribute);
						if (cntBulk === elementsCollection.Length) {
							urls.push(bulkHolder);
						}
					} else if (cntBulk <= bulkSize) {
						bulkHolder = bulkHolder + vAttribute + ',';
						cntBulk++;
					} else {
						cntBulk = 0;

						urls.push(bulkHolder);
						bulkHolder = '';
						bulkHolder = bulkHolder + vAttribute + ',';
						cntBulk++;
					}
					cntItems++;
					thisNode = iterator.iterateNext();
				}

				_res.totalCollected = cntItems;
				_res.result = urls;
				_res.returnCode = "200";

				return _res
			} else {
				_res.Description = "[" + pMarker + "] <" + errorCode + ">  Element located at XPATH {" + collectionXpath + "} not found";
				Logger.error(_res.Description, errorCode);
			}
		} catch (e) {
			Logger.error("getUrls() :: " + e.message + " at line " + e.lineNumber, "404");
		}
		return _res;
	}
}

// ADD_ENTITY, ADD_IMAGE AND FINALIZE
var PersistObject = {
		// Holds statistic counts
		_statistics: {},
		_callStack: [],
		_persistSettings: {
			collectedRecords: 0,
			scheduledImages: 0,
			flushAt: 0,
			downloadVideoFiles: true,
			useSaveBinaryForVideos: false,
			testVar: "Pesho"
		},
		_itemTypeEnum: {
			"2": "Topic",
			"3": "Comment",
			"4": "Web Entity",
			"5": "Image",
			"6": "Album",
			"12": "Relations",
			"15": "Address",
			"16": "Identifier",
			"17": "Date",
			"18": "Account Object",
			"22": "Video",
			"23": "Email",
			"24": "Key Value",
			"25": "File",
		},
		_type2Enum: {
			"1": "Comment",
			"2": "Like",
			"3": "Link",
			"4": "Friends Added",
			"5": "Event Attendance",
			"6": "Picture",
			"7": "Video",
			"8": "Profile Change",
			"9": "Shared Link",
			"10": "Join Group",
			"11": "Media",
			"12": "Removed Comment",
			"13": "Recent Activities",
			"14": "Regular Post",
			"15": "Article",
			"16": "Search Results",
			"17": "Unstructured Data",
			"18": "Tagged",
			"19": "Endorse",
			"20": "Attend Event",
			"21": "Decline Event",
			"22": "Maybe Event",
			"23": "Awaiting Reply",
			"24": "Recommended",
			"25": "Status Changed",
			"26": "With Media",
			"27": "Dislike",
			"28": "Regular Image",
			"29": "Avatar",
			"30": "Avatar Background",
			"31": "Attached Image",
			"32": "Regular Album",
			"33": "Love",
			"34": "Haha",
			"35": "Yay",
			"36": "Wow",
			"37": "Sad",
			"38": "Angry",
			"39": "Thankful",
		},
		_type3Enum: {
			"1": "Comment",
			"2": "Like",
			"3": "Link",
			"4": "Friends Added",
			"5": "Event Attendance",
			"6": "Picture",
			"7": "Video",
			"8": "Profile Change",
			"9": "Shared Link",
			"10": "Join Group",
			"11": "Media",
			"12": "Removed Comment",
			"13": "Recent Activities",
			"14": "Regular Post",
			"15": "Article",
			"16": "Search Results",
			"17": "Unstructured Data",
			"18": "Tagged",
			"19": "Endorse",
			"20": "Attend Event",
			"21": "Decline Event",
			"22": "Maybe Event",
			"23": "Awaiting Reply",
			"24": "Recommended",
			"25": "Status Changed",
			"26": "With Media",
			"27": "Dislike",
			"28": "Regular Image",
			"29": "Avatar",
			"30": "Avatar Background",
			"31": "Attached Image",
			"32": "Regular Album",
			"33": "Love",
			"34": "Haha",
			"35": "Yay",
			"36": "Wow",
			"37": "Sad",
			"38": "Angry",
			"39": "Thankful",
		},
		_type4Enum: {
			"1": "Person",
			"2": "Event",
			"3": "Group",
			"4": "Company",
			"5": "Location",
			"6": "Education",
			"7": "Page",
		},
		_type5Enum: {
			"1": "Image",
			"2": "Avatar",
			"3": "Background image",
			"4": "Cover image",
		},
		_type6Enum: {
			"1": "Regular",
			"2": "Profile",
			"3": "Wall Photos",
			"4": "Cover photos",
			"5": "Mobile uploads",
		},
		_type12Enum: {
			"1": "Web Friend",
			"2": "Attending",
			"3": "Maybe attending",
			"4": "Awaiting reply",
			"5": "Not attending",
			"6": "Brother",
			"7": "Sister",
			"8": "Daughter",
			"9": "Mother",
			"10": "Father",
			"11": "Uncle",
			"12": "Aunt",
			"13": "Cousin (male)",
			"14": "Cousin (female)",
			"15": "Study",
			"16": "Teach",
			"17": "Relationship",
			"18": "Member",
			"19": "Owner",
			"20": "Admin",
			"21": "Creator",
			"22": "For",
			"23": "Employee",
			"24": "Employer",
			"25": "Recommendation",
			"26": "Interested",
			"27": "Tagged",
			"28": "nephew",
			"29": "CheckIn",
			"30": "Like",
			"31": "Share",
			"32": "Shared",
			"33": "Created By",
			"34": "FOLLOWING",
			"35": "FOLLOWER",
			"36": "TALKING_ABOUT",
			"37": "BORN_IN",
			"38": "IS_BORN_PLACE_OF",
			"39": "LIVE_IN",
			"40": "IS_CURRENT_ PLACE_OF",
			"41": "BEEN_TO",
			"42": "IS_VISIT_LOCATION",
			"43": "BORN_ON",
			"44": "IS_BIRTHDAY_OF",
			"45": "JOIN_ON",
			"46": "IS_JOIN_DATE_OF",
			"47": "LAST_ACTIVE_ON",
			"48": "IS_LAST_ ACTIVITY_OF",
			"49": "PARENT",
			"50": "CHILD",
			"51": "SPOUSE",
			"52": "RELATIVE",
			"53": "POSTED_FROM",
			"54": "HAS_A_POST_OF",
			"55": "TO",
			"56": "CC",
			"57": "BCC",
			"58": "LOCATED_AT",
			"59": "LOCATION_OF",
		},
		_type15Enum: {
			"1": "Born at",
			"2": "Live in",
			"3": "Location",
			"4": "Located at",
			"5": "education",
			"6": "work",
		},
		_type16Enum: {
			"1": "Home Page",
			"2": "EMail",
			"3": "IM Screen Name",
			"4": "Phone",
			"5": "user Id",
		},
		_type17Enum: {
			"1": "Born",
			"2": "Created",
			"3": "Start time",
			"4": "End time",
			"5": "Join date",
			"6": "Last Activity",
		},
		_updateStatistics: function (entity) {
			var _self = this;
			try {
				var thisItemType = _self._itemTypeEnum[entity.itemType],
					typeEnum = "_type" + entity.itemType + "Enum",
					thisType, toIncrement;
				// if we have value in 'type' property try to get 'type' enumuration (ENUM)
				if (entity.type) {
					try {
						thisType = _self[typeEnum][entity.type];
					} catch (e) {
						Logger.production("Please check data you persist. No 'Entity type' ENUM present for Entity of itemType: " + entity.itemType);
					}
				}
				// build string for statistics count
				toIncrement = thisItemType + (thisType ? " (" + thisType + ")" : "");
				if (_self._statistics[toIncrement]) {
					_self._statistics[toIncrement] += 1;
				} else {
					_self._statistics[toIncrement] = 1;
				}
			} catch (e) {
				Logger.error("_updateStatistics():: " + e + " at line " + e.lineNumber);
			}
		},
		addEntity: function addEntity(entity) {
			var _self = this;
			try {
				_executor.addEntity(entity);
				_self._persistSettings.collectedRecords += 1;
				_self._updateStatistics(entity);
				if (_self._persistSettings.collectedRecords % _self._persistSettings.flushAt === 0) {
					_executor.flushEntities();
				}
			} catch (e) {
				Logger.error("addEntity() :: " + e + " at line " + e.lineNumber);
			}
		},
		addImage: function addImage(entity) {
			var _self = this;
			
			try {
				if (_self._persistSettings.downloadVideoFiles && entity.itemType == "22" && !_self._persistSettings.useSaveBinaryForVideos) {
					_self._persistSettings.testVar = "1";
					//Logger.production("vutre sum Video");
					_self._persistSettings.collectedRecords += 1;
					_self._updateStatistics(entity);
					_executor.downloadVideo(
						_executor.createVideoDownloadRequest(entity.url, "image", entity)
					);
				} else {
					if (entity.imageUrl) {
						_self._persistSettings.testVar = "2";
						//Logger.production("vutre sum saveBinary");
						_self._persistSettings.scheduledImages += 1;
						_executor.saveBinary(entity.imageUrl, onSuccess, onError, entity);
					} else {
						_self._persistSettings.testVar = "3";
						//Logger.production("vutre sum addEntity");
						addEntity(entity);
					}
				}

			} catch (e) {
				Logger.error("addImage() :: " + e + " at line " + e.lineNumber);
			}
		},
		onSuccess: function onSuccess(filePath, entity) {
			var _self = this;
			try {
				//Logger.production(_self._persistSettings.testVar);
				//Logger.production("vutre sum success");
				_self._persistSettings.scheduledImages -= 1;
				entity.image = filePath;
				addEntity(entity);
			} catch (e) {
				Logger.error("onSuccess() :: " + e + " at line " + e.lineNumber);
			}
		},
		onError: function onError() {
			var _self = this;
			try {
				//Logger.production(_self._persistSettings.testVar);
				//Logger.production("vutre sum error");
				_self._persistSettings.scheduledImages -= 1;
			} catch (e) {
				Logger.error("onError() :: " + e + " at line " + e.lineNumber);
			}
		},
		callStackAdd: function callStackAdd(fName) {
			var _self = this;
			_self._callStack.push(fName);
			Logger.production(" === ADD-CALL-STACK [" + _self._callStack.length + "] {" + _self._callStack + "}");
		},
		callStackRemove: function callStackRemove(fName) {
			var _self = this;
			_self._callStack = _self._callStack.filter(item => item !== fName);
			Logger.production(" === REMOVE-CALL-STACK [" + _self._callStack.length + "] {" + _self._callStack + "}");
		},

		finalize: function finalize(isLast) {
			var _self = this;
			try {
				var finalizeInterval = setInterval(function () {
					if ((_self._persistSettings.scheduledImages === 0) && (_self._callStack.length == 0)) { //CHAMGE CONDITION TO "_self._persistSettings.scheduledImages <= 2" TBD
						// Write statistic if this is last finalize() for the WF
						_re._statistics = JSON.stringify(_self._statistics);
						if (isLast) Logger.statistic();
						clearInterval(finalizeInterval);
						Logger.production("DONE: End Time: " + new Date());
						_executor.ready();
					} else {
						Logger.debug("INFO. Waiting for " + _self._persistSettings.scheduledImages + " photos to be downloaded... [callStack = " + _self._callStack + "]");
					}
				}, 1000);
			} catch (e) {
				Logger.error("finalize() :: " + e + " at line " + e.lineNumber);
				_executor.ready();
			}
		}
	}
	//* Object create shim *//
if (typeof Object.create !== 'function') {
	Object.create = function (o) {
		var Fn = function () {};
		Fn.prototype = o;
		return new Fn();
	}
}

function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

if (typeof Object.hasOwnPropertyCaseInsensitive !== 'function') {
	Object.defineProperty(Object, 'hasOwnPropertyCaseInsensitive', {
		enumerable: false,
		value: function hasOwnPropertyCaseInsensitive(prop) {
			return (Object.keys(this).filter(function (v) {
				return v.toLowerCase() === prop.toLowerCase();
			}).length > 0)
		}
	});
}

//-----------------------------------------------------------------------------------------------------//
///////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// (#) STANDARD LIBRARY: (END) ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------//