if (typeof s != 'undefined') {
    s.pushVal = function (name, value, obj) {
        try {
            if (name && value && obj) {
                obj.push(name);
            }
            s[name] = value || '';
        } catch (e) { }
    };
    s.replaceIllegalProductChar = function (data) {
        try {
            var dataString = String(data || '');
            dataString = dataString.toLowerCase();
            dataString = dataString.replace(/[\xE0-\xE6]/g, 'a');
            dataString = dataString.replace(/[\xE7]/g, 'c');
            dataString = dataString.replace(/[\xE8-\xEB]/g, 'e');
            dataString = dataString.replace(/[\xEC-\xEF]/g, 'i');
            dataString = dataString.replace(/[\xF0]/g, 'd');
            dataString = dataString.replace(/[\xF1]/g, 'n');
            dataString = dataString.replace(/[\xF2-\xF6]/g, 'o');
            dataString = dataString.replace(/[\xF9-\xFC]/g, 'u');
            dataString = dataString.replace(/[\x9A]/g, 's');
            dataString = dataString.replace(/[\xFD-\xFF]/g, 'y');
            dataString = dataString.replace(/[\x9E]/g, 'z');
            dataString = dataString.replace(/[^a-zA-Z\d\s:\-_.]/g, '');
            dataString = dataString.replace(/[|;=,]/g, '');
            return dataString;
        } catch (e) {
            return data;
        }
    };
    s.clickMapping = function (data, vars, events) {
        try {
            if (data.click && data.click.event.click) {
                s.pushVal('eVar23', data.click.name, vars);
                s.pushVal('eVar73', data.click.type, vars);
                s.pushVal('eVar74', data.click.group, vars);
                s.pushVal('eVar75', data.click.status, vars);
                events.push('event146');
            }
        } catch (e) { }
    };
    s.flowAddProductEvar = function (objName, eVarID, product, eVarList) {
        try {
            if (objName && eVarID && product[objName]) {
                eVarList.push(eVarID + '=' + s.replaceIllegalProductChar(product[objName]))
            }
        } catch (e) { }
    };
    s.flowAddProductEvent = function (objName, eventID, product, events, eventList, addedEvents) {
        try {
            if (objName && eventID && product[objName]) {
                eventList.push(eventID + '=' + s.replaceIllegalProductChar(product[objName]))
                if (typeof addedEvents[objName] == 'undefined') {
                    events.push(eventID);
                    addedEvents.transactionBuy = true;
                }
            }
        } catch (e) { }
    };
    s.flowProductMapping = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.productArray && data.flow.productArray.length > 0) {
                var addedEvents = {},
                    productList = [],
                    eVarList,
                    eventList,
                    category,
                    name,
                    units,
                    revenue,
                    productString,
                    product;
                for (var i = 0; i < data.flow.productArray.length; i++) {
                    product = data.flow.productArray[i];
                    eVarList = [];
                    eventList = [];
                    category = s.replaceIllegalProductChar(product.category || '');
                    name = s.replaceIllegalProductChar(product.name || '');
                    units = s.replaceIllegalProductChar(product.units || '');
                    revenue = s.replaceIllegalProductChar(product.revenue || '');
                    //product events
                    s.flowAddProductEvent('transferCompleteAmount', 'event116', product, events, eventList, addedEvents);
                    s.flowAddProductEvent('transactionBuy', 'event117', product, events, eventList, addedEvents);
                    s.flowAddProductEvent('transactionBuyVolume', 'event118', product, events, eventList, addedEvents);
                    s.flowAddProductEvent('transactionSell', 'event119', product, events, eventList, addedEvents);
                    s.flowAddProductEvent('transactionSellVolume', 'event120', product, events, eventList, addedEvents);
                    s.flowAddProductEvent('transactionCommission', 'event121', product, events, eventList, addedEvents);
                    s.flowAddProductEvent('transactionSwitch', 'event157', product, events, eventList, addedEvents);
                    s.flowAddProductEvent('transactionSwitchVolume', 'event158', product, events, eventList, addedEvents);
                    s.flowAddProductEvent('transactionStop', 'event159', product, events, eventList, addedEvents);
                    s.flowAddProductEvent('transactionStopVolume', 'event160', product, events, eventList, addedEvents);
                    s.flowAddProductEvent('transactionUnits', 'event176', product, events, eventList, addedEvents);
                    //product eVars
                    s.flowAddProductEvar('id', 'eVar86', product, eVarList);
                    s.flowAddProductEvar('settingsValue', 'eVar87', product, eVarList);
                    s.flowAddProductEvar('transferAmount', 'eVar14', product, eVarList);
                    s.flowAddProductEvar('transferRecurringType', 'eVar43', product, eVarList);
                    s.flowAddProductEvar('transferType', 'eVar44', product, eVarList);
                    s.flowAddProductEvar('transferBank', 'eVar45', product, eVarList);
                    s.flowAddProductEvar('transferEntity', 'eVar46', product, eVarList);
                    s.flowAddProductEvar('transactionRecurringType', 'eVar50', product, eVarList);
                    s.flowAddProductEvar('transactionVolume', 'eVar51', product, eVarList);
                    s.flowAddProductEvar('transactionSymbol', 'eVar80', product, eVarList);
                    s.flowAddProductEvar('transactionSymbolChange', 'eVar81', product, eVarList);
                    s.flowAddProductEvar('transactionOrderType', 'eVar82', product, eVarList);
                    s.flowAddProductEvar('transactionBank', 'eVar83', product, eVarList);
                    s.flowAddProductEvar('transactionCompany', 'eVar84', product, eVarList);
                    productList.push(category + ';' + name + ';' + units + ';' + revenue + ';' + eventList.join('|') + ';' + eVarList.join('|'));
                }
                if (productList.length > 0) {
                    s.products = productList.join(',');
                    vars.push("products");
                }
            }
        } catch (e) { }
    };
    s.flowEcommerce = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow) {
                if (data.flow.products) {
                    s.pushVal('products', data.flow.products, vars);
                }
                if (data.flow.productArray) {
                    s.flowProductMapping(data, vars, events, isPageView);
                }
                if (data.flow.event && isPageView) {
                    if (data.flow.event.purchase) {
                        events.push('purchase');
                    }
                    if (data.flow.event.prodView) {
                        events.push('prodView');
                    }
                    if (data.flow.event.scView) {
                        events.push('scView');
                    }
                    if (data.flow.event.scOpen) {
                        events.push('scOpen');
                    }
                    if (data.flow.event.scAdd) {
                        events.push('scAdd');
                    }
                    if (data.flow.event.scRemove) {
                        events.push('scRemove');
                    }
                    if (data.flow.event.scCheckout) {
                        events.push('scCheckout');
                    }
                }
            }
        } catch (e) { }
    };
    s.flowApplication = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type == 'application') {
                s.pushVal('eVar32', 'D=v24', vars);
                s.pushVal('eVar34', data.flow.applicationAmount, vars);
                s.pushVal('eVar38', data.flow.applicationStatus, vars);
                s.pushVal('eVar54', data.flow.applicationReason, vars);
                s.pushVal('eVar77', data.flow.applicationMinAmount, vars);
                s.pushVal('eVar78', data.flow.applicationMaxAmount, vars);
                s.pushVal('eVar79', data.flow.applicationApplicant, vars);
                if (data.flow.event && isPageView) {
                    if (data.flow.event.applicationStart) {
                        events.push('event31');
                    } else if (data.flow.event.applicationStep2) {
                        events.push('event32');
                    } else if (data.flow.event.applicationStep3) {
                        events.push('event33');
                    } else if (data.flow.event.applicationStep4) {
                        events.push('event34');
                    } else if (data.flow.event.applicationStep5) {
                        events.push('event35');
                    } else if (data.flow.event.applicationStep6) {
                        events.push('event36');
                    } else if (data.flow.event.applicationStep7) {
                        events.push('event37');
                    } else if (data.flow.event.applicationStep8) {
                        events.push('event38');
                    } else if (data.flow.event.applicationStep9) {
                        events.push('event39');
                    } else if (data.flow.event.applicationStep10) {
                        events.push('event40');
                    } else if (data.flow.event.applicationStep11) {
                        events.push('event41');
                    } else if (data.flow.event.applicationStep12) {
                        events.push('event42');
                    } else if (data.flow.event.applicationStep13) {
                        events.push('event43');
                    } else if (data.flow.event.applicationStep14) {
                        events.push('event44');
                    } else if (data.flow.event.applicationStep15) {
                        events.push('event45');
                    } else if (data.flow.event.applicationStep16) {
                        events.push('event46');
                    } else if (data.flow.event.applicationStep17) {
                        events.push('event47');
                    } else if (data.flow.event.applicationStep18) {
                        events.push('event48');
                    } else if (data.flow.event.applicationStep19) {
                        events.push('event49');
                    } else if (data.flow.event.applicationComplete) {
                        events.push('event50');
                    }
                    if (data.flow.event.applicationGreen) {
                        events.push('event122');
                    }
                    if (data.flow.event.applicationGreenAmount) {
                        events.push('event123=' + data.flow.event.applicationGreenAmount);
                    }
                    if (data.flow.event.applicationYellow) {
                        events.push('event124');
                    }
                    if (data.flow.event.applicationYellowAmount) {
                        events.push('event125=' + data.flow.event.applicationYellowAmount);
                    }
                    if (data.flow.event.applicationRed) {
                        events.push('event126');
                    }
                    if (data.flow.event.applicationRedAmount) {
                        events.push('event127=' + data.flow.event.applicationRedAmount);
                    }
                }
            }
        } catch (e) { }
    };
    s.flowLead = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type == 'lead') {
                s.pushVal('eVar39', 'D=v24', vars);
                s.pushVal('eVar34', data.flow.leadAmount, vars);
                s.pushVal('eVar38', data.flow.leadStatus, vars);
                s.pushVal('eVar54', data.flow.leadReason, vars);
                s.pushVal('eVar77', data.flow.leadMinAmount, vars);
                s.pushVal('eVar78', data.flow.leadMaxAmount, vars);
                s.pushVal('eVar79', data.flow.leadApplicant, vars);
                if (data.flow.event && isPageView) {
                    if (data.flow.event.leadStart) {
                        events.push('event51');
                    } else if (data.flow.event.leadStep2) {
                        events.push('event52');
                    } else if (data.flow.event.leadStep3) {
                        events.push('event53');
                    } else if (data.flow.event.leadStep4) {
                        events.push('event54');
                    } else if (data.flow.event.leadStep5) {
                        events.push('event55');
                    } else if (data.flow.event.leadStep6) {
                        events.push('event56');
                    } else if (data.flow.event.leadStep7) {
                        events.push('event57');
                    } else if (data.flow.event.leadStep8) {
                        events.push('event58');
                    } else if (data.flow.event.leadStep9) {
                        events.push('event59');
                    } else if (data.flow.event.leadComplete) {
                        events.push('event60');
                    }
                    if (data.flow.event.leadGreen) {
                        events.push('event151');
                    }
                    if (data.flow.event.leadGreenAmount) {
                        events.push('event152=' + data.flow.event.leadGreenAmount);
                    }
                    if (data.flow.event.leadYellow) {
                        events.push('event153');
                    }
                    if (data.flow.event.leadYellowAmount) {
                        events.push('event154=' + data.flow.event.leadYellowAmount);
                    }
                    if (data.flow.event.leadRed) {
                        events.push('event155');
                    }
                    if (data.flow.event.leadRedAmount) {
                        events.push('event156=' + data.flow.event.leadRedAmount);
                    }
                }
            }
        } catch (e) { }
    };
    s.flowOnboarding = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type == 'onboarding') {
                s.pushVal('eVar31', 'D=v24', vars);
                s.pushVal('eVar26', data.flow.onboardingType, vars);
                if (data.flow.event && isPageView) {
                    if (data.flow.event.onboardingStart) {
                        events.push('event5');
                    } else if (data.flow.event.onboardingStep2) {
                        events.push('event6');
                    } else if (data.flow.event.onboardingStep3) {
                        events.push('event7');
                    } else if (data.flow.event.onboardingStep4) {
                        events.push('event8');
                    } else if (data.flow.event.onboardingStep5) {
                        events.push('event9');
                    } else if (data.flow.event.onboardingComplete) {
                        events.push('event10');
                    }
                }
            }
        } catch (e) { }
    };
    s.flowSupport = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type == 'support') {
                s.pushVal('eVar40', 'D=v24', vars);
                s.pushVal('eVar38', data.flow.supportStatus, vars);
                s.pushVal('eVar54', data.flow.supportReason, vars);
                s.pushVal('eVar34', data.flow.supportAmount, vars);
                if (data.flow.event && isPageView) {
                    if (data.flow.event.supportStart) {
                        events.push('event161');
                    } else if (data.flow.event.supportStep2) {
                        events.push('event162');
                    } else if (data.flow.event.supportStep3) {
                        events.push('event163');
                    } else if (data.flow.event.supportStep4) {
                        events.push('event164');
                    } else if (data.flow.event.supportStep5) {
                        events.push('event165');
                    } else if (data.flow.event.supportStep6) {
                        events.push('event166');
                    } else if (data.flow.event.supportStep7) {
                        events.push('event167');
                    } else if (data.flow.event.supportStep8) {
                        events.push('event168');
                    } else if (data.flow.event.supportStep9) {
                        events.push('event169');
                    } else if (data.flow.event.supportComplete) {
                        events.push('event170');
                    }

                    if (data.flow.event.supportGreen) {
                        events.push('event177');
                    }
                    if (data.flow.event.supportGreenAmount) {
                        events.push('event178=' + data.flow.event.supportGreenAmount);
                    }
                    if (data.flow.event.supportYellow) {
                        events.push('event179');
                    }
                    if (data.flow.event.supportYellowAmount) {
                        events.push('event180=' + data.flow.event.supportYellowAmount);
                    }
                    if (data.flow.event.supportRed) {
                        events.push('event181');
                    }
                    if (data.flow.event.supportRedAmount) {
                        events.push('event182=' + data.flow.event.supportRedAmount);
                    }
                }
            }
        } catch (e) { }
    };
    s.flowTool = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type == 'tool') {
                s.pushVal('eVar41', 'D=v24', vars);
                if (data.flow.event && isPageView) {
                    if (data.flow.event.toolStart) {
                        events.push('event61');
                    } else if (data.flow.event.toolStep2) {
                        events.push('event62');
                    } else if (data.flow.event.toolStep3) {
                        events.push('event63');
                    } else if (data.flow.event.toolStep4) {
                        events.push('event64');
                    } else if (data.flow.event.toolStep5) {
                        events.push('event65');
                    } else if (data.flow.event.toolStep6) {
                        events.push('event66');
                    } else if (data.flow.event.toolStep7) {
                        events.push('event67');
                    } else if (data.flow.event.toolStep8) {
                        events.push('event68');
                    } else if (data.flow.event.toolStep9) {
                        events.push('event69');
                    } else if (data.flow.event.toolComplete) {
                        events.push('event70');
                    }
                }
            }
        } catch (e) { }
    };
    s.flowTransfer = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type == 'transfer') {
                s.pushVal('eVar42', 'D=v24', vars);
                s.pushVal('eVar34', data.flow.transferAmount, vars);
                s.pushVal('eVar38', data.flow.transferStatus, vars);
                s.pushVal('eVar54', data.flow.transferReason, vars);
                if (data.flow.event && isPageView) {
                    if (data.flow.event.transferStart) {
                        events.push('event71');
                    } else if (data.flow.event.transferStep2) {
                        events.push('event72');
                    } else if (data.flow.event.transferStep3) {
                        events.push('event73');
                    } else if (data.flow.event.transferStep4) {
                        events.push('event74');
                    } else if (data.flow.event.transferStep5) {
                        events.push('event75');
                    } else if (data.flow.event.transferStep6) {
                        events.push('event76');
                    } else if (data.flow.event.transferStep7) {
                        events.push('event77');
                    } else if (data.flow.event.transferStep8) {
                        events.push('event78');
                    } else if (data.flow.event.transferStep9) {
                        events.push('event79');
                    } else if (data.flow.event.transferComplete) {
                        events.push('event80');
                    }
                }
            }
        } catch (e) { }
    };
    s.flowTransaction = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type == 'transaction') {
                s.pushVal('eVar49', 'D=v24', vars);
                s.pushVal('eVar34', data.flow.transactionAmount, vars);
                s.pushVal('eVar38', data.flow.transactionStatus, vars);
                s.pushVal('eVar54', data.flow.transactionReason, vars);
                s.pushVal('eVar85', data.flow.transactionAccountType, vars);
                if (data.flow.event && isPageView) {
                    if (data.flow.event.transactionStart) {
                        events.push('event81');
                    } else if (data.flow.event.transactionStep2) {
                        events.push('event82');
                    } else if (data.flow.event.transactionStep3) {
                        events.push('event83');
                    } else if (data.flow.event.transactionStep4) {
                        events.push('event84');
                    } else if (data.flow.event.transactionStep5) {
                        events.push('event85');
                    } else if (data.flow.event.transactionStep6) {
                        events.push('event86');
                    } else if (data.flow.event.transactionStep7) {
                        events.push('event87');
                    } else if (data.flow.event.transactionStep8) {
                        events.push('event88');
                    } else if (data.flow.event.transactionStep9) {
                        events.push('event89');
                    } else if (data.flow.event.transactionComplete) {
                        events.push('event90');
                    }
                }
            }
        } catch (e) { }
    };
    s.flowSearch = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type == 'search') {
                s.pushVal('eVar29', 'D=v24', vars);
                s.pushVal('eVar27', data.flow.searchKeyword, vars);
                s.pushVal('eVar28', data.flow.searchFilter, vars);
                s.pushVal('eVar30', data.flow.searchViewedResult, vars);
                s.pushVal('eVar94', data.flow.searchDestination, vars);
                s.pushVal('eVar95', data.flow.searchResultType, vars);
                if (data.flow.event.searchTotal) {
                    events.push('event141');
                }
                if (data.flow.event.searchHit) {
                    events.push('event142');
                }
                if (data.flow.event.searchNoHit) {
                    events.push('event143');
                }
                if (data.flow.event.searchClick) {
                    events.push('event144');
                }
            }
        } catch (e) { }
    };
    s.flowService = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type == 'service') {
                s.pushVal('eVar52', 'D=v24', vars);
                if (data.flow.event && isPageView) {
                    if (data.flow.event.serviceStart) {
                        events.push('event91');
                    } else if (data.flow.event.serviceStep2) {
                        events.push('event92');
                    } else if (data.flow.event.serviceStep3) {
                        events.push('event93');
                    } else if (data.flow.event.serviceStep4) {
                        events.push('event94');
                    } else if (data.flow.event.serviceStep5) {
                        events.push('event95');
                    } else if (data.flow.event.serviceStep6) {
                        events.push('event96');
                    } else if (data.flow.event.serviceStep7) {
                        events.push('event97');
                    } else if (data.flow.event.serviceStep8) {
                        events.push('event98');
                    } else if (data.flow.event.serviceStep9) {
                        events.push('event99');
                    } else if (data.flow.event.serviceComplete) {
                        events.push('event100');
                    }
                }
            }
        } catch (e) { }
    };
    s.flowSettings = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type == 'service') {
                s.pushVal('eVar53', 'D=v24', vars);
                if (data.flow.event && isPageView) {
                    if (data.flow.event.settingsStart) {
                        events.push('event101');
                    } else if (data.flow.event.settingsStep2) {
                        events.push('event102');
                    } else if (data.flow.event.settingsStep3) {
                        events.push('event103');
                    } else if (data.flow.event.settingsStep4) {
                        events.push('event104');
                    } else if (data.flow.event.settingsStep5) {
                        events.push('event105');
                    } else if (data.flow.event.settingsStep6) {
                        events.push('event106');
                    } else if (data.flow.event.settingsStep7) {
                        events.push('event107');
                    } else if (data.flow.event.settingsStep8) {
                        events.push('event108');
                    } else if (data.flow.event.settingsStep9) {
                        events.push('event109');
                    } else if (data.flow.event.settingsComplete) {
                        events.push('event110');
                    }
                }
            }
        } catch (e) { }
    };
    s.flowCustomerFeedback = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.customerFeedbackCategory) {
                s.pushVal('eVar88', data.flow.customerFeedbackCategory, vars);
                s.pushVal('eVar89', data.flow.customerFeedbackRating, vars);
                if (data.flow.event) {
                    if (data.flow.event.customerFeedbackShown) {
                        events.push('event171');
                    }
                    if (data.flow.event.customerFeedbackRatingTotal) {
                        events.push('event172=' + data.flow.event.customerFeedbackRatingTotal);
                    }
                    if (data.flow.event.customerFeedbackWritten) {
                        events.push('event173');
                    }
                    if (data.flow.event.customerFeedbackComplete) {
                        events.push('event174');
                    }
                }
            }
        } catch (e) { }
    };
    s.flowBehaviour = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type && data.flow.event) {
                var name = data.flow.type + ':' + data.flow.category + ':' + data.flow.name;
                s.pushVal('eVar24', name, vars);
                s.pushVal('eVar25', data.flow.behaviourType, vars);
                s.pushVal('eVar61', data.flow.stepDescription, vars);
                if ((data.flow.event && isPageView) ||
                    (data.flow.type == 'search' && (data.flow.event.searchTotal || data.flow.event.searchClick))) {
                    if (data.flow.event.behaviourStart) {
                        events.push('event11');
                    } else if (data.flow.event.behaviourStep2) {
                        events.push('event12');
                    } else if (data.flow.event.behaviourStep3) {
                        events.push('event13');
                    } else if (data.flow.event.behaviourStep4) {
                        events.push('event14');
                    } else if (data.flow.event.behaviourStep5) {
                        events.push('event15');
                    } else if (data.flow.event.behaviourStep6) {
                        events.push('event16');
                    } else if (data.flow.event.behaviourStep7) {
                        events.push('event17');
                    } else if (data.flow.event.behaviourStep8) {
                        events.push('event18');
                    } else if (data.flow.event.behaviourStep9) {
                        events.push('event19');
                    } else if (data.flow.event.behaviourStep10) {
                        events.push('event20');
                    } else if (data.flow.event.behaviourStep11) {
                        events.push('event21');
                    } else if (data.flow.event.behaviourStep12) {
                        events.push('event22');
                    } else if (data.flow.event.behaviourStep13) {
                        events.push('event23');
                    } else if (data.flow.event.behaviourStep14) {
                        events.push('event24');
                    } else if (data.flow.event.behaviourStep15) {
                        events.push('event25');
                    } else if (data.flow.event.behaviourStep16) {
                        events.push('event26');
                    } else if (data.flow.event.behaviourStep17) {
                        events.push('event27');
                    } else if (data.flow.event.behaviourStep18) {
                        events.push('event28');
                    } else if (data.flow.event.behaviourStep19) {
                        events.push('event29');
                    } else if (data.flow.event.behaviourComplete) {
                        events.push('event30');
                        if (data.flow.type != 'login') {
                            s.prop24 = 'D=v24';
                        }
                    }
                }
            }
        } catch (e) { }
    };
    s.flowForm = function (data, vars, events, isPageView) {
        if (data && data.flow && data.flow.type && data.flow.event) {
            var name = data.flow.type + ':' + data.flow.category + ':' + data.flow.name + ':' + data.flow.step;
            s.pushVal('eVar55', data.flow.type, vars);
            s.pushVal('eVar56', name, vars);
            if ((data.flow.event && isPageView) ||
                (data.flow.type == 'search' && (data.flow.event.searchTotal || data.flow.event.searchClick))) {
                if (data.flow.event.formView) {
                    events.push('event140');
                }
            }
        }
    };
    s.flowLogin = function (data, vars, events, isPageView) {
        try {
            if (data && data.flow && data.flow.type == 'login') {
                s.pushVal('eVar11', 'D=v24', vars);
                s.pushVal('eVar13', 'D=v9', vars);
                s.pushVal('eVar12', data.flow.loginMethod, vars);
                s.pushVal('eVar38', data.flow.loginStatus, vars);
                s.pushVal('eVar54', data.flow.loginReason, vars);
                if (data.flow.event) {
                    if (data.flow.event.loginStart) {
                        events.push('event2');
                        events.push('event11');
                        events.push('event140');
                    } else if (data.flow.event.loginComplete) {
                        s.pushVal('eVar15', '+1', vars);
                        s.pushVal('eVar16', '+1', vars);
                        events.push('event3');
                        events.push('event30');
                        events.push('event140');
                    } else if (data.flow.event.loginError) {
                        events.push('event4');
                        events.push('event139');
                    }
                }
            }
        } catch (e) { }
    };
    s.configMapping = function (data, vars, events, isPageLoad) {
        try {
            s.account = data.account ? data.account : 'swedbankabsewebglobtestdev';
        } catch (e) { }
    };
    s.flowMapping = function (data, vars, events, isPageLoad) {
        if (data && data.flow && data.flow.type) {
            s.flowEcommerce(data, vars, events, isPageLoad);
            s.flowBehaviour(data, vars, events, isPageLoad);
            s.flowForm(data, vars, events, isPageLoad);
            s.flowApplication(data, vars, events, isPageLoad);
            s.flowLead(data, vars, events, isPageLoad);
            s.flowOnboarding(data, vars, events, isPageLoad);
            s.flowSearch(data, vars, events, isPageLoad);
            s.flowService(data, vars, events, isPageLoad);
            s.flowSettings(data, vars, events, isPageLoad);
            s.flowSupport(data, vars, events, isPageLoad);
            s.flowLogin(data, vars, events, isPageLoad);
            s.flowTool(data, vars, events, isPageLoad);
            s.flowTransfer(data, vars, events, isPageLoad);
            s.flowTransaction(data, vars, events, isPageLoad);
        }
        if (data && data.flow && data.flow.customerFeedbackCategory) {
            s.flowCustomerFeedback(data, vars, events, isPageLoad);
        }
    };
    s.abTestMapping = function (data, vars, events, isPageLoad) {
        try {
            if (data && data.abTest) {
                s.pushVal('eVar46', data.abTest, vars);
                s.pushVal('prop46', 'D=v46', vars);
            }
        } catch (e) { }
    };
    s.marketingMapping = function (data, vars, events, isPageLoad) {
        try {
            if (data && data.marketing) {
                if (data.marketing.event && isPageLoad) {
                    if (data.marketing.internalCampaignLoaded && data.marketing.event.internalCampaignLoad) {
                        s.pushVal('list3', data.marketing.internalCampaignLoaded.join(';'), vars);
                        events.push('event112');
                    }
                    if (data.marketing.internalCampaignViewed && data.marketing.event.internalCampaignView) {
                        s.pushVal('list3', data.marketing.internalCampaignViewed.join(';'), vars);
                        events.push('event113');
                    }
                    if (data.marketing.internalCampaignClick && data.marketing.event.internalCampaignClick) {
                        s.pushVal('list3', data.marketing.internalCampaignClick, vars);
                        s.pushVal('eVar60', data.marketing.internalCampaignClick, vars);
                        events.push('event114');
                    }
                }
            }
        } catch (e) { }
    };
    s.pageMapping = function (data, vars, events, isPageLoad) {
        try {
            if (data && data.page) {
                if (data.page.url) {
                    s.pageURL = data.page.url;
                }
                if (data.page.referrer) {
                    s.referrer = data.page.referrer;
                }
                if (data.page.campaign) {
                    s.campaign = data.page.campaign;
                } else if (data.page.wtCampaign) {
                    s.campaign = data.page.wtCampaign;
                } else if (data.page.utm && data.page.utm.source) {
                    var utmParts = [];
                    utmParts.push(data.page.utm.source || '-');
                    utmParts.push(data.page.utm.medium || '-');
                    utmParts.push(data.page.utm.name || '-');
                    utmParts.push(data.page.utm.content || '-');
                    utmParts.push(data.page.utm.term || '-');
                    s.campaign = utmParts.join('_');
                }
                s.pushVal('pageName', data.page.pageName, vars);
                s.pushVal('channel', data.page.section, vars);
                s.pushVal('eVar1', 'D=pageName', vars);
                s.pushVal('eVar2', 'D=ch', vars);
                s.pushVal('eVar3', data.page.platform, vars);
                s.pushVal('eVar4', data.page.platformVersion, vars);
                s.pushVal('eVar5', data.page.platformType, vars);
                s.pushVal('eVar6', data.page.language, vars);
                s.pushVal('eVar7', data.page.bankId, vars);
                s.pushVal('eVar9', data.page.userType, vars);
                s.pushVal('eVar10', 'D=User-Agent', vars);
                s.pushVal('eVar57', 'D=g', vars);
                s.pushVal('eVar58', 'D=r', vars);
                s.pushVal('eVar63', data.page.customerType, vars);
                s.pushVal('eVar67', data.page.weekday, vars);
                s.pushVal('eVar68', data.page.hour, vars);
                s.pushVal('eVar69', data.page.day, vars);
                s.pushVal('eVar70', data.page.month, vars);
                s.pushVal('eVar76', data.page.emailId, vars);
                s.pushVal('eVar90', data.page.emailLink, vars);
                s.pushVal('eVar92', data.page.authState, vars);
                if (isPageLoad) {
                    s.prop3 = 'D=v3';
                    s.prop4 = 'D=v4';
                    s.prop5 = 'D=v5';
                    s.prop6 = 'D=v6';
                    s.prop7 = 'D=v7';
                    s.prop9 = 'D=v9';
                    s.prop10 = 'D=v10';
                    s.prop57 = 'D=g';
                    s.prop58 = 'D=r';
                    s.prop67 = 'D=v67';
                    s.prop68 = 'D=v68';
                    s.prop69 = 'D=v69';
                    s.prop70 = 'D=v70';
                    if (s.campaign) {
                        s.pushVal('eVar64', s.campaign, vars);
                    } else if (data.page.emailId) {
                        s.pushVal('eVar64', data.page.emailId, vars);
                    } else if (data.marketing.internalCampaignClick) {
                        s.pushVal('eVar64', data.marketing.internalCampaignClick, vars);
                    }
                }
            }
        } catch (e) { }
    };
    s.eventMapAndTrack = function (name, data, vars, events, hrefProperty, linkType) {
        if (hrefProperty === undefined) {
            hrefProperty = this;
        }
        if (linkType === undefined) {
            linkType = 'o';
        }
        s.configMapping(data, vars, events, false);
        s.pageMapping(data, vars, events, false);
        if (data.flow && data.flow.clickFlow){
            s.flowMapping(data, vars, events, true);
            data.flow.clickFlow = false;
        } else {
            s.flowMapping(data, vars, events, false);
        }
        s.abTestMapping(data, vars, events, false);
        if (events.length) {
            vars.push('events');
        }
        s.linkTrackEvents = s.events = events.join(',');
        s.linkTrackVars = vars.join(',');
        //s.tl(this, 'o', name);
        s.tl(hrefProperty, linkType, name);
        s.clearVars();
    };
    s.mappings = {
        "flownopageview": function (data) {
            var events = [], vars = [];
            if (data.flow) {
                data.flow.clickFlow = true;
            }
            s.eventMapAndTrack("flow", data, vars, events, true, "o");
        },
        "virtualpageview": function (data) {
            var events = [], vars = [];
            try {
                s.configMapping(data, vars, events, true);
                s.pageMapping(data, vars, events, true);
                s.flowMapping(data, vars, events, true);
                s.abTestMapping(data, vars, events, true);
                s.marketingMapping(data, vars, events, true);
                s.events = events.join(',');
            } catch (e) { }
            s.t();
            s.clearVars();
        },
        "eventTrack": function (data, name) {
            var events = [], vars = [];
            s.eventMapAndTrack(name, data, vars, events);
        },
        "internalCampaignLoadAndView": function (data) {
            var events = [], vars = [];
            try {
                if (data && data.marketing && data.marketing.internalCampaignLoaded) {
                    s.pushVal('list3', data.marketing.internalCampaignLoaded.join(';'), vars);
                    events.push('event112');
                    events.push('event113');
                }
            } catch (e) { }
            s.eventMapAndTrack("internalCampaignLoadAndView", data, vars, events);
        },
        "internalCampaignLoad": function (data) {
            var events = [], vars = [];
            try {
                if (data && data.marketing && data.marketing.internalCampaignLoaded) {
                    s.pushVal('list3', data.marketing.internalCampaignLoaded.join(';'), vars);
                    events.push('event112');
                }
            } catch (e) { }
            s.eventMapAndTrack("internalCampaignLoad", data, vars, events);
        },
        "internalCampaignView": function (data) {
            var events = [], vars = [];
            try {
                if (data && data.marketing && data.marketing.internalCampaignViewed) {
                    s.pushVal('list3', data.marketing.internalCampaignViewed.join(';'), vars);
                    events.push('event113');
                }
            } catch (e) { }
            s.eventMapAndTrack("internalCampaignView", data, vars, events);
        },
        "internalCampaignClick": function (data) {
            var events = [], vars = [];
            try {
                if (data && data.marketing.internalCampaignClick) {
                    s.pushVal('list3', data.marketing.internalCampaignClick, vars);
                    s.pushVal('eVar60', data.marketing.internalCampaignClick, vars);
                    events.push('event114');
                    s.clickMapping(data, vars, events);
                }
            } catch (e) { }
            s.eventMapAndTrack("internalCampaignClick", data, vars, events);
        },
        "internalCampaignClose": function (data) {
            var events = [], vars = [];
            try {
                if (data && data.marketing.internalCampaignClick) {
                    s.pushVal('list3', data.marketing.internalCampaignClick, vars);
                    events.push('event147');
                }
            } catch (e) { }
            s.eventMapAndTrack("internalCampaignClose", data, vars, events);
        },
        "internalCampaignSoftClose": function (data) {
            var events = [], vars = [];
            try {
                if (data && data.marketing.internalCampaignClick) {
                    s.pushVal('list3', data.marketing.internalCampaignClick, vars);
                    events.push('event148');
                }
            } catch (e) { }
            s.eventMapAndTrack("internalCampaignSoftClose", data, vars, events);
        },
        "click": function (data) {
            var events = [], vars = [];
            try {
                if (data && data.click) {
                    s.pushVal('eVar23', data.click.name, vars);
                    s.pushVal('eVar73', data.click.type, vars);
                    s.pushVal('eVar74', data.click.group, vars);
                    s.pushVal('eVar75', data.click.status, vars);
                    events.push('event146');
                }
            } catch (e) { }
            if (data.click && data.click.hrefProperty && data.click.linkType) {
                s.eventMapAndTrack("click", data, vars, events, data.click.hrefProperty, data.click.linkType);
            } else {
                s.eventMapAndTrack("click", data, vars, events);
            }
        },
        "fileClick": function (data) {
            var events = [], vars = [];
            try {
                if (data && data.click) {
                    s.pushVal('eVar22', data.click.name, vars);
                    events.push('event145');
                }
            } catch (e) { }
            if (data.click && data.click.hrefProperty && data.click.linkType) {
                s.eventMapAndTrack("fileClick", data, vars, events, data.click.hrefProperty, data.click.linkType);
            } else {
                s.eventMapAndTrack("fileClick", data, vars, events);
            }
        },
        "formError": function (data) {
            var events = [], vars = [];
            try {
                if (data && data.page && data.flow.formErrors) {
                    s.pushVal('list1', data.flow.formErrors.join(';'), vars);
                    events.push('event139');
                }
            } catch (e) { }
            s.eventMapAndTrack("formError", data, vars, events);
        },
        // START Can be removed, eventTrack will handle this since these dont do much se directCall update.
        "loginStart": function (data) {
            var events = [], vars = [];
            s.eventMapAndTrack("loginStart", data, vars, events);
        },
        "loginComplete": function (data) {
            var events = [], vars = [];
            s.eventMapAndTrack("loginComplete", data, vars, events);
        },
        "loginError": function (data) {
            var events = [], vars = [];
            s.eventMapAndTrack("loginError", data, vars, events);
        }
        // END
    };
    s.directCall = function (name, data) {
        try {
            if (name && s.mappings[name]) {
                s.mappings[name](data);
            } else if (name && s.mappings["eventTrack"]) {
                s.mappings["eventTrack"](data, name);
            }
        } catch (e) { }
    }
}