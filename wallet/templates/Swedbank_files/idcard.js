var idCardHandler = null;

var idCardObject = {
    cert: null,
    slot: null,
    hash: null,
    version: 'unknown'
};

var OperatingSystem = {
    Windows: navigator.appVersion.indexOf("Win") != -1,
    MacOS: navigator.appVersion.indexOf("Mac") != -1,
    UNIX: navigator.appVersion.indexOf("X11") != -1,
    Linux: navigator.appVersion.indexOf("Linux") != -1
};

function isIE() {
    return /msie/i.test(navigator.userAgent);
}

function ActiveXSigningHandler() {
    this.setSigningCertificateAndProceed = function(errorHandler) {
        idCardObject.cert = ISign.getSigningCertificate();
        idCardObject.slot = ISign.selectedCertNumber;
        idCardObject.version = "ActiveX";
        if (idCardObject.cert) {
            finishSigning(idCardObject, errorHandler);
        }
        else {
            errorHandler(Swedbank.Signing.labels.unableToLoadCertificatesLabel);
        }
    };

    this.submitSignature = function(object, errorHandler) {
        var signature = ISign.getSignedHash(object.hash, object.slot);
        if (signature) {
            submitSignature(signature);
        }
        else {
            errorHandler(Swedbank.Signing.labels.userCancelLabel)
        }
    };

    this.load = function (element, afterLoaded, errorHandler) {
        try {
            new ActiveXObject("EIDCard.Sign");
        }
        catch(e) {
            errorHandler();
            return;
        }

        this.createSignerElement(element);

        periodicalMethodExecuter(afterLoaded, function() {
            ISign.getInfo();
        });
    };

    this.createSignerElement = function(element) {
        element.innerHTML = '<OBJECT id="ISign" classid="clsid:FC5B7BD2-584A-4153-92D7-4C5840E4BC28"/>';
    }
}

function GenericPluginSigningHandler() {
    var plugin = this;

    function getMessageFromException(e) {
        var labels = Swedbank.Signing.labels;
        var msg = labels.technicalErrorLabel;

        var errorCode = plugin.pluginObject().errorCode;
        if (errorCode != "0") {
            if (errorCode in labels.idCardPluginErrorDictionary) {
                return labels.idCardPluginErrorDictionary[errorCode];
            }
            else {
                return labels.technicalErrorLabel;
            }
        }
        else if (e.message instanceof Function) {
            msg = e.message();
        }
        else if (e.message) {
            msg = e.message;
        }
        return msg;
    }

    this.setSigningCertificateAndProceed = function(errorHandler) {
        try {
            var cert = plugin.getCertificate();
            idCardObject.cert = cert.cert;
            idCardObject.slot = cert.id;
            idCardObject.version = plugin.pluginObject().version;

            finishSigning(idCardObject, errorHandler);
        }
        catch (e) {
            errorHandler(getMessageFromException(e));
        }
    };

    this.submitSignature = function(object, errorHandler) {
        try {
            var signature = plugin.sign(object.slot, object.hash);
            if (signature) {
                submitSignature(signature);
            }
            else {
                errorHandler(Swedbank.Signing.labels.userCancelLabel);
            }
        }
        catch (e) {
            errorHandler(getMessageFromException(e));
        }
    };

    this.load = function (element, afterLoaded, errorHandler) {
        createSignerElement(element);
        periodicalMethodExecuter(afterLoaded, checkIfPluginIsLoaded);
    };

    // private
    function createSignerElement(element) {
        element.innerHTML = '<object id="mozIdCardPlugin" type="application/x-digidoc" width="1" height="1" />';
    }

    function checkIfPluginIsLoaded() {
        if (!plugin.pluginObject().version) {
            throw "plugin is not loaded";
        }
    }

    this.pluginObject = function() {
        return document.getElementById("mozIdCardPlugin");
    };

    function getPluginLanguage() {
        return {'EST': 'ET', 'LAT': 'LV', 'LIT': 'LT', 'ENG': 'EN', 'RUS': 'RU'}[Swedbank.Signing.config.language];
    }

    this.getCertificate = function() {
        return plugin.pluginObject().getCertificate();
    };

    this.sign = function(id, hash) {
        return plugin.pluginObject().sign(id, hash, { language: getPluginLanguage() });
    }
}


function MozillaIdCardPluginHandler() {
    this.errorHandler = null;
    var plugin = this;

    function getMessageFromException(e) {
        var msg = Swedbank.Signing.labels.technicalErrorLabel;
        if (e.message instanceof Function) {
            msg = e.message();
        }
        else if (e.message) {
            msg = e.message;
        }
        return msg;
    }

    this.setSigningCertificateAndProceed = function(errorHandler) {
        try {
            var cert = this.getCertificate();
            idCardObject.cert = cert.cert;
            idCardObject.slot = cert.id;
            idCardObject.version = "OldMozillaPlugin";
        }
        catch (e) {
            errorHandler(getMessageFromException(e));
        }
        finishSigning(idCardObject, errorHandler);
    };

    this.submitSignature = function(object, errorHandler) {
        try {
            submitSignature(plugin.sign(object.slot, object.hash))
        }
        catch (e) {
            errorHandler(getMessageFromException(e));
        }
    };

    this.load = function (element, afterLoaded, errorHandler) {
        if (!this.pluginInstalled()) {
            errorHandler();
            return;
        }

        plugin.createSignerElement(element);
        periodicalMethodExecuter(afterLoaded, function() {
            plugin.checkIfPluginIsLoaded();
        });
    };

    // private

    this.checkIfPluginIsLoaded = function() {
        if (!plugin.pluginObject().sign) {
            throw "plugin is not loaded";
        }
    };

    this.createSignerElement = function(element) {
        element.innerHTML = '<object id="mozIdCardPlugin" type="application/x-idcard-plugin" width="1" height="1" />';
    };

    this.pluginObject = function() {
        return document.getElementById("mozIdCardPlugin");
    };

    this.getCertificate = function () {
        var response = eval('' + plugin.pluginObject().getCertificates());

        if (response.returnCode != 0) {
            throw new IdCardException(response.returnCode);
        }

        response.certificates = filter(response.certificates);
        if (response.certificates.length == 0) {
            throw new IdCardException(2);
        }

        return response.certificates[0];
    };

    this.sign = function (id, hash) {
        var response = eval(plugin.pluginObject().sign(id, hash));
        if (response.returnCode != 0) {
            throw new IdCardException(response.returnCode);
        }
        return response.signature;
    };

    var keyUsageRegex = new RegExp("(^| |,)" + "Non-Repudiation" + "($|,)");
    var filter = function(certificates) {
        var filteredCertificates = [];

        for (var i in certificates) {
            var cert = certificates[i];
            if (keyUsageRegex.exec(cert.keyUsage)) {
                filteredCertificates[filteredCertificates.length] = cert;
            }
        }
        return filteredCertificates;
    };

    this.pluginInstalled = function() {
        var idCardMimeType = navigator.mimeTypes['application/x-idcard-plugin'];
        return idCardMimeType && idCardMimeType.enabledPlugin;
    };
}

function ChromeExtensionSigningHandler() {
    var plugin = this;
    var certObject;

    console.log("Hwcrypto will be used for signing");

    function getMessageFromException(e) {
        var labels = Swedbank.Signing.labels;
        if (e.message in labels.chromeExtensionPluginErrorDictionary) {
            return labels.chromeExtensionPluginErrorDictionary[e.message];
        }
        return labels.technicalErrorLabel;
    }

    this.setSigningCertificateAndProceed = function(errorHandler) {
        plugin.getCertificatePromise().then(
            function(certObject) {
                plugin.certObject = certObject;
                idCardObject.cert = certObject.hex ? certObject.hex : array2hex(certObject.encoded);
                idCardObject.slot = 0;
                idCardObject.version = "Hwcrypto";
                finishSigning(idCardObject, errorHandler);
            },
            function (err) {
                console.log("Hwcrypto failed to get certificate: " + err);
                errorHandler(getMessageFromException(err));
            }
        );
    };

    this.submitSignature = function(hashObject, errorHandler) {
        var hashValue = hex2array(hashObject.hash);
        plugin.signPromise(plugin.certObject, {type: hashObject.hashType, value: hashValue}).then(
            function(signature) {
                submitSignature(signature.hex ? signature.hex : array2hex(signature.value));
            },
            function (err) {
                console.log("Hwcrypto failed to sign: " + err);
                errorHandler(getMessageFromException(err));
            }
        );
    };

    this.load = function (element, afterLoaded, errorHandler) {
        plugin.pluginObject().use().then(function(res) {
            console.log("Start using plugin, result:", res);
            if (res === true) {
                afterLoaded();
            } else {
                errorHandler(Swedbank.Signing.labels.chromeExtensionSignInstallerLabel)
            }
        });
    };

    this.pluginObject = function() {
        return window.hwcrypto;
    };

    function getPluginLanguage() {
        return {'EST': 'et', 'LAT': 'en', 'LIT': 'en', 'ENG': 'en', 'RUS': 'ru'}[Swedbank.Signing.config.language];
    }

    this.getCertificatePromise = function() {
        return plugin.pluginObject().getCertificate({lang: getPluginLanguage()});
    };

    this.signPromise = function(cert, hash) {
        return plugin.pluginObject().sign(cert, hash, {lang: getPluginLanguage()});
    };

    function array2hex(args) {
        var ret = "";
        for (var i = 0; i < args.length; i++) ret += (args[i] < 16 ? "0" : "") + args[i].toString(16);
        return ret.toLowerCase();
    }

    function hex2array(str) {
        if (typeof str == "string") {
            var ret = new Uint8Array(Math.floor(str.length / 2));
            var i = 0;
            str.replace(/(..)/g, function(str) {
                ret[i++] = parseInt(str, 16);
            });
            return ret;
        }
    }
}
function shouldUseChromeExtension() {
    if (navigator.userAgent.indexOf("Chrome") != -1) {
        console.log("Chrome browser detected");
        if (typeof window["TokenSigning"] === "function") {
            console.log("Chrome extension detected");
            return true;
        } else {
            console.log("Chrome extension not detected");
        }
    }
    return false;
}

function installPlugin() {
    xpi = {'Estonian ID-Card Plugin':'https://installer.id.ee/media/npidcard.xpi'};
    InstallTrigger.install(xpi);
}

function IdCardException(returnCode) {
    this.returnCode = returnCode;

    this.message = function() {
        var messages = dictionary[returnCode];
        return messages ? messages['est'] : dictionary[0]['est'];
    };

    this.isError = function () {
        return this.returnCode != 1;
    };

    this.isCancelled = function () {
        return this.returnCode == 1;
    };
}

var dictionary = {
    0: {est: 'Tehniline viga'},
    1: {est: 'Allkirjastamine katkestati'},
    2: {est: 'Sertifikaate ei leitud'},
    12: {est: 'Id kaardi lugemine ebaõnnestus'}
};

function isNewIdCardPlugin() {
    return navigator.mimeTypes['application/x-digidoc'];
}

function AppletIdCardHandler() {
    this.errorHandler = null;

    this.setSigningCertificateAndProceed = function(errorHandler) {
        this.errorHandler = errorHandler;
        this.getAppletElement().prepare('window.idCardHandler.applSetCert', 'window.idCardHandler.applCancel', 'window.idCardHandler.applError');
    };

    this.submitSignature = function(object, errorHandler) {
        this.errorHandler = errorHandler;
        this.getAppletElement().finalize(object.slot, object.hash, 'window.submitSignature', 'window.idCardHandler.applCancel', 'window.idCardHandler.applError');
    };

    this.load = function (element, afterLoaded, errorHandler) {
        if (isNewIdCardPlugin() && !OperatingSystem.Windows) {
            ErrorMessage.add(Swedbank.Signing.labels.appletWithNewIdCardSoftwareWarningLabel);
        }

        this.createSignerElement(element);
        periodicalMethodExecuter(afterLoaded, function() {
            if (!idCardHandler.getAppletElement().isActive()) {
                throw "Applet not loaded yet!";
            }
            idCardHandler.getAppletElement().prepare('window.empty', 'window.empty', 'window.empty');
        });
    };

    this.createSignerElement = function(element) {
        var template = new Template(
            '<OBJECT id="jSign" classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93" width="0" height="0" codebase="http://java.sun.com/products/plugin/autodl/jinstall-1_4_0-win.cab#Version=1,4,0,0">' +
            '<PARAM NAME="code" VALUE="SignatureApplet.class">' +
            '<PARAM NAME ="archive" VALUE = "#{appletURI}SignApplet_sig.jar,#{appletURI}iaikPkcs11Wrapper_sig.jar" >' +
            '<PARAM NAME="type" VALUE="application/x-java-applet;version=1.4">' +
            '<PARAM NAME="MAYSCRIPT" VALUE="true">' +
            '<PARAM NAME="NAME" VALUE="SignatureApplet">' +
            '<PARAM NAME="DEBUG_LEVEL" VALUE="4">' +
            '<PARAM NAME="LANG" VALUE="#{language}">' +
            '<embed id="ejSign" type="application/x-java-applet;version=1.4" width="0" height="0"' +
            'pluginspage="http://java.sun.com/products/plugin/index.html#download" code="SignatureApplet.class"' +
            'archive="#{appletURI}SignApplet_sig.jar,#{appletURI}iaikPkcs11Wrapper_sig.jar" NAME="SignatureApplet" MAYSCRIPT="true" LANG="#{language}"' +
            'DEBUG_LEVEL="4"></embed>' +
            '</OBJECT>');

        var config = Swedbank.Signing.config;
        if (!config.appletURI.match(/\/$/)) {
            config.appletURI += "/"
        }
        element.innerHTML = template.evaluate(config);
    };

    this.getAppletElement = function() {
        return document.getElementById(isIE() ? "jSign" : "ejSign");
    };

    this.applSetCert = function(slot, cert) {
        idCardObject.slot = slot;
        idCardObject.cert = cert;
        idCardObject.version = "Applet";
        finishSigning(idCardObject, this.errorHandler);
    };

    this.applError = function(errcode, errmsg) {
        this.errorHandler(Swedbank.Signing.labels.technicalErrorLabel);
    };

    this.applCancel = function() {
        this.errorHandler(Swedbank.Signing.labels.userCancelLabel);
    }
}

function empty() {
}

function getIdCardHandler() {
    if (idCardHandler != null) {
        return idCardHandler;
    }

    doBrowserSpecificStuff({
        ie: function() {
            try {
                new ActiveXObject("esteidpluginie.EstEIDIEPluginBHO");
                idCardHandler = new GenericPluginSigningHandler();
            }
            catch(e) {
                idCardHandler = new ActiveXSigningHandler();
            }
        },
        chrome: function() {
            idCardHandler = new ChromeExtensionSigningHandler();
        },
        mozilla: function() {
            if (navigator.mimeTypes['application/x-digidoc']) {
                idCardHandler = new GenericPluginSigningHandler();
            }
            else {
                idCardHandler = new MozillaIdCardPluginHandler();
            }
        },
        applet: function() {
            idCardHandler = new AppletIdCardHandler();
        }});

    return idCardHandler;
}

function finishSigning(idCardObject, errorHandler) {
    var $pollForm = document.getElementById('pollHash');
    $pollForm['signForm.certValue'].value = idCardObject.cert;
    $pollForm['signForm.certNum'].value = idCardObject.slot;
    $pollForm['signForm.version'].value = idCardObject.version;
    $pollForm['pollHash.pollDate'].value = new Date().getTime();

    var onSuccess = function(object) {
        getIdCardHandler().submitSignature(object, errorHandler);
    };

    var onGeneralError = function () {
        errorHandler(Swedbank.Signing.labels.technicalErrorLabel);
    };

    var pollFunction = function(onRetry) {
        pollJSON($pollForm, onSuccess, onGeneralError, onRetry, errorHandler);
    };

    Hansa.retry(3, pollFunction, onGeneralError);
}

function doBrowserSpecificStuff(functions) {
    if ((jQuery.browser.msie || navigator.userAgent.indexOf('Trident') > -1)) {
        functions.ie();
    } else {
        functions.chrome();
    }
}

function submitSignature(signature) {
    document.mainForm['signForm.sigValue'].value = signature;
    onSuccessfulSigning();
}

function submitMainForm() {
    document.mainForm.submit();
}

function periodicalMethodExecuter(afterLoaded, functionToBeCalled, timeout) {
    setTimeout(function() {
        periodicalMethodExecuterWorker(afterLoaded, functionToBeCalled)
    }, timeout == undefined ? 1 : timeout);
}

function periodicalMethodExecuterWorker(afterLoaded, functionToBeCalled) {
    try {
        functionToBeCalled();
        afterLoaded();
    }
    catch(e) {
        periodicalMethodExecuter(afterLoaded, functionToBeCalled, 1000);
    }
}

function executePeriodically(functionToBeCalled, afterLoaded, afterFail, attempts) {
    setTimeout(function() {_executePeriodicallyStep(functionToBeCalled, afterLoaded, afterFail, attempts);}, 20);
}

function _executePeriodicallyStep(functionToBeCalled, afterLoaded, afterFail, attempts) {
    try {
        functionToBeCalled();
        afterLoaded();
    }
    catch(e) {
        if (attempts) {
            attempts--;
            if (attempts <= 0) {
                if (afterFail) afterFail();
                return;
            }
        }
        setTimeout(function() {_executePeriodicallyStep(functionToBeCalled, afterLoaded, afterFail, attempts)}, 1000);
    }
}